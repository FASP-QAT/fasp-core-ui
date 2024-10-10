import { CustomTooltips } from "@coreui/coreui-plugin-chartjs-custom-tooltips";
import {
  getStyle
} from "@coreui/coreui-pro/dist/js/coreui-utilities";
import CryptoJS from "crypto-js";
import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from "jspreadsheet";
import moment from "moment";
import React, { Component } from "react";
import { Bar } from "react-chartjs-2";
import Picker from "react-month-picker";
import { MultiSelect } from "react-multi-select-component";
import {
  Card,
  CardBody,
  Col,
  Form,
  FormGroup,
  Input,
  InputGroup,
  Label,
  Table
} from "reactstrap";
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction } from "../../CommonComponent/JExcelCommonFunctions.js";
import { LOGO } from "../../CommonComponent/Logo.js";
import MonthBox from "../../CommonComponent/MonthBox.js";
import getLabelText from "../../CommonComponent/getLabelText";
import {
  API_URL,
  APPROVED_SHIPMENT_STATUS,
  ARRIVED_SHIPMENT_STATUS,
  CANCELLED_SHIPMENT_STATUS,
  DATE_FORMAT_CAP_FOUR_DIGITS,
  DELIVERED_SHIPMENT_STATUS,
  DRAFT_SHIPMENT_STATUS,
  INDEXED_DB_NAME,
  INDEXED_DB_VERSION,
  JEXCEL_DATE_FORMAT,
  JEXCEL_PAGINATION_OPTION,
  JEXCEL_PRO_KEY,
  MONTHS_IN_FUTURE_FOR_DATE_PICKER_FOR_SHIPMENTS,
  ON_HOLD_SHIPMENT_STATUS,
  PLANNED_SHIPMENT_STATUS,
  PROGRAM_TYPE_SUPPLY_PLAN,
  REPORT_DATEPICKER_END_MONTH,
  REPORT_DATEPICKER_START_MONTH,
  SECRET_KEY,
  SHIPPED_SHIPMENT_STATUS,
  SUBMITTED_SHIPMENT_STATUS
} from "../../Constants.js";
import DropdownService from "../../api/DropdownService";
import ReportService from "../../api/ReportService";
import csvicon from "../../assets/img/csv.png";
import pdfIcon from "../../assets/img/pdf.png";
import i18n from "../../i18n";
import AuthenticationService from "../Common/AuthenticationService.js";
import AuthenticationServiceComponent from "../Common/AuthenticationServiceComponent";
import { addDoubleQuoteToRowContent, dateFormatterLanguage, filterOptions, formatter, makeText, roundARU } from "../../CommonComponent/JavascriptCommonFunctions";
import FundingSourceService from "../../api/FundingSourceService.js";
const ref = React.createRef();
// const options = {
//   title: {
//     display: true,
//     text: "Shipments",
//     fontColor: "black",
//   },
//   scales: {
//     xAxes: [
//       {
//         labelMaxWidth: 100,
//         stacked: true,
//         gridLines: {
//           display: false,
//         },
//         fontColor: "black",
//       },
//     ],
//     yAxes: [
//       {
//         scaleLabel: {
//           display: true,
//           labelString: i18n.t("static.graph.costInUSD"),
//           fontColor: "black",
//         },
//         stacked: true,
//         ticks: {
//           beginAtZero: true,
//           fontColor: "black",
//           callback: function (value) {
//             var cell1 = value;
//             cell1 += "";
//             var x = cell1.split(".");
//             var x1 = x[0];
//             var x2 = x.length > 1 ? "." + x[1] : "";
//             var rgx = /(\d+)(\d{3})/;
//             while (rgx.test(x1)) {
//               x1 = x1.replace(rgx, "$1" + "," + "$2");
//             }
//             return x1 + x2;
//           },
//         },
//       },
//     ],
//   },
//   tooltips: {
//     enabled: false,
//     custom: CustomTooltips,
//     callbacks: {
//       label: function (tooltipItem, data) {
//         let value =
//           data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
//         var cell1 = value;
//         cell1 += "";
//         var x = cell1.split(".");
//         var x1 = x[0];
//         var x2 = x.length > 1 ? "." + x[1] : "";
//         var rgx = /(\d+)(\d{3})/;
//         while (rgx.test(x1)) {
//           x1 = x1.replace(rgx, "$1" + "," + "$2");
//         }
//         return data.datasets[tooltipItem.datasetIndex].label + " : " + x1 + x2;
//       },
//     },
//   },
//   maintainAspectRatio: false,
//   legend: {
//     display: true,
//     position: "bottom",
//     labels: {
//       usePointStyle: true,
//       fontColor: "black",
//     },
//   },
// };
// const pickerLang = {
//   months: [
//     i18n.t("static.month.jan"),
//     i18n.t("static.month.feb"),
//     i18n.t("static.month.mar"),
//     i18n.t("static.month.apr"),
//     i18n.t("static.month.may"),
//     i18n.t("static.month.jun"),
//     i18n.t("static.month.jul"),
//     i18n.t("static.month.aug"),
//     i18n.t("static.month.sep"),
//     i18n.t("static.month.oct"),
//     i18n.t("static.month.nov"),
//     i18n.t("static.month.dec"),
//   ],
//   from: "From",
//   to: "To",
// };
/**
 * Component for Shipment Summery Report.
 */
class ShipmentSummery extends Component {
  constructor(props) {
    super(props);
    var dt = new Date();
    dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
    var dt1 = new Date();
    dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
    this.state = {
      isDarkMode:false,
      planningUnitValues: [],
      planningUnitLabels: [],
      sortType: "asc",
      dropdownOpen: false,
      radioSelected: 2,
      realms: [],
      programs: [],
      offlinePrograms: [],
      versions: [],
      planningUnits: [],
      consumptions: [],
      offlineConsumptionList: [],
      offlinePlanningUnitList: [],
      productCategories: [],
      offlineProductCategoryList: [],
      show: false,
      data: {},
      shipmentDetailsFundingSourceList: [],
      shipmentDetailsList: [],
      shipmentDetailsMonthList: [],
      message: "",
      viewById: 1,
      rangeValue: {
        from: { year: dt.getFullYear(), month: dt.getMonth() + 1 },
        to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 },
      },
      minDate: {
        year: new Date().getFullYear() - 10,
        month: new Date().getMonth() + 1,
      },
      maxDate: {
        year: new Date().getFullYear() + MONTHS_IN_FUTURE_FOR_DATE_PICKER_FOR_SHIPMENTS,
        month: new Date().getMonth() + 1,
      },
      loading: true,
      programId: "",
      versionId: "",
      fundingSources: [],
      // fundingSourcesOriginal: [],//implemented for funding source type changes
      fundingSourceValues: [],
      fundingSourceLabels: [],
      budgets: [],
      budgetValues: [],
      budgetLabels: [],
      filteredBudgetList: [],
      lang: localStorage.getItem("lang"),
      fundingSourceTypes: [],
      fundingSourceTypeValues: [],
      fundingSourceTypeLabels: [],
    };
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.setProgramId = this.setProgramId.bind(this);
    this.setVersionId = this.setVersionId.bind(this);
    this.getFundingSourceList = this.getFundingSourceList.bind(this);
    this.getBudgetList = this.getBudgetList.bind(this);
    this.buildJExcel = this.buildJExcel.bind(this);
    this.loaded = this.loaded.bind(this);
    this.selected = this.selected.bind(this);
    this.getFundingSourceType = this.getFundingSourceType.bind(this);
  }
  /**
   * Exports the data to a CSV file.
   */
  exportCSV() {
    var csvRow = [];
    csvRow.push(
      '"' +
      (
        i18n.t("static.report.dateRange") +
        " : " +
        makeText(this.state.rangeValue.from) +
        " ~ " +
        makeText(this.state.rangeValue.to)
      ).replaceAll(" ", "%20") +
      '"'
    );
    csvRow.push("");
    csvRow.push(
      '"' +
      (
        i18n.t("static.program.program") +
        " : " +
        document.getElementById("programId").selectedOptions[0].text
      ).replaceAll(" ", "%20") +
      '"'
    );
    csvRow.push("");
    csvRow.push(
      '"' +
      (
        i18n.t("static.report.versionFinal*") +
        "  :  " +
        document.getElementById("versionId").selectedOptions[0].text
      ).replaceAll(" ", "%20") +
      '"'
    );
    csvRow.push("");
    this.state.planningUnitLabels.map((ele) =>
      csvRow.push(
        '"' +
        (
          i18n.t("static.planningunit.planningunit") +
          " : " +
          ele.toString()
        ).replaceAll(" ", "%20") +
        '"'
      )
    );
    // csvRow.push("");
    // this.state.fundingSourceTypeLabels.map((ele) =>
    //   csvRow.push(
    //     '"' +
    //     (
    //       i18n.t("static.funderTypeHead.funderType") +
    //       " : " +
    //       ele.toString()
    //     ).replaceAll(" ", "%20") +
    //     '"'
    //   )
    // );
    csvRow.push("");
    this.state.fundingSourceLabels.map((ele) =>
      csvRow.push(
        '"' +
        (
          i18n.t("static.budget.fundingsource") +
          " : " +
          ele.toString()
        ).replaceAll(" ", "%20") +
        '"'
      )
    );
    csvRow.push("");
    this.state.budgetLabels.map((ele) =>
      csvRow.push(
        '"' +
        (
          i18n.t("static.budgetHead.budget") +
          " : " +
          ele.toString()
        ).replaceAll(" ", "%20") +
        '"'
      )
    );
    csvRow.push("");
    csvRow.push(
      '"' +
      (
        i18n.t("static.common.display") +
        "  :  " +
        document.getElementById("viewById").selectedOptions[0].text
      ).replaceAll(" ", "%20") +
      '"'
    );
    csvRow.push("");
    csvRow.push("");
    let viewById = this.state.viewById;
    var re;
    var A = [
      addDoubleQuoteToRowContent([
        i18n.t("static.budget.fundingsource").replaceAll(" ", "%20"),
        i18n.t("static.report.orders").replaceAll(" ", "%20"),
        i18n.t("static.report.costUsd").replaceAll(" ", "%20"),
      ]),
    ];
    this.state.shipmentDetailsFundingSourceList.map((ele) =>
      A.push(
        addDoubleQuoteToRowContent([
          ele.fundingSource.code.replaceAll(" ", "%20"),
          ele.orderCount,
          ele.cost,
        ])
      )
    );
    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","));
    }
    csvRow.push("");
    csvRow.push("");
    csvRow.push("");
    var B = [
      addDoubleQuoteToRowContent([
        i18n.t("static.report.qatPIDFID").replaceAll(" ", "%20"),
        i18n
          .t("static.report.planningUnit/ForecastingUnit")
          .replaceAll(" ", "%20"),
        i18n.t("static.report.id").replaceAll(" ", "%20"),
        i18n
          .t("static.supplyPlan.consideAsEmergencyOrder")
          .replaceAll(" ", "%20"),
        i18n.t("static.report.erpOrder").replaceAll(" ", "%20"),
        i18n.t("static.report.localprocurement").replaceAll(" ", "%20"),
        i18n
          .t("static.report.orderNo")
          .replaceAll(" ", "%20")
          .replaceAll("#", "%23"),
        i18n.t("static.report.procurementAgentName").replaceAll(" ", "%20"),
        i18n.t("static.budget.fundingsource").replaceAll(" ", "%20"),
        i18n.t("static.budgetHead.budget").replaceAll(" ", "%20"),
        i18n.t("static.common.status").replaceAll(" ", "%20"),
        i18n.t("static.report.qty").replaceAll(" ", "%20"),
        i18n.t("static.report.expectedReceiveddate").replaceAll(" ", "%20"),
        i18n.t("static.report.productCost").replaceAll(" ", "%20"),
        i18n.t("static.report.freightCost").replaceAll(" ", "%20"),
        i18n.t("static.report.totalCost").replaceAll(" ", "%20"),
        i18n.t("static.program.notes").replaceAll(" ", "%20"),
      ]),
    ];
    re = this.state.shipmentDetailsList;
    for (var item = 0; item < re.length; item++) {
      B.push(
        addDoubleQuoteToRowContent([
          re[item].planningUnit.id,
          getLabelText(re[item].planningUnit.label, this.state.lang)
            .replaceAll(",", " ")
            .replaceAll(" ", "%20"),
          re[item].shipmentId,
          re[item].emergencyOrder,
          re[item].erpOrder == true ? true : false,
          re[item].localProcurement,
          re[item].orderNo != null
            ? re[item].orderNo
              .toString()
              .replaceAll(" ", "%20")
              .replaceAll("#", "%23")
            : "",
          re[item].procurementAgent.code == null ||
            re[item].procurementAgent.code == ""
            ? ""
            : re[item].procurementAgent.code.replaceAll(" ", "%20"),
          re[item].fundingSource.code == null ||
            re[item].fundingSource.code == ""
            ? ""
            : re[item].fundingSource.code.replaceAll(" ", "%20"),
          re[item].budget.code == null || re[item].budget.code == ""
            ? ""
            : re[item].budget.code.replaceAll(" ", "%20"),
          getLabelText(re[item].shipmentStatus.label, this.state.lang)
            .replaceAll(",", " ")
            .replaceAll(" ", "%20"),
          viewById == 1
            ? roundARU(re[item].shipmentQty,1)
            : (roundARU(Number(re[item].shipmentQty) * re[item].multiplier)).toFixed(2),
          moment(re[item].expectedDeliveryDate)
            .format(DATE_FORMAT_CAP_FOUR_DIGITS)
            .replaceAll(",", " ")
            .replaceAll(" ", "%20"),
          Number(re[item].productCost).toFixed(2),
          Number(re[item].freightCost).toFixed(2),
          Number(re[item].totalCost).toFixed(2),
          re[item].notes != null && re[item].notes != "" && re[item].notes != ""
            ? re[item].notes.replaceAll("#", " ").replaceAll(" ", "%20")
            : "",
        ])
      );
    }
    for (var i = 0; i < B.length; i++) {
      csvRow.push(B[i].join(","));
    }
    var csvString = csvRow.join("%0A");
    var a = document.createElement("a");
    a.href = "data:attachment/csv," + csvString;
    a.target = "_Blank";
    a.download =
      i18n.t("static.report.shipmentDetailReport") +
      makeText(this.state.rangeValue.from) +
      " ~ " +
      makeText(this.state.rangeValue.to) +
      ".csv";
    document.body.appendChild(a);
    a.click();
  }
  /**
   * Exports the data to a PDF file.
   */
  exportPDF = () => {
    const addFooters = (doc) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      for (var i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setPage(i);
        doc.text(
          "Page " + String(i) + " of " + String(pageCount),
          doc.internal.pageSize.width / 9,
          doc.internal.pageSize.height - 30,
          {
            align: "center",
          }
        );
        doc.text(
          "Copyright © 2020 " + i18n.t("static.footer"),
          (doc.internal.pageSize.width * 6) / 7,
          doc.internal.pageSize.height - 30,
          {
            align: "center",
          }
        );
      }
    };
    const addHeaders = (doc) => {
      const pageCount = doc.internal.getNumberOfPages();
      for (var i = 1; i <= pageCount; i++) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setPage(i);
        doc.addImage(LOGO, "png", 0, 10, 180, 50, "FAST");
        doc.setTextColor("#002f6c");
        doc.text(
          i18n.t("static.report.shipmentDetailReport"),
          doc.internal.pageSize.width / 2,
          60,
          {
            align: "center",
          }
        );
        if (i == 1) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.text(
            i18n.t("static.report.dateRange") +
            " : " +
            makeText(this.state.rangeValue.from) +
            " ~ " +
            makeText(this.state.rangeValue.to),
            doc.internal.pageSize.width / 8,
            90,
            {
              align: "left",
            }
          );
          doc.text(
            i18n.t("static.program.program") +
            " : " +
            document.getElementById("programId").selectedOptions[0].text,
            doc.internal.pageSize.width / 8,
            110,
            {
              align: "left",
            }
          );
          doc.text(
            i18n.t("static.report.versionFinal*") +
            " : " +
            document.getElementById("versionId").selectedOptions[0].text,
            doc.internal.pageSize.width / 8,
            130,
            {
              align: "left",
            }
          );
          doc.text(
            i18n.t("static.common.display") +
            " : " +
            document.getElementById("viewById").selectedOptions[0].text,
            doc.internal.pageSize.width / 8,
            150,
            {
              align: "left",
            }
          );
        }
      }
    };
    const unit = "pt";
    const size = "A4";
    const orientation = "landscape";
    const marginLeft = 10;
    const doc = new jsPDF(orientation, unit, size, true);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal')
    doc.setTextColor("#002f6c");
    // var y = 190;
    var y = 170;

    // var fundingSourceTypeText = doc.splitTextToSize(
    //   i18n.t("static.funderTypeHead.funderType") +
    //   " : " +
    //   this.state.fundingSourceTypeLabels.join("; "),
    //   (doc.internal.pageSize.width * 3) / 4
    // );
    // doc.text(doc.internal.pageSize.width / 8, 170, fundingSourceTypeText);
    // y = y + fundingSourceTypeText.length * 10 + 10;

    var fundingSourceText = doc.splitTextToSize(
      i18n.t("static.budget.fundingsource") +
      " : " +
      this.state.fundingSourceLabels.join("; "),
      (doc.internal.pageSize.width * 3) / 4
    );
    // doc.text(doc.internal.pageSize.width / 8, 170, fundingSourceText);
    for (var i = 0; i < fundingSourceText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 100;
      }
      doc.text(doc.internal.pageSize.width / 8, y, fundingSourceText[i]);
      y = y + 10;
    }
    y = y + 10;

    var budgetText = doc.splitTextToSize(
      i18n.t("static.budgetHead.budget") +
      " : " +
      this.state.budgetLabels.join("; "),
      (doc.internal.pageSize.width * 3) / 4
    );
    // y = y + 5;
    for (var i = 0; i < budgetText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 100;
      }
      doc.text(doc.internal.pageSize.width / 8, y, budgetText[i]);
      y = y + 10;
    }
    y = y + 10;
    var planningText = doc.splitTextToSize(
      i18n.t("static.planningunit.planningunit") +
      " : " +
      this.state.planningUnitLabels.join("; "),
      (doc.internal.pageSize.width * 3) / 4
    );
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 100;
      }
      doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
      y = y + 10;
    }
    var canvas = document.getElementById("cool-canvas");
    var canvasImg = canvas.toDataURL("image/png", 1.0);
    var height = doc.internal.pageSize.height;
    let startY = y + 10;
    let pages = Math.ceil(startY / height)
    for (var j = 1; j < pages; j++) {
      doc.addPage()
    }
    if (startY > 310) {
      doc.addPage();
      startY = 100;
    }
    doc.addImage(canvasImg, "png", 50, startY, 750, 260, "CANVAS");
    let content1 = {
      margin: { top: 80, bottom: 100 },
      startY: height,
      styles: { lineWidth: 1, fontSize: 8, cellWidth: 190, halign: "center" },
      columnStyles: {
        0: { cellWidth: 191.89 },
      },
      html: "#mytable1",
      didDrawCell: function (data) {
        if (data.column.index === 4 && data.cell.section === "body") {
          var td = data.cell.raw;
          var img = td.getElementsByTagName("img")[0];
          var dim = data.cell.height - data.cell.padding("vertical");
          var textPos = data.cell.textPos;
          doc.addImage(img.src, textPos.x, textPos.y, dim, dim);
        }
      },
    };
    doc.autoTable(content1);
    let headerTable2 = [];
    headerTable2.push(i18n.t("static.report.planningUnit/ForecastingUnit"));
    headerTable2.push(i18n.t("static.report.id"));
    headerTable2.push(i18n.t("static.supplyPlan.consideAsEmergencyOrder"));
    headerTable2.push(i18n.t("static.report.erpOrder"));
    headerTable2.push(i18n.t("static.report.localprocurement"));
    headerTable2.push(i18n.t("static.report.orderNo"));
    headerTable2.push(i18n.t("static.report.procurementAgentName"));
    headerTable2.push(i18n.t("static.budget.fundingsource"));
    headerTable2.push(i18n.t("static.dashboard.budget"));
    headerTable2.push(i18n.t("static.common.status"));
    headerTable2.push(i18n.t("static.report.qty"));
    headerTable2.push(i18n.t("static.report.expectedReceiveddate"));
    headerTable2.push(i18n.t("static.report.productCost"));
    headerTable2.push(i18n.t("static.report.freightCost"));
    headerTable2.push(i18n.t("static.report.totalCost"));
    headerTable2.push(i18n.t("static.program.notes"));
    let data;
    data = this.state.shipmentDetailsList.map((ele) => [
      getLabelText(ele.planningUnit.label, this.state.lang),
      ele.shipmentId,
      ele.emergencyOrder,
      ele.erpOrder == true ? true : false,
      ele.localProcurement,
      ele.orderNo != null ? ele.orderNo : "",
      ele.procurementAgent.code,
      ele.fundingSource.code,
      ele.budget.code,
      getLabelText(ele.shipmentStatus.label, this.state.lang),
      this.state.viewById == 1
        ? formatter(roundARU(ele.shipmentQty,1), 0)
        : formatter(roundARU(Number(ele.shipmentQty) * ele.multiplier,1), 0),
      moment(ele.expectedDeliveryDate).format("YYYY-MM-DD"),
      ele.productCost
        .toFixed(2)
        .toString()
        .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
      ele.freightCost
        .toFixed(2)
        .toString()
        .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
      ele.totalCost
        .toFixed(2)
        .toString()
        .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
      ele.notes,
    ]);
    let contentTable2 = {
      margin: { top: 80, bottom: 100 },
      startY: 200,
      pageBreak: "auto",
      head: [headerTable2],
      body: data,
      styles: { lineWidth: 1, fontSize: 8, halign: "center" },
      columnStyles: {
        0: { cellWidth: 100 },
        15: { cellWidth: 110 },
      },
    };
    doc.autoTable(contentTable2);
    addHeaders(doc);
    addFooters(doc);
    doc.save(i18n.t("static.report.shipmentDetailReport") + ".pdf");
  };
  /**
     * Retrieves the list of funding sources types.
     */
  getFundingSourceType = () => {
    //Fetch realmId
    let realmId = AuthenticationService.getRealmId();
    if (localStorage.getItem("sessionType") === 'Online') {
      //Fetch funding source type list by realmId
      FundingSourceService.getFundingsourceTypeListByRealmId(realmId)
        .then(response => {
          if (response.status == 200) {
            var fundingSourceTypeValues = [];
            var fundingSourceTypes = response.data;
            fundingSourceTypes.sort(function (a, b) {
              a = a.fundingSourceTypeCode.toLowerCase();
              b = b.fundingSourceTypeCode.toLowerCase();
              return a < b ? -1 : a > b ? 1 : 0;
            })

            this.setState({
              fundingSourceTypes: fundingSourceTypes, loading: false,
            })
          } else {
            this.setState({
              message: response.data.messageCode, loading: false
            },
              () => {
                // this.hideSecondComponent();
              })
          }
        }).catch(
          error => {
            this.setState({
              fundingSourceTypes: [], loading: false
            }, () => {
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
      //offline
      var db3;
      var fSourceTypeResult = [];
      getDatabase();
      var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
      openRequest.onsuccess = function (e) {
        db3 = e.target.result;
        var fSourceTypeTransaction = db3.transaction(['fundingSourceType'], 'readwrite');
        var fSourceTypeOs = fSourceTypeTransaction.objectStore('fundingSourceType');
        var fSourceTypeRequest = fSourceTypeOs.getAll();
        fSourceTypeRequest.onerror = function (event) {
        }.bind(this);
        fSourceTypeRequest.onsuccess = function (event) {
          fSourceTypeResult = fSourceTypeRequest.result.filter(c => c.realm.id == realmId);
          this.setState({
            fundingSourceTypes: fSourceTypeResult.sort(function (a, b) {
              a = a.fundingSourceTypeCode.toLowerCase();
              b = b.fundingSourceTypeCode.toLowerCase();
              return a < b ? -1 : a > b ? 1 : 0;
            })
          });
        }.bind(this)
      }.bind(this)
    }
  }

  // handleFundingSourceTypeChange = (fundingSourceTypeIds) => {

  //   fundingSourceTypeIds = fundingSourceTypeIds.sort(function (a, b) {
  //     return parseInt(a.value) - parseInt(b.value);
  //   })
  //   this.setState({
  //     fundingSourceTypeValues: fundingSourceTypeIds.map(ele => ele),
  //     fundingSourceTypeLabels: fundingSourceTypeIds.map(ele => ele.label)
  //   }, () => {
  //     var filteredFundingSourceArr = [];
  //     var fundingSources = this.state.fundingSourcesOriginal;//original fs list
  //     for (var i = 0; i < fundingSourceTypeIds.length; i++) {
  //       for (var j = 0; j < fundingSources.length; j++) {
  //         if (fundingSources[j].fundingSourceType.id == fundingSourceTypeIds[i].value) {
  //           filteredFundingSourceArr.push(fundingSources[j]);
  //         }
  //       }
  //     }

  //     if (filteredFundingSourceArr.length > 0) {
  //       filteredFundingSourceArr = filteredFundingSourceArr.sort(function (a, b) {
  //         a = a.code.toLowerCase();
  //         b = b.code.toLowerCase();
  //         return a < b ? -1 : a > b ? 1 : 0;
  //       });
  //     }
  //     this.setState({
  //       fundingSources: filteredFundingSourceArr,
  //       fundingSourceValues: [],
  //       fundingSourceLabels: [],
  //     }, () => {
  //       this.fetchData();
  //     });

  //   })
  // }

  /**
   * Retrieves the list of funding sources.
   */
  getFundingSourceList() {
    if (localStorage.getItem("sessionType") === 'Online') {
      this.setState({
        loading:true
      })
      var programIds = [Number(this.state.programId)];
      DropdownService.getFundingSourceForProgramsDropdownList(programIds)
        .then((response) => {
          var listArray = response.data;
          listArray.sort((a, b) => {
            var itemLabelA = a.code.toUpperCase();
            var itemLabelB = b.code.toUpperCase();
            return itemLabelA > itemLabelB ? 1 : -1;
          });
          this.setState(
            {
              fundingSources: listArray,
              loading:false,
              fundingSourceValues: [],
              fundingSourceLabels: [],
              filteredBudgetList: [],
            },
            () => {
              this.getBudgetList();
            }
          );
        })
        .catch((error) => {
          this.setState({
            fundingSources: [],
          });
          if (error.message === "Network Error") {
            this.setState({
              message: API_URL.includes("uat")
                ? i18n.t("static.common.uatNetworkErrorMessage")
                : API_URL.includes("demo")
                  ? i18n.t("static.common.demoNetworkErrorMessage")
                  : i18n.t("static.common.prodNetworkErrorMessage"),
            });
          } else {
            switch (error.response ? error.response.status : "") {
              case 500:
              case 401:
              case 404:
              case 406:
              case 412:
                this.setState({
                  message: i18n.t(error.response.data.messageCode, {
                    entityname: i18n.t("static.fundingsource.fundingsource"),
                  }),
                });
                break;
              default:
                this.setState({ message: "static.unkownError" });
                break;
            }
          }
        });
    } else {
      var db3;
      var fSourceResult = [];
      getDatabase();
      var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
      openRequest.onsuccess = function (e) {
        db3 = e.target.result;
        var fSourceTransaction = db3.transaction(
          ["fundingSource"],
          "readwrite"
        );
        var fSourceOs = fSourceTransaction.objectStore("fundingSource");
        var fSourceRequest = fSourceOs.getAll();
        fSourceRequest.onerror = function (event) {
        }.bind(this);
        fSourceRequest.onsuccess = function (event) {
          fSourceResult = fSourceRequest.result.filter(c=>[...new Set(c.programList.map(ele => ele.id))].includes(parseInt(this.state.programId)));
          var fundingSource = [];
          for (var i = 0; i < fSourceResult.length; i++) {
            var arr = {
              id: fSourceResult[i].fundingSourceId,
              code: fSourceResult[i].fundingSourceCode,
              label: fSourceResult[i].label,
              fundingSourceType: fSourceRequest.result[i].fundingSourceType
            };
            fundingSource[i] = arr;
          }
          this.setState(
            {
              fundingSources: fundingSource.sort(function (a, b) {
                a = a.code.toLowerCase();
                b = b.code.toLowerCase();
                return a < b ? -1 : a > b ? 1 : 0;
              }),
              fundingSourceValues: [],
              fundingSourceLabels: [],
              filteredBudgetList: [],
            },
            () => {
              this.getBudgetList();
            }
          );
        }.bind(this);
      }.bind(this);
    }
  }
  /**
   * Retrieves the list of budgets.
   */
  getBudgetList() {
    var programId = this.state.programId;
    if (this.state.programId != "" && this.state.programId != 0 && programId != "") {
      if (localStorage.getItem("sessionType") === 'Online') {
        DropdownService.getBudgetDropdownBasedOnProgram(programId)
          .then((response) => {
            var listArray = response.data;
            var proList = [];
            for (var i = 0; i < listArray.length; i++) {
              var programJson = {
                budgetId: listArray[i].id,
                label: listArray[i].label,
                budgetCode: listArray[i].code,
              };
              proList[i] = programJson;
            }
            proList.sort((a, b) => {
              var itemLabelA = a.budgetCode.toUpperCase();
              var itemLabelB = b.budgetCode.toUpperCase();
              return itemLabelA > itemLabelB ? 1 : -1;
            });
            var budgetValuesFromProps = [];
            var budgetLabelsFromProps = [];
            if (
              this.props.match.params.budgetId != "" &&
              this.props.match.params.budgetId != undefined
            ) {
              budgetValuesFromProps.push({
                label: this.props.match.params.budgetCode,
                value: parseInt(this.props.match.params.budgetId),
              });
              budgetLabelsFromProps.push(this.props.match.params.budgetCode);
            }
            this.setState(
              {
                budgetValues: budgetValuesFromProps,
                budgetLabels: budgetLabelsFromProps,
                budgets: proList,
                filteredBudgetList: proList,
              },
              () => {
                this.fetchData();
              }
            );
          })
          .catch((error) => {
            this.setState({
              budgets: [],
            });
            if (error.message === "Network Error") {
              this.setState({
                message: API_URL.includes("uat")
                  ? i18n.t("static.common.uatNetworkErrorMessage")
                  : API_URL.includes("demo")
                    ? i18n.t("static.common.demoNetworkErrorMessage")
                    : i18n.t("static.common.prodNetworkErrorMessage"),
              });
            } else {
              switch (error.response ? error.response.status : "") {
                case 500:
                case 401:
                case 404:
                case 406:
                case 412:
                  this.setState({
                    message: i18n.t(error.response.data.messageCode, {
                      entityname: i18n.t("static.fundingsource.fundingsource"),
                    }),
                  });
                  break;
                default:
                  this.setState({ message: "static.unkownError" });
                  break;
              }
            }
          });
      } else {
        var db3;
        var fSourceResult = [];
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
          db3 = e.target.result;
          var fSourceTransaction = db3.transaction(["budget"], "readwrite");
          var fSourceOs = fSourceTransaction.objectStore("budget");
          var fSourceRequest = fSourceOs.getAll();
          fSourceRequest.onerror = function (event) {
          }.bind(this);
          fSourceRequest.onsuccess = function (event) {
            var budgetValuesFromProps = [];
            var budgetLabelsFromProps = [];
            if (
              this.props.match.params.budgetId != "" &&
              this.props.match.params.budgetId != undefined
            ) {
              budgetValuesFromProps.push({
                label: this.props.match.params.budgetCode,
                value: parseInt(this.props.match.params.budgetId),
              });
              budgetLabelsFromProps.push(this.props.match.params.budgetCode);
            }
            fSourceResult = fSourceRequest.result.filter(
              (b) => [...new Set(b.programs.map(ele => ele.id))].includes(programId)
            );
            this.setState(
              {
                budgetValues: budgetValuesFromProps,
                budgetLabels: budgetLabelsFromProps,
                budgets: fSourceResult.sort(function (a, b) {
                  a = a.budgetCode.toLowerCase();
                  b = b.budgetCode.toLowerCase();
                  return a < b ? -1 : a > b ? 1 : 0;
                }),
                filteredBudgetList: fSourceResult.sort(function (a, b) {
                  a = a.budgetCode.toLowerCase();
                  b = b.budgetCode.toLowerCase();
                  return a < b ? -1 : a > b ? 1 : 0;
                }),
              },
              () => {
                this.fetchData();
              }
            );
          }.bind(this);
        }.bind(this);
      }
    } else {
      var budgetValuesFromProps = [];
      var budgetLabelsFromProps = [];
      if (
        this.props.match.params.budgetId != "" &&
        this.props.match.params.budgetId != undefined
      ) {
        budgetValuesFromProps.push({
          label: this.props.match.params.budgetCode,
          value: parseInt(this.props.match.params.budgetId),
        });
        budgetLabelsFromProps.push(this.props.match.params.budgetCode);
      }
      this.setState(
        {
          budgetValues: budgetValuesFromProps,
          budgetLabels: budgetLabelsFromProps,
          budgets: [],
          filteredBudgetList: [],
        },
        () => {
          this.fetchData();
        }
      );
    }
  }
  /**
   * Handles the change event for funding sources.
   * @param {Array} fundingSourceIds - An array containing the selected funding source IDs.
   */
  handleFundingSourceChange = (fundingSourceIds) => {
    if (fundingSourceIds.length != 0) {
      fundingSourceIds = fundingSourceIds.sort(function (a, b) {
        return parseInt(a.value) - parseInt(b.value);
      });
      let newFundingSourceList = [... new Set(fundingSourceIds.map((ele) => Number(ele.value)))];
      if (localStorage.getItem("sessionType") === 'Online') {
        DropdownService.getBudgetDropdownFilterMultipleFundingSources(newFundingSourceList)
          .then((response) => {
            var budgetList = response.data;
            var bList = [];
            for (var i = 0; i < budgetList.length; i++) {
              var budgetJson = {
                budgetId: budgetList[i].id,
                label: budgetList[i].label,
                budgetCode: budgetList[i].code,
              };
              bList[i] = budgetJson;
            }
            this.setState(
              {
                budgetValues: [],
                budgetLabels: [],
                fundingSourceValues: fundingSourceIds.map((ele) => ele),
                fundingSourceLabels: fundingSourceIds.map((ele) => ele.label),
                filteredBudgetList: bList,
              },
              () => {
                this.fetchData();
              }
            );
          })
          .catch((error) => {
            this.setState(
              {
                budgetValues: [],
                budgetLabels: [],
                filteredBudgetList: [],
                loading: false,
              },
              () => {
                this.fetchData();
              }
            );
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
                  this.props.history.push(`/login/static.message.sessionExpired`);
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
      else {
        var programId = this.state.programId;
        var db3;
        var fSourceResult = [];
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
          db3 = e.target.result;
          var fSourceTransaction = db3.transaction(["budget"], "readwrite");
          var fSourceOs = fSourceTransaction.objectStore("budget");
          var fSourceRequest = fSourceOs.getAll();
          fSourceRequest.onerror = function (event) {
          }.bind(this);
          fSourceRequest.onsuccess = function (event) {
            var budgetValuesFromProps = [];
            var budgetLabelsFromProps = [];
            if (
              this.props.match.params.budgetId != "" &&
              this.props.match.params.budgetId != undefined
            ) {
              budgetValuesFromProps.push({
                label: this.props.match.params.budgetCode,
                value: parseInt(this.props.match.params.budgetId),
              });
              budgetLabelsFromProps.push(this.props.match.params.budgetCode);
            }
            fSourceResult = fSourceRequest.result.filter(
              (b) => [...new Set(b.programs.map(ele => ele.id))].includes(Number(programId)) && newFundingSourceList.includes(b.fundingSource.fundingSourceId)
            );
            this.setState(
              {
                budgetValues: [],
                budgetLabels: [],
                fundingSourceValues: fundingSourceIds.map((ele) => ele),
                fundingSourceLabels: fundingSourceIds.map((ele) => ele.label),
                filteredBudgetList: fSourceResult.sort(function (a, b) {
                  a = a.budgetCode.toLowerCase();
                  b = b.budgetCode.toLowerCase();
                  return a < b ? -1 : a > b ? 1 : 0;
                }),
              },
              () => {
                this.fetchData();
              }
            );
          }.bind(this);
        }.bind(this);
      }
    } else {
      this.setState({
        budgetValues: [],
        budgetLabels: [],
        fundingSourceValues: [],
        fundingSourceLabels: [],
        filteredBudgetList: [],
      }, () => {
        this.fetchData();
      })
    }
  };
  /**
   * Handles the change event for budgets.
   * @param {Array} budgetIds - An array containing the selected budget IDs.
   */
  handleBudgetChange = (budgetIds) => {
    budgetIds = budgetIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    });
    this.setState(
      {
        budgetValues: budgetIds.map((ele) => ele),
        budgetLabels: budgetIds.map((ele) => ele.label),
      },
      () => {
        this.fetchData();
      }
    );
  };
  /**
   * Builds the jexcel table based on the shipment details list list.
   */
  buildJExcel() {
    let shipmentDetailsList = this.state.shipmentDetailsList;
    let shipmentDetailsListArray = [];
    let count = 0;
    for (var j = 0; j < shipmentDetailsList.length; j++) {
      data = [];
      data[0] = getLabelText(
        shipmentDetailsList[j].planningUnit.label,
        this.state.lang
      );
      data[1] = shipmentDetailsList[j].shipmentId;
      data[2] = shipmentDetailsList[j].emergencyOrder;
      data[3] = shipmentDetailsList[j].erpFlag;
      data[4] = shipmentDetailsList[j].localProcurement;
      data[5] =
        shipmentDetailsList[j].orderNo != null
          ? shipmentDetailsList[j].orderNo
          : "";
      data[6] = shipmentDetailsList[j].procurementAgent.code;
      data[7] = shipmentDetailsList[j].fundingSource.code;
      data[8] = shipmentDetailsList[j].budget.code;
      data[9] = getLabelText(
        shipmentDetailsList[j].shipmentStatus.label,
        this.state.lang
      );
      data[10] =
        this.state.viewById == 1
          ? shipmentDetailsList[j].shipmentQty
          : (Number(shipmentDetailsList[j].shipmentQty) *
          shipmentDetailsList[j].multiplier);
      data[11] = moment(shipmentDetailsList[j].expectedDeliveryDate).format(
        "YYYY-MM-DD"
      );
      data[12] = shipmentDetailsList[j].productCost.toFixed(2);
      data[13] = shipmentDetailsList[j].freightCost.toFixed(2);
      data[14] = shipmentDetailsList[j].totalCost.toFixed(2);
      data[15] = shipmentDetailsList[j].notes;
      data[16] = shipmentDetailsList[j].planningUnit.id;
      shipmentDetailsListArray[count] = data;
      count++;
    }
    this.el = jexcel(
      document.getElementById("shipmentDetailsListTableDiv"),
      ""
    );
    jexcel.destroy(
      document.getElementById("shipmentDetailsListTableDiv"),
      true
    );
    var data = shipmentDetailsListArray;
    var options = {
      data: data,
      columnDrag: false,
      colWidths: [
        150, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 100,
      ],
      colHeaderClasses: ["Reqasterisk"],
      columns: [
        {
          title: i18n.t("static.report.planningUnit/ForecastingUnit"),
          type: "text",
        },
        {
          title: i18n.t("static.report.id"),
          type: "numeric",
        },
        {
          title: i18n.t("static.supplyPlan.consideAsEmergencyOrder"),
          type: "hidden",
        },
        {
          title: i18n.t("static.report.erpOrder"),
          type: "checkbox",
        },
        {
          title: i18n.t("static.report.localprocurement"),
          type: "checkbox",
        },
        {
          title: i18n.t("static.report.orderNo"),
          type: "text",
        },
        {
          title: i18n.t("static.report.procurementAgentName"),
          type: "text",
        },
        {
          title: i18n.t("static.budget.fundingsource"),
          type: "text",
        },
        {
          title: i18n.t("static.dashboard.budget"),
          type: "text",
        },
        {
          title: i18n.t("static.common.status"),
          type: "text",
        },
        {
          title: i18n.t("static.report.qty"),
          type: "numeric",
          mask: (localStorage.getItem("roundingEnabled") != undefined && localStorage.getItem("roundingEnabled").toString() == "false")?'#,##.000':'#,##', decimal: '.',
          decimal: ".",
        },
        {
          title: i18n.t("static.report.expectedReceiveddate"),
          type: "calendar",
          options: {
            format: JEXCEL_DATE_FORMAT,
          },
        },
        {
          title: i18n.t("static.report.productCost"),
          type: "numeric",
          mask: "#,##.00",
          decimal: ".",
        },
        {
          type: "numeric",
          mask: "#,##.00",
          decimal: ".",
          title: i18n.t("static.report.freightCost"),
        },
        {
          title: i18n.t("static.report.totalCost"),
          type: "numeric",
          mask: "#,##.00",
          decimal: ".",
        },
        {
          title: i18n.t("static.program.notes"),
          type: "text",
        },
        {
          title: "Planning Unit Id",
          type: "hidden",
        },
      ],
      editable: false,
      license: JEXCEL_PRO_KEY,
      filters: true,
      onload: this.loaded,
      pagination: localStorage.getItem("sesRecordCount"),
      search: true,
      columnSorting: true,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      onselection: this.selected,
      copyCompatibility: true,
      allowExport: false,
      paginationOptions: JEXCEL_PAGINATION_OPTION,
      position: "top",
      contextMenu: function (obj, x, y, e) {
        return false;
      }.bind(this),
    };
    var shipmentDetailsEl = jexcel(
      document.getElementById("shipmentDetailsListTableDiv"),
      options
    );
    this.el = shipmentDetailsEl;
    this.setState({
      shipmentDetailsEl: shipmentDetailsEl,
      loading: false,
    });
  }
  /**
   * Callback function triggered when the Jexcel instance is loaded to format the table.
   */
  loaded = function (instance, cell, x, y, value) {
    jExcelLoadedFunction(instance);
    var elInstance = instance.worksheets[0];
    var json = elInstance.getJson();
    for (var j = 0; j < json.length; j++) {
      var colArr = [
        "A",
        "B",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
      ];
      var rowData = elInstance.getRowData(j);
      var emergencyOrder = rowData[2];
      if (emergencyOrder) {
        for (var i = 0; i < colArr.length; i++) {
          var cell = elInstance.getCell(colArr[i].concat(parseInt(j) + 1));
          cell.classList.add("shipmentEntryEmergency");
        }
      }
    }
  };
  /**
   * Redirects to the edit shipment data entry screen on row click.
   */
  selected = function (instance, cell, x, y, value, e) {
    if (e.buttons == 1) {
      if ((x == 0 && value != 0) || y == 0) {
      } else {
        let versionId = document.getElementById("versionId").value;
        let programId = document.getElementById("programId").value;
        let userId = AuthenticationService.getLoggedInUserId();
        if (versionId.includes("Local")) {
          var planningUnitId = this.el.getValueFromCoords(16, x);
          var rangeValue = this.state.rangeValue;
          var programIdd =
            programId + "_v" + versionId.split(" ")[0] + "_uId_" + userId;
          localStorage.setItem("sesRangeValue", JSON.stringify(rangeValue));
          window.open(
            window.location.origin +
            `/#/shipment/shipmentDetails/${programIdd}/${versionId}/${planningUnitId}`
          );
        }
      }
    }
  };
  /**
   * Retrieves the list of programs.
   */
  getPrograms = () => {
    if (localStorage.getItem("sessionType") === 'Online') {
      let realmId = AuthenticationService.getRealmId();
      DropdownService.getProgramForDropdown(realmId, PROGRAM_TYPE_SUPPLY_PLAN)
        .then((response) => {
          var proList = [];
          for (var i = 0; i < response.data.length; i++) {
            var programJson = {
              programId: response.data[i].id,
              label: response.data[i].label,
              programCode: response.data[i].code,
            };
            proList[i] = programJson;
          }
          this.setState(
            {
              programs: proList,
              loading: false,
            },
            () => {
              this.consolidatedProgramList();
            }
          );
        })
        .catch((error) => {
          this.setState(
            {
              programs: [],
              loading: false,
            },
            () => {
              this.consolidatedProgramList();
            }
          );
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
                this.props.history.push(`/login/static.message.sessionExpired`);
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
    } else {
      this.setState({ loading: false });
      this.consolidatedProgramList();
    }
  };
  /**
   * Consolidates the list of programs obtained from Server and local programs.
   */
  consolidatedProgramList = () => {
    const { programs } = this.state;
    var proList = programs;
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
          if (myResult[i].userId == userId) {
            var databytes = CryptoJS.AES.decrypt(
              myResult[i].programData.generalData,
              SECRET_KEY
            );
            var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
            var f = 0;
            for (var k = 0; k < this.state.programs.length; k++) {
              if (this.state.programs[k].programId == programData.programId) {
                f = 1;
              }
            }
            if (f == 0) {
              proList.push(programData);
            }
          }
        }
        if (
          localStorage.getItem("sesProgramIdReport") != "" &&
          localStorage.getItem("sesProgramIdReport") != undefined
        ) {
          this.setState(
            {
              programs: proList.sort(function (a, b) {
                a = a.programCode.toLowerCase();
                b = b.programCode.toLowerCase();
                return a < b ? -1 : a > b ? 1 : 0;
              }),
              programId: localStorage.getItem("sesProgramIdReport"),
            },
            () => {
              this.getFundingSourceList();
              this.filterVersion();
            }
          );
        } else {
          this.setState({
            programs: proList.sort(function (a, b) {
              a = a.programCode.toLowerCase();
              b = b.programCode.toLowerCase();
              return a < b ? -1 : a > b ? 1 : 0;
            }),
          });
        }
      }.bind(this);
    }.bind(this);
  };
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
      const program = this.state.programs.filter(
        (c) => c.programId == programId
      );
      if (program.length == 1) {
        if (localStorage.getItem("sessionType") === 'Online') {
          this.setState(
            {
              versions: [],
              planningUnits: [],
              planningUnitValues: [],
            },
            () => {
              DropdownService.getVersionListForProgram(
                PROGRAM_TYPE_SUPPLY_PLAN,
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
      var budgetValuesFromProps = [];
      var budgetLabelsFromProps = [];
      if (
        this.props.match.params.budgetId != "" &&
        this.props.match.params.budgetId != undefined
      ) {
        budgetValuesFromProps.push({
          label: this.props.match.params.budgetCode,
          value: parseInt(this.props.match.params.budgetId),
        });
        budgetLabelsFromProps.push(this.props.match.params.budgetCode);
      }
      this.setState({
        versions: [],
        planningUnits: [],
        planningUnitValues: [],
        budgetValues: budgetValuesFromProps,
        budgetLabels: budgetLabelsFromProps,
        budgets: [],
        filteredBudgetList: [],
      });
    }
    this.fetchData();
  };
  /**
   * Retrieves data from IndexedDB and combines it with fetched versions to create a consolidated version list.
   * Filters out duplicate versions and reverses the list.
   * Sets the version list in the state and triggers fetching of planning units.
   * Handles cases where a version is selected from local storage or the default version is selected.
   * @param {number} programId - The ID of the selected program
   */
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
            myResult[i].userId == userId &&
            myResult[i].programId == programId
          ) {
            var bytes = CryptoJS.AES.decrypt(
              myResult[i].programName,
              SECRET_KEY
            );
            var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
            var databytes = CryptoJS.AES.decrypt(
              myResult[i].programData.generalData,
              SECRET_KEY
            );
            var programData = databytes.toString(CryptoJS.enc.Utf8);
            var version = JSON.parse(programData).currentVersion;
            version.versionId = `${version.versionId} (Local)`;
            version.cutOffDate = JSON.parse(programData).cutOffDate!=undefined && JSON.parse(programData).cutOffDate!=null && JSON.parse(programData).cutOffDate!=""?JSON.parse(programData).cutOffDate:""
            verList.push(version);
          }
        }
        let versionList = verList.filter(function (x, i, a) {
          return a.indexOf(x) === i;
        });
        versionList.reverse();
        if (
          localStorage.getItem("sesVersionIdReport") != "" &&
          localStorage.getItem("sesVersionIdReport") != undefined
        ) {
          let versionVar = versionList.filter(
            (c) => c.versionId == localStorage.getItem("sesVersionIdReport")
          );
          if (versionVar != "" && versionVar != undefined) {
            this.setState(
              {
                versions: versionList,
                versionId: localStorage.getItem("sesVersionIdReport"),
              },
              () => {
                this.getPlanningUnit();
              }
            );
          } else {
            this.setState(
              {
                versions: versionList,
                versionId: versionList[0].versionId,
              },
              () => {
                this.getPlanningUnit();
              }
            );
          }
        } else {
          this.setState(
            {
              versions: versionList,
              versionId: versionList[0].versionId,
            },
            () => {
              this.getPlanningUnit();
            }
          );
        }
      }.bind(this);
    }.bind(this);
  };
  /**
   * Retrieves the list of planning units for a selected program and selected version.
   */
  getPlanningUnit = () => {
    let programId = document.getElementById("programId").value;
    let versionId = document.getElementById("versionId").value;
    this.setState(
      {
        planningUnits: [],
        planningUnitValues: [],
        planningUnitLabels: [],
      },
      () => {
        if (versionId == 0) {
          this.setState({
            message: i18n.t("static.program.validversion"),
            data: [],
            shipmentDetailsList: [],
            shipmentDetailsFundingSourceList: [],
            shipmentDetailsMonthList: [],
          });
        } else {
          localStorage.setItem("sesVersionIdReport", versionId);
          var cutOffDateFromProgram=this.state.versions.filter(c=>c.versionId==this.state.versionId)[0].cutOffDate;
          var cutOffDate = cutOffDateFromProgram != undefined && cutOffDateFromProgram != null && cutOffDateFromProgram != "" ? cutOffDateFromProgram : moment(Date.now()).add(-10, 'years').format("YYYY-MM-DD");
          var rangeValue = this.state.rangeValue;
          if (moment(this.state.rangeValue.from.year + "-" + (this.state.rangeValue.from.month <= 9 ? "0" + this.state.rangeValue.from.month : this.state.rangeValue.from.month) + "-01").format("YYYY-MM") < moment(cutOffDate).format("YYYY-MM")) {
              var cutOffEndDate=moment(cutOffDate).add(18,'months').startOf('month').format("YYYY-MM-DD");
              rangeValue= { from: { year: parseInt(moment(cutOffDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) }, to: {year: parseInt(moment(cutOffEndDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M"))}};
          }
          this.setState({
            minDate: { year: parseInt(moment(cutOffDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) },
            rangeValue: rangeValue
          })
          if (versionId.includes("Local")) {
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(
              INDEXED_DB_NAME,
              INDEXED_DB_VERSION
            );
            openRequest.onsuccess = function (e) {
              db1 = e.target.result;
              var planningunitTransaction = db1.transaction(
                ["programPlanningUnit"],
                "readwrite"
              );
              var planningunitOs = planningunitTransaction.objectStore(
                "programPlanningUnit"
              );
              var planningunitRequest = planningunitOs.getAll();
              planningunitRequest.onerror = function (event) {
              };
              planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                var programId = document
                  .getElementById("programId")
                  .value.split("_")[0];
                var proList = [];
                for (var i = 0; i < myResult.length; i++) {
                  if (
                    myResult[i].program.id == programId &&
                    myResult[i].active == true
                  ) {
                    proList[i] = myResult[i].planningUnit;
                  }
                }
                var lang = this.state.lang;
                this.setState(
                  {
                    planningUnits: proList.sort(function (a, b) {
                      a = getLabelText(a.label, lang).toLowerCase();
                      b = getLabelText(b.label, lang).toLowerCase();
                      return a < b ? -1 : a > b ? 1 : 0;
                    }),
                    message: "",
                  },
                  () => {
                    this.fetchData();
                  }
                );
              }.bind(this);
            }.bind(this);
          } else {
            var programJson = {
              tracerCategoryIds: [],
              programIds: [programId],
            };
            DropdownService.getProgramPlanningUnitDropdownList(programJson)
              .then((response) => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                  var itemLabelA = getLabelText(
                    a.label,
                    this.state.lang
                  ).toUpperCase();
                  var itemLabelB = getLabelText(
                    b.label,
                    this.state.lang
                  ).toUpperCase();
                  return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState(
                  {
                    planningUnits: listArray,
                    message: "",
                  },
                  () => {
                    this.fetchData();
                  }
                );
              })
              .catch((error) => {
                this.setState({
                  planningUnits: [],
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
                    case 403:
                      this.props.history.push(`/accessDenied`);
                      break;
                    case 500:
                    case 404:
                    case 406:
                      this.setState({
                        message: i18n.t(error.response.data.messageCode, {
                          entityname: i18n.t(
                            "static.planningunit.planningunit"
                          ),
                        }),
                        loading: false,
                      });
                      break;
                    case 412:
                      this.setState({
                        message: i18n.t(error.response.data.messageCode, {
                          entityname: i18n.t(
                            "static.planningunit.planningunit"
                          ),
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
        }
      }
    );
  };
  /**
   * Handles the change event for planning units.
   * @param {Array} planningUnitIds - An array containing the selected planning unit IDs.
   */
  handlePlanningUnitChange = (planningUnitIds) => {
    planningUnitIds = planningUnitIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    });
    this.setState(
      {
        planningUnitValues: planningUnitIds.map((ele) => ele),
        planningUnitLabels: planningUnitIds.map((ele) => ele.label),
      },
      () => {
        this.fetchData();
      }
    );
  };
  /**
   * Calls the get programs and get funding source function on page load
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


    this.getPrograms();
    this.getFundingSourceType();
  }
  /**     
   * Sets the selected program ID selected by the user.
   * @param {object} event - The event object containing information about the program selection.
   */
  setProgramId(event) {
    this.setState(
      {
        programId: event.target.value,
        versionId: "",
      },
      () => {
        localStorage.setItem("sesVersionIdReport", "");
        this.getFundingSourceList();
        this.filterVersion();
        this.getBudgetList();
      }
    );
  }
  /**
   * Sets the version ID and updates the tracer category list.
   * @param {Object} event - The event object containing the version ID value.
   */
  setVersionId(event) {
    if (this.state.versionId != "" || this.state.versionId != undefined) {
      this.setState(
        {
          versionId: event.target.value,
        },
        () => {
            var cutOffDateFromProgram=this.state.versions.filter(c=>c.versionId==this.state.versionId)[0].cutOffDate;
            var cutOffDate = cutOffDateFromProgram != undefined && cutOffDateFromProgram != null && cutOffDateFromProgram != "" ? cutOffDateFromProgram : moment(Date.now()).add(-10, 'years').format("YYYY-MM-DD");
            var rangeValue = this.state.rangeValue;
            if (moment(this.state.rangeValue.from.year + "-" + (this.state.rangeValue.from.month <= 9 ? "0" + this.state.rangeValue.from.month : this.state.rangeValue.from.month) + "-01").format("YYYY-MM") < moment(cutOffDate).format("YYYY-MM")) {
                var cutOffEndDate=moment(cutOffDate).add(18,'months').startOf('month').format("YYYY-MM-DD");
                rangeValue= { from: { year: parseInt(moment(cutOffDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) }, to: {year: parseInt(moment(cutOffEndDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M"))}};
                // localStorage.setItem("sesRangeValue", JSON.stringify(rangeValue));
            }
            this.setState({
              minDate: { year: parseInt(moment(cutOffDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) },
              rangeValue: rangeValue
            })
          localStorage.setItem("sesVersionIdReport", this.state.versionId);
          this.fetchData();
        }
      );
    } else {
      this.setState(
        {
          versionId: event.target.value,
        },
        () => {
          this.getPlanningUnit();
        }
      );
    }
  }
  /**
   * Fetches data based on selected filters.
   */
  fetchData = () => {
    let versionId = document.getElementById("versionId").value;
    let programId = document.getElementById("programId").value;
    let viewById = document.getElementById("viewById").value;
    let planningUnitIds =
      this.state.planningUnitValues.length == this.state.planningUnits.length
        ? []
        : this.state.planningUnitValues.map((ele) => ele.value);
    let startDate =
      this.state.rangeValue.from.year +
      "-" +
      this.state.rangeValue.from.month +
      "-01";
    let endDate =
      this.state.rangeValue.to.year +
      "-" +
      String(this.state.rangeValue.to.month).padStart(2, "0") +
      "-" +
      new Date(
        this.state.rangeValue.to.year,
        this.state.rangeValue.to.month,
        0
      ).getDate();
    let myFundingSourceIds =
      this.state.fundingSourceValues.length == this.state.fundingSources.length
        ? []
        : this.state.fundingSourceValues.map((ele) => ele.value);
    let myBudgetIds =
      this.state.budgetValues.length == this.state.budgets.length
        ? []
        : this.state.budgetValues.map((ele) => ele.value);
    if (
      programId > 0 &&
      versionId != 0 &&
      this.state.planningUnitValues.length > 0
    ) {
      if (versionId.includes("Local")) {
        this.setState({ loading: true });
        planningUnitIds = this.state.planningUnitValues.map((ele) => ele.value);
        myFundingSourceIds = this.state.fundingSourceValues.map(
          (ele) => ele.value
        );
        myBudgetIds = this.state.budgetValues.map((ele) => ele.value);
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
          this.setState({
            message: i18n.t("static.program.errortext"),
            loading: false,
          });
        }.bind(this);
        openRequest.onsuccess = function (e) {
          db1 = e.target.result;
          var programDataTransaction = db1.transaction(
            ["programData"],
            "readwrite"
          );
          var version = versionId.split("(")[0].trim();
          var userBytes = CryptoJS.AES.decrypt(
            localStorage.getItem("curUser"),
            SECRET_KEY
          );
          var userId = userBytes.toString(CryptoJS.enc.Utf8);
          var program = `${programId}_v${version}_uId_${userId}`;
          var programDataOs = programDataTransaction.objectStore("programData");
          var programRequest = programDataOs.get(program);
          programRequest.onerror = function (event) {
            this.setState({
              message: i18n.t("static.program.errortext"),
              loading: false,
            });
          }.bind(this);
          programRequest.onsuccess = function (e) {
            var planningUnitDataList =
              programRequest.result.programData.planningUnitDataList;
            let data = [];
            let planningUnitFilter = [];
            for (let i = 0; i < planningUnitIds.length; i++) {
              var planningUnitDataIndex = planningUnitDataList.findIndex(
                (c) => c.planningUnitId == planningUnitIds[i]
              );
              var programJson = {};
              if (planningUnitDataIndex != -1) {
                var planningUnitData = planningUnitDataList.filter(
                  (c) => c.planningUnitId == planningUnitIds[i]
                )[0];
                var programDataBytes = CryptoJS.AES.decrypt(
                  planningUnitData.planningUnitData,
                  SECRET_KEY
                );
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                programJson = JSON.parse(programData);
              } else {
                programJson = {
                  consumptionList: [],
                  inventoryList: [],
                  shipmentList: [],
                  batchInfoList: [],
                  supplyPlan: [],
                };
              }
              var shipmentList = programJson.shipmentList;
              const activeFilter = shipmentList.filter(
                (c) =>
                  (c.active == true || c.active == "true") &&
                  (c.accountFlag == true || c.accountFlag == "true") &&
                  c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS
              );
              let dateFilter = activeFilter.filter((c) =>
                c.receivedDate == null || c.receivedDate === ""
                  ? c.expectedDeliveryDate >=
                  moment(startDate).format("YYYY-MM-DD") &&
                  c.expectedDeliveryDate <=
                  moment(endDate).format("YYYY-MM-DD")
                  : c.receivedDate >= moment(startDate).format("YYYY-MM-DD") &&
                  c.receivedDate <= moment(endDate).format("YYYY-MM-DD")
              );
              for (let j = 0; j < dateFilter.length; j++) {
                if (dateFilter[j].planningUnit.id == planningUnitIds[i]) {
                  planningUnitFilter.push(dateFilter[j]);
                }
              }
            }
            var planningunitTransaction = db1.transaction(
              ["planningUnit"],
              "readwrite"
            );
            var planningunitOs =
              planningunitTransaction.objectStore("planningUnit");
            var planningunitRequest = planningunitOs.getAll();
            var planningList = [];
            planningunitRequest.onerror = function (event) {
              this.setState({
                loading: false,
              });
            };
            planningunitRequest.onsuccess = function (e) {
              var myResult = [];
              myResult = planningunitRequest.result;
              for (var k = 0; k < myResult.length; k++) {
                var planningUnitObj = {
                  id: myResult[k].planningUnitId,
                  multiplier: myResult[k].multiplier,
                  label: myResult[k].label,
                  forecastingUnit: myResult[k].forecastingUnit,
                };
                planningList[k] = planningUnitObj;
              }
              var paTransaction = db1.transaction(
                ["procurementAgent"],
                "readwrite"
              );
              var paOs = paTransaction.objectStore("procurementAgent");
              var paRequest = paOs.getAll();
              paRequest.onerror = function (event) {
                this.setState({
                  loading: false,
                });
              };
              paRequest.onsuccess = function (e) {
                var paResult = [];
                paResult = paRequest.result;
                var bTransaction = db1.transaction(["budget"], "readwrite");
                var bOs = bTransaction.objectStore("budget");
                var bRequest = bOs.getAll();
                bRequest.onerror = function (event) {
                  this.setState({
                    loading: false,
                  });
                };
                bRequest.onsuccess = function (e) {
                  var bResult = [];
                  bResult = bRequest.result;
                  for (let i = 0; i < planningUnitFilter.length; i++) {
                    let multiplier = 0;
                    for (let j = 0; j < planningList.length; j++) {
                      if (
                        planningUnitFilter[i].planningUnit.id ==
                        planningList[j].id
                      ) {
                        multiplier = planningList[j].multiplier;
                        j = planningList.length;
                      }
                    }
                    var planningUnit = planningList.filter(
                      (c) => c.id == planningUnitFilter[i].planningUnit.id
                    );
                    var procurementAgent = paResult.filter(
                      (c) =>
                        c.procurementAgentId ==
                        planningUnitFilter[i].procurementAgent.id
                    );
                    if (procurementAgent.length > 0) {
                      var simplePAObject = {
                        id: procurementAgent[0].procurementAgentId,
                        label: procurementAgent[0].label,
                        code: procurementAgent[0].procurementAgentCode,
                      };
                    }
                    var fundingSource = this.state.fundingSources.filter(
                      (c) => c.id == planningUnitFilter[i].fundingSource.id
                    );
                    if (fundingSource.length > 0) {
                      var simpleFSObject = {
                        id: fundingSource[0].id,
                        label: fundingSource[0].label,
                        code: fundingSource[0].code,
                      };
                    }
                    var budget = [];
                    if (planningUnitFilter[i].budget.id > 0) {
                      var budget = bResult.filter(
                        (c) => c.budgetId == planningUnitFilter[i].budget.id
                      );
                      if (budget.length > 0) {
                        var simpleBObject = {
                          id: budget[0].budgetId,
                          label: budget[0].label,
                          code: budget[0].budgetCode,
                        };
                      }
                    }
                    let json = {
                      shipmentId: planningUnitFilter[i].shipmentId,
                      planningUnit:
                        planningUnit.length > 0
                          ? planningUnit[0]
                          : planningUnitFilter[i].planningUnit,
                      forecastingUnit:
                        planningUnit.length > 0
                          ? planningUnit[0].forecastingUnit
                          : planningUnitFilter[i].planningUnit.forecastingUnit,
                      multiplier: multiplier,
                      procurementAgent:
                        procurementAgent.length > 0
                          ? simplePAObject
                          : planningUnitFilter[i].procurementAgent,
                      fundingSource:
                        fundingSource.length > 0
                          ? simpleFSObject
                          : planningUnitFilter[i].fundingSource,
                      shipmentStatus: planningUnitFilter[i].shipmentStatus,
                      shipmentQty: planningUnitFilter[i].shipmentQty,
                      expectedDeliveryDate:
                        planningUnitFilter[i].receivedDate == null ||
                          planningUnitFilter[i].receivedDate == ""
                          ? planningUnitFilter[i].expectedDeliveryDate
                          : planningUnitFilter[i].receivedDate,
                      productCost:
                        planningUnitFilter[i].productCost *
                        planningUnitFilter[i].currency.conversionRateToUsd,
                      freightCost:
                        planningUnitFilter[i].freightCost *
                        planningUnitFilter[i].currency.conversionRateToUsd,
                      totalCost:
                        planningUnitFilter[i].productCost *
                        planningUnitFilter[i].currency.conversionRateToUsd +
                        planningUnitFilter[i].freightCost *
                        planningUnitFilter[i].currency.conversionRateToUsd,
                      notes: planningUnitFilter[i].notes,
                      emergencyOrder: planningUnitFilter[i].emergencyOrder,
                      erpFlag: planningUnitFilter[i].erpFlag,
                      localProcurement: planningUnitFilter[i].localProcurement,
                      orderNo: planningUnitFilter[i].orderNo,
                      budget:
                        budget.length > 0
                          ? simpleBObject
                          : planningUnitFilter[i].budget,
                    };
                    data.push(json);
                  }
                  data =
                    myFundingSourceIds.length > 0
                      ? data.filter((f) =>
                        myFundingSourceIds.includes(f.fundingSource.id)
                      )
                      : data;
                  data =
                    myBudgetIds.length > 0
                      ? data.filter((b) => myBudgetIds.includes(b.budget.id))
                      : data;
                  data = data.sort(function (a, b) {
                    return parseInt(a.shipmentId) - parseInt(b.shipmentId);
                  });
                  var shipmentDetailsFundingSourceList = [];
                  const fundingSourceIds = [
                    ...new Set(data.map((q) => parseInt(q.fundingSource.id))),
                  ];
                  fundingSourceIds.map((ele) => {
                    var fundingSource = this.state.fundingSources.filter(
                      (c) => c.id == ele
                    );
                    if (fundingSource.length > 0) {
                      var simpleFSObject = {
                        id: fundingSource[0].id,
                        label: fundingSource[0].label,
                        code: fundingSource[0].code,
                      };
                    }
                    var fundingSourceList = data.filter(
                      (c) => c.fundingSource.id == ele
                    );
                    var cost = 0;
                    var quantity = 0;
                    fundingSourceList.map((c) => {
                      cost =
                        cost + Number(c.productCost) + Number(c.freightCost);
                      quantity =
                        quantity +
                        (viewById == 1
                          ? Number(c.shipmentQty)
                          : Number(c.shipmentQty) * c.multiplier);
                    });
                    var json = {
                      fundingSource:
                        fundingSource.length > 0
                          ? simpleFSObject
                          : fundingSourceList[0].fundingSource,
                      orderCount: fundingSourceList.length,
                      cost: cost,
                      quantity: quantity,
                    };
                    shipmentDetailsFundingSourceList.push(json);
                  });
                  var shipmentDetailsMonthList = [];
                  var monthstartfrom = this.state.rangeValue.from.month;
                  for (
                    var from = this.state.rangeValue.from.year,
                    to = this.state.rangeValue.to.year;
                    from <= to;
                    from++
                  ) {
                    for (var month = monthstartfrom; month <= 12; month++) {
                      var dtstr =
                        from + "-" + String(month).padStart(2, "0") + "-01";
                      var enddtStr =
                        from +
                        "-" +
                        String(month).padStart(2, "0") +
                        "-" +
                        new Date(from, month, 0).getDate();
                      var dt = dtstr;
                      var shiplist = planningUnitFilter.filter((c) =>
                        c.receivedDate == null || c.receivedDate == ""
                          ? c.expectedDeliveryDate >= dt &&
                          c.expectedDeliveryDate <= enddtStr
                          : c.receivedDate >= dt && c.receivedDate <= enddtStr
                      );
                      shiplist =
                        myFundingSourceIds.length > 0
                          ? shiplist.filter((f) =>
                            myFundingSourceIds.includes(f.fundingSource.id)
                          )
                          : shiplist;
                      shiplist =
                        myBudgetIds.length > 0
                          ? shiplist.filter((b) =>
                            myBudgetIds.includes(b.budget.id)
                          )
                          : shiplist;
                      var onholdCost = 0;
                      var plannedCost = 0;
                      var receivedCost = 0;
                      var shippedCost = 0;
                      var submittedCost = 0;
                      var approvedCost = 0;
                      var arrivedCost = 0;
                      var submittedCost = 0;
                      shiplist.map((ele) => {
                        if (ele.shipmentStatus.id == PLANNED_SHIPMENT_STATUS) {
                          plannedCost =
                            plannedCost +
                            ele.productCost * ele.currency.conversionRateToUsd +
                            ele.freightCost * ele.currency.conversionRateToUsd;
                        } else if (
                          ele.shipmentStatus.id == DRAFT_SHIPMENT_STATUS
                        ) {
                        } else if (
                          ele.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS
                        ) {
                          submittedCost =
                            submittedCost +
                            ele.productCost * ele.currency.conversionRateToUsd +
                            ele.freightCost * ele.currency.conversionRateToUsd;
                        } else if (
                          ele.shipmentStatus.id == APPROVED_SHIPMENT_STATUS
                        ) {
                          approvedCost =
                            approvedCost +
                            ele.productCost * ele.currency.conversionRateToUsd +
                            ele.freightCost * ele.currency.conversionRateToUsd;
                        } else if (
                          ele.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS
                        ) {
                          shippedCost =
                            shippedCost +
                            ele.productCost * ele.currency.conversionRateToUsd +
                            ele.freightCost * ele.currency.conversionRateToUsd;
                        } else if (
                          ele.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS
                        ) {
                          arrivedCost =
                            arrivedCost +
                            ele.productCost * ele.currency.conversionRateToUsd +
                            ele.freightCost * ele.currency.conversionRateToUsd;
                        } else if (
                          ele.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS
                        ) {
                          receivedCost =
                            receivedCost +
                            ele.productCost * ele.currency.conversionRateToUsd +
                            ele.freightCost * ele.currency.conversionRateToUsd;
                        } else if (
                          ele.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS
                        ) {
                          onholdCost =
                            onholdCost +
                            ele.productCost * ele.currency.conversionRateToUsd +
                            ele.freightCost * ele.currency.conversionRateToUsd;
                        }
                      });
                      let json = {
                        dt: new Date(from, month - 1),
                        approvedCost: approvedCost,
                        arrivedCost: arrivedCost,
                        onholdCost: onholdCost,
                        plannedCost: plannedCost,
                        receivedCost: receivedCost,
                        shippedCost: shippedCost,
                        submittedCost: submittedCost,
                      };
                      shipmentDetailsMonthList.push(json);
                      if (
                        month == this.state.rangeValue.to.month &&
                        from == to
                      ) {
                        this.setState(
                          {
                            shipmentDetailsList: data,
                            shipmentDetailsFundingSourceList:
                              shipmentDetailsFundingSourceList,
                            shipmentDetailsMonthList: shipmentDetailsMonthList,
                            message: "",
                            viewById: viewById,
                            loading: false,
                          },
                          () => {
                            this.buildJExcel();
                          }
                        );
                        return;
                      }
                    }
                    monthstartfrom = 1;
                  }
                }.bind(this);
              }.bind(this);
            }.bind(this);
          }.bind(this);
        }.bind(this);
      } else {
        this.setState({ loading: true });
        var inputjson = {
          programId: programId,
          versionId: versionId,
          startDate: startDate,
          stopDate: endDate,
          planningUnitIds: planningUnitIds,
          fundingSourceIds: myFundingSourceIds,
          budgetIds: myBudgetIds,
          reportView: viewById,
        };
        ReportService.ShipmentSummery(inputjson)
          .then((response) => {
            this.setState(
              {
                data: response.data,
                shipmentDetailsFundingSourceList:
                  response.data.shipmentDetailsFundingSourceList,
                shipmentDetailsList: response.data.shipmentDetailsList,
                shipmentDetailsMonthList:
                  response.data.shipmentDetailsMonthList,
                viewById: viewById,
                message: "",
                loading: false,
              },
              () => {
                this.buildJExcel();
              }
            );
          })
          .catch((error) => {
            this.setState({
              data: [],
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
                case 403:
                  this.props.history.push(`/accessDenied`);
                  break;
                case 500:
                case 404:
                case 406:
                  this.setState({
                    message: i18n.t(error.response.data.messageCode),
                    loading: false,
                  });
                  break;
                case 412:
                  this.setState({
                    message: i18n.t(error.response.data.messageCode),
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
    } else if (programId == 0) {
      this.setState(
        {
          message: i18n.t("static.common.selectProgram"),
          data: [],
          shipmentDetailsList: [],
          shipmentDetailsFundingSourceList: [],
          shipmentDetailsMonthList: [],
        },
        () => {
          this.el = jexcel(
            document.getElementById("shipmentDetailsListTableDiv"),
            ""
          );
          jexcel.destroy(
            document.getElementById("shipmentDetailsListTableDiv"),
            true
          );
        }
      );
    } else if (versionId == 0) {
      this.setState(
        {
          message: i18n.t("static.program.validversion"),
          data: [],
          shipmentDetailsList: [],
          shipmentDetailsFundingSourceList: [],
          shipmentDetailsMonthList: [],
        },
        () => {
          this.el = jexcel(
            document.getElementById("shipmentDetailsListTableDiv"),
            ""
          );
          jexcel.destroy(
            document.getElementById("shipmentDetailsListTableDiv"),
            true
          );
        }
      );
    } else if (this.state.planningUnitValues.length == 0) {
      this.setState(
        {
          message: i18n.t("static.procurementUnit.validPlanningUnitText"),
          data: [],
          shipmentDetailsList: [],
          shipmentDetailsFundingSourceList: [],
          shipmentDetailsMonthList: [],
        },
        () => {
          this.el = jexcel(
            document.getElementById("shipmentDetailsListTableDiv"),
            ""
          );
          jexcel.destroy(
            document.getElementById("shipmentDetailsListTableDiv"),
            true
          );
        }
      );
    }
  };
  /**
   * Handles the dismiss of the range picker component.
   * Updates the component state with the new range value and triggers a data fetch.
   * @param {object} value - The new range value selected by the user.
   */
  handleRangeDissmis(value) {
    this.setState({ rangeValue: value }, () => {
      this.fetchData();
    });
  }
  /**
   * Handles the click event on the range picker box.
   * Shows the range picker component.
   * @param {object} e - The event object containing information about the click event.
   */
  _handleClickRangeBox(e) {
    this.refs.pickRange.show();
  }
  /**
   * Displays a loading indicator while data is being loaded.
   */
  loading = () => (
    <div className="animated fadeIn pt-1 text-center">
      {i18n.t("static.common.loading")}
    </div>
  );
  /**
   * Renders the Shipment Summery report table.
   * @returns {JSX.Element} - Shipment Summery report table.
   */
  render() {
    const darkModeColors = [
      '#d4bbff',
  ];
  
  const lightModeColors = [
      '#002F6C',
  ];
  
    const { isDarkMode } = this.state;
const colors = isDarkMode ? darkModeColors : lightModeColors;
const fontColor = isDarkMode ? '#e4e5e6' : '#212721';
const gridLineColor = isDarkMode ? '#444' : '#e0e0e0';

    const options = {
      title: {
        display: true,
        text: "Shipments",
        fontColor:fontColor
      },
      scales: {
        xAxes: [
          {
            labelMaxWidth: 100,
            stacked: true,
            gridLines: {
              display: false, 
            },
            ticks: {
              fontColor: fontColor, // Apply font color to x-axis labels
            },
          },
        ],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: i18n.t("static.graph.costInUSD"),
              fontColor:fontColor
            },
            gridLines: {
              display: true, // Ensure grid lines are displayed
              color: gridLineColor,
              zeroLineColor: gridLineColor,
              lineWidth: 1, // Adjust this value as needed for visibility
            },
            stacked: true,
            ticks: {
              beginAtZero: true,
              fontColor:fontColor,
              callback: function (value) {
                var cell1 = value;
                cell1 += "";
                var x = cell1.split(".");
                var x1 = x[0];
                var x2 = x.length > 1 ? "." + x[1] : "";
                var rgx = /(\d+)(\d{3})/;
                while (rgx.test(x1)) {
                  x1 = x1.replace(rgx, "$1" + "," + "$2");
                }
                return x1 + x2;
              },
            },
          },
        ],
      },
      tooltips: {
        enabled: false,
        custom: CustomTooltips,
        callbacks: {
          label: function (tooltipItem, data) {
            let value =
              data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
            var cell1 = value;
            cell1 += "";
            var x = cell1.split(".");
            var x1 = x[0];
            var x2 = x.length > 1 ? "." + x[1] : "";
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
              x1 = x1.replace(rgx, "$1" + "," + "$2");
            }
            return data.datasets[tooltipItem.datasetIndex].label + " : " + x1 + x2;
          },
        },
      },
      maintainAspectRatio: false,
      legend: {
        display: true,
        position: "bottom",
        labels: {
          usePointStyle: true,
          fontColor:fontColor,
        },
      },
    };
    const pickerLang = {
      months: [
        i18n.t("static.month.jan"),
        i18n.t("static.month.feb"),
        i18n.t("static.month.mar"),
        i18n.t("static.month.apr"),
        i18n.t("static.month.may"),
        i18n.t("static.month.jun"),
        i18n.t("static.month.jul"),
        i18n.t("static.month.aug"),
        i18n.t("static.month.sep"),
        i18n.t("static.month.oct"),
        i18n.t("static.month.nov"),
        i18n.t("static.month.dec"),
      ],
      from: "From",
      to: "To",
      fontColor:fontColor
    };

    jexcel.setDictionary({
      Show: " ",
      entries: " ",
    });
    const { programs } = this.state;
    const { versions } = this.state;
    let versionList =
      versions.length > 0 &&
      versions.map((item, i) => {
        return (
          <option key={i} value={item.versionId}>
            {item.versionStatus.id == 2 && item.versionType.id == 2
              ? item.versionId + "*"
              : item.versionId}{" "}
            ({moment(item.createdDate).format(`MMM DD YYYY`)}) {item.cutOffDate!=undefined && item.cutOffDate!=null && item.cutOffDate!=''?" ("+i18n.t("static.supplyPlan.start")+" "+moment(item.cutOffDate).format('MMM YYYY')+")":""}
          </option>
        );
      }, this);
    const { planningUnits } = this.state;
    let planningUnitList =
      planningUnits.length > 0 &&
      planningUnits.map((item, i) => {
        return {
          label: getLabelText(item.label, this.state.lang),
          value: item.id,
        };
      }, this);
    // const { fundingSourceTypes } = this.state;
    const { fundingSources } = this.state;
    const { filteredBudgetList } = this.state;
    const { rangeValue } = this.state;

    let fundingSourceListDD = fundingSources.length > 0 &&
      fundingSources.map((item, i) => {
        return {
          label: item.code,
          value: item.id,
        };
      }, this);

    const bar = {
      labels: this.state.shipmentDetailsMonthList.map((item, index) =>
        dateFormatterLanguage(item.dt)
      ),
      datasets: [
        {
          label: i18n.t("static.supplyPlan.delivered"),
          stack: 1,
          backgroundColor: colors[0],
          borderColor: "rgba(179,181,198,1)",
          pointBackgroundColor: "rgba(179,181,198,1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(179,181,198,1)",
          data: this.state.shipmentDetailsMonthList.map(
            (item, index) => item.receivedCost
          ),
        },
        {
          label: i18n.t("static.report.arrived"),
          backgroundColor: "#0067B9",
          borderColor: "rgba(179,181,198,1)",
          pointBackgroundColor: "rgba(179,181,198,1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(179,181,198,1)",
          stack: 1,
          data: this.state.shipmentDetailsMonthList.map(
            (item, index) => item.arrivedCost
          ),
        },
        {
          label: i18n.t("static.report.shipped"),
          stack: 1,
          backgroundColor: "#49A4A1",
          borderColor: "rgba(179,181,198,1)",
          pointBackgroundColor: "rgba(179,181,198,1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(179,181,198,1)",
          data: this.state.shipmentDetailsMonthList.map(
            (item, index) => item.shippedCost
          ),
        },
        {
          label: i18n.t("static.supplyPlan.ordered"),
          backgroundColor: "#118b70",
          borderColor: "rgba(179,181,198,1)",
          pointBackgroundColor: "rgba(179,181,198,1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(179,181,198,1)",
          stack: 1,
          data: this.state.shipmentDetailsMonthList.map(
            (item, index) => item.approvedCost
          ),
        },
        {
          label: i18n.t("static.report.submitted"),
          stack: 1,
          backgroundColor: "#25A7FF",
          borderColor: "rgba(179,181,198,1)",
          pointBackgroundColor: "rgba(179,181,198,1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(179,181,198,1)",
          data: this.state.shipmentDetailsMonthList.map(
            (item, index) => item.submittedCost
          ),
        },
        {
          label: i18n.t("static.report.planned"),
          backgroundColor: "#A7C6ED",
          borderColor: "rgba(179,181,198,1)",
          pointBackgroundColor: "rgba(179,181,198,1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(179,181,198,1)",
          stack: 1,
          data: this.state.shipmentDetailsMonthList.map(
            (item, index) => item.plannedCost
          ),
        },
        {
          label: i18n.t("static.report.hold"),
          stack: 1,
          backgroundColor: "#6C6463",
          borderColor: "rgba(179,181,198,1)",
          pointBackgroundColor: "rgba(179,181,198,1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(179,181,198,1)",
          data: this.state.shipmentDetailsMonthList.map(
            (item, index) => item.onholdCost
          ),
        },
      ],
    };
    return (
      <div className="animated fadeIn">
        <AuthenticationServiceComponent history={this.props.history} />
        <h6 className="mt-success">
          {i18n.t(this.props.match.params.message)}
        </h6>
        <h5 className="red">{i18n.t(this.state.message)}</h5>
        <Card>
          <div className="Card-header-reporticon">
            {this.state.shipmentDetailsMonthList.length > 0 && (
              <div className="card-header-actions">
                <a className="card-header-action">
                  <img
                    style={{ height: "25px", width: "25px", cursor: "pointer" }}
                    src={pdfIcon}
                    title="Export PDF"
                    onClick={() => {
                      var curTheme = localStorage.getItem("theme");
                      if(curTheme == "dark") {
                          this.setState({
                              isDarkMode: false
                          }, () => {
                              setTimeout(() => {
                                  this.exportPDF();
                                  if(curTheme == "dark") {
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
                <img
                  style={{ height: "25px", width: "25px", cursor: "pointer" }}
                  src={csvicon}
                  title={i18n.t("static.report.exportCsv")}
                  onClick={() => this.exportCSV()}
                />
              </div>
            )}
          </div>
          <CardBody className="pb-lg-0 pt-lg-0">
            <div className="">
              <div ref={ref}>
                <Form>
                  <div className="pl-0">
                    <div className="row">
                      <FormGroup className="col-md-3">
                        <Label htmlFor="appendedInputButton">
                          {i18n.t("static.report.dateRange")}
                          <span className="stock-box-icon fa fa-sort-desc ml-1"></span>
                        </Label>
                        <div className="controls  Regioncalender">
                          <Picker
                            ref="pickRange"
                            years={{
                              min: this.state.minDate,
                              max: this.state.maxDate,
                            }}
                            value={rangeValue}
                            lang={pickerLang}
                            key={JSON.stringify(this.state.minDate) + "-" + JSON.stringify(rangeValue)}
                            onDismiss={this.handleRangeDissmis}
                          >
                            <MonthBox
                              value={
                                makeText(rangeValue.from) +
                                " ~ " +
                                makeText(rangeValue.to)
                              }
                              onClick={this._handleClickRangeBox}
                            />
                          </Picker>
                        </div>
                      </FormGroup>
                      <FormGroup className="col-md-3">
                        <Label htmlFor="appendedInputButton">
                          {i18n.t("static.program.program")}
                        </Label>
                        <div className="controls ">
                          <InputGroup>
                            <Input
                              type="select"
                              name="programId"
                              id="programId"
                              bsSize="sm"
                              onChange={(e) => {
                                this.setProgramId(e);
                              }}
                              value={this.state.programId}
                            >
                              <option value="0">
                                {i18n.t("static.common.select")}
                              </option>
                              {programs.length > 0 &&
                                programs.map((item, i) => {
                                  return (
                                    <option key={i} value={item.programId}>
                                      {item.programCode}
                                    </option>
                                  );
                                }, this)}
                            </Input>
                          </InputGroup>
                        </div>
                      </FormGroup>
                      <FormGroup className="col-md-3">
                        <Label htmlFor="appendedInputButton">
                          {i18n.t("static.report.versionFinal*")}
                        </Label>
                        <div className="controls ">
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
                      </FormGroup>
                      <FormGroup className="col-md-3">
                        <Label htmlFor="appendedInputButton">
                          {i18n.t("static.report.planningUnit")}
                        </Label>
                        <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                        <div className="controls">
                          <MultiSelect
                            name="planningUnitId"
                            id="planningUnitId"
                            bsSize="md"
                            value={this.state.planningUnitValues}
                            filterOptions={filterOptions}
                            onChange={(e) => {
                              this.handlePlanningUnitChange(e);
                            }}
                            options={
                              planningUnitList && planningUnitList.length > 0
                                ? planningUnitList
                                : []
                            }
                            disabled={this.state.loading}
                          />
                        </div>
                      </FormGroup>
                      <FormGroup className="col-md-3">
                        <Label htmlFor="appendedInputButton">
                          {i18n.t("static.common.display")}
                        </Label>
                        <div className="controls ">
                          <InputGroup>
                            <Input
                              type="select"
                              name="viewById"
                              id="viewById"
                              bsSize="sm"
                              onChange={this.fetchData}
                            >
                              <option value="1">
                                {i18n.t("static.report.planningUnit")}
                              </option>
                              <option value="2">
                                {i18n.t("static.dashboard.forecastingunit")}
                              </option>
                            </Input>
                          </InputGroup>
                        </div>
                      </FormGroup>
                      {/* <FormGroup className="col-md-3" >
                        <Label htmlFor="fundingSourceTypeId">{i18n.t('static.funderTypeHead.funderType')}</Label>
                        <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                        <div className="controls">
                          <MultiSelect
                            name="fundingSourceTypeId"
                            id="fundingSourceTypeId"
                            bsSize="md"
                            // filterOptions={this.filterOptions}
                            value={this.state.fundingSourceTypeValues}
                            onChange={(e) => { this.handleFundingSourceTypeChange(e) }}
                            options={fundingSourceTypes.length > 0
                              && fundingSourceTypes.map((item, i) => {
                                return (
                                  { label: item.fundingSourceTypeCode, value: item.fundingSourceTypeId }
                                )
                              }, this)}
                            disabled={this.state.loading}
                          />
                        </div>
                      </FormGroup> */}
                      <FormGroup className="col-md-3" id="fundingSourceDiv">
                        <Label htmlFor="appendedInputButton">
                          {i18n.t("static.budget.fundingsource")}
                        </Label>
                        <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                        <div className="controls">
                          <MultiSelect
                            name="fundingSourceId"
                            id="fundingSourceId"
                            bsSize="md"
                            value={this.state.fundingSourceValues}
                            filterOptions={filterOptions}
                            onChange={(e) => {
                              this.handleFundingSourceChange(e);
                            }}
                            options={
                              fundingSourceListDD && fundingSourceListDD.length > 0
                                ? fundingSourceListDD
                                : []
                            }
                            disabled={this.state.loading}
                          />
                        </div>
                      </FormGroup>
                      {this.state.filteredBudgetList.length > 0 && (
                        <FormGroup className="col-md-3" id="fundingSourceDiv">
                          <Label htmlFor="appendedInputButton">
                            {i18n.t("static.budgetHead.budget")}
                          </Label>
                          <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                          <div className="controls">
                            <MultiSelect
                              name="budgetId"
                              id="budgetId"
                              bsSize="md"
                              value={this.state.budgetValues}
                              filterOptions={filterOptions}
                              onChange={(e) => {
                                this.handleBudgetChange(e);
                              }}
                              options={
                                filteredBudgetList.length > 0 &&
                                filteredBudgetList.map((item, i) => {
                                  return {
                                    label: item.budgetCode,
                                    value: item.budgetId,
                                  };
                                }, this)
                              }
                            />
                          </div>
                        </FormGroup>
                      )}
                    </div>
                  </div>
                </Form>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                  <Col md="12 pl-0">
                    <div className="row">
                      {this.state.shipmentDetailsMonthList.length > 0 && (
                        <div className="col-md-12 p-0">
                          <div className="col-md-12">
                            <div
                              className="chart-wrapper chart-graph-report pl-5 ml-3"
                              style={{ marginLeft: "50px" }}
                            >
                              <Bar
                                id="cool-canvas"
                                data={bar}
                                options={options}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="row">
                      <div className="col-md-12 pl-0 pr-0">
                        {this.state.shipmentDetailsFundingSourceList.length >
                          0 && (
                            <div>
                              <Table
                                id="mytable1"
                                responsive
                                className="table-bordered table-striped text-center "
                                style={{ width: "50%", margin: "auto" }}
                              >
                                <thead>
                                  <tr>
                                    <th
                                      style={{
                                        width: "25px",
                                        cursor: "pointer",
                                        "text-align": "center",
                                      }}
                                    >
                                      {i18n.t("static.budget.fundingsource")}
                                    </th>
                                    <th
                                      style={{
                                        width: "25px",
                                        cursor: "pointer",
                                        "text-align": "center",
                                      }}
                                    >
                                      {i18n.t("static.report.orders")}
                                    </th>
                                    <th
                                      style={{
                                        width: "25px",
                                        cursor: "pointer",
                                        "text-align": "center",
                                      }}
                                    >
                                      {i18n.t("static.report.costUsd")}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {this.state.shipmentDetailsFundingSourceList
                                    .length > 0 &&
                                    this.state.shipmentDetailsFundingSourceList.map(
                                      (item, idx) => (
                                        <tr id="addr0" key={idx}>
                                          <td style={{ "text-align": "center" }}>
                                            {getLabelText(
                                              this.state
                                                .shipmentDetailsFundingSourceList[
                                                idx
                                              ].fundingSource.label,
                                              this.state.lang
                                            )}
                                          </td>
                                          <td style={{ "text-align": "center" }}>
                                            {
                                              this.state
                                                .shipmentDetailsFundingSourceList[
                                                idx
                                              ].orderCount
                                            }
                                          </td>
                                          <td style={{ "text-align": "center" }}>
                                            {Number(
                                              this.state
                                                .shipmentDetailsFundingSourceList[
                                                idx
                                              ].cost
                                            )
                                              .toFixed(2)
                                              .toString()
                                              .replace(
                                                /\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g,
                                                ","
                                              )}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                </tbody>
                              </Table>
                            </div>
                          )}
                      </div>
                    </div>
                  </Col>
                  <Col md="12 pl-2">
                    <div className="row">
                      <FormGroup className="col-md-10 mt-3 ">
                        <ul className="legendcommitversion list-group">
                          {this.state.shipmentDetailsList.length > 0 && (
                            <li>
                              <span className="redlegend legendcolor"></span>{" "}
                              <span className="legendcommitversionText">
                                {i18n.t("static.supplyPlan.emergencyOrder")}
                              </span>
                            </li>
                          )}
                        </ul>
                      </FormGroup>
                      <div
                        className="consumptionDataEntryTable ShipmentSummeryReportMarginTop TableWidth100"
                        id="mytable2"
                      >
                        <div
                          id="shipmentDetailsListTableDiv"
                          className={
                            document.getElementById("versionId") != null &&
                              document
                                .getElementById("versionId")
                                .value.includes("Local")
                              ? "jexcelremoveReadonlybackground RowClickable TableWidth100"
                              : "jexcelremoveReadonlybackground"
                          }
                        ></div>
                      </div>
                    </div>
                  </Col>
                </div>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{ height: "500px" }}
                  >
                    <div class="align-items-center">
                      <div>
                        <h4>
                          {" "}
                          <strong>{i18n.t("static.common.loading")}</strong>
                        </h4>
                      </div>
                      <div class="spinner-border blue ml-4" role="status"></div>
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
export default ShipmentSummery;
