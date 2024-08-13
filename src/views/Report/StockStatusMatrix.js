import { DatePicker } from "antd";
import "antd/dist/antd.css";
import CryptoJS from "crypto-js";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import React from "react";
import {
  CSVExport,
  Search,
} from "react-bootstrap-table2-toolkit";
import { MultiSelect } from "react-multi-select-component";
import {
  Card,
  CardBody,
  FormGroup,
  Input,
  InputGroup,
  Label,
  Table
} from "reactstrap";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { LOGO } from "../../CommonComponent/Logo.js";
import getLabelText from "../../CommonComponent/getLabelText";
import {
  API_URL,
  INDEXED_DB_NAME,
  INDEXED_DB_VERSION,
  PROGRAM_TYPE_SUPPLY_PLAN,
  REPORT_DATEPICKER_END_MONTH,
  REPORT_DATEPICKER_START_MONTH,
  SECRET_KEY
} from "../../Constants.js";
import DropdownService from "../../api/DropdownService";
import ProductService from "../../api/ProductService";
import csvicon from "../../assets/img/csv.png";
import pdfIcon from "../../assets/img/pdf.png";
import i18n from "../../i18n";
import AuthenticationService from "../Common/AuthenticationService.js";
import AuthenticationServiceComponent from "../Common/AuthenticationServiceComponent";
import SupplyPlanFormulas from "../SupplyPlan/SupplyPlanFormulas";
import { addDoubleQuoteToRowContent, filterOptions, formatter, roundAMC, roundN } from "../../CommonComponent/JavascriptCommonFunctions";
const { RangePicker } = DatePicker;
const legendcolor = [
  { text: i18n.t("static.report.stockout"), color: "#BA0C2F", value: 0 },
  { text: i18n.t("static.report.lowstock"), color: "#f48521", value: 1 },
  { text: i18n.t("static.report.okaystock"), color: "#118b70", value: 2 },
  { text: i18n.t("static.report.overstock"), color: "#edb944", value: 3 },
  { text: i18n.t("static.supplyPlanFormula.na"), color: "#cfcdc9", value: 4 },
];
const { ExportCSVButton } = CSVExport;
const entityname = i18n.t("static.dashboard.productCatalog");
/**
 * Component for Stock Status Matrix Report.
 */
export default class StockStatusMatrix extends React.Component {
  constructor(props) {
    super(props);
    var dt = new Date();
    dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
    var dt1 = new Date();
    dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
    this.state = {
      realms: [],
      productCategories: [],
      planningUnits: [],
      data: [],
      selData: [],
      programs: [],
      versions: [],
      includePlanningShipments: true,
      years: [],
      pulst: [],
      tracerCategories: [],
      tracerCategoryValues: [],
      tracerCategoryLabels: [],
      planningUnitList: [],
      message: "",
      planningUnitValues: [],
      planningUnitLabels: [],
      rangeValue: {
        from: { year: dt.getFullYear(), month: dt.getMonth() + 1 },
        to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 },
      },
      startYear: new Date().getFullYear() - 1,
      endYear: new Date().getFullYear(),
      loading: true,
      programId: "",
      versionId: "",
    };
    this.filterData = this.filterData.bind(this);
    this.setProgramId = this.setProgramId.bind(this);
    this.setVersionId = this.setVersionId.bind(this);
  }
  /**
   * Retrieves tracer categories based on the selected program and version.
   * Fetches from local IndexedDB if version is local, or from server API.
   * Updates component state with fetched data and handles errors.
   */
  getTracerCategoryList() {
    let programId = document.getElementById("programId").value;
    let versionId = document.getElementById("versionId").value;
    this.setState(
      {
        tracerCategories: [],
        tracerCategoryValues: [],
        tracerCategoryLabels: [],
      },
      () => {
        if (programId > 0 && versionId != 0) {
          localStorage.setItem("sesVersionIdReport", versionId);
          var cutOffDateFromProgram=this.state.versions.filter(c=>c.versionId==versionId)[0].cutOffDate;
          var cutOffDate = cutOffDateFromProgram != undefined && cutOffDateFromProgram != null && cutOffDateFromProgram != "" ? cutOffDateFromProgram : moment(Date.now()).add(-10, 'years').format("YYYY-MM-DD");
          var startYear = this.state.startYear;
          var endYear=this.state.endYear;
          if (moment(startYear).format("YYYY") < moment(cutOffDate).format("YYYY")) {
              startYear=moment(cutOffDate).format("YYYY");
              endYear=moment(cutOffDate).add(1,'years').format("YYYY")
          }
          this.setState({
            startYear: startYear,
            endYear:endYear,
            minDate:moment(cutOffDate).format("YYYY")
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
              var planningList = [];
              planningunitRequest.onerror = function (event) {
              };
              planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result.filter(
                  (c) => c.active == true
                );
                var programId = document
                  .getElementById("programId")
                  .value.split("_")[0];
                var proList = [];
                for (var i = 0; i < myResult.length; i++) {
                  if (myResult[i].program.id == programId) {
                    proList.push(myResult[i].planningUnit);
                  }
                }
                this.setState({ programPlanningUnitList: myResult });
                var planningunitTransaction1 = db1.transaction(
                  ["planningUnit"],
                  "readwrite"
                );
                var planningunitOs1 =
                  planningunitTransaction1.objectStore("planningUnit");
                var planningunitRequest1 = planningunitOs1.getAll();
                planningunitRequest1.onerror = function (event) {
                };
                planningunitRequest1.onsuccess = function (e) {
                  var myResult = [];
                  myResult = planningunitRequest1.result;
                  var flList = [];
                  for (var i = 0; i < myResult.length; i++) {
                    for (var j = 0; j < proList.length; j++) {
                      if (myResult[i].planningUnitId == proList[j].id) {
                        flList.push(myResult[i].forecastingUnit);
                        planningList.push(myResult[i]);
                      }
                    }
                  }
                  var tcList = [];
                  flList.filter(function (item) {
                    var i = tcList.findIndex(
                      (x) => x.id == item.tracerCategory.id
                    );
                    if (i <= -1 && item.tracerCategory.id != 0) {
                      tcList.push({
                        id: item.tracerCategory.id,
                        label: item.tracerCategory.label,
                      });
                    }
                    return null;
                  });
                  var lang = this.state.lang;
                  this.setState(
                    {
                      tracerCategories: tcList.sort(function (a, b) {
                        a = getLabelText(a.label, lang).toLowerCase();
                        b = getLabelText(b.label, lang).toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                      }),
                      planningUnitList: planningList,
                    },
                    () => {
                      this.filterData();
                    }
                  );
                }.bind(this);
              }.bind(this);
            }.bind(this);
          } else {
            DropdownService.getTracerCategoryForMultipleProgramsDropdownList([
              programId,
            ])
              .then((response) => {
                if (response.status == 200) {
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
                      tracerCategories: listArray,
                    },
                    () => {
                      this.filterData();
                    }
                  );
                }
              })
              .catch((error) => {
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
          }
        } else {
          this.filterData();
        }
      }
    );
  }
  /**
   * Updates startYear and endYear in component state based on the selected range of years.
   * Triggers data filtering after updating the state.
   * @param {Array} value - Array containing start and end dates selected by the user.
   */
  onYearChange = (value) => {
    this.setState(
      {
        startYear: value[0].format("YYYY"),
        endYear: value[1].format("YYYY"),
      },
      () => {
        this.filterData();
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
        this.filterData();
      }
    );
  };
  /**
   * Filters data based on the selected stock status and updates the component state.
   */
  filterDataAsperstatus = () => {
    let stockStatusId = document.getElementById("stockStatusId").value;
    var filteredData = [];
    if (stockStatusId != -1) {
      this.state.selData.map((ele) => {
        var min = ele.minMonthsOfStock;
        var reorderFrequency = ele.reorderFrequency;
        if (stockStatusId == 0) {
          if (
            (ele.jan != null && roundN(ele.jan) == 0) ||
            (ele.feb != null && roundN(ele.feb) == 0) ||
            (ele.mar != null && roundN(ele.mar) == 0) ||
            (ele.apr != null && roundN(ele.apr) == 0) ||
            (ele.may != null && roundN(ele.may) == 0) ||
            (ele.jun != null && roundN(ele.jun) == 0) ||
            (ele.jul != null && roundN(ele.jul) == 0) ||
            (ele.aug != null && roundN(ele.aug) == 0) ||
            (ele.sep != null && roundN(ele.sep) == 0) ||
            (ele.oct != null && roundN(ele.oct) == 0) ||
            (ele.nov != null && roundN(ele.nov) == 0) ||
            (ele.dec != null && roundN(ele.dec) == 0)
          ) {
            filteredData.push(ele);
          }
        } else if (stockStatusId == 1) {
          if (
            (ele.jan != null &&
              roundN(ele.jan) != 0 &&
              roundN(ele.jan) < min) ||
            (ele.feb != null &&
              roundN(ele.feb) != 0 &&
              roundN(ele.feb) < min) ||
            (ele.mar != null &&
              roundN(ele.mar) != 0 &&
              roundN(ele.mar) < min) ||
            (ele.apr != null &&
              roundN(ele.apr) != 0 &&
              roundN(ele.apr) < min) ||
            (ele.may != null &&
              roundN(ele.may) != 0 &&
              roundN(ele.may) < min) ||
            (ele.jun != null &&
              roundN(ele.jun) != 0 &&
              roundN(ele.jun) < min) ||
            (ele.jul != null &&
              roundN(ele.jul) != 0 &&
              roundN(ele.jul) < min) ||
            (ele.aug != null &&
              roundN(ele.aug) != 0 &&
              roundN(ele.aug) < min) ||
            (ele.sep != null &&
              roundN(ele.sep) != 0 &&
              roundN(ele.sep) < min) ||
            (ele.oct != null &&
              roundN(ele.oct) != 0 &&
              roundN(ele.oct) < min) ||
            (ele.nov != null &&
              roundN(ele.nov) != 0 &&
              roundN(ele.nov) < min) ||
            (ele.dec != null &&
              roundN(ele.dec) != 0 &&
              roundN(ele.dec) < min)
          ) {
            filteredData.push(ele);
          }
        } else if (stockStatusId == 3) {
          if (
            roundN(ele.jan) > min + reorderFrequency ||
            roundN(ele.feb) > min + reorderFrequency ||
            roundN(ele.mar) > min + reorderFrequency ||
            roundN(ele.apr) > min + reorderFrequency ||
            roundN(ele.may) > min + reorderFrequency ||
            roundN(ele.jun) > min + reorderFrequency ||
            roundN(ele.jul) > min + reorderFrequency ||
            roundN(ele.aug) > min + reorderFrequency ||
            roundN(ele.sep) > min + reorderFrequency ||
            roundN(ele.oct) > min + reorderFrequency ||
            roundN(ele.nov) > min + reorderFrequency ||
            roundN(ele.dec) > min + reorderFrequency
          ) {
            filteredData.push(ele);
          }
        } else if (stockStatusId == 2) {
          if (
            (roundN(ele.jan) < min + reorderFrequency &&
              roundN(ele.jan) > min) ||
            (roundN(ele.feb) < min + reorderFrequency &&
              roundN(ele.feb) > min) ||
            (roundN(ele.mar) < min + reorderFrequency &&
              roundN(ele.mar) > min) ||
            (roundN(ele.apr) < min + reorderFrequency &&
              roundN(ele.apr) > min) ||
            (roundN(ele.may) < min + reorderFrequency &&
              roundN(ele.may) > min) ||
            (roundN(ele.jun) < min + reorderFrequency &&
              roundN(ele.jun) > min) ||
            (roundN(ele.jul) < min + reorderFrequency &&
              roundN(ele.jul) > min) ||
            (roundN(ele.aug) < min + reorderFrequency &&
              roundN(ele.aug) > min) ||
            (roundN(ele.sep) < min + reorderFrequency &&
              roundN(ele.sep) > min) ||
            (roundN(ele.oct) < min + reorderFrequency &&
              roundN(ele.act) > min) ||
            (roundN(ele.nov) < min + reorderFrequency &&
              roundN(ele.nov) > min) ||
            (roundN(ele.dec) < min + reorderFrequency &&
              roundN(ele.dec) > min)
          ) {
            filteredData.push(ele);
          }
        } else if (stockStatusId == 4) {
          if (
            ele.jan == null ||
            ele.feb == null ||
            ele.mar == null ||
            ele.apr == null ||
            ele.may == null ||
            ele.jun == null ||
            ele.jul == null ||
            ele.aug == null ||
            ele.sep == null ||
            ele.oct == null ||
            ele.nov == null ||
            ele.dec == null
          ) {
            filteredData.push(ele);
          }
        }
      });
    } else {
      filteredData = this.state.selData;
    }
    this.setState({
      data: filteredData,
    });
  };
  /**
   * Filters data based on selected parameters and updates component state accordingly.
   */
  filterData() {
    let startDate = this.state.startYear + "-01-01";
    let endDate =
      this.state.endYear +
      "-12-" +
      new Date(this.state.endYear, 12, 0).getDate();
    let programId = document.getElementById("programId").value;
    let planningUnitIds = this.state.planningUnitValues.map((ele) =>
      ele.value.toString()
    );
    let versionId = document.getElementById("versionId").value;
    let tracercategory =
      this.state.tracerCategoryValues.length ==
        this.state.tracerCategories.length
        ? []
        : this.state.tracerCategoryValues.map((ele) => ele.value.toString());
    let includePlannedShipments = document.getElementById(
      "includePlanningShipments"
    ).value;
    if (
      this.state.planningUnitValues.length > 0 &&
      programId > 0 &&
      versionId != 0 &&
      this.state.tracerCategoryValues.length > 0
    ) {
      if (versionId.includes("Local")) {
        this.setState({ loading: true });
        var data = [];
        var data1 = [];
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
          var planningUnitTransaction = db1.transaction(
            ["planningUnit"],
            "readwrite"
          );
          var planningUnitObjectStore =
            planningUnitTransaction.objectStore("planningUnit");
          var planningunitRequest = planningUnitObjectStore.getAll();
          planningunitRequest.onerror = function (event) {
            this.setState({
              loading: false,
            });
          };
          var plunit = [];
          planningunitRequest.onsuccess = function (e) {
            var myResult1 = [];
            myResult1 = e.target.result;
            planningUnitIds.map((planningUnitId) => {
              plunit = [
                ...plunit,
                ...myResult1.filter((c) => c.planningUnitId == planningUnitId),
              ];
            });
          }.bind(this);
          var transaction = db1.transaction(["programData"], "readwrite");
          var programTransaction = transaction.objectStore("programData");
          var version = versionId.split("(")[0].trim();
          var userBytes = CryptoJS.AES.decrypt(
            localStorage.getItem("curUser"),
            SECRET_KEY
          );
          var userId = userBytes.toString(CryptoJS.enc.Utf8);
          var program = `${programId}_v${version}_uId_${userId}`;
          var programRequest = programTransaction.get(program);
          programRequest.onerror = function (event) {
            this.setState({
              loading: false,
            });
          }.bind(this);
          programRequest.onsuccess = function (event) {
            var planningUnitDataList =
              programRequest.result.programData.planningUnitDataList;
            planningUnitIds.map((planningUnitId) => {
              var planningUnitDataIndex = planningUnitDataList.findIndex(
                (c) => c.planningUnitId == planningUnitId
              );
              var programJson = {};
              if (planningUnitDataIndex != -1) {
                var planningUnitData = planningUnitDataList.filter(
                  (c) => c.planningUnitId == planningUnitId
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
              var pu = this.state.planningUnits.filter(
                (c) => c.planningUnit.id == planningUnitId
              )[0];
              for (
                var from = this.state.startYear, to = this.state.endYear;
                from <= to;
                from++
              ) {
                var monthlydata = [];
                var monthlydata1 = [];
                var monthlydataTotal = 0;
                var totalMonths = 0;
                for (var month = 1; month <= 12; month++) {
                  var dtstr =
                    from + "-" + String(month).padStart(2, "0") + "-01";
                  var dt = dtstr;
                  var list = programJson.supplyPlan.filter(
                    (c) =>
                      c.planningUnitId == planningUnitId && c.transDate == dt
                  );
                  if (list.length > 0) {
                    if (includePlannedShipments.toString() == "true") {
                      monthlydata.push(
                        pu.planBasedOn == 1 ? list[0].mos : list[0].maxStock
                      );
                      monthlydata1.push(list[0].closingBalance);
                      monthlydataTotal += Number(list[0].maxStock);
                      totalMonths += 1;
                    } else {
                      monthlydata.push(
                        pu.planBasedOn == 1 ? list[0].mosWps : list[0].maxStock
                      );
                      monthlydata1.push(list[0].closingBalanceWps);
                      monthlydataTotal += Number(list[0].maxStock);
                      totalMonths += 1;
                    }
                  } else {
                    monthlydata.push(null);
                    monthlydata1.push(null);
                  }
                }
                var json = {
                  tracerCategoryId: this.state.planningUnitList.filter(
                    (c) => c.planningUnitId == planningUnitId
                  )[0].forecastingUnit.tracerCategory.id,
                  planningUnit: pu.planningUnit,
                  unit: plunit.filter(
                    (c) => c.planningUnitId == planningUnitId
                  )[0].unit,
                  reorderFrequency: pu.reorderFrequencyInMonths,
                  year: from,
                  minMonthsOfStock:
                    pu.planBasedOn == 1 ? pu.minMonthsOfStock : pu.minQty,
                  jan: monthlydata[0],
                  feb: monthlydata[1],
                  mar: monthlydata[2],
                  apr: monthlydata[3],
                  may: monthlydata[4],
                  jun: monthlydata[5],
                  jul: monthlydata[6],
                  aug: monthlydata[7],
                  sep: monthlydata[8],
                  oct: monthlydata[9],
                  nov: monthlydata[10],
                  dec: monthlydata[11],
                  planBasedOn: pu.planBasedOn,
                  janStock: monthlydata1[0],
                  febStock: monthlydata1[1],
                  marStock: monthlydata1[2],
                  aprStock: monthlydata1[3],
                  mayStock: monthlydata1[4],
                  junStock: monthlydata1[5],
                  julStock: monthlydata1[6],
                  augStock: monthlydata1[7],
                  sepStock: monthlydata1[8],
                  octStock: monthlydata1[9],
                  novStock: monthlydata1[10],
                  decStock: monthlydata1[11],
                  maxStock:
                    totalMonths != 0
                      ? Number(monthlydataTotal) / totalMonths
                      : "",
                };
                data.push(json);
              }
            });
            let tracerCategoryValues = this.state.tracerCategoryValues;
            for (let i = 0; i < data.length; i++) {
              for (let j = 0; j < tracerCategoryValues.length; j++) {
                if (tracerCategoryValues[j].value == data[i].tracerCategoryId) {
                  data1.push(data[i]);
                }
              }
            }
            data1.sort((a, b) => {
              var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase();
              var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase();
              return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState(
              {
                selData: data1,
                message: "",
                loading: false,
              },
              () => {
                this.filterDataAsperstatus();
              }
            );
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
          includePlannedShipments: includePlannedShipments,
          tracerCategoryIds: tracercategory,
        };
        ProductService.getStockStatusMatrixData(inputjson)
          .then((response) => {
            var listArray = response.data;
            listArray.sort((a, b) => {
              var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase();
              var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase();
              return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState(
              {
                selData: listArray,
                message: "",
                loading: false,
              },
              () => {
                this.filterDataAsperstatus();
              }
            );
          })
          .catch((error) => {
            this.setState({
              selData: [],
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
                    message: i18n.t(error.response.data.messageCode, {
                      entityname: i18n.t("static.dashboard.productcategory"),
                    }),
                    loading: false,
                  });
                  break;
                case 412:
                  this.setState({
                    message: i18n.t(error.response.data.messageCode, {
                      entityname: i18n.t("static.dashboard.productcategory"),
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
    } else if (programId == 0) {
      this.setState({
        message: i18n.t("static.common.selectProgram"),
        selData: [],
        data: [],
        tracerCategories: [],
        tracerCategoryValues: [],
        tracerCategoryLabels: [],
        planningUnits: [],
        planningUnitValues: [],
        planningUnitLabels: [],
      });
    } else if (versionId == 0) {
      this.setState({
        message: i18n.t("static.program.validversion"),
        selData: [],
        data: [],
        tracerCategories: [],
        tracerCategoryValues: [],
        tracerCategoryLabels: [],
        planningUnits: [],
        planningUnitValues: [],
        planningUnitLabels: [],
      });
    } else if (this.state.tracerCategoryValues.length == 0) {
      this.setState({
        message: i18n.t("static.tracercategory.tracercategoryText"),
        selData: [],
        data: [],
        planningUnits: [],
        planningUnitValues: [],
        planningUnitLabels: [],
      });
    } else if (this.state.planningUnitValues.length == 0) {
      this.setState({
        message: i18n.t("static.procurementUnit.validPlanningUnitText"),
        selData: [],
        data: [],
      });
    }
  }
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
              this.filterVersion();
              this.filterData();
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
      this.setState({
        versions: [],
      });
    }
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
                this.getTracerCategoryList();
              }
            );
          } else {
            this.setState(
              {
                versions: versionList,
                versionId: versionList[0].versionId,
              },
              () => {
                this.getTracerCategoryList();
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
              this.getTracerCategoryList();
            }
          );
        }
      }.bind(this);
    }.bind(this);
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
        this.getPlanningUnit();
        this.filterData();
      }
    );
  };
  /**
   * Retrieves the list of planning units for a selected program and selected version.
   */
  getPlanningUnit = () => {
    let programId = document.getElementById("programId").value;
    let versionId = document.getElementById("versionId").value;
    let tracercategory =
      this.state.tracerCategoryValues.length ==
        this.state.tracerCategories.length
        ? []
        : this.state.tracerCategoryValues.map((ele) => ele.value.toString());
    if (this.state.tracerCategoryValues.length > 0) {
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
              selData: [],
              data: [],
            });
          } else {
            localStorage.setItem("sesVersionIdReport", versionId);
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
                  let incrmental = 0;
                  for (var i = 0; i < myResult.length; i++) {
                    if (
                      myResult[i].program.id == programId &&
                      myResult[i].active == true
                    ) {
                      let tempTCId = this.state.planningUnitList.filter(
                        (c) => c.planningUnitId == myResult[i].planningUnit.id
                      )[0].forecastingUnit.tracerCategory.id;
                      let tempPUObj = myResult[i];
                      tempPUObj["tracerCategoryId"] = tempTCId;
                      proList[incrmental] = tempPUObj;
                      incrmental = incrmental + 1;
                    }
                  }
                  let tracerCategoryValues =
                    this.state.tracerCategoryValues.map((item, i) => {
                      return { tracerCategoryId: item.value };
                    }, this);
                  let data1 = [];
                  for (let i = 0; i < proList.length; i++) {
                    for (let j = 0; j < tracerCategoryValues.length; j++) {
                      if (
                        tracerCategoryValues[j].tracerCategoryId ==
                        proList[i].tracerCategoryId
                      ) {
                        data1.push(proList[i]);
                      }
                    }
                  }
                  var lang = this.state.lang;
                  this.setState(
                    {
                      planningUnits: data1.sort(function (a, b) {
                        a = getLabelText(
                          a.planningUnit.label,
                          lang
                        ).toLowerCase();
                        b = getLabelText(
                          b.planningUnit.label,
                          lang
                        ).toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                      }),
                      planningUnitValues: data1.map((item, i) => {
                        return {
                          label: getLabelText(
                            item.planningUnit.label,
                            this.state.lang
                          ),
                          value: item.planningUnit.id,
                        };
                      }, this),
                      planningUnitLabels: data1.map((item, i) => {
                        return getLabelText(
                          item.planningUnit.label,
                          this.state.lang
                        );
                      }, this),
                      message: "",
                    },
                    () => {
                      this.filterData();
                    }
                  );
                }.bind(this);
              }.bind(this);
            } else {
              var json = {
                tracerCategoryIds: tracercategory,
                programIds: [programId],
              };
              DropdownService.getProgramPlanningUnitDropdownList(json)
                .then((response) => {
                  var listArray = response.data;
                  for (var i = 0; i < listArray.length; i++) {
                    var programJson = {
                      id: listArray[i].id,
                      label: listArray[i].label,
                    };
                    listArray[i].planningUnit = programJson;
                  }
                  listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(
                      a.planningUnit.label,
                      this.state.lang
                    ).toUpperCase();
                    var itemLabelB = getLabelText(
                      b.planningUnit.label,
                      this.state.lang
                    ).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                  });
                  this.setState(
                    {
                      planningUnits: listArray,
                      planningUnitValues: response.data.map((item, i) => {
                        return {
                          label: getLabelText(
                            item.planningUnit.label,
                            this.state.lang
                          ),
                          value: item.planningUnit.id,
                        };
                      }, this),
                      planningUnitLabels: response.data.map((item, i) => {
                        return getLabelText(
                          item.planningUnit.label,
                          this.state.lang
                        );
                      }, this),
                      message: "",
                    },
                    () => {
                      this.filterData();
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
    } else {
      this.setState({
        message: i18n.t("static.tracercategory.tracercategoryText"),
        selData: [],
        data: [],
      });
    }
  };
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
    this.setState(
      {
        programId: event.target.value,
        versionId: "",
      },
      () => {
        localStorage.setItem("sesVersionIdReport", "");
        this.filterVersion();
        this.filterData();
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
          localStorage.setItem("sesVersionIdReport", this.state.versionId);
          this.getTracerCategoryList();
        }
      );
    } else {
      this.setState(
        {
          versionId: event.target.value,
        },
        () => {
          this.getTracerCategoryList();
        }
      );
    }
  }
  /**
   * Exports the data to a CSV file.
   * @param {array} columns - The columns to be exported.
   */
  exportCSV(columns) {
    var csvRow = [];
    csvRow.push(
      '"' +
      (
        i18n.t("static.report.dateRange") +
        " : " +
        (this.state.startYear + " ~ " + this.state.endYear)
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
      (
        i18n.t("static.program.isincludeplannedshipment") +
        " : " +
        document.getElementById("includePlanningShipments").selectedOptions[0]
          .text
      ).replaceAll(" ", "%20") +
      '"'
    );
    csvRow.push("");
    csvRow.push(
      '"' +
      (
        i18n.t("static.dashboard.stockstatusmain") +
        " : " +
        document.getElementById("stockStatusId").selectedOptions[0].text
      ).replaceAll(" ", "%20") +
      '"'
    );
    csvRow.push("");
    csvRow.push("");
    csvRow.push("");
    csvRow.push(
      '"' + i18n.t("static.common.youdatastart").replaceAll(" ", "%20") + '"'
    );
    csvRow.push("");
    const headers = [];
    columns.map((item, idx) => {
      headers[idx] = item.text.replaceAll(" ", "%20").replaceAll("#", "%23");
    });
    var A = [addDoubleQuoteToRowContent(headers)];
    this.state.data.map((ele) =>
      A.push(
        addDoubleQuoteToRowContent([
          ele.planningUnit.id,
          getLabelText(ele.planningUnit.label, this.state.lang)
            .replaceAll(",", " ")
            .replaceAll(" ", "%20"),
          ele.planBasedOn == 1
            ? i18n.t("static.report.mos")
            : i18n.t("static.report.qty"),
          ele.minMonthsOfStock,
          ele.planBasedOn == 1
            ? Number(ele.minMonthsOfStock) + Number(ele.reorderFrequency)
            : roundAMC(ele.maxStock),
          ele.year,
          ele.planBasedOn == 1
            ? ele.jan != null
              ? isNaN(ele.jan)
                ? ""
                : roundN(ele.jan)
              : i18n.t("static.supplyPlanFormula.na")
            : ele.janStock != null
              ? isNaN(ele.janStock)
                ? ""
                : roundN(ele.janStock)
              : i18n.t("static.supplyPlanFormula.na"),
          ele.planBasedOn == 1
            ? ele.feb != null
              ? isNaN(ele.feb)
                ? ""
                : roundN(ele.feb)
              : i18n.t("static.supplyPlanFormula.na")
            : ele.febStock != null
              ? isNaN(ele.febStock)
                ? ""
                : roundN(ele.febStock)
              : i18n.t("static.supplyPlanFormula.na"),
          ele.planBasedOn == 1
            ? ele.mar != null
              ? isNaN(ele.mar)
                ? ""
                : roundN(ele.mar)
              : i18n.t("static.supplyPlanFormula.na")
            : ele.marStock != null
              ? isNaN(ele.marStock)
                ? ""
                : roundN(ele.marStock)
              : i18n.t("static.supplyPlanFormula.na"),
          ele.planBasedOn == 1
            ? ele.apr != null
              ? isNaN(ele.apr)
                ? ""
                : roundN(ele.apr)
              : i18n.t("static.supplyPlanFormula.na")
            : ele.aprStock != null
              ? isNaN(ele.aprStock)
                ? ""
                : roundN(ele.aprStock)
              : i18n.t("static.supplyPlanFormula.na"),
          ele.planBasedOn == 1
            ? ele.may != null
              ? isNaN(ele.may)
                ? ""
                : roundN(ele.may)
              : i18n.t("static.supplyPlanFormula.na")
            : ele.mayStock != null
              ? isNaN(ele.mayStock)
                ? ""
                : roundN(ele.mayStock)
              : i18n.t("static.supplyPlanFormula.na"),
          ele.planBasedOn == 1
            ? ele.jun != null
              ? isNaN(ele.jun)
                ? ""
                : roundN(ele.jun)
              : i18n.t("static.supplyPlanFormula.na")
            : ele.junStock != null
              ? isNaN(ele.junStock)
                ? ""
                : roundN(ele.junStock)
              : i18n.t("static.supplyPlanFormula.na"),
          ele.planBasedOn == 1
            ? ele.jul != null
              ? isNaN(ele.jul)
                ? ""
                : roundN(ele.jul)
              : i18n.t("static.supplyPlanFormula.na")
            : ele.julStock != null
              ? isNaN(ele.julStock)
                ? ""
                : roundN(ele.julStock)
              : i18n.t("static.supplyPlanFormula.na"),
          ele.planBasedOn == 1
            ? ele.aug != null
              ? isNaN(ele.aug)
                ? ""
                : roundN(ele.aug)
              : i18n.t("static.supplyPlanFormula.na")
            : ele.augStock != null
              ? isNaN(ele.augStock)
                ? ""
                : roundN(ele.augStock)
              : i18n.t("static.supplyPlanFormula.na"),
          ele.planBasedOn == 1
            ? ele.sep != null
              ? isNaN(ele.sep)
                ? ""
                : roundN(ele.sep)
              : i18n.t("static.supplyPlanFormula.na")
            : ele.sepStock != null
              ? isNaN(ele.sepStock)
                ? ""
                : roundN(ele.sepStock)
              : i18n.t("static.supplyPlanFormula.na"),
          ele.planBasedOn == 1
            ? ele.oct != null
              ? isNaN(ele.oct)
                ? ""
                : roundN(ele.oct)
              : i18n.t("static.supplyPlanFormula.na")
            : ele.octStock != null
              ? isNaN(ele.octStock)
                ? ""
                : roundN(ele.octStock)
              : i18n.t("static.supplyPlanFormula.na"),
          ele.planBasedOn == 1
            ? ele.nov != null
              ? isNaN(ele.nov)
                ? ""
                : roundN(ele.nov)
              : i18n.t("static.supplyPlanFormula.na")
            : ele.novStock != null
              ? isNaN(ele.novStock)
                ? ""
                : roundN(ele.novStock)
              : i18n.t("static.supplyPlanFormula.na"),
          ele.planBasedOn == 1
            ? ele.dec != null
              ? isNaN(ele.dec)
                ? ""
                : roundN(ele.dec)
              : i18n.t("static.supplyPlanFormula.na")
            : ele.decStock != null
              ? isNaN(ele.decStock)
                ? ""
                : roundN(ele.decStock)
              : i18n.t("static.supplyPlanFormula.na"),
        ])
      )
    );
    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","));
    }
    var csvString = csvRow.join("%0A");
    var a = document.createElement("a");
    a.href = "data:attachment/csv," + csvString;
    a.target = "_Blank";
    a.download =
      i18n.t("static.dashboard.stockstatusmatrix") +
      "-" +
      this.state.startYear +
      "~" +
      this.state.endYear +
      ".csv";
    document.body.appendChild(a);
    a.click();
  }
  /**
   * Exports the data to a PDF file.
   * @param {array} columns - The columns to be exported.
   */
  exportPDF = (columns) => {
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
          i18n.t("static.dashboard.stockstatusmatrix"),
          doc.internal.pageSize.width / 2,
          60,
          {
            align: "center",
          }
        );
        if (i == 1) {
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.text(
            i18n.t("static.report.dateRange") +
            " : " +
            this.state.startYear +
            " ~ " +
            this.state.endYear,
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
            i18n.t("static.program.isincludeplannedshipment") +
            " : " +
            document.getElementById("includePlanningShipments")
              .selectedOptions[0].text,
            doc.internal.pageSize.width / 8,
            130,
            {
              align: "left",
            }
          );
          doc.text(
            i18n.t("static.dashboard.stockstatusmain") +
            " : " +
            document.getElementById("stockStatusId").selectedOptions[0].text,
            doc.internal.pageSize.width / 8,
            150,
            {
              align: "left",
            }
          );
          var planningText = doc.splitTextToSize(
            i18n.t("static.tracercategory.tracercategory") +
            " : " +
            this.state.tracerCategoryLabels.join("; "),
            (doc.internal.pageSize.width * 3) / 4
          );
          doc.text(doc.internal.pageSize.width / 8, 170, planningText);
          var planningText = doc.splitTextToSize(
            i18n.t("static.planningunit.planningunit") +
            " : " +
            this.state.planningUnitLabels.join("; "),
            (doc.internal.pageSize.width * 3) / 4
          );
          doc.text(
            doc.internal.pageSize.width / 8,
            180 + this.state.tracerCategoryValues.length * 1.2,
            planningText
          );
          doc.setDrawColor(0);
          doc.setFillColor(186, 12, 47);
          doc.rect(
            doc.internal.pageSize.width / 8,
            200 +
            this.state.planningUnitValues.length * 3 +
            this.state.tracerCategoryValues.length * 1.2,
            15,
            12,
            "F"
          );
          doc.setFillColor(244, 133, 33);
          doc.rect(
            doc.internal.pageSize.width / 8 + 100,
            200 +
            this.state.planningUnitValues.length * 3 +
            this.state.tracerCategoryValues.length * 1.2,
            15,
            12,
            "F"
          );
          doc.setFillColor(17, 139, 112);
          doc.rect(
            doc.internal.pageSize.width / 8 + 200,
            200 +
            this.state.planningUnitValues.length * 3 +
            this.state.tracerCategoryValues.length * 1.2,
            15,
            12,
            "F"
          );
          doc.setFillColor(237, 185, 68);
          doc.rect(
            doc.internal.pageSize.width / 8 + 300,
            200 +
            this.state.planningUnitValues.length * 3 +
            this.state.tracerCategoryValues.length * 1.2,
            15,
            12,
            "F"
          );
          doc.setFillColor(207, 205, 201);
          doc.rect(
            doc.internal.pageSize.width / 8 + 400,
            200 +
            this.state.planningUnitValues.length * 3 +
            this.state.tracerCategoryValues.length * 1.2,
            15,
            12,
            "F"
          );
          doc.text(
            i18n.t(legendcolor[0].text),
            doc.internal.pageSize.width / 8 + 20,
            210 +
            this.state.planningUnitValues.length * 3 +
            this.state.tracerCategoryValues.length * 1.2,
            {
              align: "left",
            }
          );
          doc.text(
            i18n.t(legendcolor[1].text),
            doc.internal.pageSize.width / 8 + 120,
            210 +
            this.state.planningUnitValues.length * 3 +
            this.state.tracerCategoryValues.length * 1.2,
            {
              align: "left",
            }
          );
          doc.text(
            i18n.t(legendcolor[2].text),
            doc.internal.pageSize.width / 8 + 220,
            210 +
            this.state.planningUnitValues.length * 3 +
            this.state.tracerCategoryValues.length * 1.2,
            {
              align: "left",
            }
          );
          doc.text(
            i18n.t(legendcolor[3].text),
            doc.internal.pageSize.width / 8 + 320,
            210 +
            this.state.planningUnitValues.length * 3 +
            this.state.tracerCategoryValues.length * 1.2,
            {
              align: "left",
            }
          );
          doc.text(
            i18n.t(legendcolor[4].text),
            doc.internal.pageSize.width / 8 + 420,
            210 +
            this.state.planningUnitValues.length * 3 +
            this.state.tracerCategoryValues.length * 1.2,
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
    const doc = new jsPDF(orientation, unit, size);
    doc.setFontSize(8);
    let header = [];
    header = [
      [
        {
          content: i18n.t("static.report.qatPID"),
          styles: { halign: "center" },
        },
        {
          content: i18n.t("static.planningunit.planningunit"),
          styles: { halign: "center" },
        },
        {
          content: i18n.t("static.stockStatus.plannedBy"),
          styles: { halign: "center" },
        },
        {
          content: i18n.t("static.report.minMosOrQty"),
          styles: { halign: "center" },
        },
        {
          content: i18n.t("static.report.maxMosOrQty"),
          styles: { halign: "center" },
        },
        { content: i18n.t("static.common.year"), styles: { halign: "center" } },
        { content: i18n.t("static.month.jan"), styles: { halign: "center" } },
        { content: i18n.t("static.month.feb"), styles: { halign: "center" } },
        { content: i18n.t("static.month.mar"), styles: { halign: "center" } },
        { content: i18n.t("static.month.apr"), styles: { halign: "center" } },
        { content: i18n.t("static.month.may"), styles: { halign: "center" } },
        { content: i18n.t("static.month.jun"), styles: { halign: "center" } },
        { content: i18n.t("static.month.jul"), styles: { halign: "center" } },
        { content: i18n.t("static.month.aug"), styles: { halign: "center" } },
        { content: i18n.t("static.month.sep"), styles: { halign: "center" } },
        { content: i18n.t("static.month.oct"), styles: { halign: "center" } },
        { content: i18n.t("static.month.nov"), styles: { halign: "center" } },
        { content: i18n.t("static.month.dec"), styles: { halign: "center" } },
      ],
    ];
    let data;
    data = this.state.data.map((ele) => [
      ele.planningUnit.id,
      getLabelText(ele.planningUnit.label, this.state.lang),
      ele.planBasedOn == 1
        ? i18n.t("static.report.mos")
        : i18n.t("static.report.qty"),
      formatter(ele.minMonthsOfStock, 1),
      ele.planBasedOn == 1
        ? formatter(
          Number(ele.minMonthsOfStock) + Number(ele.reorderFrequency)
          , 0)
        : formatter(roundAMC(ele.maxStock), 0),
      ele.year,
      ele.planBasedOn == 1
        ? ele.jan != null
          ? isNaN(ele.jan)
            ? ""
            : formatter(ele.jan, 1)
          : i18n.t("static.supplyPlanFormula.na")
        : ele.janStock != null
          ? isNaN(ele.janStock)
            ? ""
            : formatter(ele.janStock, 1)
          : i18n.t("static.supplyPlanFormula.na"),
      ele.planBasedOn == 1
        ? ele.feb != null
          ? isNaN(ele.feb)
            ? ""
            : formatter(ele.feb, 1)
          : i18n.t("static.supplyPlanFormula.na")
        : ele.febStock != null
          ? isNaN(ele.febStock)
            ? ""
            : formatter(ele.febStock, 1)
          : i18n.t("static.supplyPlanFormula.na"),
      ele.planBasedOn == 1
        ? ele.mar != null
          ? isNaN(ele.mar)
            ? ""
            : formatter(ele.mar, 1)
          : i18n.t("static.supplyPlanFormula.na")
        : ele.marStock != null
          ? isNaN(ele.marStock)
            ? ""
            : formatter(ele.marStock, 1)
          : i18n.t("static.supplyPlanFormula.na"),
      ele.planBasedOn == 1
        ? ele.apr != null
          ? isNaN(ele.apr)
            ? ""
            : formatter(ele.apr, 1)
          : i18n.t("static.supplyPlanFormula.na")
        : ele.aprStock != null
          ? isNaN(ele.aprStock)
            ? ""
            : formatter(ele.aprStock, 1)
          : i18n.t("static.supplyPlanFormula.na"),
      ele.planBasedOn == 1
        ? ele.may != null
          ? isNaN(ele.may)
            ? ""
            : formatter(ele.may, 1)
          : i18n.t("static.supplyPlanFormula.na")
        : ele.mayStock != null
          ? isNaN(ele.mayStock)
            ? ""
            : formatter(ele.mayStock, 1)
          : i18n.t("static.supplyPlanFormula.na"),
      ele.planBasedOn == 1
        ? ele.jun != null
          ? isNaN(ele.jun)
            ? ""
            : formatter(ele.jun, 1)
          : i18n.t("static.supplyPlanFormula.na")
        : ele.junStock != null
          ? isNaN(ele.junStock)
            ? ""
            : formatter(ele.junStock, 1)
          : i18n.t("static.supplyPlanFormula.na"),
      ele.planBasedOn == 1
        ? ele.jul != null
          ? isNaN(ele.jul)
            ? ""
            : formatter(ele.jul, 1)
          : i18n.t("static.supplyPlanFormula.na")
        : ele.julStock != null
          ? isNaN(ele.julStock)
            ? ""
            : formatter(ele.julStock, 1)
          : i18n.t("static.supplyPlanFormula.na"),
      ele.planBasedOn == 1
        ? ele.aug != null
          ? isNaN(ele.aug)
            ? ""
            : formatter(ele.aug, 1)
          : i18n.t("static.supplyPlanFormula.na")
        : ele.augStock != null
          ? isNaN(ele.augStock)
            ? ""
            : formatter(ele.augStock, 1)
          : i18n.t("static.supplyPlanFormula.na"),
      ele.planBasedOn == 1
        ? ele.sep != null
          ? isNaN(ele.sep)
            ? ""
            : formatter(ele.sep, 1)
          : i18n.t("static.supplyPlanFormula.na")
        : ele.sepStock != null
          ? isNaN(ele.sepStock)
            ? ""
            : formatter(ele.sepStock, 1)
          : i18n.t("static.supplyPlanFormula.na"),
      ele.planBasedOn == 1
        ? ele.oct != null
          ? isNaN(ele.oct)
            ? ""
            : formatter(ele.oct, 1)
          : i18n.t("static.supplyPlanFormula.na")
        : ele.octStock != null
          ? isNaN(ele.octStock)
            ? ""
            : formatter(ele.octStock, 1)
          : i18n.t("static.supplyPlanFormula.na"),
      ele.planBasedOn == 1
        ? ele.nov != null
          ? isNaN(ele.nov)
            ? ""
            : formatter(ele.nov, 1)
          : i18n.t("static.supplyPlanFormula.na")
        : ele.novStock != null
          ? isNaN(ele.novStock)
            ? ""
            : formatter(ele.novStock, 1)
          : i18n.t("static.supplyPlanFormula.na"),
      ele.planBasedOn == 1
        ? ele.dec != null
          ? isNaN(ele.dec)
            ? ""
            : formatter(ele.dec, 1)
          : i18n.t("static.supplyPlanFormula.na")
        : ele.decStock != null
          ? isNaN(ele.decStock)
            ? ""
            : formatter(ele.decStock, 1)
          : i18n.t("static.supplyPlanFormula.na"),
    ]);
    const cellStyle = (
      planBasedOn,
      min,
      reorderFrequency,
      value,
      valueStock
    ) => {
      var actualValue = planBasedOn == 1 ? value : valueStock;
      var maxValue = planBasedOn == 1 ? min + reorderFrequency : value;
      if (actualValue != null) {
        actualValue = roundN(actualValue);
        if (actualValue == 0) {
          return legendcolor[0].color;
        } else if (min > actualValue) {
          return legendcolor[1].color;
        } else if (maxValue < actualValue) {
          return legendcolor[3].color;
        } else {
          return legendcolor[2].color;
        }
      } else {
        return legendcolor[4].color;
      }
    };
    let dataColor;
    dataColor = this.state.data.map((ele) => [
      cellStyle(
        ele.planBasedOn,
        ele.minMonthsOfStock,
        ele.reorderFrequency,
        ele.jan,
        ele.janStock
      ),
      cellStyle(
        ele.planBasedOn,
        ele.minMonthsOfStock,
        ele.reorderFrequency,
        ele.feb,
        ele.febStock
      ),
      cellStyle(
        ele.planBasedOn,
        ele.minMonthsOfStock,
        ele.reorderFrequency,
        ele.mar,
        ele.marStock
      ),
      cellStyle(
        ele.planBasedOn,
        ele.minMonthsOfStock,
        ele.reorderFrequency,
        ele.apr,
        ele.aprStock
      ),
      cellStyle(
        ele.planBasedOn,
        ele.minMonthsOfStock,
        ele.reorderFrequency,
        ele.may,
        ele.mayStock
      ),
      cellStyle(
        ele.planBasedOn,
        ele.minMonthsOfStock,
        ele.reorderFrequency,
        ele.jun,
        ele.junStock
      ),
      cellStyle(
        ele.planBasedOn,
        ele.minMonthsOfStock,
        ele.reorderFrequency,
        ele.jul,
        ele.julStock
      ),
      cellStyle(
        ele.planBasedOn,
        ele.minMonthsOfStock,
        ele.reorderFrequency,
        ele.aug,
        ele.augStock
      ),
      cellStyle(
        ele.planBasedOn,
        ele.minMonthsOfStock,
        ele.reorderFrequency,
        ele.sep,
        ele.sepStock
      ),
      cellStyle(
        ele.planBasedOn,
        ele.minMonthsOfStock,
        ele.reorderFrequency,
        ele.oct,
        ele.octStock
      ),
      cellStyle(
        ele.planBasedOn,
        ele.minMonthsOfStock,
        ele.reorderFrequency,
        ele.nov,
        ele.novStock
      ),
      cellStyle(
        ele.planBasedOn,
        ele.minMonthsOfStock,
        ele.reorderFrequency,
        ele.dec,
        ele.decStock
      ),
    ]);
    var startY =
      230 +
      this.state.planningUnitValues.length * 3 +
      this.state.tracerCategoryValues.length * 1.2;
    let content = {
      margin: { top: 80, bottom: 90 },
      startY: startY,
      head: header,
      body: data,
      styles: { lineWidth: 1, fontSize: 8, cellWidth: 38, halign: "center" },
      columnStyles: {
        1: { cellWidth: 99.89 },
        2: { cellWidth: 54 },
      },
      didParseCell: function (data) {
        if (data.section == "body" && data.column.index > 5)
          data.cell.styles.fillColor =
            dataColor[data.row.index][data.column.index - 6];
      },
    };
    doc.autoTable(content);
    addHeaders(doc);
    addFooters(doc);
    doc.save(i18n.t("static.dashboard.stockstatusmatrix") + ".pdf");
  };
  /**
   * Determines the cell background color based on the provided parameters.
   * @param {number} planBasedOn - Indicates whether the plan is based on months of stock or maximum stock.
   * @param {number} min - The minimum months of stock or quantity.
   * @param {number} reorderFrequency - The reorder frequency.
   * @param {number} value - The value to be compared with the minimum and maximum.
   * @param {number} valueStock - The value for stock-based plan.
   * @returns {object} - The style object with the background color determined based on the provided values.
   */
  cellStyle = (planBasedOn, min, reorderFrequency, value, valueStock) => {
    var actualValue = planBasedOn == 1 ? value : valueStock;
    var maxValue = planBasedOn == 1 ? min + reorderFrequency : value;
    if (actualValue != null) {
      actualValue = roundN(actualValue);
      if (actualValue == 0) {
        return { backgroundColor: legendcolor[0].color };
      } else if (min > actualValue) {
        return { backgroundColor: legendcolor[1].color };
      } else if (maxValue < actualValue) {
        return { backgroundColor: legendcolor[3].color };
      } else {
        return { backgroundColor: legendcolor[2].color };
      }
    } else {
      return { backgroundColor: legendcolor[4].color };
    }
  };
  /**
   * Renders the Stock Status Overtime report table.
   * @returns {JSX.Element} - Stock Status Overtime report table.
   */
  render() {
    const { planningUnits } = this.state;
    let planningUnitList =
      planningUnits.length > 0 &&
      planningUnits.map((item, i) => {
        return {
          label: getLabelText(item.planningUnit.label, this.state.lang),
          value: item.planningUnit.id,
        };
      }, this);
    const { SearchBar, ClearSearchButton } = Search;
    const { programs } = this.state;
    let programList =
      programs.length > 0 &&
      programs.map((item, i) => {
        return (
          <option key={i} value={item.programId}>
            {item.programCode}
          </option>
        );
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
            ({moment(item.createdDate).format(`MMM DD YYYY`)}) {item.cutOffDate!=undefined && item.cutOffDate!=null && item.cutOffDate!=''?" ("+i18n.t("static.supplyPlan.start")+" "+moment(item.cutOffDate).format('MMM YYYY')+")":""}
          </option>
        );
      }, this);
    const { tracerCategories } = this.state;
    let columns = [
      {
        text: i18n.t("static.report.qatPID")
      },
      {
        text: i18n.t("static.planningunit.planningunit"),
      },
      {
        text: i18n.t("static.stockStatus.plannedBy"),
      },
      {
        text: i18n.t("static.report.minMosOrQty"),
      },
      {
        text: i18n.t("static.report.maxMosOrQty"),
      },
      {
        text: i18n.t("static.common.year"),
      },
      {
        text: i18n.t("static.month.jan"),
      },
      {
        text: i18n.t("static.month.feb"),
      },
      {
        text: i18n.t("static.month.mar"),
      },
      {
        text: i18n.t("static.month.apr"),
      },
      {
        text: i18n.t("static.month.may"),
      },
      {
        text: i18n.t("static.month.jun"),
      },
      {
        text: i18n.t("static.month.jul"),
      },
      {
        text: i18n.t("static.month.aug"),
      },
      {
        text: i18n.t("static.month.sep"),
      },
      {
        text: i18n.t("static.month.oct"),
      },
      {
        text: i18n.t("static.month.nov"),
      },
      {
        text: i18n.t("static.month.dec"),
      },
    ];
    const MyExportCSV = (props) => {
      const handleClick = () => {
        props.onExport();
      };
      return (
        <div>
          <img
            style={{ height: "40px", width: "40px" }}
            src={csvicon}
            title="Export CSV"
            onClick={() => handleClick()}
          />
        </div>
      );
    };
    return (
      <div className="animated">
        <AuthenticationServiceComponent history={this.props.history} />
        <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
        <h5 className="red">{i18n.t(this.state.message, { entityname })}</h5>
        <SupplyPlanFormulas ref="formulaeChild" />
        <Card>
          <div className="Card-header-reporticon pb-2">
            <div className="card-header-actions">
              <a className="card-header-action">
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    this.refs.formulaeChild.toggleStockStatusMatrix();
                  }}
                >
                  <small className="supplyplanformulas">
                    {i18n.t("static.supplyplan.supplyplanformula")}
                  </small>
                </span>
              </a>
              {this.state.data.length > 0 && (
                <div className="card-header-actions">
                  <img
                    style={{ height: "25px", width: "25px", cursor: "pointer" }}
                    src={pdfIcon}
                    title={i18n.t("static.report.exportPdf")}
                    onClick={() => this.exportPDF(columns)}
                  />
                  <img
                    style={{ height: "25px", width: "25px", cursor: "pointer" }}
                    src={csvicon}
                    title={i18n.t("static.report.exportCsv")}
                    onClick={() => this.exportCSV(columns)}
                  />
                </div>
              )}
            </div>
          </div>
          <CardBody className="pb-md-3 pb-lg-2 pt-lg-0">
            <div className="pl-0">
              <div className="row">
                <FormGroup className="col-md-3">
                  <Label htmlFor="appendedInputButton">
                    {i18n.t("static.report.dateRange")}
                    <span className="stock-box-icon  fa fa-sort-desc ml-1"></span>
                  </Label>
                  <div className="controls box">
                    <RangePicker
                      picker="year"
                      allowClear={false}
                      id="date"
                      name="date"
                      onChange={this.onYearChange}
                      disabledDate={(current) => current && current.year() < this.state.minDate}
                      value={[
                        moment(this.state.startYear.toString()),
                        moment(this.state.endYear.toString()),
                      ]}
                    />
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
                        {programList}
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
                    {i18n.t("static.tracercategory.tracercategory")}
                  </Label>
                  <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                  <div className="controls">
                    <MultiSelect
                      name="tracerCategoryId"
                      id="tracerCategoryId"
                      filterOptions={filterOptions}
                      bsSize="sm"
                      value={this.state.tracerCategoryValues}
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
                    />
                  </div>
                </FormGroup>
                <FormGroup className="col-md-3">
                  <Label htmlFor="appendedInputButton">
                    {i18n.t("static.planningunit.planningunit")}
                  </Label>
                  <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                  <div className="controls">
                    <MultiSelect
                      name="planningUnitId"
                      id="planningUnitId"
                      filterOptions={filterOptions}
                      bsSize="md"
                      value={this.state.planningUnitValues}
                      onChange={(e) => {
                        this.handlePlanningUnitChange(e);
                      }}
                      options={
                        planningUnitList && planningUnitList.length > 0
                          ? planningUnitList
                          : []
                      }
                      disabled={this.state.loading}
                    />{" "}
                  </div>
                </FormGroup>
                <FormGroup className="col-md-3">
                  <Label htmlFor="appendedInputButton">
                    {i18n.t("static.program.isincludeplannedshipment")}
                  </Label>
                  <div className="controls ">
                    <InputGroup>
                      <Input
                        type="select"
                        name="includePlanningShipments"
                        id="includePlanningShipments"
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
            <div
              class="TableCust"
              style={{ display: this.state.loading ? "none" : "block" }}
            >
              {this.state.data.length > 0 && (
                <div className="fixTableHead1">
                  <Table
                    striped
                    bordered
                    responsive="md"
                    style={{ width: "100%" }}
                  >
                    <thead className="Theadtablesticky">
                      <tr>
                        <th className="text-center" style={{ width: "20%" }}>
                          {i18n.t("static.planningunit.planningunit")}
                        </th>
                        <th className="text-center" style={{ width: "5%" }}>
                          {i18n.t("static.stockStatus.plannedBy")}
                        </th>
                        <th className="text-center" style={{ width: "5%" }}>
                          {i18n.t("static.report.minMosOrQty")}
                        </th>
                        <th
                          className="text-center infoIconStockStatus"
                          style={{ width: "5%" }}
                          title={i18n.t(
                            "static.programPU.stockStatusMatrixMaxTooltip"
                          )}
                        >
                          {i18n.t("static.report.maxMosOrQty")}
                        </th>
                        <th className="text-center" style={{ width: "5%" }}>
                          {i18n.t("static.common.year")}
                        </th>
                        <th className="text-center" style={{ width: "5%" }}>
                          {i18n.t("static.month.jan")}
                        </th>
                        <th className="text-center" style={{ width: "5%" }}>
                          {i18n.t("static.month.feb")}
                        </th>
                        <th className="text-center" style={{ width: "5%" }}>
                          {i18n.t("static.month.mar")}
                        </th>
                        <th className="text-center" style={{ width: "5%" }}>
                          {i18n.t("static.month.apr")}
                        </th>
                        <th className="text-center" style={{ width: "5%" }}>
                          {i18n.t("static.month.may")}
                        </th>
                        <th className="text-center" style={{ width: "5%" }}>
                          {i18n.t("static.month.jun")}
                        </th>
                        <th className="text-center" style={{ width: "5%" }}>
                          {i18n.t("static.month.jul")}
                        </th>
                        <th className="text-center" style={{ width: "5%" }}>
                          {i18n.t("static.month.aug")}
                        </th>
                        <th className="text-center" style={{ width: "5%" }}>
                          {i18n.t("static.month.sep")}
                        </th>
                        <th className="text-center" style={{ width: "5%" }}>
                          {i18n.t("static.month.oct")}
                        </th>
                        <th className="text-center" style={{ width: "5%" }}>
                          {i18n.t("static.month.nov")}
                        </th>
                        <th className="text-center" style={{ width: "5%" }}>
                          {i18n.t("static.month.dec")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.data.map((ele) => {
                        return (
                          <tr>
                            <td className="text-center">
                              {" "}
                              {getLabelText(
                                ele.planningUnit.label,
                                this.state.lang
                              )}
                            </td>
                            <td className="text-center">
                              {" "}
                              {ele.planBasedOn == 1
                                ? i18n.t("static.report.mos")
                                : i18n.t("static.report.qty")}
                            </td>
                            <td className="text-center">
                              {formatter(ele.minMonthsOfStock, 0)}
                            </td>
                            <td className="text-center">
                              {ele.planBasedOn == 1
                                ? formatter(
                                  Number(ele.minMonthsOfStock) +
                                  Number(ele.reorderFrequency)
                                  , 0)
                                : formatter(
                                  roundAMC(ele.maxStock)
                                  , 0)}
                            </td>
                            <td className="text-center">{ele.year}</td>
                            <td
                              className="text-center"
                              style={this.cellStyle(
                                ele.planBasedOn,
                                ele.minMonthsOfStock,
                                ele.reorderFrequency,
                                ele.jan,
                                ele.janStock
                              )}
                            >
                              {ele.planBasedOn == 1
                                ? isNaN(ele.jan)
                                  ? ""
                                  : ele.jan != null
                                    ? formatter(ele.jan, 1)
                                    : i18n.t("static.supplyPlanFormula.na")
                                : isNaN(ele.janStock)
                                  ? ""
                                  : ele.janStock != null
                                    ? formatter(ele.janStock, 1)
                                    : ""}
                            </td>
                            <td
                              className="text-center"
                              style={this.cellStyle(
                                ele.planBasedOn,
                                ele.minMonthsOfStock,
                                ele.reorderFrequency,
                                ele.feb,
                                ele.febStock
                              )}
                            >
                              {" "}
                              {ele.planBasedOn == 1
                                ? isNaN(ele.feb)
                                  ? ""
                                  : ele.feb != null
                                    ? formatter(ele.feb, 1)
                                    : i18n.t("static.supplyPlanFormula.na")
                                : isNaN(ele.febStock)
                                  ? ""
                                  : ele.febStock != null
                                    ? formatter(ele.febStock, 1)
                                    : ""}
                            </td>
                            <td
                              className="text-center"
                              style={this.cellStyle(
                                ele.planBasedOn,
                                ele.minMonthsOfStock,
                                ele.reorderFrequency,
                                ele.mar,
                                ele.marStock
                              )}
                            >
                              {" "}
                              {ele.planBasedOn == 1
                                ? isNaN(ele.mar)
                                  ? ""
                                  : ele.mar != null
                                    ? formatter(ele.mar, 1)
                                    : i18n.t("static.supplyPlanFormula.na")
                                : isNaN(ele.marStock)
                                  ? ""
                                  : ele.marStock != null
                                    ? formatter(ele.marStock, 1)
                                    : ""}
                            </td>
                            <td
                              className="text-center"
                              style={this.cellStyle(
                                ele.planBasedOn,
                                ele.minMonthsOfStock,
                                ele.reorderFrequency,
                                ele.apr,
                                ele.aprStock
                              )}
                            >
                              {" "}
                              {ele.planBasedOn == 1
                                ? isNaN(ele.apr)
                                  ? ""
                                  : ele.apr != null
                                    ? formatter(ele.apr, 1)
                                    : i18n.t("static.supplyPlanFormula.na")
                                : isNaN(ele.aprStock)
                                  ? ""
                                  : ele.aprStock != null
                                    ? formatter(ele.aprStock, 1)
                                    : ""}
                            </td>
                            <td
                              className="text-center"
                              style={this.cellStyle(
                                ele.planBasedOn,
                                ele.minMonthsOfStock,
                                ele.reorderFrequency,
                                ele.may,
                                ele.mayStock
                              )}
                            >
                              {" "}
                              {ele.planBasedOn == 1
                                ? isNaN(ele.may)
                                  ? ""
                                  : ele.may != null
                                    ? formatter(ele.may, 1)
                                    : i18n.t("static.supplyPlanFormula.na")
                                : isNaN(ele.mayStock)
                                  ? ""
                                  : ele.mayStock != null
                                    ? formatter(ele.mayStock, 1)
                                    : ""}
                            </td>
                            <td
                              className="text-center"
                              style={this.cellStyle(
                                ele.planBasedOn,
                                ele.minMonthsOfStock,
                                ele.reorderFrequency,
                                ele.jun,
                                ele.junStock
                              )}
                            >
                              {" "}
                              {ele.planBasedOn == 1
                                ? isNaN(ele.jun)
                                  ? ""
                                  : ele.jun != null
                                    ? formatter(ele.jun, 1)
                                    : i18n.t("static.supplyPlanFormula.na")
                                : isNaN(ele.junStock)
                                  ? ""
                                  : ele.junStock != null
                                    ? formatter(ele.junStock, 1)
                                    : ""}
                            </td>
                            <td
                              className="text-center"
                              style={this.cellStyle(
                                ele.planBasedOn,
                                ele.minMonthsOfStock,
                                ele.reorderFrequency,
                                ele.jul,
                                ele.julStock
                              )}
                            >
                              {" "}
                              {ele.planBasedOn == 1
                                ? isNaN(ele.jul)
                                  ? ""
                                  : ele.jul != null
                                    ? formatter(ele.jul, 1)
                                    : i18n.t("static.supplyPlanFormula.na")
                                : isNaN(ele.julStock)
                                  ? ""
                                  : ele.julStock != null
                                    ? formatter(ele.julStock, 1)
                                    : ""}
                            </td>
                            <td
                              className="text-center"
                              style={this.cellStyle(
                                ele.planBasedOn,
                                ele.minMonthsOfStock,
                                ele.reorderFrequency,
                                ele.aug,
                                ele.augStock
                              )}
                            >
                              {" "}
                              {ele.planBasedOn == 1
                                ? isNaN(ele.aug)
                                  ? ""
                                  : ele.aug != null
                                    ? formatter(ele.aug, 1)
                                    : i18n.t("static.supplyPlanFormula.na")
                                : isNaN(ele.augStock)
                                  ? ""
                                  : ele.augStock != null
                                    ? formatter(ele.augStock, 1)
                                    : ""}
                            </td>
                            <td
                              className="text-center"
                              style={this.cellStyle(
                                ele.planBasedOn,
                                ele.minMonthsOfStock,
                                ele.reorderFrequency,
                                ele.sep,
                                ele.sepStock
                              )}
                            >
                              {" "}
                              {ele.planBasedOn == 1
                                ? isNaN(ele.sep)
                                  ? ""
                                  : ele.sep != null
                                    ? formatter(ele.sep, 1)
                                    : i18n.t("static.supplyPlanFormula.na")
                                : isNaN(ele.sepStock)
                                  ? ""
                                  : ele.sepStock != null
                                    ? formatter(ele.sepStock, 1)
                                    : ""}
                            </td>
                            <td
                              className="text-center"
                              style={this.cellStyle(
                                ele.planBasedOn,
                                ele.minMonthsOfStock,
                                ele.reorderFrequency,
                                ele.oct,
                                ele.octStock
                              )}
                            >
                              {" "}
                              {ele.planBasedOn == 1
                                ? isNaN(ele.oct)
                                  ? ""
                                  : ele.oct != null
                                    ? formatter(ele.oct, 1)
                                    : i18n.t("static.supplyPlanFormula.na")
                                : isNaN(ele.octStock)
                                  ? ""
                                  : ele.octStock != null
                                    ? formatter(ele.octStock, 1)
                                    : ""}
                            </td>
                            <td
                              className="text-center"
                              style={this.cellStyle(
                                ele.planBasedOn,
                                ele.minMonthsOfStock,
                                ele.reorderFrequency,
                                ele.nov,
                                ele.novStock
                              )}
                            >
                              {" "}
                              {ele.planBasedOn == 1
                                ? isNaN(ele.nov)
                                  ? ""
                                  : ele.nov != null
                                    ? formatter(ele.nov, 1)
                                    : i18n.t("static.supplyPlanFormula.na")
                                : isNaN(ele.novStock)
                                  ? ""
                                  : ele.novStock != null
                                    ? formatter(ele.novStock, 1)
                                    : ""}
                            </td>
                            <td
                              className="text-center"
                              style={this.cellStyle(
                                ele.planBasedOn,
                                ele.minMonthsOfStock,
                                ele.reorderFrequency,
                                ele.dec,
                                ele.decStock
                              )}
                            >
                              {" "}
                              {ele.planBasedOn == 1
                                ? isNaN(ele.dec)
                                  ? ""
                                  : ele.dec != null
                                    ? formatter(ele.dec, 1)
                                    : i18n.t("static.supplyPlanFormula.na")
                                : isNaN(ele.decStock)
                                  ? ""
                                  : ele.decStock != null
                                    ? formatter(ele.decStock, 1)
                                    : ""}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
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
          </CardBody>
        </Card>
      </div>
    );
  }
}
