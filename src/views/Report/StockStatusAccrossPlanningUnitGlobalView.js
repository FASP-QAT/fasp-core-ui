import { CustomTooltips } from "@coreui/coreui-plugin-chartjs-custom-tooltips";
import {
  getStyle
} from "@coreui/coreui-pro/dist/js/coreui-utilities";
import "chartjs-plugin-annotation";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import React, { Component } from "react";
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
import { LOGO } from "../../CommonComponent/Logo.js";
import MonthBox from "../../CommonComponent/MonthBox.js";
import getLabelText from "../../CommonComponent/getLabelText";
import {
  API_URL,
  PROGRAM_TYPE_SUPPLY_PLAN
} from "../../Constants.js";
import DropdownService from "../../api/DropdownService";
import ProgramService from "../../api/ProgramService";
import RealmService from "../../api/RealmService";
import ReportService from "../../api/ReportService";
import TracerCategoryService from "../../api/TracerCategoryService";
import csvicon from "../../assets/img/csv.png";
import pdfIcon from "../../assets/img/pdf.png";
import i18n from "../../i18n";
import AuthenticationService from "../Common/AuthenticationService.js";
import AuthenticationServiceComponent from "../Common/AuthenticationServiceComponent";
import { addDoubleQuoteToRowContent, filterOptions, formatter, makeText, round, roundN } from "../../CommonComponent/JavascriptCommonFunctions.js";
const ref = React.createRef();
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
};
const legendcolor = [
  { text: i18n.t("static.report.stockout"), color: "#BA0C2F", value: 0 },
  { text: i18n.t("static.report.lowstock"), color: "#f48521", value: 1 },
  { text: i18n.t("static.report.okaystock"), color: "#118b70", value: 2 },
  { text: i18n.t("static.report.overstock"), color: "#edb944", value: 3 },
  { text: i18n.t("static.supplyPlanFormula.na"), color: "#cfcdc9", value: 4 },
];
/**
 * Component for Stock Status Across Planning Unit Global View Report.
 */
class StockStatusAccrossPlanningUnitGlobalView extends Component {
  constructor(props) {
    super(props);
    this.filterTracerCategory = this.filterTracerCategory.bind(this);
    this.filterProgram = this.filterProgram.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      dropdownOpen: false,
      radioSelected: 2,
      lang: localStorage.getItem("lang"),
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
      message: "",
      data: [],
      selData: [],
      tracerCategories: [],
      singleValue2: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
      },
      minDate: {
        year: new Date().getFullYear() - 10,
        month: new Date().getMonth() + 1,
      },
      maxDate: {
        year: new Date().getFullYear() + 10,
        month: new Date().getMonth() + 1,
      },
      loading: true,
      programLstFiltered: [],
      sortedData: [],
    };
  }
  /**
   * Handles the click event on the range picker box.
   * Shows the range picker component.
   * @param {object} e - The event object containing information about the click event.
   */
  handleClickMonthBox2 = (e) => {
    this.refs.pickAMonth2.show();
  };
  /**
   * Handles the dismiss of the range picker component.
   * Updates the component state with the new range value and triggers a data fetch.
   * @param {object} value - The new range value selected by the user.
   */
  handleAMonthDissmis2 = (value) => {
    this.setState({ singleValue2: value }, () => {
      this.filterData();
    });
  };
  /**
   * Exports the data to a CSV file.
   */
  exportCSV() {
    var csvRow = [];
    csvRow.push(
      '"' +
      (
        i18n.t("static.report.month") +
        " : " +
        makeText(this.state.singleValue2)
      ).replaceAll(" ", "%20") +
      '"'
    );
    csvRow.push("");
    this.state.countryLabels.map((ele) =>
      csvRow.push(
        '"' +
        (
          i18n.t("static.dashboard.country") +
          " : " +
          ele.toString()
        ).replaceAll(" ", "%20") +
        '"'
      )
    );
    csvRow.push("");
    this.state.programLabels.map((ele) =>
      csvRow.push(
        '"' +
        (
          i18n.t("static.program.program") +
          " : " +
          ele.toString()
        ).replaceAll(" ", "%20") +
        '"'
      )
    );
    csvRow.push("");
    this.state.tracerCategoryLabels.map((ele) =>
      csvRow.push(
        '"' +
        i18n
          .t("static.tracercategory.tracercategory")
          .replaceAll(" ", "%20") +
        " : " +
        ele.toString().replaceAll(" ", "%20") +
        '"'
      )
    );
    csvRow.push("");
    csvRow.push(
      '"' +
      ((
        i18n.t("static.report.includeapproved") +
        " : " +
        document.getElementById("includeApprovedVersions").selectedOptions[0]
          .text
      ).replaceAll(" ", "%20") +
        '"')
    );
    csvRow.push("");
    csvRow.push("");
    csvRow.push(
      '"' + i18n.t("static.common.youdatastart").replaceAll(" ", "%20") + '"'
    );
    csvRow.push("");
    var re;
    var A = [
      addDoubleQuoteToRowContent([
        i18n.t("static.report.qatPID").replaceAll(" ", "%20"),
        i18n.t("static.planningunit.planningunit").replaceAll(" ", "%20"),
        i18n.t("static.program.programMaster").replaceAll(" ", "%20"),
        i18n.t("static.supplyPlan.amc").replaceAll(" ", "%20"),
        i18n.t("static.supplyPlan.endingBalance").replaceAll(" ", "%20"),
        i18n.t("static.supplyPlan.monthsOfStock").replaceAll(" ", "%20"),
        i18n.t("static.supplyPlan.minStock").replaceAll(" ", "%20"),
        i18n.t("static.supplyPlan.maxStock").replaceAll(" ", "%20"),
      ]),
    ];
    //old code
    // re = this.state.data;
    // for (var item = 0; item < re.length; item++) {
    //   re[item].programData.map((p) =>
    //     A.push([
    //       addDoubleQuoteToRowContent([
    //         re[item].planningUnit.id,
    //         getLabelText(re[item].planningUnit.label, this.state.lang)
    //           .replaceAll(",", "%20")
    //           .replaceAll(" ", "%20"),
    //         getLabelText(p.program.label, this.state.lang)
    //           .replaceAll(",", "%20")
    //           .replaceAll(" ", "%20"),
    //         round(p.amc),
    //         round(p.finalClosingBalance),
    //         p.mos != null
    //           ? roundN(p.mos)
    //           : i18n.t("static.supplyPlanFormula.na"),
    //         p.minMos,
    //         p.maxMos,
    //       ]),
    //     ])
    //   );
    // }

    //new code
    this.state.sortedData.map((p) =>
      A.push([
        addDoubleQuoteToRowContent([
          p.planningUnit.id,
          getLabelText(p.planningUnit.label, this.state.lang)
            .replaceAll(",", "%20")
            .replaceAll(" ", "%20"),
          getLabelText(p.program.label, this.state.lang)
            .replaceAll(",", "%20")
            .replaceAll(" ", "%20"),
          round(p.amc),
          round(p.finalClosingBalance),
          p.mos != null
            ? roundN(p.mos)
            : i18n.t("static.supplyPlanFormula.na"),
          p.minMos,
          p.maxMos,
        ]),
      ])
    );

    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","));
    }
    var csvString = csvRow.join("%0A");
    var a = document.createElement("a");
    a.href = "data:attachment/csv," + csvString;
    a.target = "_Blank";
    a.download =
      i18n.t("static.report.stockStatusAccrossPlanningUnitGlobalView") + ".csv";
    document.body.appendChild(a);
    a.click();
  }
  /**
   * Determines the cell background color based on the minimum and maximum months of stock (MOS) thresholds.
   * @param {Object} item - An object containing MOS (months of stock), minimum MOS, and maximum MOS values.
   * @returns {Object} - An object representing the cell's background color based on the MOS thresholds.
   */
  cellstyleWithData = (item) => {
    if (item.mos != null && roundN(item.mos) == 0) {
      return { backgroundColor: legendcolor[0].color };
    } else if (
      roundN(item.mos) != 0 &&
      roundN(item.mos) != null &&
      roundN(item.mos) < item.minMos
    ) {
      return { backgroundColor: legendcolor[1].color };
    } else if (
      roundN(item.mos) >= item.minMos &&
      roundN(item.mos) <= item.maxMos
    ) {
      return { backgroundColor: legendcolor[2].color };
    } else if (roundN(item.mos) > item.maxMos) {
      return { backgroundColor: legendcolor[3].color };
    } else if (item.mos == null) {
      return { backgroundColor: legendcolor[4].color };
    }
  };
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
          i18n.t("static.report.stockStatusAccrossPlanningUnitGlobalView"),
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
            i18n.t("static.report.month") +
            " : " +
            makeText(this.state.singleValue2),
            doc.internal.pageSize.width / 8,
            90,
            {
              align: "left",
            }
          );
          doc.text(
            i18n.t("static.report.includeapproved") +
            " : " +
            document.getElementById("includeApprovedVersions")
              .selectedOptions[0].text,
            doc.internal.pageSize.width / 8,
            110,
            {
              align: "left",
            }
          );
          /*
          var planningText = doc.splitTextToSize(
            i18n.t("static.dashboard.country") +
            " : " +
            this.state.countryLabels.join(" , "),
            (doc.internal.pageSize.width * 3) / 4
          );
          doc.text(doc.internal.pageSize.width / 8, 130, planningText);
          var len = 140 + planningText.length * 10;
          planningText = doc.splitTextToSize(
            i18n.t("static.program.program") +
            " : " +
            this.state.programLabels.join("; "),
            (doc.internal.pageSize.width * 3) / 4
          );
          doc.text(doc.internal.pageSize.width / 8, 150, planningText);
          var len = len + 10 + planningText.length * 10;
          var planningText = doc.splitTextToSize(
            i18n.t("static.tracercategory.tracercategory") +
            " : " +
            this.state.tracerCategoryLabels.join("; "),
            (doc.internal.pageSize.width * 3) / 4
          );
          doc.text(doc.internal.pageSize.width / 8, len, planningText);
          */
        }
      }
    };
    const unit = "pt";
    const size = "A4";
    const orientation = "landscape";
    const marginLeft = 10;
    const doc = new jsPDF(orientation, unit, size, true);

    doc.setFontSize(8);
    doc.setTextColor("#002f6c");
    let y = 130;
    var countryText = doc.splitTextToSize(i18n.t("static.dashboard.country") + " : " + this.state.countryLabels.join(", "), (doc.internal.pageSize.width * 3) / 4);
    for (var i = 0; i < countryText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;
      };
      doc.text(doc.internal.pageSize.width / 8, y, countryText[i]);
      y = y + 10;
    }

    y = y + 10;
    var programText = doc.splitTextToSize(i18n.t("static.program.program") + " : " + this.state.programLabels.join("; "), (doc.internal.pageSize.width * 3) / 4);
    for (var i = 0; i < programText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;
      };
      doc.text(doc.internal.pageSize.width / 8, y, programText[i]);
      y = y + 10;
    }

    y = y + 10;
    var tracerCategoryText = doc.splitTextToSize(i18n.t("static.tracercategory.tracercategory") + " : " + this.state.tracerCategoryLabels.join("; "), (doc.internal.pageSize.width * 3) / 4);
    for (var i = 0; i < tracerCategoryText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;
      };
      doc.text(doc.internal.pageSize.width / 8, y, tracerCategoryText[i]);
      y = y + 10;
    }
    y = y + 10;

    //boxes to represent color code of stock
    doc.setDrawColor(0);
    doc.setFillColor(186, 12, 47);
    doc.rect(
      doc.internal.pageSize.width / 8,
      y,
      15,
      12,
      "F"
    );
    doc.setFillColor(244, 133, 33);
    doc.rect(
      doc.internal.pageSize.width / 8 + 100,
      y,
      15,
      12,
      "F"
    );
    doc.setFillColor(17, 139, 112);
    doc.rect(
      doc.internal.pageSize.width / 8 + 200,
      y,
      15,
      12,
      "F"
    );
    doc.setFillColor(237, 185, 68);
    doc.rect(
      doc.internal.pageSize.width / 8 + 300,
      y,
      15,
      12,
      "F"
    );
    doc.setFillColor(207, 205, 201);
    doc.rect(
      doc.internal.pageSize.width / 8 + 400,
      y,
      15,
      12,
      "F"
    );

    //for color label
    doc.text(
      i18n.t(legendcolor[0].text),
      doc.internal.pageSize.width / 8 + 20,
      y+10,
      {
        align: "left",
      }
    );

    doc.text(
      i18n.t(legendcolor[1].text),
      doc.internal.pageSize.width / 8 + 120,
      y+10,
      {
        align: "left",
      }
    );

    doc.text(
      i18n.t(legendcolor[2].text),
      doc.internal.pageSize.width / 8 + 220,
      y+10,
      {
        align: "left",
      }
    );

    doc.text(
      i18n.t(legendcolor[3].text),
      doc.internal.pageSize.width / 8 + 320,
      y+10,
      {
        align: "left",
      }
    );

    doc.text(
      i18n.t(legendcolor[4].text),
      doc.internal.pageSize.width / 8 + 420,
      y+10,
      {
        align: "left",
      }
    );

    // End of boxes
    y = y + 20;

    doc.setFontSize(10);
    const headers = [
      [
        i18n.t("static.report.qatPID"),
        i18n.t("static.planningunit.planningunit"),
        i18n.t("static.program.programMaster"),
        i18n.t("static.supplyPlan.amc"),
        i18n.t("static.supplyPlan.endingBalance"),
        i18n.t("static.supplyPlan.monthsOfStock"),
        i18n.t("static.supplyPlan.minStock"),
        i18n.t("static.supplyPlan.maxStock"),
      ],
    ];
    var data = [];

    // this.state.data.map((elt) =>
    //   elt.programData.map((p) =>
    //     data.push([
    //       elt.planningUnit.id,
    //       getLabelText(elt.planningUnit.label, this.state.lang),
    //       getLabelText(p.program.label, this.state.lang),
    //       formatter(round(p.amc),0),
    //       formatter(round(p.finalClosingBalance),0),
    //       p.mos != null
    //         ? formatter(roundN(p.mos),0)
    //         : i18n.t("static.supplyPlanFormula.na"),
    //       p.minMos,
    //       p.maxMos,
    //     ])
    //   )
    // );

    this.state.sortedData.map((p) =>
      data.push([
        p.planningUnit.id,
        getLabelText(p.planningUnit.label, this.state.lang),
        getLabelText(p.program.label, this.state.lang),
        formatter(round(p.amc), 0),
        formatter(round(p.finalClosingBalance), 0),
        p.mos != null
          ? formatter(roundN(p.mos), 0)
          : i18n.t("static.supplyPlanFormula.na"),
        p.minMos,
        p.maxMos,
      ])
    );

    const cellstyleWithData = (item) => {
      if (item.mos != null && roundN(item.mos) == 0) {
        return legendcolor[0].color;
      } else if (
        roundN(item.mos) != 0 &&
        roundN(item.mos) != null &&
        roundN(item.mos) < item.minMos
      ) {
        return legendcolor[1].color;
      } else if (
        roundN(item.mos) >= item.minMos &&
        roundN(item.mos) <= item.maxMos
      ) {
        return legendcolor[2].color;
      } else if (roundN(item.mos) > item.maxMos) {
        return legendcolor[3].color;
      } else if (item.mos == null) {
        return legendcolor[4].color;
      }
    };
    let dataColor;
    dataColor = this.state.sortedData.map((ele) => cellstyleWithData(ele));

    // var startY =
    //   150 +
    //   this.state.countryValues.length * 2 +
    //   this.state.tracerCategoryLabels.length * 3;

    let startY = y + 10;

    let content = {
      margin: { top: 80, bottom: 50 },
      startY: startY,
      head: headers,
      body: data,
      styles: { lineWidth: 1, fontSize: 8, halign: "center", cellWidth: 67 },
      columnStyles: {
        1: { cellWidth: 181.89 },
        2: { cellWidth: 178 },
      },
      didParseCell: function (data) {
        if (data.section == "body" && data.column.index == 5)
          data.cell.styles.fillColor =
            dataColor[data.row.index];
      },
    };
    doc.autoTable(content);
    addHeaders(doc);
    addFooters(doc);
    doc.save(
      i18n.t("static.report.stockStatusAccrossPlanningUnitGlobalView") + ".pdf"
    );
  };
  /**
   * Handles the change event for tracer categories.
   * @param {Array} tracerCategoryIds - An array containing the selected tracer category IDs.
   */
  handleTracerCategoryChange = (tracerCategoryIds) => {
    tracerCategoryIds = tracerCategoryIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    });
    this.setState(
      {
        tracerCategoryValues: tracerCategoryIds.map((ele) => ele),
        tracerCategoryLabels: tracerCategoryIds.map((ele) => ele.label),
      },
      () => {
        this.filterData();
      }
    );
  };
  /**
   * Handles the change event for program selection.
   * @param {array} programIds - The array of selected program IDs.
   */
  handleChangeProgram(programIds) {
    programIds = programIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    });
    this.setState(
      {
        programValues: programIds.map((ele) => ele),
        programLabels: programIds.map((ele) => ele.label),
      },
      () => {
        this.filterTracerCategory(programIds);
      }
    );
  }
  /**
   * Retrieves and filters tracer categories based on the provided program IDs.
   * @param {Array} programIds - An array containing the selected program IDs.
   */
  filterTracerCategory(programIds) {
    var programIdsValue = [];
    for (var i = 0; i < programIds.length; i++) {
      programIdsValue.push(programIds[i].value);
    }
    DropdownService.getTracerCategoryForMultipleProgramsDropdownList(
      programIdsValue
    )
      .then((response) => {
        var listArray = response.data;
        listArray.sort((a, b) => {
          var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
          var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
          return itemLabelA > itemLabelB ? 1 : -1;
        });
        this.setState(
          {
            tracerCategories: listArray,
          },
          () => {
            this.filterData();
          }
        );
      })
      .catch((error) => {
        this.setState(
          {
            tracerCategories: [],
          },
          () => {
            this.filterData();
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
              this.setState(
                {
                  tracerCategories: [],
                  message: i18n.t(error.response.data.messageCode, {
                    entityname: i18n.t("static.dashboard.Country"),
                  }),
                  loading: false,
                },
                () => {
                  this.filterData();
                }
              );
              break;
            case 412:
              this.setState(
                {
                  tracerCategories: [],
                  message: i18n.t(error.response.data.messageCode, {
                    entityname: i18n.t("static.dashboard.Country"),
                  }),
                  loading: false,
                },
                () => {
                  this.filterData();
                }
              );
              break;
            default:
              this.setState(
                {
                  tracerCategories: [],
                  message: "static.unkownError",
                  loading: false,
                },
                () => {
                  this.filterData();
                }
              );
              break;
          }
        }
      });
    if (programIdsValue.length == 0) {
      this.setState({
        message: i18n.t("static.common.selectProgram"),
        data: [],
        selData: [],
      });
    } else {
      this.setState({ message: "" });
    }
  }
  /**
   * Handles the change event for selected countries.
   * @param {Array} countrysId - An array containing the selected country IDs.
   */
  handleChange(countrysId) {
    countrysId = countrysId.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    });
    this.setState(
      {
        countryValues: countrysId.map((ele) => ele),
        countryLabels: countrysId.map((ele) => ele.label),
      },
      () => {
        this.filterProgram();
      }
    );
  }
  /**
   * Filters programs based on selected countries and tracer categories.
   */
  filterProgram = () => {
    let countryIds = this.state.countryValues.map((ele) => ele.value);
    let tracercategory =
      this.state.tracerCategoryValues.length ==
        this.state.tracerCategories.length
        ? []
        : this.state.tracerCategoryValues.map((ele) => ele.value.toString());
    this.setState(
      {
        programLstFiltered: [],
        programValues: [],
        programLabels: [],
      },
      () => {
        if (countryIds.length != 0) {
          let newCountryList = [...new Set(countryIds)];
          DropdownService.getProgramWithFilterForMultipleRealmCountryForDropdown(
            PROGRAM_TYPE_SUPPLY_PLAN,
            newCountryList
          )
            .then((response) => {
              var listArray = response.data;
              listArray.sort((a, b) => {
                var itemLabelA = a.code.toUpperCase();
                var itemLabelB = b.code.toUpperCase();
                return itemLabelA > itemLabelB ? 1 : -1;
              });
              if (listArray.length > 0) {
                this.setState(
                  {
                    programLstFiltered: listArray,
                  },
                  () => {
                    this.filterData();
                  }
                );
              } else {
                this.setState(
                  {
                    programLstFiltered: [],
                  },
                  () => {
                    this.filterData();
                  }
                );
              }
            })
            .catch((error) => {
              this.setState({
                programLstFiltered: [],
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
        } else {
          this.setState(
            {
              programLstFiltered: [],
            },
            () => {
              this.filterData();
            }
          );
        }
      }
    );
  };
  /**
   * Filters data based on selected countries, tracer categories, programs, and other parameters.
   */
  filterData = () => {
    let countrysId =
      this.state.countryValues.length == this.state.countrys.length
        ? []
        : this.state.countryValues.map((ele) => ele.value.toString());
    let tracercategory =
      this.state.tracerCategoryValues.length ==
        this.state.tracerCategories.length
        ? []
        : this.state.tracerCategoryValues.map((ele) => ele.value.toString());
    let realmId = AuthenticationService.getRealmId();
    let date = moment(
      new Date(this.state.singleValue2.year, this.state.singleValue2.month, 0)
    )
      .startOf("month")
      .format("YYYY-MM-DD");
    let useApprovedVersion = document.getElementById(
      "includeApprovedVersions"
    ).value;
    let programIds =
      this.state.programValues.length == this.state.programLstFiltered.length
        ? []
        : this.state.programValues.map((ele) => ele.value.toString());
    if (
      realmId > 0 &&
      this.state.countryValues.length > 0 &&
      this.state.tracerCategoryValues.length > 0 &&
      this.state.programValues.length > 0
    ) {
      this.setState({ loading: true });
      var inputjson = {
        realmCountryIds: countrysId,
        tracerCategoryIds: tracercategory,
        programIds: programIds,
        realmId: realmId,
        dt: date,
        useApprovedSupplyPlanOnly: useApprovedVersion,
      };
      ReportService.stockStatusAcrossProducts(inputjson)
        .then((response) => {
          this.setState(
            {
              selData: response.data,
              message: "",
              loading: false,
            },
            () => {
              this.filterDataAsperstatus();
            }
          );
        })
        .catch((error) => {
          this.setState(
            {
              selData: [],
              loading: false,
            },
            () => {
              this.filterDataAsperstatus();
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
    } else if (realmId <= 0) {
      this.setState({
        message: i18n.t("static.common.realmtext"),
        data: [],
        selData: [],
      });
    } else if (this.state.countryValues.length == 0) {
      this.setState({
        message: i18n.t("static.program.validcountrytext"),
        data: [],
        selData: [],
      });
    } else if (this.state.programValues.length == 0) {
      this.setState({
        message: i18n.t("static.common.selectProgram"),
        data: [],
        selData: [],
      });
    } else {
      this.setState({
        message: i18n.t("static.tracercategory.tracercategoryText"),
        data: [],
        selData: [],
      });
    }
  };
  /**
   * Filters data based on stock status and updates the state with the filtered data.
   */
  filterDataAsperstatus = () => {
    let stockStatusId = document.getElementById("stockStatusId").value;
    var filteredData = [];
    if (stockStatusId != -1) {
      this.state.selData.map((ele1) => {
        var filterProgramData = [];
        ele1.programData.map((ele) => {
          var min = ele.minMos;
          var max = ele.maxMos;
          if (stockStatusId == 0) {
            if (ele.mos != null && roundN(ele.mos) == 0) {
              filterProgramData.push(ele);
            }
          } else if (stockStatusId == 1) {
            if (
              ele.mos != null &&
              roundN(ele.mos) != 0 &&
              roundN(ele.mos) < min
            ) {
              filterProgramData.push(ele);
            }
          } else if (stockStatusId == 3) {
            if (roundN(ele.mos) > max) {
              filterProgramData.push(ele);
            }
          } else if (stockStatusId == 2) {
            if (roundN(ele.mos) < max && roundN(ele.mos) > min) {
              filterProgramData.push(ele);
            }
          } else if (stockStatusId == 4) {
            if (ele.mos == null) {
              filterProgramData.push(ele);
            }
          }
        });
        if (filterProgramData.length > 0) {
          filteredData.push({
            planningUnit: ele1.planningUnit,
            programData: filterProgramData,
          });
        }
      });
    } else {
      filteredData = this.state.selData;
    }
    let planningUnits = [
      ...new Set(filteredData.map((ele) => ele.planningUnit)),
    ];
    planningUnits.sort((a, b) => {
      var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
      var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
      return itemLabelA > itemLabelB ? 1 : -1;
    });

    let programs = [
      ...new Set(
        filteredData
          .map((ele) => ele.programData.map((ele1) => ele1.program.code))
          .flat(1)
      ),
    ];

    //sort programs alphabetically
    programs.sort((a, b) => {
      var itemLabelA = a.toUpperCase();
      var itemLabelB = b.toUpperCase();
      return itemLabelA > itemLabelB ? 1 : -1;
    });

    this.setState({
      data: filteredData,
      programLst: programs,
      planningUnits: planningUnits,
    });

    //create new data for pdf & csv report
    var dataCopy = [...filteredData];
    var unsortedDataList = [];
    dataCopy.map((elt) =>
      elt.programData.map((p) => {
        p.planningUnit = elt.planningUnit
        unsortedDataList.push(p);
      }
      )
    );

    // unsortedDataList.sort((a, b) => {
    //   var itemLabelA = getLabelText(a.program.label, this.state.lang).toUpperCase();
    //   var itemLabelB = getLabelText(b.program.label, this.state.lang).toUpperCase();
    //   return itemLabelA > itemLabelB ? 1 : -1;
    // });

    //sort alphabeltically by program, to group records by program, and then within each program, alphabetical by PU
    unsortedDataList.sort((a, b) => {
      // First, compare the program labels (alphabetically)
      const programLabelA = getLabelText(a.program.label, this.state.lang).toUpperCase();
      const programLabelB = getLabelText(b.program.label, this.state.lang).toUpperCase();

      if (programLabelA < programLabelB) return -1;
      if (programLabelA > programLabelB) return 1;

      // If program labels are the same, compare the planning unit labels (alphabetically)
      const planningUnitLabelA = a.planningUnit.label.label_en?.toUpperCase() || "";//handle cases where the label_en might be null or undefined.
      const planningUnitLabelB = b.planningUnit.label.label_en?.toUpperCase() || "";

      if (planningUnitLabelA < planningUnitLabelB) return -1;
      if (planningUnitLabelA > planningUnitLabelB) return 1;

      // If both are the same, return 0 (they are equal)
      return 0;
    });

    this.setState({
      sortedData: unsortedDataList
    });
  };
  /**
   * Retrieves the list of countries based on the realm ID and updates the state with the list.
   */
  getCountrys = () => {
    let realmId = AuthenticationService.getRealmId();
    DropdownService.getRealmCountryDropdownList(realmId)
      .then((response) => {
        var listArray = response.data;
        listArray.sort((a, b) => {
          var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
          var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
          return itemLabelA > itemLabelB ? 1 : -1;
        });
        this.setState({
          countrys: listArray,
          loading: false,
        });
      })
      .catch((error) => {
        this.setState({
          countrys: [],
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
                  entityname: i18n.t("static.dashboard.Country"),
                }),
                loading: false,
              });
              break;
            case 412:
              this.setState({
                message: i18n.t(error.response.data.messageCode, {
                  entityname: i18n.t("static.dashboard.Country"),
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
  };
  /**
   * Calls the get countrys function on page load
   */
  componentDidMount() {
    this.getCountrys();
  }
  /**
   * Renders a loading indicator.
   * @returns {JSX.Element} Loading indicator.
   */
  loading = () => (
    <div className="animated fadeIn pt-1 text-center">
      {i18n.t("static.common.loading")}
    </div>
  );
  /**
   * Renders the Stock Status Planning Unit Global View table.
   * @returns {JSX.Element} - Stock Status Planning Unit Global View table
   */
  render() {
    const { singleValue2 } = this.state;
    const { countrys } = this.state;
    let countryList =
      countrys.length > 0 &&
      countrys.map((item, i) => {
        return {
          label: getLabelText(item.label, this.state.lang),
          value: item.id,
        };
      }, this);
    const { tracerCategories } = this.state;
    const { programLstFiltered } = this.state;
    let programList = [];
    programList =
      programLstFiltered.length > 0 &&
      programLstFiltered.map((item, i) => {
        return (
          { label: item.code, value: item.id }
        );
      }, this);
    return (
      <div className="animated fadeIn">
        <AuthenticationServiceComponent history={this.props.history} />
        <h6 className="mt-success">
          {i18n.t(this.props.match.params.message)}
        </h6>
        <h5 className="red">{i18n.t(this.state.message)}</h5>
        <Card>
          <div className="Card-header-reporticon">
            {this.state.data.length > 0 && (
              <div className="card-header-actions">
                <a className="card-header-action">
                  <img
                    style={{ height: "25px", width: "25px", cursor: "pointer" }}
                    src={pdfIcon}
                    title="Export PDF"
                    onClick={() => this.exportPDF()}
                  />
                  <img
                    style={{ height: "25px", width: "25px", cursor: "pointer" }}
                    src={csvicon}
                    title={i18n.t("static.report.exportCsv")}
                    onClick={() => this.exportCSV()}
                  />
                </a>
              </div>
            )}
          </div>
          <CardBody className="pb-lg-2 pt-lg-0">
            <div ref={ref}>
              <Form>
                <div className="pl-0">
                  <div className="row">
                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">
                        {i18n.t("static.report.month")}
                        <span className="stock-box-icon  fa fa-sort-desc ml-1"></span>
                      </Label>
                      <div className="controls edit">
                        <Picker
                          ref="pickAMonth2"
                          years={{
                            min: this.state.minDate,
                            max: this.state.maxDate,
                          }}
                          value={singleValue2}
                          lang={pickerLang.months}
                          theme="dark"
                          onDismiss={this.handleAMonthDissmis2}
                        >
                          <MonthBox
                            value={makeText(singleValue2)}
                            onClick={this.handleClickMonthBox2}
                          />
                        </Picker>
                      </div>
                    </FormGroup>
                    <FormGroup className="col-md-3">
                      <Label htmlFor="countrysId">
                        {i18n.t("static.program.realmcountry")}
                      </Label>
                      <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                      <div className="controls edit">
                        <MultiSelect
                          bsSize="sm"
                          filterOptions={filterOptions}
                          name="countrysId"
                          id="countrysId"
                          value={this.state.countryValues}
                          onChange={(e) => {
                            this.handleChange(e);
                          }}
                          options={
                            countryList && countryList.length > 0
                              ? countryList
                              : []
                          }
                          disabled={this.state.loading}
                          overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                          selectSomeItems: i18n.t('static.common.select')}}
                        />
                        {!!this.props.error && this.props.touched && (
                          <div style={{ color: "#BA0C2F", marginTop: ".5rem" }}>
                            {this.props.error}
                          </div>
                        )}
                      </div>
                    </FormGroup>
                    <FormGroup className="col-md-3">
                      <Label htmlFor="programIds">
                        {i18n.t("static.program.program")}
                      </Label>
                      <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                      <MultiSelect
                        bsSize="sm"
                        name="programIds"
                        id="programIds"
                        value={this.state.programValues}
                        filterOptions={filterOptions}
                        onChange={(e) => {
                          this.handleChangeProgram(e);
                        }}
                        options={
                          programList && programList.length > 0
                            ? programList
                            : []
                        }
                        disabled={this.state.loading}
                        overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                        selectSomeItems: i18n.t('static.common.select')}}
                      />
                      {!!this.props.error && this.props.touched && (
                        <div style={{ color: "#BA0C2F", marginTop: ".5rem" }}>
                          {this.props.error}
                        </div>
                      )}
                    </FormGroup>
                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">
                        {i18n.t("static.tracercategory.tracercategory")}
                      </Label>
                      <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                      <div className="controls">
                        <MultiSelect
                          name="tracerCategoryId"
                          id="tracerCategoryId"
                          bsSize="sm"
                          value={this.state.tracerCategoryValues}
                          filterOptions={filterOptions}
                          onChange={(e) => {
                            this.handleTracerCategoryChange(e);
                          }}
                          disabled={this.state.loading}
                          options={
                            tracerCategories.length > 0
                              ? tracerCategories.map((item, i) => {
                                return {
                                  label: getLabelText(
                                    item.label,
                                    this.state.lang
                                  ),
                                  value: item.id,
                                };
                              }, this)
                              : []
                          }
                          overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                          selectSomeItems: i18n.t('static.common.select')}}
                        />
                      </div>
                    </FormGroup>
                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">
                        {i18n.t("static.report.includeapproved")}
                      </Label>
                      <div className="controls ">
                        <InputGroup>
                          <Input
                            type="select"
                            name="includeApprovedVersions"
                            id="includeApprovedVersions"
                            bsSize="sm"
                            onChange={(e) => {
                              this.filterData();
                            }}
                          >
                            <option value="true">
                              {i18n.t("static.program.yes")}
                            </option>
                            <option value="false">
                              {i18n.t("static.program.no")}
                            </option>
                          </Input>
                        </InputGroup>
                      </div>
                    </FormGroup>
                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">
                        {i18n.t("static.report.withinstock")}
                      </Label>
                      <div className="controls ">
                        <InputGroup>
                          <Input
                            type="select"
                            name="stockStatusId"
                            id="stockStatusId"
                            bsSize="sm"
                            onChange={(e) => {
                              this.filterDataAsperstatus();
                            }}
                          >
                            <option value="-1">
                              {i18n.t("static.common.all")}
                            </option>
                            {legendcolor.length > 0 &&
                              legendcolor.map((item, i) => {
                                return (
                                  <option key={i} value={item.value}>
                                    {item.text}
                                  </option>
                                );
                              }, this)}
                          </Input>
                        </InputGroup>
                      </div>
                    </FormGroup>
                    <FormGroup
                      className="col-md-12 mt-2 "
                      style={{ display: this.state.display }}
                    >
                      <ul className="legendcommitversion list-group">
                        {legendcolor.map((item1) => (
                          <li>
                            <span
                              className="legendcolor"
                              style={{ backgroundColor: item1.color }}
                            ></span>{" "}
                            <span className="legendcommitversionText">
                              {item1.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </FormGroup>
                  </div>
                </div>
              </Form>
              <Col md="12 pl-0">
                <div className="globalviwe-scroll">
                  <div className="row"></div>
                  <div
                    className="row"
                    style={{ display: this.state.loading ? "none" : "block" }}
                  >
                    <div className="col-md-12">
                      <div className="">
                        <div className="fixTableHead1">
                          {this.state.data.length > 0 && (
                            <Table className="table-striped  table-fixed  table-bordered text-center">
                              <thead>
                                <tr>
                                  <th
                                    className="text-center Firstcolum1"
                                    style={{ width: "27%",left:"0" }}
                                  >
                                    {i18n.t("static.planningunit.planningunit")}
                                  </th>
                                  {this.state.programLst.map((ele) => {
                                    return (
                                      <th
                                        className="text-center"
                                        style={{
                                          width:
                                            (100 - 27) /
                                            this.state.programLst.length +
                                            "%",
                                        }}
                                      >
                                        {ele}
                                      </th>
                                    );
                                  })}
                                </tr>
                              </thead>
                              <tbody>
                                {this.state.planningUnits.map((ele) => {
                                  return (
                                    <tr>
                                      <td className="sticky-col first-col clone Firstcolum">
                                        {getLabelText(
                                          ele.label,
                                          this.state.lang
                                        )}
                                      </td>
                                      {this.state.programLst.map((ele1) => {
                                        return this.state.data
                                          .filter(
                                            (c) => c.planningUnit.id == ele.id
                                          )
                                          .map((item) => {
                                            return item.programData.filter(
                                              (c) => c.program.code === ele1
                                            ).length == 0 ? (
                                              <td></td>
                                            ) : (
                                              <td
                                                className="text-center darkModeclrblack"
                                                style={this.cellstyleWithData(
                                                  item.programData.filter(
                                                    (c) =>
                                                      c.program.code == ele1
                                                  )[0]
                                                )}
                                              >
                                                {item.programData.filter(
                                                  (c) => c.program.code == ele1
                                                )[0].mos != null
                                                  ? roundN(
                                                    item.programData.filter(
                                                      (c) =>
                                                        c.program.code == ele1
                                                    )[0].mos
                                                  )
                                                  : i18n.t(
                                                    "static.supplyPlanFormula.na"
                                                  )}
                                              </td>
                                            );
                                          });
                                      })}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </Table>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{ display: this.state.loading ? "block" : "none" }}
                  >
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
                        <div
                          class="spinner-border blue ml-4"
                          role="status"
                        ></div>
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