import { CustomTooltips } from "@coreui/coreui-plugin-chartjs-custom-tooltips";
import CryptoJS from 'crypto-js';
import { Formik } from 'formik';
import jsPDF from 'jspdf';
import jexcel from 'jspreadsheet';
import moment from "moment";
import React from "react";
import { Bar } from 'react-chartjs-2';
import Picker from 'react-month-picker';
import NumberFormat from 'react-number-format';
import { Prompt } from "react-router-dom";
import 'react-select/dist/react-select.min.css';
import {
  Button,
  Card, CardBody,
  CardFooter,
  Col, Form,
  FormFeedback,
  FormGroup,
  Input,
  InputGroup,
  Label,
  Modal,
  ModalBody, ModalFooter,
  ModalHeader,
  Table
} from 'reactstrap';
import * as Yup from 'yup';
import { API_URL, SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, DATE_FORMAT_CAP_WITHOUT_DATE, TITLE_FONT, JEXCEL_DECIMAL_MONTHLY_CHANGE_4_DECIMAL_POSITIVE } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import 'react-select/dist/react-select.min.css';
import AuthenticationService from "../Common/AuthenticationService.js";
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js';
import { LOGO } from "../../CommonComponent/Logo";
import MonthBox from '../../CommonComponent/MonthBox.js';
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, PROGRAM_TYPE_DATASET } from '../../Constants.js';
import csvicon from '../../assets/img/csv.png';
import dataentryScreenshot1 from '../../assets/img/dataentryScreenshot-1.png';
import dataentryScreenshot2 from '../../assets/img/dataentryScreenshot-2.png';
import pdfIcon from '../../assets/img/pdf.png';
import { calculateArima } from '../Extrapolation/Arima';
import { calculateLinearRegression } from '../Extrapolation/LinearRegression';
import { calculateMovingAvg } from '../Extrapolation/MovingAverages';
import { calculateSemiAverages } from '../Extrapolation/SemiAverages';
import { calculateTES } from '../Extrapolation/TESNew';
import { addDoubleQuoteToRowContent, hideFirstComponent, hideSecondComponent } from "../../CommonComponent/JavascriptCommonFunctions.js";
import DropdownService from '../../api/DropdownService.js';
import DatasetService from "../../api/DatasetService.js";
import ForecastingUnitService from "../../api/ForecastingUnitService.js";
import PlanningUnitService from "../../api/PlanningUnitService.js";
// Localized entity name
const entityname = i18n.t('static.dashboard.dataEntryAndAdjustment');
const pickerLang = {
  months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
  from: 'From', to: 'To',
}
/**
 * Defines the validation schema for consumption data entry details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values, t) {
  return Yup.object().shape({
    consumptionNotes: Yup.string()
      .matches(/^([a-zA-Z0-9\s,\./<>\?;':""[\]\\{}\|`~!@#\$%\^&\*()-_=\+]*)$/, i18n.t("static.commit.consumptionnotesvalid"))
  })
}
/**
 * Component for consumption data entry and adjustments.
 */
export default class ConsumptionDataEntryandAdjustment extends React.Component {
  constructor(props) {
    super(props);
    var startDate = moment(Date.now()).add(-36, 'months').format("YYYY-MM-DD");
    this.state = {
      isDarkMode: false,
      datasetList: [],
      datasetId: "",
      showInPlanningUnit: false,
      lang: localStorage.getItem("lang"),
      consumptionUnitShowArr: [],
      dataEl: "",
      jexcelDataEl: "",
      unitQtyArr: [],
      unitQtyArrForRegion: [],
      planningUnitList: [],
      forecastingUnitList: [],
      aruList: [],
      loading: true,
      selectedPlanningUnitId: "",
      selectedPlanningUnitDesc: "",
      selectedPlanningUnitMultiplier: "",
      changedPlanningUnitMultiplier: "",
      changedConsumptionTypeId: "",
      toggleDataCheck: false,
      toggleDataChangeForSmallTable: false,
      missingMonthList: [],
      consumptionListlessTwelve: [],
      showSmallTable: false,
      showDetailTable: false,
      showOtherUnitNameField: false,
      dataEnteredInFU: true,
      dataEnteredInPU: false,
      dataEnteredInOU: false,
      otherUnitEditable: false,
      dataEnteredIn: '',
      allPlanningUnitList: [],
      message: "",
      messageColor: "green",
      consumptionChanged: false,
      selectedConsumptionUnitObject: { "consumptionDataType": "" },
      tempConsumptionUnitObject: { "consumptionDataType": "" },
      dataEnteredInUnitList: [],
      minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
      singleValue2: localStorage.getItem("sesDataentryStartDateRange") != "" ? JSON.parse(localStorage.getItem("sesDataentryStartDateRange")) : { year: Number(moment(startDate).startOf('month').format("YYYY")), month: Number(moment(startDate).startOf('month').format("M")) },
      // maxDate: { year: Number(moment(Date.now()).startOf('month').format("YYYY")), month: Number(moment(Date.now()).startOf('month').format("M")) },
      maxDate: '',
      planningUnitTotalList: [],
      dataEnteredInTableExSpan: 0,
      confidenceLevelId: 0.85,
      confidenceLevelIdLinearRegression: 0.85,
      confidenceLevelIdArima: 0.85,
      alpha: 0.2,
      beta: 0.2,
      gamma: 0.2,
      noOfMonthsForASeason: 4,
      confidence: 0.95,
      monthsForMovingAverage: 6,
      seasonality: 1,
      p: 0,
      d: 1,
      q: 1,
      CI: "",
      tesData: [],
      arimaData: [],
      jsonDataMovingAvg: [],
      jsonDataSemiAverage: [],
      jsonDataLinearRegression: [],
      jsonDataTes: [],
      jsonDataArima: [],
      count: 0,
      countRecived: 0,
      isTableLoaded: "",
      consumptionNotesForValidation: "",
      monthArray: [],
      versionId: -1,
      versions: [],
      isDisabled: false,
      onlyDownloadedProgram: false
    }
    this.loaded = this.loaded.bind(this);
    this.loadedJexcel = this.loadedJexcel.bind(this);
    this.changed = this.changed.bind(this);
    this.buildDataJexcel = this.buildDataJexcel.bind(this);
    this.cancelClicked = this.cancelClicked.bind(this);
    this.consumptionDataChanged = this.consumptionDataChanged.bind(this);
    this.checkValidationConsumption = this.checkValidationConsumption.bind(this);
    this.checkValidationInterpolate = this.checkValidationInterpolate.bind(this);
    this.resetClicked = this.resetClicked.bind(this)
    this.buildJexcel = this.buildJexcel.bind(this);
    this.saveConsumptionList = this.saveConsumptionList.bind(this);
    this.updateMovingAvgData = this.updateMovingAvgData.bind(this);
    this.updateSemiAveragesData = this.updateSemiAveragesData.bind(this);
    this.updateLinearRegressionData = this.updateLinearRegressionData.bind(this);
    this.updateTESData = this.updateTESData.bind(this);
    this.updateArimaData = this.updateArimaData.bind(this);
    this.formulaChanged = this.formulaChanged.bind(this);
    this.pickAMonth2 = React.createRef();
    this.roundingForPuQty = this.roundingForPuQty.bind(this);
    this.roundingForPuQtyForCsv = this.roundingForPuQtyForCsv.bind(this);
    this.setVersionId = this.setVersionId.bind(this);
    this.getPrograms = this.getPrograms.bind(this);
    this.changeOnlyDownloadedProgram = this.changeOnlyDownloadedProgram.bind(this);
    this.addPUForArimaAndTesWhileOffline = this.addPUForArimaAndTesWhileOffline.bind(this);
  }
  /**
   * Rounds the given pu quantity (puQty) to 4 decimal places if it's less than 1,
   * otherwise rounds it to the nearest integer.
   * @param {*} puQty 
   * @returns 
   */
  roundingForPuQty(puQty) {
    if (puQty !== "") {
      if (puQty < 1) {
        puQty = Number(puQty).toFixed(4);
      } else {
        puQty = Math.round(puQty);
      }
    }
    return puQty;
  }
  roundingForPuQtyForCsv(puQty) {
    if (puQty !== "") {
        puQty = Number(puQty).toFixed(4);
    }
    return puQty;
  }
  /**
   * Redirects to the application dashboard screen when cancel button is clicked.
   */
  cancelClicked() {
    var cont = false;
    if (this.state.consumptionChanged) {
      var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
      if (cf == true) {
        cont = true;
      } else {
      }
    } else {
      cont = true;
    }
    if (cont == true) {
      this.setState({
        consumptionChanged: false
      }, () => {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
      })
    }
  }
  /**
   * Function to build a jexcel table.
   * Constructs and initializes a jexcel table using the provided data and options.
   */
  buildDataJexcel(consumptionUnitId, isInterpolate) {
    localStorage.setItem("sesDatasetPlanningUnitId", consumptionUnitId);
    var cont = false;
    if (this.state.consumptionChanged && !isInterpolate) {
      var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
      if (cf == true) {
        cont = true;
      } else {
      }
    } else {
      cont = true;
    }
    if (cont == true) {
      this.setState({
        loading: true,
        consumptionChanged: false
      }, () => {
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
        var consumptionList = isInterpolate == 1 ? this.state.tempConsumptionList : this.state.consumptionList;
        var consumptionUnit = {};
        var consumptionNotes = "";
        if (consumptionUnitId > 0) {
          consumptionUnit = this.state.planningUnitList.filter(c => c.planningUnit.id == consumptionUnitId)[0];
          consumptionNotes = consumptionUnit.consumptionNotes != null ? consumptionUnit.consumptionNotes : "";
        } else {
          consumptionUnit = {
            programPlanningUnitId: 0,
            planningUnit: {
              id: 0,
              label: {
              },
              multiplier: 1,
              forecastingUnit: {
                id: 0,
                label: {
                }
              }
            },
            consuptionForecast: true,
            treeForecast: false,
            consumptionNotes: "",
            consumptionDataType: 1,
            otherUnit: {
              id: 0,
              label: {
              },
              multiplier: 1,
            },
            selectedForecastMap: {},
          }
        }
        if (!isInterpolate) {
          document.getElementById("consumptionNotes").value = consumptionNotes;
        }
        this.setState({ consumptionNotesForValidation: consumptionNotes })
        var multiplier = 1;
        var changedConsumptionDataDesc = "";
        if (consumptionUnitId != 0) {
          if (consumptionUnit.consumptionDataType == 1) {
            multiplier = consumptionUnit.planningUnit.multiplier;
            changedConsumptionDataDesc = getLabelText(consumptionUnit.planningUnit.forecastingUnit.label, this.state.lang) + ' | ' + consumptionUnit.planningUnit.forecastingUnit.id;
          } else if (consumptionUnit.consumptionDataType == 2) {
            multiplier = 1;
            changedConsumptionDataDesc = getLabelText(consumptionUnit.planningUnit.label, this.state.lang) + ' | ' + consumptionUnit.planningUnit.id;;
          } else {
            multiplier = 1 / (consumptionUnit.otherUnit.multiplier / consumptionUnit.planningUnit.multiplier);
            changedConsumptionDataDesc = getLabelText(consumptionUnit.otherUnit.label, this.state.lang);
          }
        }
        consumptionList = consumptionList.filter(c => c.planningUnit.id == consumptionUnitId);
        var monthArray = this.state.monthArray;
        var regionList = this.state.regionList;
        let dataArray = [];
        let data = [];
        let columns = [];
        columns.push({ title: i18n.t('static.inventoryDate.inventoryReport'), type: 'text', width: 200 })
        data[0] = i18n.t('static.program.noOfDaysInMonth');
        for (var j = 0; j < monthArray.length; j++) {
          data[j + 1] = monthArray[j].noOfDays;
          columns.push({ title: moment(monthArray[j].date).format(DATE_FORMAT_CAP_WITHOUT_DATE), type: 'numeric', textEditor: true, mask: '#,##.0000', decimal: '.', disabledMaskOnEdition: true, width: 100 })
        }
        data[monthArray.length + 1] = multiplier;
        columns.push({ type: 'hidden', title: 'Multiplier' })
        dataArray.push(data)
        data = [];
        for (var r = 0; r < regionList.length; r++) {
          data = [];
          data[0] = getLabelText(regionList[r].label);
          for (var j = 0; j < monthArray.length; j++) {
            data[j + 1] = "";
          }
          data[monthArray.length + 1] = multiplier;
          dataArray.push(data);
          data = [];
          data[0] = i18n.t('static.supplyPlan.actualConsumption')
          for (var j = 0; j < monthArray.length; j++) {
            var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
            data[j + 1] = consumptionData.length > 0 ? consumptionData[0].amount : "";
          }
          data[monthArray.length + 1] = multiplier;
          dataArray.push(data);
          data = [];
          data[0] = i18n.t('static.dataentry.reportingRate')
          for (var j = 0; j < monthArray.length; j++) {
            var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
            data[j + 1] = consumptionData.length > 0 && consumptionData[0].reportingRate > 0 ? consumptionData[0].reportingRate : 100;
          }
          data[monthArray.length + 1] = multiplier;
          dataArray.push(data);
          data = [];
          data[0] = i18n.t('static.dataentry.stockedOut')
          for (var j = 0; j < monthArray.length; j++) {
            var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
            data[j + 1] = consumptionData.length > 0 && consumptionData[0].daysOfStockOut > 0 ? consumptionData[0].daysOfStockOut : 0;
          }
          data[monthArray.length + 1] = multiplier;
          dataArray.push(data);
          data = [];
          data[0] = i18n.t('static.dataentry.stockedOutPer')
          for (var j = 0; j < monthArray.length; j++) {
            data[j + 1] = `=ROUND(${colArr[j + 1]}${parseInt(dataArray.length)}/${colArr[j + 1] + "1"}*100,0)`;
          }
          data[monthArray.length + 1] = multiplier;
          dataArray.push(data);
          data = [];
          data[0] = i18n.t('static.dataentry.adjustedConsumption')
          for (var j = 0; j < monthArray.length; j++) {
            data[j + 1] = `=IF(ISBLANK(${colArr[j + 1]}${parseInt(dataArray.length - 3)}),'',ROUND((${colArr[j + 1]}${parseInt(dataArray.length - 3)}/${colArr[j + 1]}${parseInt(dataArray.length - 2)}/(1-(${colArr[j + 1]}${parseInt(dataArray.length - 1)}/${colArr[j + 1] + "1"})))*100,4))`;

          }
          data[monthArray.length + 1] = multiplier;
          dataArray.push(data);
          data = [];
          data[0] = i18n.t('static.dataentry.convertedToPlanningUnit')
          for (var j = 0; j < monthArray.length; j++) {
            data[j + 1] = `=IF(ISBLANK(${colArr[j + 1]}${parseInt(dataArray.length - 4)}),'',ROUND(${colArr[j + 1]}${parseInt(dataArray.length)}/${colArr[monthArray.length + 1] + "1"},4))`;
          }
          data[monthArray.length + 1] = multiplier;
          dataArray.push(data);
          if (r != regionList.length - 1) {
            data = [];
            dataArray.push([]);
          }
        }
        var multiplier1 = 1;
        if (consumptionUnitId != 0) {
          if (consumptionUnit.consumptionDataType == 1) {
            multiplier1 = 1;
          } else if (consumptionUnit.consumptionDataType == 2) {
            multiplier1 = consumptionUnit.planningUnit.multiplier;
          } else {
            multiplier1 = consumptionUnit.otherUnit.multiplier;
          }
        }
        jexcel.destroy(document.getElementById('tableDiv'), true);
        var options = {
          data: dataArray,
          columnDrag: false,
          columns: columns,
          colWidths: [10, 50, 100, 100, 100, 100, 50, 100],
          updateTable: function (el, cell, x, y, source, value, id) {
          },
          onload: this.loaded,
          onchange: function (instance, cell, x, y, value) {
            this.consumptionDataChanged(instance, cell, x, y, value)
            if (this.state.consumptionChanged != true) { this.setState({ consumptionChanged: true }) }
          }.bind(this),
          pagination: false,
          search: false,
          columnSorting: false,
          wordWrap: true,
          allowInsertColumn: false,
          allowManualInsertColumn: false,
          allowInsertRow: false,
          allowManualInsertRow: false,
          allowDeleteRow: false,
          copyCompatibility: true,
          allowExport: false,
          paginationOptions: JEXCEL_PAGINATION_OPTION,
          position: 'top',
          filters: false,
          license: JEXCEL_PRO_KEY,
          parseFormulas: true,
          editable: AuthenticationService.checkUserACL([this.state.datasetId.toString()], 'ROLE_BF_CONSUMPTION_DATA_ENTRY_ADJUSTMENT') ? true : false,
          contextMenu: function (obj, x, y, e) {
            return [];
          }.bind(this),
        };
        var dataEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = dataEl;
        this.setState({
          dataEl: dataEl, loading: false,
          selectedConsumptionUnitId: consumptionUnitId,
          selectedConsumptionUnitObject: consumptionUnit,
          tempConsumptionUnitObject: consumptionUnit,
          selectedPlanningUnitId: consumptionUnit.planningUnit.id,
          selectedPlanningUnitMultiplier: multiplier1,
          showDetailTable: true,
          selectedPlanningUnitDesc: changedConsumptionDataDesc,
          changedPlanningUnitMultiplier: multiplier1,
          changedConsumptionTypeId: consumptionUnit.consumptionDataType,
          dataEnteredIn: consumptionUnit.consumptionDataType,
          showOtherUnitNameField: consumptionUnit.consumptionDataType == 3 ? true : false,
          otherUnitName: consumptionUnit.consumptionDataType == 3 ? consumptionUnit.otherUnit.label.label_en : "",
          selectedPlanningUnitMultiplier: consumptionUnit.consumptionDataType == 1 ? 1 : consumptionUnit.consumptionDataType == 2 ? consumptionUnit.planningUnit.multiplier : consumptionUnit.otherUnit.multiplier,
          consumptionChanged: isInterpolate ? true : false
        })
      })
    }
  }
  /**
     * Add PUs in local storage that were not extrapolated with ARIMA & TES while offline.
     */
  addPUForArimaAndTesWhileOffline(regionObj, puObj) {
    var tempForecastProgramId = this.state.datasetId + "_v" + this.state.versionId.split(" (")[0] + "_uId_" + AuthenticationService.getLoggedInUserId();
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['planningUnitBulkExtrapolation'], 'readwrite');
      var planningUnitBulkExtrapolationTransaction = transaction.objectStore('planningUnitBulkExtrapolation');
      var planningUnitBulkExtrapolationRequest = planningUnitBulkExtrapolationTransaction.get(tempForecastProgramId);
      planningUnitBulkExtrapolationRequest.onerror = function (event) {
      }.bind(this);
      planningUnitBulkExtrapolationRequest.onsuccess = function (event) {
        var obj = {
          region: regionObj,
          planningUnit: puObj,
          programId: tempForecastProgramId
        }
        planningUnitBulkExtrapolationTransaction.put(obj);

      }.bind(this);
    }.bind(this);
  }
  /**
   * Builds data for extrapolation and runs extrapolation methods
   */
  ExtrapolatedParameters() {
    if (this.state.selectedConsumptionUnitId > 0) {
      this.setState({ loading: true })
      var datasetJson = this.state.datasetJson;
      var regionList = this.state.regionList;
      var count = 0;
      var puObj = [];
      var regionObj = []
      for (var i = 0; i < regionList.length; i++) {
        var actualConsumptionListForPlanningUnitAndRegion = datasetJson.actualConsumptionList.filter(c => c.planningUnit.id == this.state.selectedConsumptionUnitId && c.region.id == regionList[i].regionId);
        if (actualConsumptionListForPlanningUnitAndRegion.length > 1) {
          let minDate = moment.min(actualConsumptionListForPlanningUnitAndRegion.filter(c => c.puAmount >= 0).map(d => moment(d.month)));
          let maxDate = moment.max(actualConsumptionListForPlanningUnitAndRegion.filter(c => c.puAmount >= 0).map(d => moment(d.month)));
          let curDate = minDate;
          var inputDataMovingAvg = [];
          var inputDataSemiAverage = [];
          var inputDataLinearRegression = [];
          var inputDataTes = [];
          var inputDataArima = [];
          for (var j = 0; moment(curDate).format("YYYY-MM") < moment(maxDate).format("YYYY-MM"); j++) {
            curDate = moment(minDate).startOf('month').add(j, 'months').format("YYYY-MM-DD");
            var consumptionData = actualConsumptionListForPlanningUnitAndRegion.filter(c => moment(c.month).format("YYYY-MM") == moment(curDate).format("YYYY-MM"))
            inputDataMovingAvg.push({ "month": inputDataMovingAvg.length + 1, "actual": consumptionData.length > 0 ? Number(consumptionData[0].puAmount) : null, "forecast": null })
            inputDataSemiAverage.push({ "month": inputDataSemiAverage.length + 1, "actual": consumptionData.length > 0 ? Number(consumptionData[0].puAmount) : null, "forecast": null })
            inputDataLinearRegression.push({ "month": inputDataLinearRegression.length + 1, "actual": consumptionData.length > 0 ? Number(consumptionData[0].puAmount) : null, "forecast": null })
            inputDataTes.push({ "month": inputDataTes.length + 1, "actual": consumptionData.length > 0 ? Number(consumptionData[0].puAmount) : null, "forecast": null })
            inputDataArima.push({ "month": inputDataArima.length + 1, "actual": consumptionData.length > 0 ? Number(consumptionData[0].puAmount) : null, "forecast": null })
          }
          var forecastMinDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
          var forecastMaxDate = moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD");
          const monthsDiff = moment(new Date(moment(maxDate).format("YYYY-MM-DD") > moment(forecastMaxDate).format("YYYY-MM-DD") ? moment(maxDate).format("YYYY-MM-DD") : moment(forecastMaxDate).format("YYYY-MM-DD"))).diff(new Date(moment(minDate).format("YYYY-MM-DD") < moment(forecastMinDate).format("YYYY-MM-DD") ? moment(minDate).format("YYYY-MM-DD") : moment(forecastMinDate).format("YYYY-MM-DD")), 'months', true);
          const noOfMonthsForProjection = (monthsDiff + 1) - inputDataMovingAvg.length;
          if (inputDataMovingAvg.filter(c => c.actual != null).length >= 3) {
            count++;
            calculateMovingAvg(inputDataMovingAvg, this.state.monthsForMovingAverage, noOfMonthsForProjection, this, "DataEntry", regionList[i].regionId);
          }
          if (inputDataMovingAvg.filter(c => c.actual != null).length >= 3) {
            count++;
            calculateSemiAverages(inputDataSemiAverage, noOfMonthsForProjection, this, "DataEntry", regionList[i].regionId);
          }
          if (inputDataMovingAvg.filter(c => c.actual != null).length >= 3) {
            count++;
            calculateLinearRegression(inputDataLinearRegression, this.state.confidenceLevelIdLinearRegression, noOfMonthsForProjection, this, false, "DataEntry", regionList[i].regionId);
          }
          if (inputDataMovingAvg.filter(c => c.actual != null).length >= 24) {
            count++;
            calculateTES(inputDataTes, this.state.alpha, this.state.beta, this.state.gamma, this.state.confidenceLevelId, noOfMonthsForProjection, this, minDate, false, "DataEntry", regionList[i].regionId);
          }
          if (((this.state.seasonality && inputDataMovingAvg.filter(c => c.actual != null).length >= 13) || (!this.state.seasonality && inputDataMovingAvg.filter(c => c.actual != null).length >= 2))) {
            count++;
            calculateArima(inputDataArima, this.state.p, this.state.d, this.state.q, this.state.confidenceLevelIdArima, noOfMonthsForProjection, this, minDate, false, this.state.seasonality, "DataEntry", regionList[i].regionId);
          }
          if (localStorage.getItem("sessionType") === "Offline" && (inputDataMovingAvg.filter(c => c.actual != null).length >= 24 || ((this.state.seasonality && inputDataMovingAvg.filter(c => c.actual != null).length >= 13) || (!this.state.seasonality && inputDataMovingAvg.filter(c => c.actual != null).length >= 2)))) {
            if (!regionObj.includes(regionList[i].regionId)) {
              // Add the value to the array if it's not present
              regionObj.push(regionList[i].regionId)
            }
            puObj.push(this.state.selectedConsumptionUnitId)
          }
        }
      }
      if (regionObj != "" && puObj != "") {
        this.addPUForArimaAndTesWhileOffline(regionObj, puObj);
      }
      this.setState({
        count: count,
      })
    }
  }
  /**
   * Updates the moving average data by adding the provided data to the existing state.
   * @param {Object} data The data to be added to the moving average data set.
   */
  updateMovingAvgData(data) {
    var jsonDataMovingAvg = this.state.jsonDataMovingAvg;
    jsonDataMovingAvg.push(data);
    var countR = this.state.countRecived
    this.setState({
      jsonDataMovingAvg: jsonDataMovingAvg,
      countRecived: countR + 1
    }, () => {
      if (this.state.jsonDataMovingAvg.length
        + this.state.jsonDataSemiAverage.length
        + this.state.jsonDataLinearRegression.length
        + this.state.jsonDataTes.length
        + this.state.jsonDataArima.length
        == this.state.count) {
        this.saveForecastConsumptionExtrapolation();
      }
    })
  }
  /**
   * Updates the semi average data by adding the provided data to the existing state.
   * @param {Object} data The data to be added to the semi average data set.
   */
  updateSemiAveragesData(data) {
    var jsonDataSemiAverage = this.state.jsonDataSemiAverage;
    jsonDataSemiAverage.push(data);
    var countR = this.state.countRecived
    this.setState({
      jsonDataSemiAverage: jsonDataSemiAverage,
      countRecived: countR + 1
    }, () => {
      if (this.state.jsonDataMovingAvg.length
        + this.state.jsonDataSemiAverage.length
        + this.state.jsonDataLinearRegression.length
        + this.state.jsonDataTes.length
        + this.state.jsonDataArima.length
        == this.state.count) {
        this.saveForecastConsumptionExtrapolation();
      }
    })
  }
  /**
   * Updates the linear regression data by adding the provided data to the existing state.
   * @param {Object} data The data to be added to the linear regression data set.
   */
  updateLinearRegressionData(data) {
    var jsonDataLinearRegression = this.state.jsonDataLinearRegression;
    jsonDataLinearRegression.push(data);
    this.setState({
      jsonDataLinearRegression: jsonDataLinearRegression,
      countRecived: this.state.countRecived++
    }, () => {
      if (this.state.jsonDataMovingAvg.length
        + this.state.jsonDataSemiAverage.length
        + this.state.jsonDataLinearRegression.length
        + this.state.jsonDataTes.length
        + this.state.jsonDataArima.length
        == this.state.count) {
        this.saveForecastConsumptionExtrapolation();
      }
    })
  }
  /**
   * Updates the TES data by adding the provided data to the existing state.
   * @param {Object} data The data to be added to the TES data set.
   */
  updateTESData(data) {
    var jsonDataTes = this.state.jsonDataTes;
    jsonDataTes.push(data);
    this.setState({
      jsonDataTes: jsonDataTes,
      countRecived: this.state.countRecived++
    }, () => {
      if (this.state.jsonDataMovingAvg.length
        + this.state.jsonDataSemiAverage.length
        + this.state.jsonDataLinearRegression.length
        + this.state.jsonDataTes.length
        + this.state.jsonDataArima.length
        == this.state.count) {
        this.saveForecastConsumptionExtrapolation();
      }
    })
  }
  /**
   * Updates the ARIMA data by adding the provided data to the existing state.
   * @param {Object} data The data to be added to the ARIMA data set.
   */
  updateArimaData(data) {
    var jsonDataArima = this.state.jsonDataArima;
    jsonDataArima.push(data);
    this.setState({
      jsonDataArima: jsonDataArima,
      countRecived: this.state.countRecived++
    }, () => {
      if (this.state.jsonDataMovingAvg.length
        + this.state.jsonDataSemiAverage.length
        + this.state.jsonDataLinearRegression.length
        + this.state.jsonDataTes.length
        + this.state.jsonDataArima.length
        == this.state.count) {
        this.saveForecastConsumptionExtrapolation();
      }
    })
  }
  /**
   * Saves extrapolation data in indexed DB
   */
  saveForecastConsumptionExtrapolation() {
    var tempDatasetId = this.state.datasetId + "_v" + this.state.versionId.split(" (")[0] + "_uId_" + AuthenticationService.getLoggedInUserId();
    this.setState({
      loading: true
    })
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
      this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
      this.props.updateState("color", "red");
      this.props.hideFirstComponent();
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var extrapolationMethodTransaction = db1.transaction(['extrapolationMethod'], 'readwrite');
      var extrapolationMethodObjectStore = extrapolationMethodTransaction.objectStore('extrapolationMethod');
      var extrapolationMethodRequest = extrapolationMethodObjectStore.getAll();
      extrapolationMethodRequest.onerror = function (event) {
      }.bind(this);
      extrapolationMethodRequest.onsuccess = function (event) {
        var transaction = db1.transaction(['datasetData'], 'readwrite');
        var datasetTransaction = transaction.objectStore('datasetData');
        var datasetRequest = datasetTransaction.get(tempDatasetId);
        datasetRequest.onerror = function (event) {
        }.bind(this);
        datasetRequest.onsuccess = function (event) {
          var extrapolationMethodList = extrapolationMethodRequest.result;
          var myResult = datasetRequest.result;
          var datasetDataBytes = CryptoJS.AES.decrypt(myResult.programData, SECRET_KEY);
          var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
          var datasetJson = JSON.parse(datasetData);
          var consumptionExtrapolationDataUnFiltered = (datasetJson.consumptionExtrapolation);
          var regionList = this.state.regionList;
          var consumptionExtrapolationList = datasetJson.consumptionExtrapolation;
          for (var r = 0; r < regionList.length; r++) {
            consumptionExtrapolationList = consumptionExtrapolationList.filter(c => c.planningUnit.id != this.state.selectedConsumptionUnitId || (c.planningUnit.id == this.state.selectedConsumptionUnitId && c.region.id != regionList[r].regionId));
            var id = consumptionExtrapolationDataUnFiltered.length > 0 ? Math.max(...consumptionExtrapolationDataUnFiltered.map(o => o.consumptionExtrapolationId)) + 1 : 1;
            var planningUnitObj = this.state.planningUnitList.filter(c => c.planningUnit.id == this.state.selectedConsumptionUnitId)[0].planningUnit;
            var regionObj = this.state.regionList.filter(c => c.regionId == regionList[r].regionId)[0];
            var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
            var curUser = AuthenticationService.getLoggedInUserId();
            var datasetJson = this.state.datasetJson;
            var actualConsumptionListForPlanningUnitAndRegion = datasetJson.actualConsumptionList.filter(c => c.planningUnit.id == this.state.selectedConsumptionUnitId && c.region.id == regionList[r].regionId);
            var minDate = moment.min(actualConsumptionListForPlanningUnitAndRegion.filter(c => c.puAmount >= 0).map(d => moment(d.month)));
            var maxDate = moment.max(actualConsumptionListForPlanningUnitAndRegion.filter(c => c.puAmount >= 0).map(d => moment(d.month)));
            var jsonDataSemiAvgFilter = this.state.jsonDataSemiAverage.filter(c => c.PlanningUnitId == this.state.selectedConsumptionUnitId && c.regionId == regionList[r].regionId)
            if (jsonDataSemiAvgFilter.length > 0) {
              var jsonSemi = jsonDataSemiAvgFilter[0].data;
              var data = [];
              for (var i = 0; i < jsonSemi.length; i++) {
                data.push({ month: moment(minDate).add(i, 'months').format("YYYY-MM-DD"), amount: jsonSemi[i].forecast != null ? (jsonSemi[i].forecast).toFixed(4) : null, ci: null })
              }
              consumptionExtrapolationList.push(
                {
                  "consumptionExtrapolationId": id,
                  "planningUnit": planningUnitObj,
                  "region": {
                    id: regionObj.regionId,
                    label: regionObj.label
                  },
                  "extrapolationMethod": extrapolationMethodList.filter(c => c.id == 6)[0],
                  "jsonProperties": {
                    startDate: moment(minDate).format("YYYY-MM-DD"),
                    stopDate: moment(maxDate).format("YYYY-MM-DD")
                  },
                  "createdBy": {
                    "userId": curUser
                  },
                  "createdDate": curDate,
                  "extrapolationDataList": data
                })
              id += 1;
            }
            var data = [];
            var jsonDataMovingFilter = this.state.jsonDataMovingAvg.filter(c => c.PlanningUnitId == this.state.selectedConsumptionUnitId && c.regionId == regionList[r].regionId)
            if (jsonDataMovingFilter.length > 0) {
              var jsonDataMoving = jsonDataMovingFilter[0].data;
              for (var i = 0; i < jsonDataMoving.length; i++) {
                data.push({ month: moment(minDate).add(i, 'months').format("YYYY-MM-DD"), amount: jsonDataMoving[i].forecast != null ? (jsonDataMoving[i].forecast).toFixed(4) : null, ci: null })
              }
              consumptionExtrapolationList.push(
                {
                  "consumptionExtrapolationId": id,
                  "planningUnit": planningUnitObj,
                  "region": {
                    id: regionObj.regionId,
                    label: regionObj.label
                  },
                  "extrapolationMethod": extrapolationMethodList.filter(c => c.id == 7)[0],
                  "jsonProperties": {
                    months: this.state.monthsForMovingAverage,
                    startDate: moment(minDate).format("YYYY-MM-DD"),
                    stopDate: moment(maxDate).format("YYYY-MM-DD")
                  },
                  "createdBy": {
                    "userId": curUser
                  },
                  "createdDate": curDate,
                  "extrapolationDataList": data
                })
            }
            id += 1;
            var data = [];
            var jsonDataLinearFilter = this.state.jsonDataLinearRegression.filter(c => c.PlanningUnitId == this.state.selectedConsumptionUnitId && c.regionId == regionList[r].regionId)
            if (jsonDataLinearFilter.length > 0) {
              var jsonDataLinear = jsonDataLinearFilter[0].data;
              for (var i = 0; i < jsonDataLinear.length; i++) {
                data.push({ month: moment(minDate).add(i, 'months').format("YYYY-MM-DD"), amount: jsonDataLinear[i].forecast != null ? (jsonDataLinear[i].forecast).toFixed(4) : null, ci: (jsonDataLinear[i].ci) })
              }
              consumptionExtrapolationList.push(
                {
                  "consumptionExtrapolationId": id,
                  "planningUnit": planningUnitObj,
                  "region": {
                    id: regionObj.regionId,
                    label: regionObj.label
                  },
                  "extrapolationMethod": extrapolationMethodList.filter(c => c.id == 5)[0],
                  "jsonProperties": {
                    confidenceLevel: this.state.confidenceLevelIdLinearRegression,
                    startDate: moment(minDate).format("YYYY-MM-DD"),
                    stopDate: moment(maxDate).format("YYYY-MM-DD")
                  },
                  "createdBy": {
                    "userId": curUser
                  },
                  "createdDate": curDate,
                  "extrapolationDataList": data
                })
              id += 1;
            }
            var data = [];
            var jsonDataTesFilter = this.state.jsonDataTes.filter(c => c.PlanningUnitId == this.state.selectedConsumptionUnitId && c.regionId == regionList[r].regionId)
            if (jsonDataTesFilter.length > 0) {
              var jsonDataTes = jsonDataTesFilter[0].data;
              for (var i = 0; i < jsonDataTes.length; i++) {
                data.push({ month: moment(minDate).add(i, 'months').format("YYYY-MM-DD"), amount: jsonDataTes[i].forecast != null ? (jsonDataTes[i].forecast).toFixed(4) : null, ci: (jsonDataTes[i].ci) })
              }
              consumptionExtrapolationList.push(
                {
                  "consumptionExtrapolationId": id,
                  "planningUnit": planningUnitObj,
                  "region": {
                    id: regionObj.regionId,
                    label: regionObj.label
                  },
                  "extrapolationMethod": extrapolationMethodList.filter(c => c.id == 2)[0],
                  "jsonProperties": {
                    confidenceLevel: this.state.confidenceLevelId,
                    seasonality: this.state.noOfMonthsForASeason,
                    alpha: this.state.alpha,
                    beta: this.state.beta,
                    gamma: this.state.gamma,
                    startDate: moment(minDate).format("YYYY-MM-DD"),
                    stopDate: moment(maxDate).format("YYYY-MM-DD")
                  },
                  "createdBy": {
                    "userId": curUser
                  },
                  "createdDate": curDate,
                  "extrapolationDataList": data
                })
              id += 1;
            }
            var data = [];
            var jsonDataArimaFilter = this.state.jsonDataArima.filter(c => c.PlanningUnitId == this.state.selectedConsumptionUnitId && c.regionId == regionList[r].regionId)
            if (jsonDataArimaFilter.length > 0) {
              var jsonDataArima = jsonDataArimaFilter[0].data;
              for (var i = 0; i < jsonDataArima.length; i++) {
                data.push({ month: moment(minDate).add(i, 'months').format("YYYY-MM-DD"), amount: jsonDataArima[i].forecast != null ? (jsonDataArima[i].forecast).toFixed(4) : null, ci: (jsonDataArima[i].ci) })
              }
              consumptionExtrapolationList.push(
                {
                  "consumptionExtrapolationId": id,
                  "planningUnit": planningUnitObj,
                  "region": {
                    id: regionObj.regionId,
                    label: regionObj.label
                  },
                  "extrapolationMethod": extrapolationMethodList.filter(c => c.id == 4)[0],
                  "jsonProperties": {
                    confidenceLevel: this.state.confidenceLevelIdArima,
                    seasonality: this.state.seasonality,
                    p: this.state.p,
                    d: this.state.d,
                    q: this.state.q,
                    startDate: moment(minDate).format("YYYY-MM-DD"),
                    stopDate: moment(maxDate).format("YYYY-MM-DD")
                  },
                  "createdBy": {
                    "userId": curUser
                  },
                  "createdDate": curDate,
                  "extrapolationDataList": data
                })
              id += 1;
            }
          }
          datasetJson.consumptionExtrapolation = consumptionExtrapolationList;
          datasetData = (CryptoJS.AES.encrypt(JSON.stringify(datasetJson), SECRET_KEY)).toString()
          myResult.programData = datasetData;
          var putRequest = datasetTransaction.put(myResult);
          this.setState({
            dataChanged: false
          })
          putRequest.onerror = function (event) {
          }.bind(this);
          putRequest.onsuccess = function (event) {
            this.setState({
              loading: false,
              dataChanged: false,
              message: i18n.t('static.compareAndSelect.dataSaved'),
              extrapolateClicked: false,
              countRecived: 0,
              count: 0,
              showDetailTable: true,
              datasetJson: datasetJson
            }, () => {
              hideFirstComponent();
              this.componentDidMount()
            })
          }.bind(this);
        }.bind(this);
      }.bind(this);
    }.bind(this);
  }
  /**
   * Function to handle changes in jexcel cells.
   * @param {Object} instance - The jexcel instance.
   * @param {Object} cell - The cell object that changed.
   * @param {number} x - The x-coordinate of the changed cell.
   * @param {number} y - The y-coordinate of the changed cell.
   * @param {any} value - The new value of the changed cell.
   */
  consumptionDataChanged = function (instance, cell, x, y, value) {
    var possibleActualConsumptionY = [];
    var possibleReportRateY = [];
    var possibleStockDayY = [];
    var adjustedConsumptionY = [];
    var actualConsumptionStart = 2;
    var reportRateStart = 3;
    var stockDayStart = 4;
    var adjustedConsumption = 6;
    var reg = JEXCEL_DECIMAL_MONTHLY_CHANGE_4_DECIMAL_POSITIVE;
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
    var regionList = this.state.regionList;
    for (var i = 0; i < regionList.length; i++) {
      possibleActualConsumptionY.push(actualConsumptionStart.toString());
      possibleReportRateY.push(reportRateStart.toString());
      possibleStockDayY.push(stockDayStart.toString());
      adjustedConsumptionY.push(adjustedConsumption.toString());
      actualConsumptionStart += 8;
      reportRateStart += 8;
      stockDayStart += 8;
      adjustedConsumption += 8;
    }
    var elInstance = this.state.dataEl;
    if (possibleActualConsumptionY.includes(y.toString())) {
      value = elInstance.getValue(`${colArr[x]}${parseInt(y) + 1}`, true);
      value = value.replaceAll(',', '');
      if (value === "") {
        var cell = elInstance.getCell((colArr[x]).concat(parseInt(y) + 2))
        cell.classList.add('readonly');
        var cell = elInstance.getCell((colArr[x]).concat(parseInt(y) + 3))
        cell.classList.add('readonly');
        elInstance.setValueFromCoords(x, y + 1, 100, true);
        elInstance.setValueFromCoords(x, y + 2, "0", true);
        var col = (colArr[x]).concat(parseInt(y) + 1);
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setStyle(col, "background-color", "yellow");
      } else if (value < 0) {
        var col = (colArr[x]).concat(parseInt(y) + 1);
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setStyle(col, "background-color", "yellow");
        elInstance.setComments(col, "Please enter a positive number");
      } else if (!(reg.test(value))) {
        var col = (colArr[x]).concat(parseInt(y) + 1);
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setStyle(col, "background-color", "yellow");
        this.el.setComments(col, i18n.t('static.common.positiveIntegerWithLength'));
      } else {
        var col = (colArr[x]).concat(parseInt(y) + 1);
        var cell = elInstance.getCell((colArr[x]).concat(parseInt(y) + 2))
        cell.classList.remove('readonly');
        var cell1 = elInstance.getCell((colArr[x]).concat(parseInt(y) + 3))
        cell1.classList.remove('readonly');
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setComments(col, "");
        elInstance.setStyle(col, "background-color", "transparent");
      }
    }
    if (possibleReportRateY.includes(y.toString())) {
      value = elInstance.getValue(`${colArr[x]}${parseInt(y) + 1}`, true);
      value = value.replaceAll(',', '');
      if (value == "") {
      }
      else if (value < 0 || value > 100) {
        var col = (colArr[x]).concat(parseInt(y) + 1);
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setStyle(col, "background-color", "yellow");
        elInstance.setComments(col, "Please enter any positive number upto 100");
      } else if (value == 0) {
        var col = (colArr[x]).concat(parseInt(y) + 1);
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setStyle(col, "background-color", "yellow");
        elInstance.setComments(col, i18n.t('static.currency.conversionrateMin'));
      }
      else if (!(reg.test(value))) {
        var col = (colArr[x]).concat(parseInt(y) + 1);
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setStyle(col, "background-color", "yellow");
        this.el.setComments(col, i18n.t('static.common.positiveIntegerWithLength'));
      } else {
        var col = (colArr[x]).concat(parseInt(y) + 1);
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setComments(col, "");
      }
    }
    if (possibleStockDayY.includes(y.toString())) {
      value = elInstance.getValue(`${colArr[x]}${parseInt(y) + 1}`, true);
      value = value.replaceAll(',', '');
      var stockOutdays = elInstance.getColumnData(x)[0];
      if (value == "") {
      } else if (elInstance.getValue(`${colArr[x]}${parseInt(y) + 1 - 2}`, true) >= 0 && value == stockOutdays) {
        var col = (colArr[x]).concat(parseInt(y) + 1);
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setStyle(col, "background-color", "yellow");
        elInstance.setComments(col, i18n.t('static.dataEntry.daysOfStockOutMustBeLessInCaseOfActualConsumption'));
      } else if (value < 0 || value >= stockOutdays) {
        var col = (colArr[x]).concat(parseInt(y) + 1);
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setStyle(col, "background-color", "yellow");
        elInstance.setComments(col, "Please enter positive value lesser than number of days.");
      } else if (!(reg.test(value))) {
        var col = (colArr[x]).concat(parseInt(y) + 1);
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setStyle(col, "background-color", "yellow");
        this.el.setComments(col, i18n.t('static.common.positiveIntegerWithLength'));
      } else {
        var col = (colArr[x]).concat(parseInt(y) + 1);
        elInstance.setValueFromCoords(x, y, (value), true)
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setComments(col, "");
      }
    }
  }
  /**
   * Function to check validation of the jexcel table before performing interpolate.
   * @returns {boolean} - True if validation passes, false otherwise.
   */
  checkValidationInterpolate() {
    var valid = true;
    var elInstance = this.state.dataEl;
    var json = elInstance.getJson(null, false);
    var possibleActualConsumptionY = [];
    var possibleReportRateY = [];
    var possibleStockDayY = [];
    var actualConsumptionStart = 2;
    var reportRateStart = 3;
    var stockDayStart = 4;
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
    var regionList = this.state.regionList;
    var reg = JEXCEL_DECIMAL_MONTHLY_CHANGE_4_DECIMAL_POSITIVE;
    for (var i = 0; i < regionList.length; i++) {
      possibleActualConsumptionY.push(actualConsumptionStart.toString());
      possibleReportRateY.push(reportRateStart.toString());
      possibleStockDayY.push(stockDayStart.toString());
      actualConsumptionStart += 8;
      reportRateStart += 8;
      stockDayStart += 8;
    }
    for (var y = 0; y < json.length; y++) {
      for (var x = 1; x <= this.state.monthArray.length; x++) {
        var value = elInstance.getValue(`${colArr[x]}${parseInt(y) + 1}`, true);
        value = value.replaceAll(',', '');
        if (possibleStockDayY.includes(y.toString())) {
          var stockOutdays = elInstance.getColumnData(x)[0];
          if (value == "") {
          } else if (elInstance.getValue(`${colArr[x]}${parseInt(y) + 1 - 2}`, true) >= 0 && value == stockOutdays) {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, i18n.t('static.dataEntry.daysOfStockOutMustBeLessInCaseOfActualConsumption'));
            valid = false;
          }
          else if (value < 0 || value >= stockOutdays) {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, "Please enter positive value lesser than number of days.");
            valid = false;
          } else if (!(reg.test(value))) {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            this.el.setComments(col, i18n.t('static.common.positiveIntegerWithLength'));
            valid = false;
          } else {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
          }
        }
      }
    }
    return valid;
  }
  /**
   * Function to check validation of the jexcel table.
   * @returns {boolean} - True if validation passes, false otherwise.
   */
  checkValidationConsumption() {
    var valid = true;
    var elInstance = this.state.dataEl;
    var json = elInstance.getJson(null, false);
    var possibleActualConsumptionY = [];
    var possibleReportRateY = [];
    var possibleStockDayY = [];
    var actualConsumptionStart = 2;
    var reportRateStart = 3;
    var stockDayStart = 4;
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
    var regionList = this.state.regionList;
    var reg = JEXCEL_DECIMAL_MONTHLY_CHANGE_4_DECIMAL_POSITIVE;
    for (var i = 0; i < regionList.length; i++) {
      possibleActualConsumptionY.push(actualConsumptionStart.toString());
      possibleReportRateY.push(reportRateStart.toString());
      possibleStockDayY.push(stockDayStart.toString());
      actualConsumptionStart += 8;
      reportRateStart += 8;
      stockDayStart += 8;
    }
    for (var y = 0; y < json.length; y++) {
      for (var x = 1; x <= this.state.monthArray.length; x++) {
        var value = elInstance.getValue(`${colArr[x]}${parseInt(y) + 1}`, true);
        value = value.replaceAll(',', '');
        if (possibleActualConsumptionY.includes(y.toString())) {
          if (value == "") {
          } else if (value < 0) {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, "Please enter a positive number)");
            valid = false;
          } else if (!(reg.test(value))) {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            this.el.setComments(col, i18n.t('static.common.positiveIntegerWithLength'));
            valid = false;
          } else {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
          }
        }
        if (possibleReportRateY.includes(y.toString())) {
          if (value == "") {
          }
          else if (value < 0 || value > 100) {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, "Please enter any positive number upto 100");
            valid = false;
          } else if (value == 0) {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, i18n.t('static.currency.conversionrateMin'));
            valid = false;
          } else if (!(reg.test(value))) {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            this.el.setComments(col, i18n.t('static.common.positiveIntegerWithLength'));
            valid = false;
          }
          else {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
          }
        }
        if (possibleStockDayY.includes(y.toString())) {
          var stockOutdays = elInstance.getColumnData(x)[0];
          if (value == "") {
          } else if (elInstance.getValue(`${colArr[x]}${parseInt(y) + 1 - 2}`, true) >= 0 && value == stockOutdays) {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, i18n.t('static.dataEntry.daysOfStockOutMustBeLessInCaseOfActualConsumption'));
            valid = false;
          }
          else if (value < 0 || value >= stockOutdays) {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, "Please enter positive value lesser than number of days.");
            valid = false;
          } else if (!(reg.test(value))) {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            this.el.setComments(col, i18n.t('static.common.positiveIntegerWithLength'));
            valid = false;
          } else {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
          }
        }
      }
    }
    return valid;
  }
  /**
   * Interpolates missing consumption data
   */
  interpolationMissingActualConsumption() {
    var checkValidation = this.checkValidationInterpolate();
    if (checkValidation) {
      var notes = document.getElementById("consumptionNotes").value;
      var monthArray = this.state.monthArray;
      var regionList = this.state.regionList;
      var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
      var curUser = AuthenticationService.getLoggedInUserId();
      var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
      var consumptionUnit = this.state.selectedConsumptionUnitObject;
      var rangeValue = this.state.singleValue2;
      var startDate = moment(rangeValue.year + '-' + rangeValue.month + '-01').format("YYYY-MM-DD");
      var stopDate = moment(startDate).add(35, 'months').format("YYYY-MM-DD");
      if(moment(stopDate).format("YYYY-MM")>=moment(Date.now()).format("YYYY-MM")){
        stopDate=moment(Date.now()).startOf('month').format("YYYY-MM-DD");
      }
      var fullConsumptionList=[];
      if(moment(startDate).format("YYYY-MM")==moment(stopDate).format("YYYY-MM")){
        fullConsumptionList = this.state.tempConsumptionList.filter(c => (c.planningUnit.id != consumptionUnit.planningUnit.id) || (c.planningUnit.id == consumptionUnit.planningUnit.id && (moment(c.month).format("YYYY-MM") != moment(startDate).format("YYYY-MM"))));
      }else{
        fullConsumptionList = this.state.tempConsumptionList.filter(c => (c.planningUnit.id != consumptionUnit.planningUnit.id) || (c.planningUnit.id == consumptionUnit.planningUnit.id && (moment(c.month).format("YYYY-MM") < moment(startDate).format("YYYY-MM") || moment(c.month).format("YYYY-MM") > moment(stopDate).format("YYYY-MM"))));
      }
      var elInstance = this.state.dataEl;
      for (var i = 0; i < monthArray.length; i++) {
        var columnData = elInstance.getColumnData([i + 1]);
        var actualConsumptionCount = 2;
        var reportingRateCount = 3;
        var daysOfStockOutCount = 4;
        var adjustedAmountCount = 6;
        var puAmountCount = 7;
        for (var r = 0; r < regionList.length; r++) {
          var index = 0;
          index = fullConsumptionList.findIndex(c => c.planningUnit.id == consumptionUnit.planningUnit.id && c.region.id == regionList[r].regionId && moment(c.month).format("YYYY-MM") == moment(monthArray[i].date).format("YYYY-MM"));
          var actualConsumptionValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(actualConsumptionCount) + 1}`, true).replaceAll(",", "");
          var reportingRateValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(reportingRateCount) + 1}`, true);
          var daysOfStockOutValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(daysOfStockOutCount) + 1}`, true);
          var adjustedAmountValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(adjustedAmountCount) + 1}`, true).replaceAll(",", "");;
          var puAmountValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(puAmountCount) + 1}`, true).replaceAll(",", "");;
          if (actualConsumptionValue !== "") {
            if (index != -1) {
              fullConsumptionList[index].amount = actualConsumptionValue;
              fullConsumptionList[index].reportingRate = reportingRateValue;
              fullConsumptionList[index].daysOfStockOut = daysOfStockOutValue;
              fullConsumptionList[index].adjustedAmount = adjustedAmountValue;
              fullConsumptionList[index].puAmount = puAmountValue;
            } else {
              var json = {
                amount: actualConsumptionValue,
                adjustedAmount: adjustedAmountValue !== "" ? adjustedAmountValue : 0,
                puAmount: puAmountValue !== "" ? puAmountValue : 0,
                planningUnit: {
                  id: consumptionUnit.planningUnit.id,
                  label: consumptionUnit.planningUnit.label
                },
                createdBy: {
                  userId: curUser
                },
                createdDate: curDate,
                daysOfStockOut: daysOfStockOutValue,
                exculde: false,
                forecastConsumptionId: 0,
                month: moment(monthArray[i].date).startOf('month').format("YYYY-MM-DD"),
                region: {
                  id: regionList[r].regionId,
                  label: regionList[r].label
                },
                reportingRate: reportingRateValue
              }
              fullConsumptionList.push(json);
            }
          }
          actualConsumptionCount += 8;
          reportingRateCount += 8;
          daysOfStockOutCount += 8;
          adjustedAmountCount += 8;
          puAmountCount += 8;
        }
      }
      var interpolatedRegionsAndMonths = [];
      for (var r = 0; r < regionList.length; r++) {
        for (var j = 0; j < monthArray.length; j++) {
          var consumptionData = fullConsumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.planningUnit.id == consumptionUnit.planningUnit.id && c.region.id == regionList[r].regionId && Number(c.amount) >= 0);
          if (consumptionData.length == 0) {
            var startValList = fullConsumptionList.filter(c => moment(c.month).format("YYYY-MM") < moment(monthArray[j].date).format("YYYY-MM") && c.planningUnit.id == consumptionUnit.planningUnit.id && c.region.id == regionList[r].regionId && Number(c.amount) >= 0)
              .sort(function (a, b) {
                return new Date(a.month) - new Date(b.month);
              });
            var endValList = fullConsumptionList.filter(c => moment(c.month).format("YYYY-MM") > moment(monthArray[j].date).format("YYYY-MM") && c.planningUnit.id == consumptionUnit.planningUnit.id && c.region.id == regionList[r].regionId && Number(c.amount) >= 0)
              .sort(function (a, b) {
                return new Date(a.month) - new Date(b.month);
              });
            if (startValList.length > 0 && endValList.length > 0) {
              var startVal = startValList[startValList.length - 1].adjustedAmount != undefined ? startValList[startValList.length - 1].adjustedAmount : startValList[startValList.length - 1].amount;
              var startMonthVal = startValList[startValList.length - 1].month;
              var endVal = endValList[0].adjustedAmount != undefined ? endValList[0].adjustedAmount : endValList[0].amount;
              var endMonthVal = endValList[0].month;
              interpolatedRegionsAndMonths.push({ region: regionList[r], month: moment(monthArray[j].date).format("YYYY-MM") });
              const monthDifference = Math.round(Number(moment(new Date(monthArray[j].date)).diff(new Date(startMonthVal), 'months', true)));
              const monthDiff = Math.round(Number(moment(new Date(endMonthVal)).diff(new Date(startMonthVal), 'months', true)));
              var missingActualConsumption = Number(startVal) + (monthDifference * ((Number(endVal) - Number(startVal)) / monthDiff));
              var json = {
                amount: missingActualConsumption.toFixed(4),
                planningUnit: {
                  id: consumptionUnit.planningUnit.id,
                  label: consumptionUnit.planningUnit.label
                },
                createdBy: {
                  userId: curUser
                },
                createdDate: curDate,
                daysOfStockOut: columnData[daysOfStockOutCount],
                exculde: false,
                forecastConsumptionId: 0,
                month: moment(monthArray[j].date).format("YYYY-MM-DD"),
                region: {
                  id: regionList[r].regionId,
                  label: regionList[r].label
                },
                reportingRate: columnData[reportingRateCount]
              }
              fullConsumptionList.push(json);
            }
          }
        }
      }
      if (interpolatedRegionsAndMonths.length == 0) {
        window.alert(i18n.t('static.consumptionDataEntryAndAdjustment.nothingToInterpolate'));
      } else {
        var interpolatedRegions = [...new Set(interpolatedRegionsAndMonths.map(ele => (ele.region.regionId)))];
        var cont = false;
        var cf = window.confirm(i18n.t('static.consumptionDataEntryAndAdjustment.interpolatedDataFor') + interpolatedRegions.map(item => (
          "\r\n\r\n" + getLabelText(regionList.filter(c => c.regionId == item)[0].label, this.state.lang) + ": " + interpolatedRegionsAndMonths.filter(c => c.region.regionId == item).map(item1 => moment(item1.month).format(DATE_FORMAT_CAP_WITHOUT_DATE))
        )));
        if (cf == true) {
          cont = true;
        } else {
        }
        if (cont == true) {
          document.getElementById("consumptionNotes").value = notes + (notes != "" ? "\r\n" : "") + "Interpolated data for: " + interpolatedRegions.map(item => (
            "\r\n" + getLabelText(regionList.filter(c => c.regionId == item)[0].label, this.state.lang) + ": " + interpolatedRegionsAndMonths.filter(c => c.region.regionId == item).map(item1 => moment(item1.month).format(DATE_FORMAT_CAP_WITHOUT_DATE))
          ));
          this.setState({
            tempConsumptionList: fullConsumptionList,
            consumptionChanged: true,
            loading: false,
            message: "",
            messageColor: ""
          })
          this.buildDataJexcel(this.state.selectedConsumptionUnitId, 1);
        }
      }
    } else {
      this.setState({
        loading: false,
        message: i18n.t('static.dataEntry.validationFailedAndCannotInterpolate'),
        messageColor: "red"
      })
    }
  }
  /**
   * Saves forecast consumption data in indexed db
   */
  saveConsumptionList() {
    var tempDatasetId = this.state.datasetId + "_v" + this.state.versionId.split(" (")[0] + "_uId_" + AuthenticationService.getLoggedInUserId();
    this.setState({
      loading: true
    })
    var validation = this.checkValidationConsumption();
    if (validation) {
      var db1;
      getDatabase();
      var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
      openRequest.onerror = function (event) {
        this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
        this.props.updateState("color", "red");
        this.props.hideFirstComponent();
      }.bind(this);
      openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var transaction = db1.transaction(['datasetData'], 'readwrite');
        var datasetTransaction = transaction.objectStore('datasetData');
        var datasetRequest = datasetTransaction.get(tempDatasetId);
        datasetRequest.onerror = function (event) {
        }.bind(this);
        datasetRequest.onsuccess = function (event) {
          var myResult = datasetRequest.result;
          var datasetDataBytes = CryptoJS.AES.decrypt(myResult.programData, SECRET_KEY);
          var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
          var datasetJson = JSON.parse(datasetData);
          var elInstance = this.state.dataEl;
          var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
          var curUser = AuthenticationService.getLoggedInUserId();
          var consumptionUnit = this.state.selectedConsumptionUnitObject;
          var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
          var rangeValue = this.state.singleValue2;
          var startDate = moment(rangeValue.year + '-' + rangeValue.month + '-01').format("YYYY-MM-DD");
          var stopDate = moment(startDate).add(35, 'months').format("YYYY-MM-DD");
          if(moment(stopDate).format("YYYY-MM")>=moment(Date.now()).format("YYYY-MM")){
            stopDate=moment(Date.now()).startOf('month').format("YYYY-MM-DD");
          }
          var fullConsumptionList=[];
          if(moment(startDate).format("YYYY-MM")==moment(stopDate).format("YYYY-MM")){
            fullConsumptionList = this.state.consumptionList.filter(c => (c.planningUnit.id != consumptionUnit.planningUnit.id) || (c.planningUnit.id == consumptionUnit.planningUnit.id && (moment(c.month).format("YYYY-MM") != moment(startDate).format("YYYY-MM"))));            
          }else{
            fullConsumptionList = this.state.consumptionList.filter(c => (c.planningUnit.id != consumptionUnit.planningUnit.id) || (c.planningUnit.id == consumptionUnit.planningUnit.id && (moment(c.month).format("YYYY-MM") < moment(startDate).format("YYYY-MM") || moment(c.month).format("YYYY-MM") > moment(stopDate).format("YYYY-MM"))));
          }
          var monthArray = this.state.monthArray;
          var regionList = this.state.regionList;
          for (var i = 0; i < monthArray.length; i++) {
            var actualConsumptionCount = 2;
            var reportingRateCount = 3;
            var daysOfStockOutCount = 4;
            var adjustedAmountCount = 6;
            var puAmountCount = 7;
            for (var r = 0; r < regionList.length; r++) {
              var index = 0;
              index = fullConsumptionList.findIndex(c => c.planningUnit.id == consumptionUnit.planningUnit.id && c.region.id == regionList[r].regionId && moment(c.month).format("YYYY-MM") == moment(monthArray[i].date).format("YYYY-MM"));
              var actualConsumptionValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(actualConsumptionCount) + 1}`, true).replaceAll(",", "");
              var reportingRateValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(reportingRateCount) + 1}`, true);
              var daysOfStockOutValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(daysOfStockOutCount) + 1}`, true);
              var adjustedAmountValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(adjustedAmountCount) + 1}`, true).replaceAll(",", "");
              var puAmountValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(puAmountCount) + 1}`, true).replaceAll(",", "");
              if (actualConsumptionValue !== "") {
                if (index != -1) {
                  fullConsumptionList[index].amount = actualConsumptionValue;
                  fullConsumptionList[index].reportingRate = reportingRateValue;
                  fullConsumptionList[index].daysOfStockOut = daysOfStockOutValue;
                  fullConsumptionList[index].adjustedAmount = adjustedAmountValue;
                  fullConsumptionList[index].puAmount = puAmountValue;
                  fullConsumptionList[index].createdBy = {
                    userId: curUser
                  };
                  fullConsumptionList[index].createdDate = curDate;
                } else {
                  var json = {
                    amount: actualConsumptionValue,
                    adjustedAmount: adjustedAmountValue !== "" ? adjustedAmountValue : 0,
                    puAmount: puAmountValue !== "" ? puAmountValue : 0,
                    planningUnit: {
                      id: consumptionUnit.planningUnit.id,
                      label: consumptionUnit.planningUnit.label
                    },
                    createdBy: {
                      userId: curUser
                    },
                    createdDate: curDate,
                    daysOfStockOut: daysOfStockOutValue !== "" ? Math.round(daysOfStockOutValue) : daysOfStockOutValue,
                    exculde: false,
                    forecastConsumptionId: 0,
                    month: moment(monthArray[i].date).startOf('month').format("YYYY-MM-DD"),
                    region: {
                      id: regionList[r].regionId,
                      label: regionList[r].label
                    },
                    reportingRate: reportingRateValue
                  }
                  fullConsumptionList.push(json);
                }
              }
              actualConsumptionCount += 8;
              reportingRateCount += 8;
              daysOfStockOutCount += 8;
              adjustedAmountCount += 8;
              puAmountCount += 8;
            }
          }
          var planningUnitList = datasetJson.planningUnitList;
          var planningUnitIndex = planningUnitList.findIndex(c => c.planningUnit.id == consumptionUnit.planningUnit.id);
          planningUnitList[planningUnitIndex].consumptionNotes = document.getElementById("consumptionNotes").value;
          planningUnitList[planningUnitIndex].consumptionDataType = this.state.dataEnteredIn;
          if (this.state.dataEnteredIn == 3) {
            var otherUnitJson = {
              id: null,
              label: {
                label_en: this.state.tempConsumptionUnitObject.otherUnit.label.label_en
              },
              multiplier: this.state.tempConsumptionUnitObject.otherUnit.multiplier
            }
            planningUnitList[planningUnitIndex].otherUnit = otherUnitJson;
          }
          datasetJson.actualConsumptionList = fullConsumptionList;
          datasetJson.planningUnitList = planningUnitList;
          datasetData = (CryptoJS.AES.encrypt(JSON.stringify(datasetJson), SECRET_KEY)).toString()
          myResult.programData = datasetData;
          var putRequest = datasetTransaction.put(myResult);
          putRequest.onerror = function (event) {
          }.bind(this);
          putRequest.onsuccess = function (event) {
            db1 = e.target.result;
            var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
            var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
            var datasetDetailsRequest = datasetDetailsTransaction.get(tempDatasetId);
            datasetDetailsRequest.onsuccess = function (e) {
              var datasetDetailsRequestJson = datasetDetailsRequest.result;
              datasetDetailsRequestJson.changed = 1;
              var datasetDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
              datasetDetailsRequest1.onsuccess = function (event) {
              }
            }
            this.setState({
              message: i18n.t('static.compareAndSelect.dataSaved'),
              messageColor: "green",
              consumptionChanged: false,
              jsonDataMovingAvg: [],
              jsonDataSemiAverage: [],
              jsonDataLinearRegression: [],
              jsonDataTes: [],
              jsonDataArima: [],
              datasetJson: datasetJson
            }, () => {
              this.ExtrapolatedParameters();
            })
          }.bind(this)
        }.bind(this)
      }.bind(this)
    } else {
      this.setState({
        loading: false,
        message: i18n.t('static.supplyPlan.validationFailed'),
        messageColor: "red"
      })
    }
  }
  /**
   * This function is used to format the table like add asterisk or info to the table headers
   * @param {*} instance This is the DOM Element where sheet is created
   * @param {*} cell This is the object of the DOM element
   */
  loadedJexcel = function (instance, cell, x, y, value) {
    jExcelLoadedFunctionOnlyHideRow(instance);
    var elInstance = instance.worksheets[0];
    var consumptionDataType = this.state.tempConsumptionUnitObject.consumptionDataType;
    var json = elInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', , 'E', 'F']
    for (var j = 0; j < json.length; j++) {
      for (var i = 0; i < colArr.length; i++) {
        var cell = elInstance.getCell("C1")
        cell.classList.add('readonly');
        var cell = elInstance.getCell("C2")
        cell.classList.add('readonly');
        if (consumptionDataType == 3) {
          var cell1 = elInstance.getCell(`C3`)
          var cell2 = elInstance.getCell(`D3`)
          cell1.classList.remove('readonly');
          cell2.classList.remove('readonly');
          document.getElementById("dataEnteredInTableExLabel").style.display = "block";
          this.setState({
            dataEnteredInTableExSpan: Math.round(Number(1 / this.state.tempConsumptionUnitObject.planningUnit.multiplier * this.state.tempConsumptionUnitObject.otherUnit.multiplier).toFixed(4) * 1000)
          })
        } else {
          var cell1 = elInstance.getCell(`C3`)
          var cell2 = elInstance.getCell(`D3`)
          cell1.classList.add('readonly');
          cell2.classList.add('readonly');
          document.getElementById("dataEnteredInTableExLabel").style.display = "none";
        }
      }
    }
  }
  /**
   * This function is used to format the table like add asterisk or info to the table headers
   * @param {*} instance This is the DOM Element where sheet is created
   * @param {*} cell This is the object of the DOM element
   */
  loaded = function (instance, cell, x, y, value) {
    jExcelLoadedFunctionOnlyHideRow(instance);
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM'];
    var elInstance = instance.worksheets[0];
    var json = elInstance.getJson(null, false);
    var arr = [];
    var count = 1;
    for (var r = 0; r < this.state.regionList.length; r++) {
      arr.push(count);
      count += 8;
    }
    for (var j = 0; j < json.length; j++) {
      var cell = elInstance.getCell(("A").concat(parseInt(j) + 1))
      if (arr.includes(j)) {
        cell.classList.add('regionBold');
      }
      cell.classList.add('readonly');
    }
    for (var j = 0; j < this.state.monthArray.length; j++) {
      var count = 2;
      var count1 = 1;
      var count2 = 6;
      var count3 = 7;
      var count4 = 8;
      var count5 = 3;
      var count6 = 4;
      var count7 = 5;
      for (var r = 0; r < this.state.regionList.length; r++) {
        var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count)))
        cell.classList.add('readonly');
        cell.classList.add('regionBold');
        var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count1)))
        cell.classList.add('readonly');
        var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count2)))
        cell.classList.add('readonly');
        var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count3)))
        cell.classList.add('readonly');
        var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count4)))
        cell.classList.add('readonly');
        if (elInstance.getValue(`${colArr[j + 1]}${parseInt(count5)}`, true) === "") {
          var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count6)))
          cell.classList.add('readonly');
          var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count7)))
          cell.classList.add('readonly');
          elInstance.setStyle((colArr[j + 1]).concat(parseInt(count5)), "background-color", "yellow");
        }
        if (this.state.isDisabled) {
          var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count5)))
          cell.classList.add('readonly');
          var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count6)))
          cell.classList.add('readonly');
          var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count7)))
          cell.classList.add('readonly');
        }
        count = count + 8;
        count1 = count1 + 8;
        count2 = count2 + 8;
        count3 = count3 + 8;
        count4 = count4 + 8;
        count5 += 8;
        count6 += 8;
        count7 += 8;
      }
    }
  }
  /**
   * Toggles the accordion state for a specific consumption unit ID.
   * @param {String} consumptionUnitId The ID of the consumption unit to toggle.
   */
  toggleAccordion(consumptionUnitId) {
    var consumptionUnitShowArr = this.state.consumptionUnitShowArr;
    if (consumptionUnitShowArr.includes(consumptionUnitId)) {
      consumptionUnitShowArr = consumptionUnitShowArr.filter(c => c != consumptionUnitId);
    } else {
      consumptionUnitShowArr.push(consumptionUnitId)
    }
    this.setState({
      consumptionUnitShowArr: consumptionUnitShowArr
    }, () => {
      this.setState({
        isTableLoaded: this.getTableDiv()
      })
    })
  }
  /**
   * Calls getDatasetList function on component mount
   */
  componentDidMount() {
    //to restrict calender max date to current Date - 36 months
    let currDate = Date.now();
    let maxDateCalender = moment(currDate).startOf('month').format("YYYY-MM-DD");
    let maxDateTmp = { year: Number(moment(maxDateCalender).startOf('month').format("YYYY")), month: Number(moment(maxDateCalender).startOf('month').format("M")) };
    // let hasRole = AuthenticationService.checkUserACLBasedOnRoleId([this.state.datasetId.toString()], "ROLE_FORECAST_VIEWER");
    let hasRole = false;
    AuthenticationService.getLoggedInUserRole().map(c => {
      if (c.roleId == 'ROLE_FORECAST_VIEWER') {
        hasRole = true;
      }
    });
    this.setState({
      onlyDownloadedProgram: !hasRole,
      maxDate: maxDateTmp
    });

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
    hideSecondComponent();
    if (localStorage.getItem('sessionType') === 'Online') {
      // ForecastingUnitService.getForecastingUnitListAll().then(response => {
      //   if (response.status == 200) {
      //     this.setState({
      //       fuResult: response.data,
      //       loading: false
      //     })
      //   }
      // }).catch(
      //   error => {
      //     if (error.message === "Network Error") {
      //       this.setState({
      //         message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
      //         loading: false
      //       });
      //     } else {
      //       switch (error.response ? error.response.status : "") {
      //         case 401:
      //           this.props.history.push(`/login/static.message.sessionExpired`)
      //           break;
      //         case 409:
      //           this.setState({
      //             message: i18n.t('static.common.accessDenied'),
      //             loading: false,
      //             color: "#BA0C2F",
      //           });
      //           break;
      //         case 403:
      //           this.props.history.push(`/accessDenied`)
      //           break;
      //         case 500:
      //         case 404:
      //         case 406:
      //           this.setState({
      //             message: error.response.data.messageCode,
      //             loading: false
      //           });
      //           break;
      //         case 412:
      //           this.setState({
      //             message: error.response.data.messageCode,
      //             loading: false
      //           });
      //           break;
      //         default:
      //           this.setState({
      //             message: 'static.unkownError',
      //             loading: false
      //           });
      //           break;
      //       }
      //     }
      //   }
      // );
    }
    // if (localStorage.getItem('sessionType') === 'Online') {
    //   PlanningUnitService.getAllPlanningUnitList().then(response => {
    //     if (response.status == 200) {
    //       this.setState({
    //         puResult: response.data,
    //         loading: false
    //       })
    //     }
    //   }).catch(
    //     error => {
    //       if (error.message === "Network Error") {
    //         this.setState({
    //           message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
    //           loading: false
    //         });
    //       } else {
    //         switch (error.response ? error.response.status : "") {
    //           case 401:
    //             this.props.history.push(`/login/static.message.sessionExpired`)
    //             break;
    //           case 409:
    //             this.setState({
    //               message: i18n.t('static.common.accessDenied'),
    //               loading: false,
    //               color: "#BA0C2F",
    //             });
    //             break;
    //           case 403:
    //             this.props.history.push(`/accessDenied`)
    //             break;
    //           case 500:
    //           case 404:
    //           case 406:
    //             this.setState({
    //               message: error.response.data.messageCode,
    //               loading: false
    //             });
    //             break;
    //           case 412:
    //             this.setState({
    //               message: error.response.data.messageCode,
    //               loading: false
    //             });
    //             break;
    //           default:
    //             this.setState({
    //               message: 'static.unkownError',
    //               loading: false
    //             });
    //             break;
    //         }
    //       }
    //     }
    //   );
    //   TracerCategoryService.getTracerCategoryListAll()
    //   .then(response => {
    //     if (response.status == 200) {
    //       this.setState({
    //         tcResult: response.data,
    //         loading: false
    //       })
    //     }
    // }).catch(
    //   error => {
    //       if (error.message === "Network Error") {
    //           this.setState({
    //               message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
    //               loading: false
    //           });
    //       } else {
    //           switch (error.response ? error.response.status : "") {
    //               case 401:
    //                   this.props.history.push(`/login/static.message.sessionExpired`)
    //                   break;
    //               case 403:
    //                   this.props.history.push(`/accessDenied`)
    //                   break;
    //               case 500:
    //               case 404:
    //               case 406:
    //                   this.setState({
    //                       message: error.response.data.messageCode,
    //                       loading: false
    //                   });
    //                   break;
    //               case 412:
    //                   this.setState({
    //                       message: error.response.data.messageCode,
    //                       loading: false
    //                   });
    //                   break;
    //               default:
    //                   this.setState({
    //                       message: 'static.unkownError',
    //                       loading: false
    //                   });
    //                   break;
    //           }
    //       }
    //   }
    // );
    // }
    // this.getDatasetList();
    this.getPrograms()
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
    csvRow.push('"' + (document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[0] + " " + (document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[1])).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (getLabelText(this.state.datasetJson.label, this.state.lang)).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    var elInstance = this.state.dataEl;
    var actualConsumption = 3;
    var reportingRateCount = 4;
    var stockOutCount = 5;
    var stockOutPercentCount = 6;
    var adjustedConsumptionCount = 7;
    var convertedToPlanningUnitCount = 8;
    csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("datasetId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('')
    csvRow.push('')
    var columns = [];
    columns.push(i18n.t('static.dashboard.Productmenu').replaceAll(' ', '%20'));
    this.state.monthArray.map(item => (
      columns.push(("\'").concat(moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE)))
    ))
    columns.push(i18n.t('static.supplyPlan.total').replaceAll(' ', '%20'));
    columns.push(i18n.t('static.dataentry.regionalPer').replaceAll(' ', '%20'));
    let headers = [];
    columns.map((item, idx) => { headers[idx] = (item).replaceAll(' ', '%20') });
    var A = [addDoubleQuoteToRowContent(headers)];
    this.state.planningUnitList.map(item => {
      var total = 0;
      var totalPU = 0;
      var datacsv = [];
      datacsv.push((item.consumptionDataType == 1 ? getLabelText(item.planningUnit.forecastingUnit.label, this.state.lang) : item.consumptionDataType == 2 ? getLabelText(item.planningUnit.label, this.state.lang) : getLabelText(item.otherUnit.label, this.state.lang)).replaceAll(' ', '%20'));
      this.state.monthArray.map((item1, count) => {
        var data = this.state.planningUnitTotalList.filter(c => c.planningUnitId == item.planningUnit.id && moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"));
        total += Number(data[0].qty);
        totalPU += Number(data[0].qtyInPU);
        datacsv.push(this.state.showInPlanningUnit ? this.roundingForPuQtyForCsv(data[0].qtyInPU) : this.roundingForPuQtyForCsv(data[0].qty))
      })
      datacsv.push(this.state.showInPlanningUnit ? this.roundingForPuQtyForCsv(totalPU) : this.roundingForPuQtyForCsv(total));
      datacsv.push("100 %");
      A.push(addDoubleQuoteToRowContent(datacsv))
      this.state.regionList.map(r => {
        var datacsv = [];
        var totalRegion = 0;
        var totalRegionPU = 0;
        datacsv.push((getLabelText(r.label, this.state.lang)).replaceAll(' ', '%20'))
        {
          this.state.monthArray.map((item1, count) => {
            var data = this.state.planningUnitTotalListRegion.filter(c => c.planningUnitId == item.planningUnit.id && moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM") && c.region.regionId == r.regionId)
            totalRegion += Number(data[0].qty);
            totalRegionPU += Number(data[0].qtyInPU);
            datacsv.push(this.state.showInPlanningUnit ? this.roundingForPuQtyForCsv(data[0].qtyInPU) : this.roundingForPuQtyForCsv(data[0].qty))
          })
        }
        A.push(addDoubleQuoteToRowContent(datacsv))
      });
    });
    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","))
    }
    if (this.state.selectedConsumptionUnitId > 0) {
      csvRow.push('')
      csvRow.push('')
      if (this.state.selectedConsumptionUnitId > 0) {
        csvRow.push('"' + (i18n.t('static.dashboard.planningunitheader') + ' : ' + getLabelText(this.state.selectedConsumptionUnitObject.planningUnit.label, this.state.lang)).replaceAll(' ', '%20') + '"')
      }
      csvRow.push('')
      headers = [];
      var columns = [];
      columns.push(i18n.t('static.inventoryDate.inventoryReport').replaceAll(' ', '%20'))
      this.state.monthArray.map(item => (
        columns.push(("\'").concat(moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE)))
      ))
      columns.push('')
      columns.map((item, idx) => { headers[idx] = (item).replaceAll(' ', '%20') });
      var C = []
      C.push([addDoubleQuoteToRowContent(headers)]);
      var B = [];
      var monthArray = this.state.monthArray;
      var regionList = this.state.regionList;
      var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
      B.push(i18n.t('static.program.noOfDaysInMonth').replaceAll('#', '%23').replaceAll(' ', '%20'))
      for (var j = 0; j < monthArray.length; j++) {
        B.push(monthArray[j].noOfDays)
      }
      C.push(addDoubleQuoteToRowContent(B));
      for (var r = 0; r < regionList.length; r++) {
        B = [];
        B.push((getLabelText(regionList[r].label)).replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push("")
        }
        C.push(addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.supplyPlan.actualConsumption').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push(elInstance.getValue(`${colArr[j + 1]}${parseInt(actualConsumption)}`, true).toString().replaceAll("\,", ""))
        }
        C.push(addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.reportingRate').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push(elInstance.getValue(`${colArr[j + 1]}${parseInt(reportingRateCount)}`, true).toString().replaceAll("\,", ""))
        }
        C.push(addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.stockedOut').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push(elInstance.getValue(`${colArr[j + 1]}${parseInt(stockOutCount)}`, true).toString().replaceAll("\,", ""))
        }
        C.push(addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.stockedOutPer').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push(elInstance.getValue(`${colArr[j + 1]}${parseInt(stockOutPercentCount)}`, true).toString().replaceAll("\,", ""))
        }
        C.push(addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.adjustedConsumption').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push((elInstance.getValue(`${colArr[j + 1]}${parseInt(adjustedConsumptionCount)}`, true).toString().replaceAll("\,", "")))
        }
        C.push(addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.convertedToPlanningUnit').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push(elInstance.getValue(`${colArr[j + 1]}${parseInt(convertedToPlanningUnitCount)}`, true).toString().replaceAll("\,", ""))
        }
        C.push(addDoubleQuoteToRowContent(B));
        B = [];
        actualConsumption += 8;
        reportingRateCount += 8;
        stockOutCount += 8;
        stockOutPercentCount += 8;
        adjustedConsumptionCount += 8;
        convertedToPlanningUnitCount += 8;
      }
      for (var i = 0; i < C.length; i++) {
        csvRow.push(C[i].join(","))
      }
    }
    var planningUnitList = this.state.planningUnitList.filter(c => c.planningUnit.id != this.state.selectedConsumptionUnitId);
    for (var pul = 0; pul < planningUnitList.length; pul++) {
      var consumptionList = this.state.consumptionList.filter(c => c.planningUnit.id == planningUnitList[pul].planningUnit.id);
      csvRow.push('')
      csvRow.push('')
      csvRow.push('"' + (i18n.t('static.dashboard.planningunitheader') + ' : ' + getLabelText(planningUnitList[pul].planningUnit.label, this.state.lang)).replaceAll(' ', '%20') + '"')
      csvRow.push('')
      headers = [];
      var columns = [];
      columns.push(i18n.t('static.inventoryDate.inventoryReport').replaceAll(' ', '%20'))
      this.state.monthArray.map(item => (
        columns.push(("\'").concat(moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE)))
      ))
      columns.push('')
      columns.map((item, idx) => { headers[idx] = (item).replaceAll(' ', '%20') });
      var C = []
      C.push([addDoubleQuoteToRowContent(headers)]);
      var B = [];
      var monthArray = this.state.monthArray;
      var regionList = this.state.regionList;
      var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
      B.push(i18n.t('static.program.noOfDaysInMonth').replaceAll('#', '%23').replaceAll(' ', '%20'))
      for (var j = 0; j < monthArray.length; j++) {
        B.push(monthArray[j].noOfDays)
      }
      C.push(addDoubleQuoteToRowContent(B));
      for (var r = 0; r < regionList.length; r++) {
        B = [];
        B.push((getLabelText(regionList[r].label)).replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push("")
        }
        C.push(addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.supplyPlan.actualConsumption').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
          B.push(consumptionData.length > 0 ? consumptionData[0].amount.toString().replaceAll("\,", "") : "")
        }
        C.push(addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.reportingRate').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
          B.push(consumptionData.length > 0 && consumptionData[0].reportingRate > 0 ? consumptionData[0].reportingRate.toString().replaceAll("\,", "") : 100);
        }
        C.push(addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.stockedOut').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
          B.push(consumptionData.length > 0 && consumptionData[0].daysOfStockOut > 0 ? consumptionData[0].daysOfStockOut.toString().replaceAll("\,", "") : 0)
        }
        C.push(addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.stockedOutPer').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
          var percentage = consumptionData.length > 0 && consumptionData[0].daysOfStockOut > 0 ? Math.round((consumptionData[0].daysOfStockOut / monthArray[j].noOfDays) * 100) : 0;
          B.push(percentage.toString().replaceAll("\,", ""))
        }
        C.push(addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.adjustedConsumption').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
          B.push(consumptionData.length > 0 ? consumptionData[0].adjustedAmount != undefined ? consumptionData[0].adjustedAmount.toString().replaceAll("\,", "") : consumptionData[0].amount.toString().replaceAll("\,", "") : "")
        }
        C.push(addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.convertedToPlanningUnit').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
          B.push(consumptionData.length > 0 ? consumptionData[0].puAmount != undefined ? consumptionData[0].puAmount.toString().replaceAll("\,", "") : consumptionData[0].amount : "")
        }
        C.push(addDoubleQuoteToRowContent(B));
        B = [];
      }
      for (var i = 0; i < C.length; i++) {
        csvRow.push(C[i].join(","))
      }
    }
    var csvString = csvRow.join("%0A")
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.dashboard.dataEntryAndAdjustment') + ".csv"
    a.download = document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[0] + "-" + document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[1] + "-" + i18n.t('static.dashboard.dataEntryAndAdjustment') + ".csv"
    document.body.appendChild(a)
    a.click()
  }
  /**
    * Handles the change event of the diplaying only downloaded programs.
    * @param {Object} event - The event object containing the checkbox state.
    */
  changeOnlyDownloadedProgram(event) {
    var flag = event.target.checked ? 1 : 0
    if (flag) {
      this.setState({
        datasetId: this.state.versionId.toString().includes('Local') ? this.state.datasetId : "",
        showSmallTable: this.state.versionId.toString().includes('Local') ? true : false,
        onlyDownloadedProgram: true,
        loading: false
      }, () => {
        this.getPrograms();
      })
    } else {
      this.setState({
        onlyDownloadedProgram: false,
        loading: false
      }, () => {
        this.getPrograms();
      })
    }
  }
  /**
    * Retrieves list of all programs
  */
  getPrograms() {
    this.setState({ loading: true })
    if (localStorage.getItem('sessionType') === 'Online') {
      let realmId = AuthenticationService.getRealmId();
      DropdownService.getFCProgramBasedOnRealmId(realmId)
        .then(response => {
          var proList = [];
          if (response.status == 200) {
            for (var i = 0; i < response.data.length; i++) {
              var programJson = {
                id: response.data[i].id,
                label: response.data[i].label,
                name: response.data[i].code
              }
              proList[i] = programJson
            }
            this.setState({
              datasetList: proList,
              loading: false,
              allProgramList: proList
            }, () => {
              this.consolidatedProgramList();
            })
          } else {
            this.setState({
              message: response.data.messageCode, loading: false
            }, () => {
              this.hideSecondComponent();
            })
          }
        }).catch(
          error => {
            this.consolidatedProgramList();
          }
        );
    } else {
      this.setState({ loading: false })
      this.consolidatedProgramList()
    }
  }
  /**
   * Consolidates server and local version of all programs
   */
  consolidatedProgramList = () => {
    this.setState({ loading: true })
    const lan = 'en';
    const { datasetList } = this.state
    var proList;
    if (this.state.onlyDownloadedProgram) {
      proList = [];
    } else {
      proList = datasetList;
    }
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['datasetData'], 'readwrite');
      var program = transaction.objectStore('datasetData');
      var getRequest = program.getAll();
      getRequest.onerror = function (event) {
      };
      getRequest.onsuccess = function (event) {
        var myResult = [];

        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        let downloadedProgramData = [];
        for (var i = 0; i < myResult.length; i++) {
          if (myResult[i].userId == userId) {
            var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
            var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
            var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
            var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
            programData.code = programData.programCode;
            programData.id = programData.programId;
            var planningUnitList = programData.planningUnitList.filter(c => c.consuptionForecast && c.active == true);
            var regionList = programData.regionList;
            planningUnitList.sort((a, b) => {
              var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase();
              var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase();
              return itemLabelA > itemLabelB ? 1 : -1;
            });
            regionList.sort((a, b) => {
              var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
              var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
              return itemLabelA > itemLabelB ? 1 : -1;
            });
            var forecastProgramJson = {
              name: programData.programCode,
              id: myResult[i].id.split("_")[0],
              regionList: regionList,
              planningUnitList: planningUnitList,
              dataset: programData
            }
            var f = 0
            for (var k = 0; k < this.state.datasetList.length; k++) {
              if (this.state.datasetList[k].id == programData.programId) {
                f = 1;
              }
            }
            if (this.state.onlyDownloadedProgram) {
              proList.push(forecastProgramJson)
            } else {
              if (f == 0) {
                proList.push(forecastProgramJson)
              } else if (f == 1) {
                proList[proList.findIndex(m => m.id === programData.programId)] = forecastProgramJson;
              }
            }
            downloadedProgramData.push(forecastProgramJson);
          }
        }
        var lang = this.state.lang;
        if (proList.length == 1) {
          this.setState({
            datasetList: proList.sort(function (a, b) {
              a = (a.name).toLowerCase();
              b = (b.name).toLowerCase();
              return a < b ? -1 : a > b ? 1 : 0;
            }),
            loading: false,
            downloadedProgramData: downloadedProgramData,
            downloadedProgramList: downloadedProgramData.sort(function (a, b) {
              a = (a.name).toLowerCase();
              b = (b.name).toLowerCase();
              return a < b ? -1 : a > b ? 1 : 0;
            })
          }, () => {
            this.filterVersion();
          })
        } else {
          this.setState({
            datasetList: proList.sort(function (a, b) {
              a = (a.name).toLowerCase();
              b = (b.name).toLowerCase();
              return a < b ? -1 : a > b ? 1 : 0;
            }),
            downloadedProgramData: downloadedProgramData,
            downloadedProgramList: downloadedProgramData.sort(function (a, b) {
              a = (a.name).toLowerCase();
              b = (b.name).toLowerCase();
              return a < b ? -1 : a > b ? 1 : 0;
            }),
            loading: false
          }, () => {
            this.filterVersion();
          })
        }

      }.bind(this);
    }.bind(this);
  }
  /**
     * Sets selected version
     * @param {*} event - Version change event
     */
  setVersionId(event) {
    var versionId = ((event == null || event == '' || event == undefined) ? ((this.state.versionId).toString().split('(')[0]) : (event.target.value.split('(')[0]).trim());
    versionId = parseInt(versionId);
    if (versionId != '' || versionId != undefined) {
      this.setState({
        planningUnitList: [],
        planningUnitId: "",
        regionList: [],
        regionId: "",
        showData: false,
        dataEl: "",
        versionId: ((event == null || event == '' || event == undefined) ? (this.state.versionId) : (event.target.value).trim()),
      }, () => {
        this.getDatasetData();
      })
    } else {
      localStorage.setItem("sesVersionId", event.target.value);
      this.setState({
        planningUnitList: [],
        planningUnitId: "",
        regionList: [],
        regionId: "",
        showData: false,
        dataEl: "",
        versionId: event.target.value
      }, () => {
        this.getDatasetData();
      })
    }
  }
  /**
   * Retrieves list of all available version for selected forecast program
   */
  getVersionIds() {
    let programId = this.state.datasetId;
    let datasetId = this.state.datasetId;
    if (programId != 0) {
      const program = this.state.datasetList.filter(c => c.id == datasetId)
      if (program.length == 1) {
        if (localStorage.getItem("sessionType") === 'Online') {
          DropdownService.getVersionListForFCProgram(programId)
            .then(response => {
              this.setState({
                versions: []
              }, () => {
                this.setState({
                  versions: response.data
                }, () => { this.consolidatedVersionList(programId) });
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
        } else {
          this.setState({
            versions: [],
          }, () => {
            this.consolidatedVersionList(programId)
          })
        }
      } else {
        this.setState({
          versions: [],
        }, () => { })
      }
    } else {
      this.setState({
        versions: [],
        planningUnitList: [],
        regionList: []
      }, () => { })
    }
  }
  /**
   * Retrieves version list of the selected program
   */
  filterVersion() {
    this.setState({ loading: true })
    let programId = this.state.datasetId;
    if (programId != 0) {
      const program = this.state.datasetList.filter(c => c.id == programId)
      if (program.length == 1) {
        if (localStorage.getItem('sessionType') === 'Online') {
          DropdownService.getVersionListForFCProgram(programId)
            .then(response => {
              this.setState({
                versions: []
              }, () => {
                this.setState({
                  versions: response.data
                }, () => { this.consolidatedVersionList(programId) });
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
        } else {
          this.setState({
            versions: [],
            loading: false
          }, () => {
            this.consolidatedVersionList(programId)
          })
        }
      } else {
        this.setState({
          versions: [],
          loading: false
        }, () => { })
      }
    } else {
      this.setState({
        versions: [],
        loading: false
      }, () => {
        if (document.getElementById("tableDiv")) {
          this.el = jexcel(document.getElementById("tableDiv"), '');
          jexcel.destroy(document.getElementById("tableDiv"), true);
        }
      })
    }
  }
  /**
   * Gets consolidated list of all versions for a forecast program
   * @param {*} programId - Forecast Program Id
   */
  consolidatedVersionList = (programId) => {
    const { versions } = this.state
    var verList;
    if (this.state.onlyDownloadedProgram) {
      verList = [];
    } else {
      verList = versions;
    }
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['datasetData'], 'readwrite');
      var program = transaction.objectStore('datasetData');
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
            var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
            var programData = databytes.toString(CryptoJS.enc.Utf8)
            var version = JSON.parse(programData).currentVersion
            version.versionId = `${version.versionId} (Local)`
            verList.push(version)
          }
        }
        let versionList = verList.filter(function (x, i, a) {
          return a.indexOf(x) === i;
        })
        versionList.reverse();
        if (this.props.match.params.versionId != "" && this.props.match.params.versionId != undefined) {
          this.setState({
            versions: versionList,
            versionId: this.props.match.params.versionId + " (Local)",
          }, () => {
            this.getDatasetData();
          })
        } else if (localStorage.getItem("sesVersionId") != '' && localStorage.getItem("sesVersionId") != undefined) {
          let versionVar = versionList.filter(c => c.versionId == localStorage.getItem("sesVersionId"));
          this.setState({
            versions: versionList,
            versionId: (versionVar != '' && versionVar != undefined ? localStorage.getItem("sesVersionId") : versionList[0].versionId),
          }, () => {
            this.getDatasetData();
          })
        } else {
          this.setState({
            versions: versionList,
            versionId: (versionList.length > 0 ? versionList[0].versionId : ''),
          }, () => {
            this.getDatasetData();
          })
        }
      }.bind(this);
    }.bind(this)
  }
  /**
   * Reterives forecast program list from indexed db that user has loaded
   */
  getDatasetList() {
    this.setState({
      loading: true
    })
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var datasetTransaction = db1.transaction(['datasetData'], 'readwrite');
      var datasetOs = datasetTransaction.objectStore('datasetData');
      var getRequest = datasetOs.getAll();
      getRequest.onerror = function (event) {
      }.bind(this);
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var datasetList = [];
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        for (var mr = 0; mr < myResult.length; mr++) {
          if (myResult[mr].userId == userId) {
            var json = {
              id: myResult[mr].id,
              name: myResult[mr].programCode + "~v" + myResult[mr].version,
              dataset: myResult[mr]
            }
            datasetList.push(json)
          }
        }
        var datasetId = "";
        var event = {
          target: {
            value: ""
          }
        };
        if (datasetList.length == 1) {
          datasetId = datasetList[0].id;
          event.target.value = datasetList[0].id;
        } else if (localStorage.getItem("sesDatasetId") != "" && datasetList.filter(c => c.id == localStorage.getItem("sesDatasetId")).length > 0) {
          datasetId = localStorage.getItem("sesDatasetId");
          event.target.value = localStorage.getItem("sesDatasetId");
        }
        datasetList = datasetList.sort(function (a, b) {
          a = a.name.toLowerCase();
          b = b.name.toLowerCase();
          return a < b ? -1 : a > b ? 1 : 0;
        });
        this.setState({
          datasetList: datasetList,
          loading: false,
          showDetailTable: false
        }, () => {
          if (datasetId != "") {
            this.setDatasetId(event);
          }
        })
      }.bind(this)
    }.bind(this)
  }
  /**
   * Sets the dataset ID based on the value provided.
   * @param {Event} e The event object containing the target value.
   */
  setDatasetId(e) {
    var cont = false;
    if (this.state.consumptionChanged) {
      var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
      if (cf == true) {
        cont = true;
      } else {
      }
    } else {
      cont = true;
    }
    if (cont == true) {
      this.setState({
        loading: true,
        consumptionChanged: false
      })
      var datasetId = e.target.value;
      localStorage.setItem("sesDatasetId", datasetId);
      this.setState({
        datasetId: datasetId,
        versionId: '',
        dataEl: "",
        showSmallTable: false,
        showDetailTable: false,
        isTableLoaded: ""
      }, () => {
        try {
          jexcel.destroy(document.getElementById("tableDiv"), true);
        } catch (error) {
        }
        if (datasetId != "") {
          this.filterVersion();
        } else {
          this.setState({
            showSmallTable: false,
            showDetailTable: false,
            dataEl: "",
            isTableLoaded: "",
            loading: false
          })
        }
      })
    }
  }
  /**
   * Reterives consumption data for selected program
   */
  getDatasetData() {
    let programId = this.state.datasetId;
    let versionId = this.state.versionId;
    if (versionId.toString().includes('Local')) {
      var tempDatasetId = this.state.datasetId + "_v" + this.state.versionId.split(" (")[0] + "_uId_" + AuthenticationService.getLoggedInUserId();
      this.setState({
        loading: true,
        isDisabled: false
      })
      var db1;
      getDatabase();
      var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
      openRequest.onerror = function (event) {
      }.bind(this);
      openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var datasetTransaction = db1.transaction(['datasetData'], 'readwrite');
        var datasetOs = datasetTransaction.objectStore('datasetData');
        var dsRequest = datasetOs.get(tempDatasetId);
        dsRequest.onerror = function (event) {
        }.bind(this);
        dsRequest.onsuccess = function (event) {
          var tcTransaction = db1.transaction(['tracerCategory'], 'readwrite');
          var tcOs = tcTransaction.objectStore('tracerCategory');
          var tcRequest = tcOs.getAll();
          tcRequest.onerror = function (event) {
          }.bind(this);
          tcRequest.onsuccess = function (event) {
            var myResult = [];
            myResult = tcRequest.result;
            var fuTransaction = db1.transaction(['forecastingUnit'], 'readwrite');
            var fuOs = fuTransaction.objectStore('forecastingUnit');
            var fuRequest = fuOs.getAll();
            fuRequest.onerror = function (event) {
            }.bind(this);
            fuRequest.onsuccess = function (event) {
              var fuResult = [];
              fuResult = fuRequest.result;
              var puTransaction = db1.transaction(['planningUnit'], 'readwrite');
              var puOs = puTransaction.objectStore('planningUnit');
              var puRequest = puOs.getAll();
              puRequest.onerror = function (event) {
              }.bind(this);
              puRequest.onsuccess = function (event) {
                var puResult = [];
                puResult = puRequest.result;
                var datasetData = dsRequest.result;
                var datasetDataBytes = CryptoJS.AES.decrypt(datasetData.programData, SECRET_KEY);
                var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
                var datasetJson = JSON.parse(datasetData);
                var consumptionList = datasetJson.actualConsumptionList;
                var planningUnitList = datasetJson.planningUnitList.filter(c => c.consuptionForecast && c.active);
                planningUnitList.sort((a, b) => {
                  var itemLabelA = (this.state.showInPlanningUnit ? getLabelText(a.planningUnit.label, this.state.lang) : a.consumptionDataType == 1 ? getLabelText(a.planningUnit.forecastingUnit.label, this.state.lang) : a.consumptionDataType == 2 ? getLabelText(a.planningUnit.label, this.state.lang) : getLabelText(a.otherUnit.label, this.state.lang)).toUpperCase();
                  var itemLabelB = (this.state.showInPlanningUnit ? getLabelText(b.planningUnit.label, this.state.lang) : b.consumptionDataType == 1 ? getLabelText(b.planningUnit.forecastingUnit.label, this.state.lang) : b.consumptionDataType == 2 ? getLabelText(b.planningUnit.label, this.state.lang) : getLabelText(b.otherUnit.label, this.state.lang)).toUpperCase();
                  return itemLabelA > itemLabelB ? 1 : -1;
                });
                var regionList = datasetJson.regionList;
                regionList.sort((a, b) => {
                  var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                  var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                  return itemLabelA > itemLabelB ? 1 : -1;
                });
                var rangeValue = this.state.singleValue2;
                var startDate = moment(rangeValue.year + '-' + (rangeValue.month <= 9 ? "0" + rangeValue.month : rangeValue.month) + '-01').format("YYYY-MM-DD");
                var stopDate = moment(startDate).add(35, 'months').format("YYYY-MM-DD");
                if(moment(stopDate).format("YYYY-MM")>=moment(Date.now()).format("YYYY-MM")){
                  stopDate=moment(Date.now()).startOf('month').format("YYYY-MM-DD");
                }
                var daysInMonth = datasetJson.currentVersion.daysInMonth;
                var monthArray = [];
                var curDate = startDate;
                var planningUnitTotalList = [];
                var planningUnitTotalListRegion = [];
                for (var m = 0; (moment(startDate).format("YYYY-MM") == moment(stopDate).format("YYYY-MM")?(m<=0):(moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"))); m++) {
                  curDate = moment(startDate).add(m, 'months').format("YYYY-MM-DD");
                  var daysInCurrentDate = moment(curDate, "YYYY-MM").daysInMonth();
                  var noOfDays = daysInMonth > 0 ? daysInMonth > daysInCurrentDate ? daysInCurrentDate : daysInMonth : daysInCurrentDate;
                  monthArray.push({ date: curDate, noOfDays: noOfDays })
                  var totalPlanningUnit = 0;
                  var totalPlanningUnitPU = 0;
                  for (var cul = 0; cul < planningUnitList.length; cul++) {
                    var totalQty = "";
                    var totalQtyPU = "";
                    for (var r = 0; r < regionList.length; r++) {
                      var consumptionDataForMonth = consumptionList.filter(c => c.region.id == regionList[r].regionId && moment(c.month).format("YYYY-MM") == moment(curDate).format("YYYY-MM") && c.planningUnit.id == planningUnitList[cul].planningUnit.id)
                      var qty = 0;
                      var qtyInPU = 0;
                      var reportingRate = "";
                      var actualConsumption = "";
                      var daysOfStockOut = ""
                      if (consumptionDataForMonth.length > 0) {
                        var c = consumptionDataForMonth[0];
                        reportingRate = c.reportingRate > 0 ? c.reportingRate : 100;
                        actualConsumption = c.amount;
                        daysOfStockOut = c.daysOfStockOut;
                        qty = (Number(actualConsumption) / Number(reportingRate) / Number(1 - (Math.round(daysOfStockOut) / Number(noOfDays)))) * 100;
                        qty = qty.toFixed(4)
                        var multiplier = 0;
                        if (planningUnitList[cul].consumptionDataType == 1) {
                          multiplier = 1
                        } else if (planningUnitList[cul].consumptionDataType == 2) {
                          multiplier = planningUnitList[cul].planningUnit.multiplier
                        } else {
                          multiplier = planningUnitList[cul].otherUnit.multiplier
                        }
                        if (planningUnitList[cul].consumptionDataType == 1) {
                          qtyInPU = (Number(qty) / Number(planningUnitList[cul].planningUnit.multiplier)).toFixed(4)
                        } else if (planningUnitList[cul].consumptionDataType == 2) {
                          qtyInPU = (Number(qty));
                        } else if (planningUnitList[cul].consumptionDataType == 3) {
                          qtyInPU = Number((Number(qty) * Number(planningUnitList[cul].otherUnit.multiplier)) / Number(planningUnitList[cul].planningUnit.multiplier)).toFixed(4)
                        }
                      } else {
                        qty = "";
                        reportingRate = 100;
                        daysOfStockOut = 0;
                        qtyInPU = ""
                      }
                      planningUnitTotalListRegion.push({ planningUnitId: planningUnitList[cul].planningUnit.id, month: curDate, qty: qty != "" ? Number(qty).toFixed(4) : "", qtyInPU: qty !== "" ? Number(qtyInPU).toFixed(4) : "", reportingRate: reportingRate, region: regionList[r], multiplier: multiplier, actualConsumption: actualConsumption, daysOfStockOut: daysOfStockOut, noOfDays: noOfDays })
                      if (qty !== "") {
                        totalQty = Number(totalQty) + Number(qty);
                        totalQtyPU = Number(totalQtyPU) + Number(qtyInPU);
                      }
                    }
                    planningUnitTotalList.push({ planningUnitId: planningUnitList[cul].planningUnit.id, month: curDate, qty: totalQty !== "" ? Number(totalQty).toFixed(4) : "", qtyInPU: totalQtyPU !== "" ? Number(totalQtyPU).toFixed(4) : "" })
                    totalPlanningUnit += totalQty;
                    totalPlanningUnitPU += totalQtyPU;
                  }
                }
                var healthAreaList = [...new Set(datasetJson.healthAreaList.map(ele => (ele.id)))];
                var tracerCategoryListFilter = myResult.filter(c => healthAreaList.includes(c.healthArea.id));
                var tracerCategoryIds = [...new Set(tracerCategoryListFilter.map(ele => (ele.tracerCategoryId)))];
                var forecastingUnitList = fuResult.filter(c => tracerCategoryIds.includes(c.tracerCategory.id));
                var forecastingUnitIds = [...new Set(forecastingUnitList.map(ele => (ele.forecastingUnitId)))];
                var allPlanningUnitList = puResult.filter(c => forecastingUnitIds.includes(c.forecastingUnit.forecastingUnitId));
                this.setState({
                  consumptionList: consumptionList,
                  tempConsumptionList: consumptionList,
                  regionList: regionList,
                  startDate: startDate,
                  stopDate: stopDate,
                  monthArray: monthArray,
                  datasetJson: datasetJson,
                  planningUnitList: planningUnitList,
                  forecastingUnitList: forecastingUnitList,
                  showSmallTable: true,
                  loading: false,
                  planningUnitTotalList: planningUnitTotalList,
                  planningUnitTotalListRegion: planningUnitTotalListRegion,
                  allPlanningUnitList: allPlanningUnitList
                }, () => {
                  this.setState({
                    isTableLoaded: this.getTableDiv()
                  })
                  if (this.props.match.params.planningUnitId > 0) {
                    this.buildDataJexcel(this.props.match.params.planningUnitId, 0)
                  }
                  if (localStorage.getItem("sesDatasetPlanningUnitId") != "" && planningUnitList.filter(c => c.planningUnit.id == localStorage.getItem("sesDatasetPlanningUnitId")).length > 0) {
                    this.buildDataJexcel(localStorage.getItem("sesDatasetPlanningUnitId"), 0)
                  }
                })
              }.bind(this)
            }.bind(this)
          }.bind(this)
        }.bind(this)
      }.bind(this)
    } else {
      this.setState({
        loading: true,
        isDisabled: true
      })
      DatasetService.getDatasetDataWithoutTree(programId, versionId)
        .then(response => {
          if (response.status == 200) {
            var datasetJson = response.data
            var consumptionList = datasetJson.actualConsumptionList;
            var planningUnitList = datasetJson.planningUnitList.filter(c => c.consuptionForecast && c.active);
            planningUnitList.sort((a, b) => {
              var itemLabelA = (this.state.showInPlanningUnit ? getLabelText(a.planningUnit.label, this.state.lang) : a.consumptionDataType == 1 ? getLabelText(a.planningUnit.forecastingUnit.label, this.state.lang) : a.consumptionDataType == 2 ? getLabelText(a.planningUnit.label, this.state.lang) : getLabelText(a.otherUnit.label, this.state.lang)).toUpperCase();
              var itemLabelB = (this.state.showInPlanningUnit ? getLabelText(b.planningUnit.label, this.state.lang) : b.consumptionDataType == 1 ? getLabelText(b.planningUnit.forecastingUnit.label, this.state.lang) : b.consumptionDataType == 2 ? getLabelText(b.planningUnit.label, this.state.lang) : getLabelText(b.otherUnit.label, this.state.lang)).toUpperCase();
              return itemLabelA > itemLabelB ? 1 : -1;
            });
            var regionList = datasetJson.regionList;
            regionList.sort((a, b) => {
              var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
              var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
              return itemLabelA > itemLabelB ? 1 : -1;
            });
            var rangeValue = this.state.singleValue2;
            var startDate = moment(rangeValue.year + '-' + (rangeValue.month <= 9 ? "0" + rangeValue.month : rangeValue.month) + '-01').format("YYYY-MM-DD");
            var stopDate = moment(startDate).add(35, 'months').format("YYYY-MM-DD");
            if(moment(stopDate).format("YYYY-MM")>=moment(Date.now()).format("YYYY-MM")){
              stopDate=moment(Date.now()).startOf('month').format("YYYY-MM-DD");
            }
            var daysInMonth = datasetJson.currentVersion.daysInMonth;
            var monthArray = [];
            var curDate = startDate;
            var planningUnitTotalList = [];
            var planningUnitTotalListRegion = [];
            for (var m = 0; (moment(startDate).format("YYYY-MM") == moment(stopDate).format("YYYY-MM")?(m<=0):(moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"))); m++) {
              curDate = moment(startDate).add(m, 'months').format("YYYY-MM-DD");
              var daysInCurrentDate = moment(curDate, "YYYY-MM").daysInMonth();
              var noOfDays = daysInMonth > 0 ? daysInMonth > daysInCurrentDate ? daysInCurrentDate : daysInMonth : daysInCurrentDate;
              monthArray.push({ date: curDate, noOfDays: noOfDays })
              var totalPlanningUnit = 0;
              var totalPlanningUnitPU = 0;
              for (var cul = 0; cul < planningUnitList.length; cul++) {
                var totalQty = "";
                var totalQtyPU = "";
                for (var r = 0; r < regionList.length; r++) {
                  var consumptionDataForMonth = consumptionList.filter(c => c.region.id == regionList[r].regionId && moment(c.month).format("YYYY-MM") == moment(curDate).format("YYYY-MM") && c.planningUnit.id == planningUnitList[cul].planningUnit.id)
                  var qty = 0;
                  var qtyInPU = 0;
                  var reportingRate = "";
                  var actualConsumption = "";
                  var daysOfStockOut = ""
                  if (consumptionDataForMonth.length > 0) {
                    var c = consumptionDataForMonth[0];
                    reportingRate = c.reportingRate > 0 ? c.reportingRate : 100;
                    actualConsumption = c.amount;
                    daysOfStockOut = c.daysOfStockOut;
                    qty = (Number(actualConsumption) / Number(reportingRate) / Number(1 - (Math.round(daysOfStockOut) / Number(noOfDays)))) * 100;
                    qty = qty.toFixed(4)
                    var multiplier = 0;
                    if (planningUnitList[cul].consumptionDataType == 1) {
                      multiplier = 1
                    } else if (planningUnitList[cul].consumptionDataType == 2) {
                      multiplier = planningUnitList[cul].planningUnit.multiplier
                    } else {
                      multiplier = planningUnitList[cul].otherUnit.multiplier
                    }
                    if (planningUnitList[cul].consumptionDataType == 1) {
                      qtyInPU = (Number(qty) / Number(planningUnitList[cul].planningUnit.multiplier)).toFixed(4)
                    } else if (planningUnitList[cul].consumptionDataType == 2) {
                      qtyInPU = (Number(qty));
                    } else if (planningUnitList[cul].consumptionDataType == 3) {
                      qtyInPU = Number((Number(qty) * Number(planningUnitList[cul].otherUnit.multiplier)) / Number(planningUnitList[cul].planningUnit.multiplier)).toFixed(4)
                    }
                  } else {
                    qty = "";
                    reportingRate = 100;
                    daysOfStockOut = 0;
                    qtyInPU = ""
                  }
                  planningUnitTotalListRegion.push({ planningUnitId: planningUnitList[cul].planningUnit.id, month: curDate, qty: qty != "" ? Number(qty).toFixed(4) : "", qtyInPU: qty !== "" ? Number(qtyInPU).toFixed(4) : "", reportingRate: reportingRate, region: regionList[r], multiplier: multiplier, actualConsumption: actualConsumption, daysOfStockOut: daysOfStockOut, noOfDays: noOfDays })
                  if (qty !== "") {
                    totalQty = Number(totalQty) + Number(qty);
                    totalQtyPU = Number(totalQtyPU) + Number(qtyInPU);
                  }
                }
                planningUnitTotalList.push({ planningUnitId: planningUnitList[cul].planningUnit.id, month: curDate, qty: totalQty !== "" ? Number(totalQty).toFixed(4) : "", qtyInPU: totalQtyPU !== "" ? Number(totalQtyPU).toFixed(4) : "" })
                totalPlanningUnit += totalQty;
                totalPlanningUnitPU += totalQtyPU;
              }
            }
            // var healthAreaList = [...new Set(datasetJson.healthAreaList.map(ele => (ele.id)))];
            // var tracerCategoryListFilter = this.state.tcResult.filter(c => healthAreaList.includes(c.healthArea.id));
            // var tracerCategoryIds = [...new Set(tracerCategoryListFilter.map(ele => (ele.tracerCategoryId)))];
            // var forecastingUnitList = this.state.fuResult.filter(c => tracerCategoryIds.includes(c.tracerCategory.id));
            // var forecastingUnitIds = [...new Set(forecastingUnitList.map(ele => (ele.forecastingUnitId)))];
            var puList=[]
            var allPlanningUnitList = datasetJson.planningUnitList.filter(c => c.consuptionForecast.toString()=="true").map(c=>{
              puList.push({
                "planningUnitId":c.planningUnit.id,
                "label":c.planningUnit.label
              })
            });
            this.setState({
              consumptionList: consumptionList,
              tempConsumptionList: consumptionList,
              regionList: regionList,
              startDate: startDate,
              stopDate: stopDate,
              monthArray: monthArray,
              datasetJson: datasetJson,
              planningUnitList: planningUnitList,
              forecastingUnitList: [],
              showSmallTable: true,
              loading: false,
              planningUnitTotalList: planningUnitTotalList,
              planningUnitTotalListRegion: planningUnitTotalListRegion,
              allPlanningUnitList: puList
            }, () => {
              this.setState({
                isTableLoaded: this.getTableDiv()
              })
              if (this.props.match.params.planningUnitId > 0) {
                this.buildDataJexcel(this.props.match.params.planningUnitId, 0)
              }
              if (localStorage.getItem("sesDatasetPlanningUnitId") != "" && planningUnitList.filter(c => c.planningUnit.id == localStorage.getItem("sesDatasetPlanningUnitId")).length > 0) {
                this.buildDataJexcel(localStorage.getItem("sesDatasetPlanningUnitId"), 0)
              }
            })
            this.setState({
              datasetJson: datasetJson,
              loading: false
            })
          }
        });
    }
  }
  /**
   * Toggles the visibility of guidance.
   */
  toggleShowGuidance() {
    this.setState({
      showGuidance: !this.state.showGuidance
    })
  }
  /**
   * Sets the state to control the visibility of data in terms planning units.
   * @param {Object} e Event object containing the checkbox state.
   */
  setShowInPlanningUnits(e) {
    this.setState({
      showInPlanningUnit: e.target.checked
    }, () => {
      this.setState({
        isTableLoaded: this.getTableDiv()
      })
    })
  }
  /**
   * This function is triggered when this component is about to unmount
   */
  componentWillUnmount() {
    clearTimeout(this.timeout);
    window.onbeforeunload = null;
  }
  /**
   * This function is trigged when this component is updated and is being used to display the warning for leaving unsaved changes
   */
  componentDidUpdate = () => {
    if (this.state.consumptionChanged) {
      window.onbeforeunload = () => true
    } else {
      window.onbeforeunload = undefined
    }
  }
  /**
   * Exports the data check data to a PDF file.
   */
  exportPDFDataCheck() {
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
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor("#002f6c");
        doc.text(i18n.t('static.supplyPlan.runDate') + " " + moment(new Date()).format(`${DATE_FORMAT_CAP}`), doc.internal.pageSize.width - 40, 20, {
          align: 'right'
        })
        doc.text(i18n.t('static.supplyPlan.runTime') + " " + moment(new Date()).format('hh:mm A'), doc.internal.pageSize.width - 40, 30, {
          align: 'right'
        })
        doc.text(i18n.t('static.user.user') + ': ' + AuthenticationService.getLoggedInUsername(), doc.internal.pageSize.width - 40, 40, {
          align: 'right'
        })
        doc.text(document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[0] + " " + (document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[1]), doc.internal.pageSize.width - 40, 50, {
          align: 'right'
        })
        doc.text(getLabelText(this.state.datasetJson.label, this.state.lang), doc.internal.pageSize.width - 40, 60, {
          align: 'right'
        })
        doc.setFontSize(TITLE_FONT)
        doc.setTextColor("#002f6c");
        doc.text(i18n.t('static.common.dataCheck'), doc.internal.pageSize.width / 2, 80, {
          align: 'center'
        })
        if (i == 1) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.text(i18n.t('static.dashboard.programheader') + ' : ' + document.getElementById("datasetId").selectedOptions[0].text, doc.internal.pageSize.width / 20, 90, {
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
    var y = 110;
    doc.setFont('helvetica', 'bold')
    var planningText = doc.splitTextToSize(i18n.t('static.commitTree.consumptionForecast'), doc.internal.pageSize.width * 3 / 4);
    y = y + 20;
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 100;
      }
      doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
      y = y + 10;
    }
    doc.setFont('helvetica', 'normal')
    planningText = doc.splitTextToSize("a. " + i18n.t('static.commitTree.monthsMissingActualConsumptionValues'), doc.internal.pageSize.width * 3 / 4);
    y = y + 10;
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 100;
      }
      doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
      y = y + 10;
    }
    this.state.missingMonthList.map((item, i) => {
      doc.setFont('helvetica', 'bold')
      planningText = doc.splitTextToSize(getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " : ", doc.internal.pageSize.width * 3 / 4);
      y = y + 10;
      for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
          doc.addPage();
          y = 100;
        }
        doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
        y = y + 10;
      }
      doc.setFont('helvetica', 'normal')
      planningText = doc.splitTextToSize("" + item.monthsArray, doc.internal.pageSize.width * 3 / 4);
      y = y + 3;
      for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
          doc.addPage();
          y = 100;
        }
        doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
        y = y + 10;
      }
    })
    doc.setFont('helvetica', 'normal')
    planningText = doc.splitTextToSize("b. " + i18n.t('static.commitTree.puThatDoNotHaveAtleast24MonthsOfActualConsumptionValues'), doc.internal.pageSize.width * 3 / 4);
    y = y + 20;
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 100;
      }
      doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
      y = y + 10;
    }
    this.state.consumptionListlessTwelve.map((item, i) => {
      doc.setFont('helvetica', 'bold')
      planningText = doc.splitTextToSize(getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " : ", doc.internal.pageSize.width * 3 / 4);
      y = y + 10;
      for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
          doc.addPage();
          y = 100;
        }
        doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
        y = y + 10;
      }
      doc.setFont('helvetica', 'normal')
      planningText = doc.splitTextToSize("" + item.noOfMonths + " month(s)", doc.internal.pageSize.width * 3 / 4);
      y = y + 3;
      for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
          doc.addPage();
          y = 100;
        }
        doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
        y = y + 10;
      }
    })
    addHeaders(doc)
    addFooters(doc)
    doc.save(document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[0] + "-" + document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[1] + "-" + i18n.t('static.dashboard.dataEntryAndAdjustment') + "-" + i18n.t('static.common.dataCheck') + '.pdf');
  }
  /**
   * Handles the click event on the range picker box.
   * Shows the range picker component.
   * @param {object} e - The event object containing information about the click event.
   */
  handleClickMonthBox2 = (e) => {
    this.pickAMonth2.current.show()
  }
  /**
   * Handles the dismiss of the range picker component.
   * Updates the component state with the new range value and triggers a data fetch.
   * @param {object} value - The new range value selected by the user.
   */
  handleAMonthDissmis2 = (value) => {
    if (this.state.datasetId != "") {
      var cont = false;
      if (this.state.consumptionChanged) {
        var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
        if (cf == true) {
          cont = true;
        } else {
        }
      } else {
        cont = true;
      }
      if (cont == true) {
        this.setState({
          consumptionChanged: false
        }, () => {
          this.setState({ singleValue2: value, }, () => {
            localStorage.setItem("sesDataentryStartDateRange", JSON.stringify(value))
            this.getDatasetData()
          })
        })
      }
    }
  }
  /**
   * Generates a table based on the state data.
   * It dynamically renders table rows and columns with planning unit details.
   * @returns {JSX.Element} - Returns JSX element representing the table.
   */
  getTableDiv() {
    return (
      <Table className="table-bordered text-center overflowhide main-table " bordered size="sm" options={this.options}>
        <thead>
          <tr>
            <th className="BorderNoneSupplyPlan sticky-col first-col clone1"></th>
            <th className="dataentryTdWidth sticky-col first-col clone">{i18n.t('static.dashboard.Productmenu')}</th>
            {this.state.monthArray.map((item, count) => {
              return (<th>{moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE)}</th>)
            })}
            <th>{i18n.t('static.supplyPlan.total')}</th>
            <th>{i18n.t('static.dataentry.regionalPer')}</th>
          </tr>
        </thead>
        <tbody>
          {this.state.planningUnitList.map(item => {
            var total = 0;
            var totalPU = 0;
            return (<>
              <tr className="hoverTd">
                <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordion(item.planningUnit.id)}>
                  {this.state.consumptionUnitShowArr.includes(item.planningUnit.id) ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                </td>
                <td className="sticky-col first-col clone hoverTd" align="left" onClick={() => { this.buildDataJexcel(item.planningUnit.id, 0) }}>
                  {
                    this.state.showInPlanningUnit ? getLabelText(item.planningUnit.label, this.state.lang) : item.consumptionDataType == 1 ? getLabelText(item.planningUnit.forecastingUnit.label, this.state.lang) : item.consumptionDataType == 2 ? getLabelText(item.planningUnit.label, this.state.lang) : getLabelText(item.otherUnit.label, this.state.lang)
                  }</td>
                {this.state.monthArray.map((item1, count) => {
                  var data = this.state.planningUnitTotalList.filter(c => c.planningUnitId == item.planningUnit.id && moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                  total += Number(data[0].qty);
                  totalPU += Number(data[0].qtyInPU);
                  return (<td style={{ backgroundColor: (this.state.showInPlanningUnit ? data[0].qtyInPU : data[0].qty) === "" ? 'yellow' : 'transparent' }} onClick={() => { this.buildDataJexcel(item.planningUnit.id, 0) }}><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.showInPlanningUnit ? this.roundingForPuQty(data[0].qtyInPU) : this.roundingForPuQty(data[0].qty)} /></td>)
                })}
                <td><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.showInPlanningUnit ? this.state.planningUnitTotalList.filter(c => c.planningUnitId == item.planningUnit.id && c.qty !== "").length > 0 ? this.roundingForPuQty(totalPU) : "" : this.state.planningUnitTotalList.filter(c => c.planningUnitId == item.planningUnit.id && c.qty !== "").length > 0 ? this.roundingForPuQty(total) : ""} /></td>
                <td>{this.state.planningUnitTotalList.filter(c => c.planningUnitId == item.planningUnit.id && c.qty !== "").length > 0 ? 100 : ""}</td>
              </tr>
              {this.state.regionList.map(r => {
                var totalRegion = 0;
                var totalRegionPU = 0;
                return (<tr style={{ display: this.state.consumptionUnitShowArr.includes(item.planningUnit.id) ? "" : "none" }}>
                  <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                  <td className="sticky-col first-col clone text-left" style={{ textIndent: '30px' }}>{"   " + getLabelText(r.label, this.state.lang)}</td>
                  {this.state.monthArray.map((item1, count) => {
                    var data = this.state.planningUnitTotalListRegion.filter(c => c.planningUnitId == item.planningUnit.id && moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM") && c.region.regionId == r.regionId)
                    totalRegion += Number(data[0].qty);
                    totalRegionPU += Number(data[0].qtyInPU);
                    return (<td onClick={() => { this.buildDataJexcel(item.planningUnit.id, 0) }} style={{ backgroundColor: (this.state.showInPlanningUnit ? data[0].qtyInPU : data[0].qty) === "" ? 'yellow' : 'transparent' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.showInPlanningUnit ? this.roundingForPuQty(data[0].qtyInPU) : this.roundingForPuQty(data[0].qty)} /></td>)
                  })}
                  <td><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.showInPlanningUnit ? (this.state.planningUnitTotalListRegion.filter(c => c.planningUnitId == item.planningUnit.id && c.region.regionId == r.regionId && c.qty !== "").length > 0 ? this.roundingForPuQty(totalRegionPU) : "") : (this.state.planningUnitTotalListRegion.filter(c => c.planningUnitId == item.planningUnit.id && c.region.regionId == r.regionId && c.qty !== "").length > 0 ? this.roundingForPuQty(totalRegion) : "")} /></td>
                  <td>{this.state.showInPlanningUnit ? (this.state.planningUnitTotalListRegion.filter(c => c.planningUnitId == item.planningUnit.id && c.region.regionId == r.regionId && c.qty !== "").length > 0 ? (totalPU == 0 ? 100 : Math.round((totalRegionPU / totalPU) * 100)) : "") : (this.state.planningUnitTotalListRegion.filter(c => c.planningUnitId == item.planningUnit.id && c.region.regionId == r.regionId && c.qty !== "").length > 0 ? (total == 0 ? 100 : Math.round((totalRegion / total) * 100)) : "")}</td>
                </tr>)
              })}
            </>)
          }
          )}
        </tbody>
      </Table>
    )
  }
  /**
   * Renders the consumption data entry and adjustment screen.
   * @returns {JSX.Element} - Consumption data entry and adjustment screen.
   */
  render() {
    jexcel.setDictionary({
      Show: " ",
      entries: " ",
    });
    const pickerLang = {
      months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
      from: 'From', to: 'To',
    }
    const makeText = m => {
      if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
      return '?'
    }
    const { datasetList } = this.state;
    let datasets = datasetList.length > 0
      && datasetList.map((item, i) => {
        return (
          <option key={i} value={item.id}>
            {item.name}
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
    const { allPlanningUnitList } = this.state;
    let planningUnits = allPlanningUnitList.length > 0
      && allPlanningUnitList.map((item, i) => {
        return (
          <option key={i} value={item.planningUnitId}>
            {getLabelText(item.label, this.state.lang)}
          </option>
        )
      }, this);

    const { isDarkMode } = this.state;
    // const colourArray = isDarkMode ? darkModeColors : lightModeColors;
    const fontColor = isDarkMode ? '#e4e5e6' : '#212721';
    const gridLineColor = isDarkMode ? '#444' : '#e0e0e0';

    var chartOptions = {
      title: {
        display: true,
        text: this.state.selectedConsumptionUnitId > 0 ? i18n.t('static.dashboard.dataEntryAndAdjustments') + " - " + document.getElementById("datasetId").selectedOptions[0].text + " - " + getLabelText(this.state.selectedConsumptionUnitObject.planningUnit.label, this.state.lang) : "",
        fontColor: fontColor
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: this.state.selectedConsumptionUnitId > 0 ? getLabelText(this.state.selectedConsumptionUnitObject.planningUnit.label, this.state.lang) : "",
            fontColor: fontColor
          },
          stacked: true,
          ticks: {
            beginAtZero: true,
            fontColor: fontColor,
            callback: function (value) {
              return value.toLocaleString();
            }
          },
          gridLines: {
            drawBorder: true, lineWidth: 0,
            color: gridLineColor,
            zeroLineColor: gridLineColor
          },
          position: 'left',
        }],
        xAxes: [{
          ticks: {
            fontColor: fontColor,
          },
          gridLines: {
            drawBorder: true, lineWidth: 0,
            color: gridLineColor,
            zeroLineColor: gridLineColor
          },
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
          fontColor: fontColor
        }
      }
    }
    let bar = {}
    var datasetListForGraph = [];
    var lightModeColors = ["#002F6C", "#BA0C2F", "#118B70", "#EDB944", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721"]
    var darkModeColors = ["#d4bbff", "#BA0C2F", "#118B70", "#EDB944", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721"]
    const colourArray = isDarkMode ? darkModeColors : lightModeColors;
    if (this.state.showDetailTable) {
      var elInstance = this.state.dataEl;
      if (elInstance != undefined) {
        var colourCount = 0;
        datasetListForGraph.push({
          label: "Total",
          data: this.state.planningUnitTotalList.filter(c => c.planningUnitId == this.state.selectedConsumptionUnitObject.planningUnit.id).map(item => (item.qtyInPU !== "" ? this.roundingForPuQty(item.qtyInPU) : null)),
          type: 'line',
          backgroundColor: 'transparent',
          borderStyle: 'dotted',
          ticks: {
            fontSize: 2,
            fontColor: 'transparent',
          },
          pointStyle: 'line',
          pointBorderWidth: 5,
          borderColor: '#CFCDC9',
          showInLegend: true,
        })
        this.state.regionList.map((item, count) => {
          if (colourCount > 7) {
            colourCount = 0;
          }
          datasetListForGraph.push({
            label: getLabelText(item.label, this.state.lang),
            data: this.state.planningUnitTotalListRegion.filter(c => c.planningUnitId == this.state.selectedConsumptionUnitObject.planningUnit.id && c.region.regionId == item.regionId).map(item => (item.qtyInPU > 0 ? this.roundingForPuQty(item.qtyInPU) : null)),
            stack: 1,
            backgroundColor: colourArray[colourCount],
            borderStyle: 'dotted',
            ticks: {
              fontSize: 2,
              fontColor: 'transparent',
            },
            showInLegend: true,
          })
          colourCount++;
        })
      }
    }
    if (this.state.showDetailTable) {
      bar = {
        labels: this.state.monthArray.map((item, index) => (moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE))),
        datasets: datasetListForGraph
      };
    }
    const { missingMonthList } = this.state;
    let missingMonths = missingMonthList.length > 0 && missingMonthList.map((item, i) => {
      return (
        <li key={i}>
          <div><span><b>{getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " :"}</b>{"" + item.monthsArray}</span></div>
        </li>
      )
    }, this);
    const { consumptionListlessTwelve } = this.state;
    let consumption = consumptionListlessTwelve.length > 0 && consumptionListlessTwelve.map((item, i) => {
      return (
        <li key={i}>
          <div><span><b>{getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " : "}</b></span><span>{item.noOfMonths + " month(s)"}</span></div>
        </li>
      )
    }, this);
    return (
      <div className="animated fadeIn">
        <Prompt
          when={this.state.consumptionChanged == 1}
          message={i18n.t("static.dataentry.confirmmsg")}
        />
        <AuthenticationServiceComponent history={this.props.history} />
        <h5 className={this.state.messageColor} id="div1">{this.state.message}</h5>
        <h5 className={this.props.match.params.color} id="div2">{i18n.t(this.props.match.params.message, { entityname })}</h5>
        <Card>
          <div className="card-header-actions">
            <div className="Card-header-reporticon">
              {localStorage.getItem('sessionType') === 'Online' && <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>}
              <span className="compareAndSelect-rarrow"> <i className="cui-arrow-right icons " > </i></span>
              {localStorage.getItem('sessionType') === 'Online' && <span className="compareAndSelect-larrowText"> {i18n.t('static.common.backTo')} <a href="/#/importFromQATSupplyPlan/listImportFromQATSupplyPlan" className="supplyplanformulas">{i18n.t('static.importFromQATSupplyPlan.importFromQATSupplyPlan')}</a></span>}
              <span className="compareAndSelect-rarrowText"> {i18n.t('static.common.continueTo')} <a href="/#/extrapolation/extrapolateData" className="supplyplanformulas">{i18n.t('static.dashboard.extrapolation')}</a></span><br />
            </div>
          </div>
          <div className="Card-header-addicon pb-0">
            <div className="card-header-actions">
              <a className="card-header-action">
                <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
              </a>
              {this.state.datasetId !== "" && <img style={{ height: '23px', width: '23px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />}
            </div>
          </div>
          <Formik
            enableReinitialize={true}
            initialValues={{ consumptionNotes: this.state.consumptionNotesForValidation }}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting, setErrors }) => { this.saveConsumptionList() }}
            render={
              ({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
                isValid,
                setTouched,
                handleReset,
                setFieldValue,
                setFieldTouched,
                setFieldError
              }) => (
                <Form className="col-md-12" onSubmit={handleSubmit} noValidate name="dataEnteredInTable" autocomplete="off">
                  <CardBody className="pb-lg-0 pt-lg-0">
                    <div>
                      <Form >
                        <div className="pl-0">
                          <div className="row">
                            <FormGroup className="col-md-3">
                              <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.programheader')}</Label>
                              <div className="controls ">
                                <InputGroup>
                                  <Input
                                    type="select"
                                    name="datasetId"
                                    id="datasetId"
                                    bsSize="sm"
                                    onChange={(e) => { this.setDatasetId(e); }}
                                    value={this.state.datasetId}
                                  >
                                    <option value="">{i18n.t('static.common.select')}</option>
                                    {datasets}
                                  </Input>
                                </InputGroup>
                              </div>
                            </FormGroup>
                            <FormGroup className="col-md-3">
                              <Label htmlFor="appendedInputButton">{i18n.t('static.report.versionFinal*')}</Label>
                              <div className="controls ">
                                <Input
                                  type="select"
                                  name="versionId"
                                  id="versionId"
                                  bsSize="sm"
                                  onChange={(e) => { this.setVersionId(e); }}
                                  value={this.state.versionId}
                                >
                                  <option value="-1">{i18n.t('static.common.select')}</option>
                                  {versionList}
                                </Input>
                              </div>
                            </FormGroup>
                            <FormGroup className="col-md-3">
                              <Label htmlFor="appendedInputButton">{i18n.t('static.supplyPlan.startMonth')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                              <div className="controls edit">
                                <Picker
                                  ref={this.pickAMonth2}
                                  years={{ min: this.state.minDate, max: this.state.maxDate }}
                                  value={this.state.singleValue2}
                                  // key={JSON.stringify(this.state.singleValue2)}
                                  key={JSON.stringify(this.state.maxDate) + "-" + JSON.stringify(this.state.singleValue2)}
                                  lang={pickerLang}
                                  onDismiss={this.handleAMonthDissmis2}
                                >
                                  <MonthBox value={makeText(this.state.singleValue2)} onClick={this.handleClickMonthBox2} />
                                </Picker>
                              </div>
                            </FormGroup>
                          </div>
                          <div className="row">
                            {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_LOAD_DELETE_DATASET') && localStorage.getItem("sessionType") === "Online" &&
                              <FormGroup className="col-md-3 ">
                                <div className="tab-ml-1 ml-lg-3">
                                  <Input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="onlyDownloadedProgram"
                                    name="onlyDownloadedProgram"
                                    checked={this.state.onlyDownloadedProgram}
                                    onClick={(e) => { this.changeOnlyDownloadedProgram(e); }}
                                  />
                                  <Label
                                    className="form-check-label"
                                    check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                    {i18n.t('static.common.onlyDownloadedProgram')}
                                  </Label>
                                </div>
                              </FormGroup>
                            }
                            <FormGroup className="col-md-3">
                              <div className="tab-ml-1 ml-lg-3">
                                <Input className="form-check-input" type="checkbox" id="checkbox1" name="checkbox1" value={this.state.showInPlanningUnit} onChange={(e) => this.setShowInPlanningUnits(e)} />
                                <Label check className="form-check-label" htmlFor="checkbox1">{i18n.t('static.dataentry.showInPlanningUnits')}</Label>
                              </div>
                            </FormGroup>
                          </div>
                        </div>
                      </Form>
                      <div style={{ display: this.state.loading ? "none" : "block" }}>
                        {this.state.showSmallTable &&
                          <div className="row">
                            <div className="col-md-12 mt-2">
                              <div className="table-scroll">
                                <div className="table-wrap DataEntryTable table-responsive fixTableHeadSupplyPlan">
                                  {this.state.isTableLoaded}
                                </div>
                              </div>
                              <br></br>
                              <br></br>
                              <div className="row">
                                {this.state.showDetailTable &&
                                  <>
                                    <FormGroup className="col-md-4">
                                      <Label htmlFor="appendedInputButton">{i18n.t('static.common.for')} {i18n.t('static.dashboard.planningunitheader')}: <b>{getLabelText(this.state.selectedConsumptionUnitObject.planningUnit.label, this.state.lang)}</b>
                                      </Label><br />
                                      <Label htmlFor="appendedInputButton">{i18n.t('static.common.dataEnteredIn')}: <b>{this.state.tempConsumptionUnitObject.consumptionDataType == 1 ? (this.state.tempConsumptionUnitObject.planningUnit.forecastingUnit.label.label_en) : this.state.tempConsumptionUnitObject.consumptionDataType == 2 ? this.state.tempConsumptionUnitObject.planningUnit.label.label_en : this.state.tempConsumptionUnitObject.otherUnit.label.label_en}</b>
                                        {!this.state.isDisabled && <a className="card-header-action">
                                          {AuthenticationService.checkUserACL([this.state.datasetId.toString()], 'ROLE_BF_CONSUMPTION_DATA_ENTRY_ADJUSTMENT') && <span style={{ cursor: 'pointer' }} className="hoverDiv" onClick={() => { this.changeUnit(this.state.selectedConsumptionUnitId) }}><u>({i18n.t('static.dataentry.change')})</u></span>}
                                        </a>}
                                      </Label><br />
                                      <Label htmlFor="appendedInputButton">{i18n.t('static.dataentry.conversionToPu')}: <b>{this.state.tempConsumptionUnitObject.consumptionDataType == 1 ? Number(1 / this.state.tempConsumptionUnitObject.planningUnit.multiplier).toFixed(4) : this.state.tempConsumptionUnitObject.consumptionDataType == 2 ? 1 : Number(1 / this.state.tempConsumptionUnitObject.planningUnit.multiplier * this.state.tempConsumptionUnitObject.otherUnit.multiplier).toFixed(4)}</b>
                                      </Label>
                                    </FormGroup>
                                  </>
                                }
                                <FormGroup className="col-md-4" style={{ display: this.state.showDetailTable ? 'block' : 'none' }}>
                                  <Label htmlFor="appendedInputButton">{i18n.t('static.dataentry.consumptionNotes')}</Label>
                                  <div className="controls ">
                                    <InputGroup>
                                      <Input
                                        type="textarea"
                                        name="consumptionNotes"
                                        id="consumptionNotes"
                                        valid={!errors.consumptionNotes}
                                        invalid={!!errors.consumptionNotes}
                                        disabled={this.state.isDisabled}
                                        bsSize="sm"
                                        readOnly={AuthenticationService.checkUserACL([this.state.datasetId.toString()], 'ROLE_BF_CONSUMPTION_DATA_ENTRY_ADJUSTMENT') ? false : true}
                                        onChange={(e) => { handleChange(e); this.setState({ consumptionChanged: true }) }}
                                        onBlur={handleBlur}
                                      >
                                      </Input>
                                      <FormFeedback className="red">{errors.consumptionNotes}</FormFeedback>
                                    </InputGroup>
                                  </div>
                                </FormGroup>
                                <FormGroup className="col-md-4" style={{ paddingTop: '30px', display: this.state.showDetailTable ? 'block' : 'none' }}>
                                  {AuthenticationService.checkUserACL([this.state.datasetId.toString()], 'ROLE_BF_CONSUMPTION_DATA_ENTRY_ADJUSTMENT') && !this.state.isDisabled && <Button type="button" id="formSubmitButton" size="md" color="success" className="float-right mr-1" onClick={() => this.interpolationMissingActualConsumption()}>
                                    <i className="fa fa-check"></i>{i18n.t('static.pipeline.interpolateMissingValues')}</Button>}
                                </FormGroup>
                              </div>
                              <div className="row">
                                <div className="col-md-12 pl-2 pr-2 datdEntryRow consumptionDataEntryTable DataentryTable">
                                  <div id="tableDiv" className="leftAlignTable">
                                  </div>
                                </div>
                              </div>
                              <br></br>
                              <br></br>
                              {this.state.showDetailTable &&
                                <div className="col-md-12">
                                  <div className="chart-wrapper chart-graph-report">
                                    <Bar id="cool-canvas" data={bar} options={chartOptions} />
                                    <div>
                                    </div>
                                  </div>
                                  <b className="text-blackD">{i18n.t('static.dataentry.graphNotes')}</b>
                                </div>
                              }
                            </div>
                          </div>
                        }
                      </div>
                      <div style={{ display: this.state.loading ? "block" : "none" }}>
                        <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                          <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>
                            <div class="spinner-border blue ml-4" role="status">
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                  <CardFooter>
                    <FormGroup>
                      <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                      {!this.state.isDisabled && <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>}
                      {this.state.consumptionChanged && <><Button type="submit" id="formSubmitButton" size="md" color="success" className="float-right mr-1"><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>&nbsp;</>}
                      {this.state.showSmallTable && <> <Button type="button" id="dataCheck" size="md" color="info" className="float-right mr-1" onClick={() => this.openDataCheckModel()}><i className="fa fa-check"></i>{i18n.t('static.common.dataCheck')}</Button></>}
                      &nbsp;
                    </FormGroup>
                  </CardFooter>
                </Form>
              )} />
        </Card>
        <Modal isOpen={this.state.showGuidance}
          className={'modal-lg ' + this.props.className} >
          <ModalHeader toggle={() => this.toggleShowGuidance()} className="ModalHead modal-info-Headher">
            <strong className="TextWhite">{i18n.t('static.common.showGuidance')}</strong>
          </ModalHeader>
          <div>
            <ModalBody>
              <div>
                <h3 className='ShowGuidanceHeading'>{i18n.t('static.dashboard.dataEntryAndAdjustments')} </h3>
              </div>
              <p>
                <p style={{ fontSize: '13px' }}><span className="UnderLineText">{i18n.t('static.listTree.purpose')} :</span> {i18n.t('static.dataEntryAndAdjustments.EnableUser')} '<a href="/#/Extrapolation/extrapolateData" target="_blank" style={{ textDecoration: 'underline' }}>{i18n.t('static.commitTree.extrapolation')}</a>' {i18n.t('static.dataEntryAndAdjustments.HistoricalActual')} '<a href="/#/importFromQATSupplyPlan/listImportFromQATSupplyPlan" target="_blank" style={{ textDecoration: 'underline' }}>{i18n.t('static.importFromQATSupplyPlan.importFromQATSupplyPlan')}</a>' screen). </p>
              </p>
              <p>
                <p style={{ fontSize: '13px' }}><span className="UnderLineText">{i18n.t('static.listTree.useThisScreen')}:</span></p>
                <ol>
                  <li>{i18n.t('static.dataEntryAndAdjustments.DesiredReview')} {i18n.t('static.dataEntryAndAdjustments.YellowCellsIndicating')}  </li>
                  <li>{i18n.t('static.dataEntryAndAdjustments.TopTable')}
                  </li>
                  <li>{i18n.t('static.dataEntryAndAdjustments.DetailedData')}
                    <ol type="a">
                      <li>{i18n.t('static.dataEntryAndAdjustments.DataManually')}  </li>
                      <li>{i18n.t('static.dataEntryAndAdjustments.ImportedData')}  </li>
                      <li>{i18n.t('static.dataEntryAndAdjustments.DataIsAssumed')} </li>
                    </ol>
                  </li>
                  <li>{i18n.t('static.dataEntryAndAdjustments.AdjustTheData')}:
                    <ol type="a">
                      <li><b>{i18n.t('static.dataEntryAndAdjustments.UnderReporting')}</b>: {i18n.t('static.dataEntryAndAdjustments.DefaultValue')} </li>
                      <li><b>{i18n.t('static.dataEntryAndAdjustments.AdjustStockOuts')}</b>: {i18n.t('static.dataEntryAndAdjustments.NumberOfStock')} '<a href="/#/dataset/versionSettings" target="_blank" style={{ textDecoration: 'underline' }}>{i18n.t('static.UpdateversionSettings.UpdateversionSettings')}</a>'. </li>
                      <p className="pl-lg-5">
                        <span style={{ fontStyle: 'italic' }}><b>{i18n.t('static.dataEntryAndAdjustments.StockOutRate')}</b> = {i18n.t('static.dataEntryAndAdjustments.StockOutDays')}/ {i18n.t('static.dataEntryAndAdjustments.DaysInMonth')}. </span><br></br>
                        <span style={{ fontStyle: 'italic' }}><b>{i18n.t('static.dataEntryAndAdjustments.AdjustedConsumption')}</b> = {i18n.t('static.dataEntryAndAdjustments.ActualConsumption')} / {i18n.t('static.dataEntryAndAdjustments.ReportingRate')} / {i18n.t('static.dataEntryAndAdjustments.StockRate')} </span>
                      </p>
                      <p>{i18n.t('static.dataEntryAndAdjustments.GivenMonth')}: <br></br>
                        <span className="pl-lg-5" style={{ fontStyle: 'italic' }}><b> {i18n.t('static.dataEntryAndAdjustments.StockOutRate')} </b>= 5 days stocked out /31 days in a month = 16.1%. </span><br></br>
                        <span className="pl-lg-5" style={{ fontStyle: 'italic' }}><b>  {i18n.t('static.dataEntryAndAdjustments.AdjustedConsumption')} </b>= 1,000 units / 98% Reporting / (1 - 16.1%) = 1,217</span>  </p>
                      <li><b>{i18n.t('static.dataEntryAndAdjustments.Interpolating')}</b>: {i18n.t('static.dataEntryAndAdjustments.ClickInterpolate')}  {i18n.t('static.dataEntryAndAdjustments.InterpolateForMonths')}
                        <br></br>
                        {i18n.t('static.dataEntryAndAdjustments.Mathematically')}:<br></br>
                        <ul>
                          <li>{i18n.t('static.dataEntryAndAdjustments.XRepresentMonths')}</li>
                          <li>{i18n.t('static.dataEntryAndAdjustments.DataValues')} </li>
                          <li>{i18n.t('static.dataEntryAndAdjustments.UnknownData')} </li>
                          <li>{i18n.t('static.dataEntryAndAdjustments.InterpolatedLine')} </li>
                        </ul>
                        <span><img className="formula-img-mr img-fluid mb-lg-0" src={dataentryScreenshot1} style={{ border: '1px solid #fff', width: '250px' }} /></span><br></br>
                        <span><img className="formula-img-mr img-fluid mb-lg-0 mt-lg-0" src={dataentryScreenshot2} style={{ border: '1px solid #fff', width: '250px' }} /></span>
                      </li>
                      <li>
                        {i18n.t('static.dataEntryAndAdjustments.GraphBelow')}  </li>
                    </ol>
                  </li>
                  <li>{i18n.t('static.dataEntryAndAdjustments.ClickSubmit')} </li>
                  <li>{i18n.t('static.dataEntryAndAdjustments.RepeatSteps')}
                  </li>
                </ol>
              </p>
            </ModalBody>
          </div>
        </Modal>
        <Modal isOpen={this.state.toggleDataCheck}
          className={'modal-lg ' + this.props.className} >
          <ModalHeader toggle={() => this.openDataCheckModel()} className="ModalHead modal-info-Headher">
            <div>
              <img className=" pull-right iconClass cursor ml-lg-2" style={{ height: '22px', width: '22px', cursor: 'pointer', marginTop: '-4px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDFDataCheck()} />
              <strong>{i18n.t('static.common.dataCheck')}</strong>
            </div>
          </ModalHeader>
          <div>
            <ModalBody>
              <span><b>{i18n.t('static.commitTree.consumptionForecast')} : </b>(<a href="/#/dataentry/consumptionDataEntryAndAdjustment" target="_blank">{i18n.t('static.commitTree.dataEntry&Adjustment')}</a>, <a href="/#/extrapolation/extrapolateData" target="_blank">{i18n.t('static.commitTree.extrapolation')}</a>)</span><br />
              <span>a. {i18n.t('static.commitTree.monthsMissingActualConsumptionValues')} :</span><br />
              <ul>{missingMonths}</ul>
              <span>b. {i18n.t('static.commitTree.puThatDoNotHaveAtleast24MonthsOfActualConsumptionValues')} :</span><br />
              <ul>{consumption}</ul>
            </ModalBody>
          </div>
        </Modal>
        <Modal isOpen={this.state.toggleDataChangeForSmallTable}
          className={'modal-lg ' + this.props.className} >
          <ModalHeader className="modalHeaderDataEnteredIn hideCross">
            <strong>{i18n.t('static.common.dataEnteredIn')}</strong>
          </ModalHeader>
          <Formik
            enableReinitialize={true}
            onSubmit={(values, { setSubmitting, setErrors }) => {
              this.submitChangedUnit(this.state.changedConsumptionTypeId);
            }}
            render={
              ({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
                isValid,
                setTouched,
                handleReset,
                setFieldValue,
                setFieldTouched,
                setFieldError
              }) => (
                <Form onSubmit={handleSubmit} noValidate name='dataEnteredInForm'>
                  <ModalBody>
                    <div className="dataEnteredTable">
                      <div id="mapPlanningUnit">
                      </div>
                    </div>
                    <Label id="dataEnteredInTableExLabel" style={{ display: "none" }} htmlFor="appendedInputButton">{i18n.t('static.dataentry.dataEnteredInTableEx')} <NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.dataEnteredInTableExSpan} /> {i18n.t('static.common.planningUnits')}
                    </Label>
                  </ModalBody>
                  <ModalFooter>
                    <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1"> <i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ toggleDataChangeForSmallTable: false })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                  </ModalFooter>
                </Form>
              )
            }
          />
        </Modal>
      </div >
    );
  }
  /**
   * Toggles the state to open/close the data check modal.
   * Calculates data if the modal is opened.
   */
  openDataCheckModel() {
    this.setState({
      toggleDataCheck: !this.state.toggleDataCheck
    }, () => {
      if (this.state.toggleDataCheck) {
        this.calculateData();
      }
    })
  }
  /**
   * Calculates missing months and planning units with less than 24 months of consumption data.
   */
  calculateData() {
    this.setState({ loading: true })
    var datasetJson = this.state.datasetJson;
    var startDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
    var stopDate = moment(Date.now()).format("YYYY-MM-DD");
    var consumptionList = datasetJson.actualConsumptionList;
    var datasetPlanningUnit = datasetJson.planningUnitList.filter(c => c.consuptionForecast && c.active);
    var datasetRegionList = datasetJson.regionList;
    var missingMonthList = [];
    var consumptionListlessTwelve = [];
    for (var dpu = 0; dpu < datasetPlanningUnit.length; dpu++) {
      for (var drl = 0; drl < datasetRegionList.length; drl++) {
        var curDate = startDate;
        var monthsArray = [];
        var puId = datasetPlanningUnit[dpu].planningUnit.id;
        var regionId = datasetRegionList[drl].regionId;
        var consumptionListFiltered = consumptionList.filter(c => c.planningUnit.id == puId && c.region.id == regionId);
        if (consumptionListFiltered.length < 24) {
          consumptionListlessTwelve.push({
            planningUnitId: datasetPlanningUnit[dpu].planningUnit.id,
            planningUnitLabel: datasetPlanningUnit[dpu].planningUnit.label,
            regionId: datasetRegionList[drl].regionId,
            regionLabel: datasetRegionList[drl].label,
            noOfMonths: consumptionListFiltered.length
          })
        }
        var consumptionListFilteredForMonth = consumptionList.filter(c => c.planningUnit.id == puId && c.region.id == regionId);
        let actualMin = moment.min(consumptionListFilteredForMonth.map(d => moment(d.month)));
        curDate = moment(actualMin).format("YYYY-MM");
        for (var i = 0; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); i++) {
          curDate = moment(actualMin).add(i, 'months').format("YYYY-MM-DD");
          var consumptionListForCurrentMonth = consumptionListFilteredForMonth.filter(c => moment(c.month).format("YYYY-MM") == moment(curDate).format("YYYY-MM"));
          var checkIfPrevMonthConsumptionAva = consumptionListFilteredForMonth.filter(c => moment(c.month).format("YYYY-MM") < moment(curDate).format("YYYY-MM"));
          var checkIfNextMonthConsumptionAva = consumptionListFilteredForMonth.filter(c => moment(c.month).format("YYYY-MM") > moment(curDate).format("YYYY-MM"));
          if (consumptionListForCurrentMonth.length == 0 && checkIfPrevMonthConsumptionAva.length > 0 && checkIfNextMonthConsumptionAva.length > 0) {
            monthsArray.push(" " + moment(curDate).format(DATE_FORMAT_CAP_WITHOUT_DATE));
          }
        }
        if (monthsArray.length > 0) {
          missingMonthList.push({
            planningUnitId: datasetPlanningUnit[dpu].planningUnit.id,
            planningUnitLabel: datasetPlanningUnit[dpu].planningUnit.label,
            regionId: datasetRegionList[drl].regionId,
            regionLabel: datasetRegionList[drl].label,
            monthsArray: monthsArray
          })
        }
      }
    }
    this.setState({
      missingMonthList: missingMonthList,
      consumptionListlessTwelve: consumptionListlessTwelve,
      loading: false
    })
  }
  /**
   * Submits the changed consumption unit and updates the data accordingly.
   * @param {*} consumptionUnitId The ID of the consumption unit.
   */
  submitChangedUnit(consumptionUnitId) {
    var elInstance = this.state.dataEl;
    var elInstance1 = this.state.jexcelDataEl;
    var consumptionUnitTemp = {};
    consumptionUnitTemp = this.state.selectedConsumptionUnitObject;
    var multiplier = 1;
    if (this.state.dataEnteredIn == 1) {
      multiplier = consumptionUnitTemp.planningUnit.multiplier;
    } else if (this.state.dataEnteredIn == 2) {
      multiplier = 1;
    } else {
      var conversionToFuOtherUnit = elInstance1.getValue(`D3`, true);
      var descOtherUnit = elInstance1.getValue(`C3`, true);
      multiplier = (1 / Number(conversionToFuOtherUnit.toString().replaceAll(",", ""))) * consumptionUnitTemp.planningUnit.multiplier;
    }
    var consumptionUnitForUpdate = {};
    consumptionUnitForUpdate = {
      consumptionDataType: this.state.dataEnteredIn,
      planningUnit: consumptionUnitTemp.planningUnit,
      otherUnit: this.state.dataEnteredIn == 3 ? {
        label: {
          labelId: null,
          label_en: descOtherUnit,
          label_fr: "",
          label_sp: "",
          label_pr: ""
        },
        multiplier: Number(conversionToFuOtherUnit.toString().replaceAll(",", ""))
      } : null
    }
    this.setState({
      tempConsumptionUnitObject: consumptionUnitForUpdate,
      consumptionChanged: true,
      toggleDataChangeForSmallTable: false,
    }, () => {
      elInstance.setValueFromCoords(37, 0, multiplier, true);
    })
  }
  /**
   * Toggles the data change for the small table and updates the state accordingly.
   * @param {*} consumptionUnitId The ID of the consumption unit.
   */
  changeUnit(consumptionUnitId) {
    this.setState({
      toggleDataChangeForSmallTable: !this.state.toggleDataChangeForSmallTable,
    }, () => {
      if (this.state.toggleDataChangeForSmallTable) {
        this.setState({
          dataEnteredIn: this.state.tempConsumptionUnitObject.consumptionDataType,
          showOtherUnitNameField: this.state.tempConsumptionUnitObject.consumptionDataType == 3 ? true : false,
          otherUnitName: this.state.tempConsumptionUnitObject.consumptionDataType == 3 ? this.state.tempConsumptionUnitObject.otherUnit.label.label_en : "",
          selectedPlanningUnitMultiplier: this.state.tempConsumptionUnitObject.consumptionDataType == 1 ? 1 : this.state.tempConsumptionUnitObject.consumptionDataType == 2 ? this.state.tempConsumptionUnitObject.planningUnit.multiplier : this.state.tempConsumptionUnitObject.otherUnit.multiplier
        }, () => {
          this.buildJexcel();
        })
      }
    })
  }
  /**
   * Resets the consumption data when reset button is clicked.
   */
  resetClicked() {
    if (this.state.datasetId != "") {
      this.buildDataJexcel(this.state.selectedConsumptionUnitId, 0)
    }
  }
  /**
   * Function to handle changes in jexcel cells.
   * @param {Object} instance - The jexcel instance.
   * @param {Object} cell - The cell object that changed.
   * @param {number} x - The x-coordinate of the changed cell.
   * @param {number} y - The y-coordinate of the changed cell.
   * @param {any} value - The new value of the changed cell.
   */
  changed = function (instance, cell, x, y, value) {
    var elInstance = instance;
    var rowData = elInstance.getRowData(y);
    var consumptionDataType = rowData[5];
    var cell1 = elInstance.getCell(`C1`)
    var cell2 = elInstance.getCell(`C2`)
    cell1.classList.add('readonly');
    cell2.classList.add('readonly');
    var cell1 = elInstance.getCell(`D1`)
    var cell2 = elInstance.getCell(`D2`)
    cell1.classList.add('readonly');
    cell2.classList.add('readonly');
    if (consumptionDataType == 3) {
      var cell1 = elInstance.getCell(`C3`)
      var cell2 = elInstance.getCell(`D3`)
      cell1.classList.remove('readonly');
      cell2.classList.remove('readonly');
      document.getElementById("dataEnteredInTableExLabel").style.display = "block";
      this.setState({
        dataEnteredInTableExSpan: Math.round(1 / this.state.selectedConsumptionUnitObject.planningUnit.multiplier * Number(rowData[3].toString().replaceAll(',', '')) * 1000),
        dataEnteredInFU: true,
        dataEnteredInPU: false,
        dataEnteredInOU: true
      })
    } else {
      if (consumptionDataType == 1) {
        this.setState({
          dataEnteredInFU: true,
          dataEnteredInPU: false,
          dataEnteredInOU: false
        })
      } else if (consumptionDataType == 2) {
        this.setState({
          dataEnteredInFU: false,
          dataEnteredInPU: true,
          dataEnteredInOU: false
        })
      }
      var cell1 = elInstance.getCell(`C3`)
      var cell2 = elInstance.getCell(`D3`)
      cell1.classList.add('readonly');
      cell2.classList.add('readonly');
      document.getElementById("dataEnteredInTableExLabel").style.display = "none";
    }
    this.setState({
      dataEnteredIn: consumptionDataType,
      selectedPlanningUnitMultiplier: consumptionDataType == 1 ? 1 : consumptionDataType == 2 ? this.state.tempConsumptionUnitObject.planningUnit.multiplier : this.state.tempConsumptionUnitObject.otherUnit != null ? this.state.tempConsumptionUnitObject.otherUnit.multiplier : "",
      otherUnitName: consumptionDataType == 3 && this.state.tempConsumptionUnitObject.otherUnit != null ? this.state.tempConsumptionUnitObject.otherUnit.label.label_en : ""
    })
  }
  /**
   * This function is used when some value of the formula cell is changed
   * @param {*} instance This is the object of the DOM element
   * @param {*} executions This is object of the formula cell that is being edited
   */
  formulaChanged = function (instance, executions) {
    var executions = executions;
    for (var e = 0; e < executions.length; e++) {
      this.changed(instance, executions[e].cell, executions[e].x, executions[e].y, executions[e].v)
    }
  }
  /**
   * Function to build a jexcel table.
   * Constructs and initializes a jexcel table using the provided data and options.
   */
  buildJexcel() {
    var data = [];
    let dataArray1 = [];
    if (this.state.selectedConsumptionUnitId != 0) {
      var data = [];
      data[0] = this.state.tempConsumptionUnitObject.consumptionDataType == 2 ? true : false;
      data[1] = i18n.t('static.product.product');
      data[2] = getLabelText(this.state.selectedConsumptionUnitObject.planningUnit.label, this.state.lang);
      data[3] = this.state.selectedConsumptionUnitObject.planningUnit.multiplier;
      data[4] = Number(1).toFixed(4);
      data[5] = 2
      dataArray1.push(data);
      data = [];
      data[0] = this.state.tempConsumptionUnitObject.consumptionDataType == 1 ? true : false;
      data[1] = i18n.t('static.forecastingunit.forecastingunit');
      data[2] = getLabelText(this.state.selectedConsumptionUnitObject.planningUnit.forecastingUnit.label, this.state.lang);
      data[3] = 1;
      data[4] = Number(1 / this.state.selectedConsumptionUnitObject.planningUnit.multiplier).toFixed(4);
      data[5] = 1
      dataArray1.push(data);
      data = [];
      data[0] = this.state.tempConsumptionUnitObject.consumptionDataType == 3 ? true : false;
      data[1] = i18n.t('static.common.otherUnit');
      data[2] = this.state.tempConsumptionUnitObject.consumptionDataType == 3 ? this.state.otherUnitName : "";
      data[3] = this.state.tempConsumptionUnitObject.consumptionDataType == 3 ? this.state.selectedPlanningUnitMultiplier : Number(0);
      data[4] = `=ROUND(1/D1*ROUND(D3,4),4)`;
      data[5] = 3
      dataArray1.push(data);
    }
    this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
    jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
    var data = dataArray1;
    var options = {
      data: data,
      columnDrag: false,
      columns: [
        { title: ' ', type: 'radio' },
        { title: ' ', type: 'text', readOnly: true },
        { title: ' ', type: 'text', textEditor: true },
        { title: i18n.t('static.dataentry.conversionToFu'), type: 'numeric', mask: '#,##.00', decimal: '.', textEditor: true },
        { title: i18n.t('static.dataentry.conversionToPu'), type: 'numeric', decimal: '.', readOnly: true },
        { title: 'Conversion Type', type: 'hidden' }
      ],
      onload: this.loadedJexcel,
      onformulachain: this.formulaChanged,
      pagination: false,
      filters: false,
      search: false,
      columnSorting: true,
      wordWrap: true,
      paginationOptions: JEXCEL_PAGINATION_OPTION,
      position: 'top',
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      onchange: this.changed,
      copyCompatibility: true,
      allowManualInsertRow: false,
      parseFormulas: true,
      editable: true,
      license: JEXCEL_PRO_KEY,
      contextMenu: function (obj, x, y, e) {
        return [];
      }.bind(this),
    };
    var jexcelDataEl = jexcel(document.getElementById("mapPlanningUnit"), options);
    this.el = jexcelDataEl;
    this.setState({
      jexcelDataEl: jexcelDataEl
    })
  }
}