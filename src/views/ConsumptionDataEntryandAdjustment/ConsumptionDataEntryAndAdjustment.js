import React from "react";
import { Formik } from 'formik';
import { Bar } from 'react-chartjs-2';
import {
  Card, CardBody,
  Label, Input, FormGroup, Table,
  CardFooter, Button, Col, Form, InputGroup, Modal, ModalHeader, ModalBody, ModalFooter, FormFeedback
} from 'reactstrap';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, DATE_FORMAT_CAP_WITHOUT_DATE, DATE_FORMAT_CAP, TITLE_FONT, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_DECIMAL_NO_REGEX_LONG_2_DECIMAL, SPECIAL_CHARECTER_WITH_NUM, TBD_PROCUREMENT_AGENT_ID } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import 'react-select/dist/react-select.min.css';
import AuthenticationService from "../Common/AuthenticationService.js";
import '../Forms/ValidationForms/ValidationForms.css';
import moment from "moment"
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import csvicon from '../../assets/img/csv.png';
import { JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import { jExcelLoadedFunctionOnlyHideRow, checkValidtion, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js'
import NumberFormat from 'react-number-format';
import { CustomTooltips } from "@coreui/coreui-plugin-chartjs-custom-tooltips";
import { Prompt } from "react-router-dom";
import pdfIcon from '../../assets/img/pdf.png';
import jsPDF from 'jspdf';
import { LOGO } from "../../CommonComponent/Logo";
import { green } from "@material-ui/core/colors";
import { red } from "@material-ui/core/colors";
import * as Yup from 'yup';
import { confirmAlert } from "react-confirm-alert";
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import dataentryScreenshot1 from '../../assets/img/dataentryScreenshot-1.png';
import dataentryScreenshot2 from '../../assets/img/dataentryScreenshot-2.png';
import dataentryScreenshot3 from '../../assets/img/dataentryScreenshot-3.png';
import { round } from "mathjs";

const entityname = i18n.t('static.dashboard.dataEntryAndAdjustment');
const ref = React.createRef();
const pickerLang = {
  months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
  from: 'From', to: 'To',
}

const validate = (getValidationSchema) => {
  return (values) => {

    const validationSchema = getValidationSchema(values, i18n.t)
    try {
      validationSchema.validateSync(values, { abortEarly: false })
      return {}
    } catch (error) {
      return getErrorsFromValidationError(error)
    }
  }
}

const getErrorsFromValidationError = (validationError) => {
  const FIRST_ERROR = 0
  return validationError.inner.reduce((errors, error) => {
    return {
      ...errors,
      [error.path]: error.errors[FIRST_ERROR],
    }
  }, {})
}

export default class ConsumptionDataEntryandAdjustment extends React.Component {

  constructor(props) {
    super(props);
    var startDate = moment(Date.now()).add(-36, 'months').format("YYYY-MM-DD");
    var stopDate = moment(Date.now()).format("YYYY-MM-DD");
    this.state = {
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
      singleValue2: localStorage.getItem("sesDataentryDateRange") != "" ? JSON.parse(localStorage.getItem("sesDataentryDateRange")) : { from: { year: Number(moment(startDate).startOf('month').format("YYYY")), month: Number(moment(startDate).startOf('month').format("M")) }, to: { year: Number(moment(stopDate).startOf('month').format("YYYY")), month: Number(moment(stopDate).startOf('month').format("M")) } },
      maxDate: { year: Number(moment(Date.now()).startOf('month').format("YYYY")), month: Number(moment(Date.now()).startOf('month').format("M")) },
      planningUnitTotalList: [],
      dataEnteredInTableExSpan: 0
    }
    this.loaded = this.loaded.bind(this);
    this.loadedJexcel = this.loadedJexcel.bind(this);
    this.changed = this.changed.bind(this);
    this.buildDataJexcel = this.buildDataJexcel.bind(this);
    this.cancelClicked = this.cancelClicked.bind(this);
    this.consumptionDataChanged = this.consumptionDataChanged.bind(this);
    this.checkValidationConsumption = this.checkValidationConsumption.bind(this);
    this.filterList = this.filterList.bind(this)
    this.resetClicked = this.resetClicked.bind(this)
    this.buildJexcel = this.buildJexcel.bind(this);
    this.saveConsumptionList = this.saveConsumptionList.bind(this);
  }

  makeText = m => {
    if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
    return '?'
  }

  filterList = function (instance, cell, c, r, source) {
    var value = (instance.jexcel.getJson(null, false)[r])[1];
    return this.state.mixedList.filter(c => c.type == value);
  }

  touchAll(setTouched, errors) {
    setTouched({
      otherUnitName: true,
      otherUnitMultiplier: true
    }
    );
    this.validateForm(errors);
  }
  validateForm(errors) {
    this.findFirstError('dataEnteredInForm', (fieldName) => {
      return Boolean(errors[fieldName])
    })
  }
  findFirstError(formName, hasError) {
    const form = document.forms[formName]
    for (let i = 0; i < form.length; i++) {
      if (hasError(form[i].name)) {
        form[i].focus()
        break
      }
    }
  }

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
        console.log("consumptionList All--->", this.state.tempConsumptionList)
        var consumptionUnit = {};
        var consumptionNotes = "";
        if (consumptionUnitId > 0) {
          consumptionUnit = this.state.planningUnitList.filter(c => c.planningUnit.id == consumptionUnitId)[0];
          consumptionNotes = consumptionUnit.consumptionNotes;
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
        console.log("consumptionList---->", consumptionList);
        var monthArray = this.state.monthArray;
        var regionList = this.state.regionList;
        let dataArray = [];
        let data = [];
        let columns = [];
        columns.push({ title: i18n.t('static.inventoryDate.inventoryReport'), type: 'text', width: 200 })
        data[0] = i18n.t('static.program.noOfDaysInMonth');
        for (var j = 0; j < monthArray.length; j++) {
          data[j + 1] = monthArray[j].noOfDays;
          columns.push({ title: moment(monthArray[j].date).format(DATE_FORMAT_CAP_WITHOUT_DATE), type: 'numeric', textEditor: true, mask: '#,##.00', decimal: '.', disabledMaskOnEdition: true, width: 100 })
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
            // data[j + 1] = `=ROUND((${colArr[j + 1]}${parseInt(dataArray.length - 3)}/${colArr[j + 1]}${parseInt(dataArray.length - 2)}/(1-(${colArr[j + 1]}${parseInt(dataArray.length - 1)}/${colArr[j + 1] + "1"})))*100,0)`;
            data[j + 1] = `=IF(${colArr[j + 1]}${parseInt(dataArray.length - 3)}=='','',ROUND((${colArr[j + 1]}${parseInt(dataArray.length - 3)}/${colArr[j + 1]}${parseInt(dataArray.length - 2)}/(1-(${colArr[j + 1]}${parseInt(dataArray.length - 1)}/${colArr[j + 1] + "1"})))*100,0))`;
          }
          data[monthArray.length + 1] = multiplier;
          dataArray.push(data);

          data = [];
          data[0] = i18n.t('static.dataentry.convertedToPlanningUnit')
          for (var j = 0; j < monthArray.length; j++) {
            // data[j + 1] = `=ROUND(${colArr[j + 1]}${parseInt(dataArray.length)}/${colArr[monthArray.length + 1] + "0"},0)`;
            console.log("Multiplier 1@@@@@@@@@@@@@@@", multiplier1);
            data[j + 1] = `=IF(${colArr[j + 1]}${parseInt(dataArray.length - 4)}=='','',ROUND(${colArr[j + 1]}${parseInt(dataArray.length)}/${colArr[monthArray.length + 1] + "1"},0))`;
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
        // for (var j = 0; j < monthArray.length; j++) {
        //   data = [];
        //   data[0] = langaugeList[j].languageId
        //   data[1] = langaugeList[j].label.label_en;
        //   data[2] = langaugeList[j].languageCode;
        //   data[3] = langaugeList[j].countryCode;
        //   data[4] = langaugeList[j].lastModifiedBy.username;
        //   data[5] = (langaugeList[j].lastModifiedDate ? moment(langaugeList[j].lastModifiedDate).format("YYYY-MM-DD") : null)
        //   data[6] = langaugeList[j].active;

        //   languageArray[count] = data;
        //   count++;
        // }
        // this.el = jexcel(document.getElementById("tableDiv"), '');
        // this.el.destroy();
        jexcel.destroy(document.getElementById('tableDiv'), true);
        var options = {
          data: dataArray,
          columnDrag: true,
          columns: columns,
          colWidths: [10, 50, 100, 100, 100, 100, 50, 100],
          // text: {
          //   // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
          //   showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
          //   show: '',
          //   entries: '',
          // },
          updateTable: function (el, cell, x, y, source, value, id) {
          },
          onload: this.loaded,
          onchange: function (instance, cell, x, y, value) {
            this.consumptionDataChanged(instance, cell, x, y, value)
            // this.setState({
            //   consumptionChanged: true
            // })
            if (this.state.consumptionChanged != true) { this.setState({ consumptionChanged: true }) }
          }.bind(this),

          pagination: false,
          search: false,
          columnSorting: false,
          // tableOverflow: true,
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
          freezeColumns: 1,
          license: JEXCEL_PRO_KEY,
          parseFormulas: true,
          editable: AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_CONSUMPTION_DATA_ENTRY_ADJUSTMENT') ? true : false,
          contextMenu: function (obj, x, y, e) {
            return [];
          }.bind(this),
        };
        var dataEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = dataEl;
        this.setState({
          dataEl: dataEl, loading: false,
          // smallTableEl: smallTableEl,
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

  consumptionDataChanged = function (instance, cell, x, y, value) {
    var possibleActualConsumptionY = [];
    var possibleReportRateY = [];
    var possibleStockDayY = [];
    var adjustedConsumptionY = [];
    var actualConsumptionStart = 2;
    var reportRateStart = 3;
    var stockDayStart = 4;
    var adjustedConsumption = 6;
    var reg = JEXCEL_DECIMAL_NO_REGEX_LONG_2_DECIMAL;

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
        // elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
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
        // elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
        elInstance.setComments(col, "Please enter any positive number upto 100");
      } else if (!(reg.test(value))) {
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
      } else if (value < 0 || value > stockOutdays) {
        var col = (colArr[x]).concat(parseInt(y) + 1);
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setStyle(col, "background-color", "yellow");
        // elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
        elInstance.setComments(col, "Please enter positive value lesser than number of days.");
      } else if (!(reg.test(value))) {
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
  }

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
    var reg = JEXCEL_DECIMAL_NO_REGEX_LONG_2_DECIMAL;

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
        // var rowData = elInstance.getRowData(y);
        var value = elInstance.getValue(`${colArr[x]}${parseInt(y) + 1}`, true);
        value = value.replaceAll(',', '');
        if (possibleActualConsumptionY.includes(y.toString())) {
          if (value == "") {
          } else if (value < 0) {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            // elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
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
          console.log("possibleReportRateY--", y.toString());
          if (value == "") {

          }
          else if (value < 0 || value > 100) {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            //elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
            elInstance.setComments(col, "Please enter any positive number upto 100");
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

            console.log("possibleReportRateY--Col esle  ", col);

            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
          }
        }

        if (possibleStockDayY.includes(y.toString())) {
          var stockOutdays = elInstance.getColumnData(x)[0];
          if (value == "") {
          } else if (value < 0 || value > stockOutdays) {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            // elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
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
    console.log("valid--", valid)
    return valid;
  }

  interpolationMissingActualConsumption() {
    var notes = document.getElementById("consumptionNotes").value;
    var monthArray = this.state.monthArray;
    var regionList = this.state.regionList;
    var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
    var curUser = AuthenticationService.getLoggedInUserId();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
    var consumptionUnit = this.state.selectedConsumptionUnitObject;
    var rangeValue = this.state.singleValue2;
    console.log("RangeValuie@@@@@@@@@@@@", rangeValue);
    var startDate = moment(rangeValue.from.year + '-' + rangeValue.from.month + '-01').format("YYYY-MM-DD");
    var stopDate = moment(rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate()).format("YYYY-MM-DD");
    var fullConsumptionList = this.state.tempConsumptionList.filter(c => (c.planningUnit.id != consumptionUnit.planningUnit.id) || (c.planningUnit.id == consumptionUnit.planningUnit.id && (moment(c.month).format("YYYY-MM") < moment(startDate).format("YYYY-MM") || moment(c.month).format("YYYY-MM") > moment(stopDate).format("YYYY-MM"))));
    var elInstance = this.state.dataEl;
    for (var i = 0; i < monthArray.length; i++) {
      var columnData = elInstance.getColumnData([i + 1]);
      var actualConsumptionCount = 2;
      var reportingRateCount = 3;
      var daysOfStockOutCount = 4;
      var adjustedAmountCount = 6;
      var puAmountCount = 7;

      for (var r = 0; r < regionList.length; r++) {
        console.log("&&&&&&&&&&MonthList", monthArray[i]);
        var index = 0;
        index = fullConsumptionList.findIndex(c => c.planningUnit.id == consumptionUnit.planningUnit.id && c.region.id == regionList[r].regionId && moment(c.month).format("YYYY-MM") == moment(monthArray[i].date).format("YYYY-MM"));
        var actualConsumptionValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(actualConsumptionCount) + 1}`, true).replaceAll(",", "");
        var reportingRateValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(reportingRateCount) + 1}`, true);
        var daysOfStockOutValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(daysOfStockOutCount) + 1}`, true);
        var adjustedAmountValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(adjustedAmountCount) + 1}`, true).replaceAll(",", "");;
        var puAmountValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(puAmountCount) + 1}`, true).replaceAll(",", "");;
        console.log("&&&&&&&&&&ActualConsumptionValue", actualConsumptionValue);
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
    // notes += " Interpolated data for: "
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
            //y=y1+(x-x1)*(y2-y1)/(x2-x1);
            const monthDifference = moment(new Date(monthArray[j].date)).diff(new Date(startMonthVal), 'months', true);
            const monthDiff = moment(new Date(endMonthVal)).diff(new Date(startMonthVal), 'months', true);
            var missingActualConsumption = Number(startVal) + (monthDifference * ((Number(endVal) - Number(startVal)) / monthDiff));
            var json = {
              amount: missingActualConsumption.toFixed(0),
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
    // document.getElementById("consumptionNotes").value = document.getElementById("consumptionNotes").value.concat(notes).concat("filled in with interpolated");
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
          consumptionChanged: true
        })
        this.buildDataJexcel(this.state.selectedConsumptionUnitId, 1);
      }
    }
  }

  saveConsumptionList() {
    this.setState({
      loading: true
    })
    var validation = this.checkValidationConsumption();
    if (validation) {
      var db1;
      var storeOS;
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
        var datasetRequest = datasetTransaction.get(this.state.datasetId);
        datasetRequest.onerror = function (event) {
        }.bind(this);
        datasetRequest.onsuccess = function (event) {
          var myResult = datasetRequest.result;
          var datasetDataBytes = CryptoJS.AES.decrypt(myResult.programData, SECRET_KEY);
          var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
          var datasetJson = JSON.parse(datasetData);
          var elInstance = this.state.dataEl;
          var consumptionList = [];
          var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
          var curUser = AuthenticationService.getLoggedInUserId();
          var consumptionUnit = this.state.selectedConsumptionUnitObject;
          var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
          console.log("this.state.consumptionList", this.state.consumptionList);
          // var fullConsumptionList = this.state.consumptionList.filter(c => c.planningUnit.id != consumptionUnit.planningUnit.id);
          var rangeValue = this.state.singleValue2;
          console.log("RangeValuie@@@@@@@@@@@@", rangeValue);
          var startDate = moment(rangeValue.from.year + '-' + rangeValue.from.month + '-01').format("YYYY-MM-DD");
          var stopDate = moment(rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate()).format("YYYY-MM-DD");
          var fullConsumptionList = this.state.consumptionList.filter(c => (c.planningUnit.id != consumptionUnit.planningUnit.id) || (c.planningUnit.id == consumptionUnit.planningUnit.id && (moment(c.month).format("YYYY-MM") < moment(startDate).format("YYYY-MM") || moment(c.month).format("YYYY-MM") > moment(stopDate).format("YYYY-MM"))));
          console.log("Full ConsumptionList @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@", fullConsumptionList)
          var monthArray = this.state.monthArray;
          var regionList = this.state.regionList;
          for (var i = 0; i < monthArray.length; i++) {

            var columnData = elInstance.getColumnData([i + 1]);
            var actualConsumptionCount = 2;
            var reportingRateCount = 3;
            var daysOfStockOutCount = 4;
            var adjustedAmountCount = 6;
            var puAmountCount = 7;

            for (var r = 0; r < regionList.length; r++) {
              console.log("&&&&&&&&&&MonthList", monthArray[i]);
              var index = 0;
              index = fullConsumptionList.findIndex(c => c.planningUnit.id == consumptionUnit.planningUnit.id && c.region.id == regionList[r].regionId && moment(c.month).format("YYYY-MM") == moment(monthArray[i].date).format("YYYY-MM"));
              var actualConsumptionValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(actualConsumptionCount) + 1}`, true).replaceAll(",", "");
              var reportingRateValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(reportingRateCount) + 1}`, true);
              var daysOfStockOutValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(daysOfStockOutCount) + 1}`, true);
              var adjustedAmountValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(adjustedAmountCount) + 1}`, true).replaceAll(",", "");
              var puAmountValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(puAmountCount) + 1}`, true).replaceAll(",", "");
              console.log("&&&&&&&&&&ActualConsumptionValue", actualConsumptionValue);
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
          var planningUnitList = datasetJson.planningUnitList;
          // if (this.state.selectedConsumptionUnitId == 0) {
          //   planningUnitList.push(consumptionUnit);
          // }

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

            //this.el = jexcel(document.getElementById("tableDiv"), '');
            //this.el.destroy();
            //this.el = jexcel(document.getElementById("smallTableDiv"), '');
            //this.el.destroy();


            this.setState({
              // dataEl: "",
              showDetailTable: true,
              loading: false,
              message: i18n.t('static.compareAndSelect.dataSaved'),
              messageColor: "green",
              consumptionChanged: false
            }, () => {
              this.getDatasetData();
              this.hideFirstComponent();
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

  hideFirstComponent() {
    document.getElementById('div1').style.display = 'block';
    this.state.timeout = setTimeout(function () {
      document.getElementById('div1').style.display = 'none';
    }, 30000);
  }

  hideSecondComponent() {
    document.getElementById('div2').style.display = 'block';
    this.state.timeout = setTimeout(function () {
      document.getElementById('div2').style.display = 'none';
    }, 30000);
  }

  loadedJexcel = function (instance, cell, x, y, value) {
    // jExcelLoadedFunctionOnlyHideRow(instance);

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

        if (consumptionDataType == 3) {// grade out
          // console.log("other consumptionDataType")
          var cell1 = elInstance.getCell(`C3`)//other name
          var cell2 = elInstance.getCell(`D3`)//other multiplier
          cell1.classList.remove('readonly');
          cell2.classList.remove('readonly');
          document.getElementById("dataEnteredInTableExLabel").style.display = "block";
          // document.getElementById("dataEnteredInTableExSpan").innerHTML = Math.round(Number(1 / this.state.tempConsumptionUnitObject.planningUnit.multiplier * this.state.tempConsumptionUnitObject.otherUnit.multiplier).toFixed(4) * 1000);
          this.setState({
            dataEnteredInTableExSpan: Math.round(Number(1 / this.state.tempConsumptionUnitObject.planningUnit.multiplier * this.state.tempConsumptionUnitObject.otherUnit.multiplier).toFixed(4) * 1000)
          })
        } else {
          // console.log("consumptionDataType", consumptionDataType)
          var cell1 = elInstance.getCell(`C3`)//other name
          var cell2 = elInstance.getCell(`D3`)//other multiplier
          cell1.classList.add('readonly');
          cell2.classList.add('readonly');
          document.getElementById("dataEnteredInTableExLabel").style.display = "none";

        }
      }

    }
    // }

  }

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

  toggleAccordion(consumptionUnitId) {
    var consumptionUnitShowArr = this.state.consumptionUnitShowArr;
    if (consumptionUnitShowArr.includes(consumptionUnitId)) {
      consumptionUnitShowArr = consumptionUnitShowArr.filter(c => c != consumptionUnitId);
    } else {
      consumptionUnitShowArr.push(consumptionUnitId)
    }
    this.setState({
      consumptionUnitShowArr: consumptionUnitShowArr
    })
  }

  componentDidMount() {
    this.hideSecondComponent();
    this.getDatasetList();
  }

  addDoubleQuoteToRowContent = (arr) => {
    return arr.map(ele => '"' + ele + '"')
  }

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
      columns.push(moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE))
    ))
    columns.push(i18n.t('static.supplyPlan.total').replaceAll(' ', '%20'));
    columns.push(i18n.t('static.dataentry.regionalPer').replaceAll(' ', '%20'));

    let headers = [];
    columns.map((item, idx) => { headers[idx] = (item).replaceAll(' ', '%20') });
    var A = [this.addDoubleQuoteToRowContent(headers)];

    this.state.planningUnitList.map(item => {
      var total = 0;
      var totalPU = 0;
      var datacsv = [];
      datacsv.push((item.consumptionDataType == 1 ? getLabelText(item.planningUnit.forecastingUnit.label, this.state.lang) : item.consumptionDataType == 2 ? getLabelText(item.planningUnit.label, this.state.lang) : getLabelText(item.otherUnit.label, this.state.lang)).replaceAll(' ', '%20'));
      this.state.monthArray.map((item1, count) => {
        var data = this.state.planningUnitTotalList.filter(c => c.planningUnitId == item.planningUnit.id && moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"));
        total += Number(data[0].qty);
        totalPU += Number(data[0].qtyInPU);
        datacsv.push(this.state.showInPlanningUnit ? data[0].qtyInPU : data[0].qty)
      })
      datacsv.push(this.state.showInPlanningUnit ? Math.round(totalPU) : Math.round(total));
      datacsv.push("100 %");
      A.push(this.addDoubleQuoteToRowContent(datacsv))

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
            datacsv.push(this.state.showInPlanningUnit ? data[0].qtyInPU : data[0].qty)
          })
        }
        A.push(this.addDoubleQuoteToRowContent(datacsv))
      });
    });

    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","))
    }
    if (this.state.selectedConsumptionUnitId > 0) {
      csvRow.push('')
      csvRow.push('')
      if (this.state.selectedConsumptionUnitId > 0) {
        csvRow.push('"' + (i18n.t('static.dashboard.planningunitheader') + ' : ' + document.getElementById("planningUnitId").value).replaceAll(' ', '%20') + '"')
      }
      csvRow.push('')
      headers = [];
      var columns = [];
      columns.push(i18n.t('static.inventoryDate.inventoryReport').replaceAll(' ', '%20'))
      this.state.monthArray.map(item => (
        columns.push(moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE))
      ))
      columns.push('')
      columns.map((item, idx) => { headers[idx] = (item).replaceAll(' ', '%20') });
      var C = []
      C.push([this.addDoubleQuoteToRowContent(headers)]);
      var B = [];
      var monthArray = this.state.monthArray;
      var regionList = this.state.regionList;
      var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
      B.push(i18n.t('static.program.noOfDaysInMonth').replaceAll('#', '%23').replaceAll(' ', '%20'))
      for (var j = 0; j < monthArray.length; j++) {
        B.push(monthArray[j].noOfDays)
      }
      C.push(this.addDoubleQuoteToRowContent(B));

      for (var r = 0; r < regionList.length; r++) {
        B = [];
        B.push((getLabelText(regionList[r].label)).replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push("")
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.supplyPlan.actualConsumption').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push(elInstance.getValue(`${colArr[j + 1]}${parseInt(actualConsumption)}`, true).toString().replaceAll("\,", ""))
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.reportingRate').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push(elInstance.getValue(`${colArr[j + 1]}${parseInt(reportingRateCount)}`, true).toString().replaceAll("\,", ""))
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.stockedOut').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push(elInstance.getValue(`${colArr[j + 1]}${parseInt(stockOutCount)}`, true).toString().replaceAll("\,", ""))
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.stockedOutPer').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push(elInstance.getValue(`${colArr[j + 1]}${parseInt(stockOutPercentCount)}`, true).toString().replaceAll("\,", ""))
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];

        B.push(i18n.t('static.dataentry.adjustedConsumption').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push((elInstance.getValue(`${colArr[j + 1]}${parseInt(adjustedConsumptionCount)}`, true).toString().replaceAll("\,", "")))
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];

        B.push(i18n.t('static.dataentry.convertedToPlanningUnit').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push(elInstance.getValue(`${colArr[j + 1]}${parseInt(convertedToPlanningUnitCount)}`, true).toString().replaceAll("\,", ""))
        }
        C.push(this.addDoubleQuoteToRowContent(B));
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
    console.log("PlanningUnitList@@@@@@@@@@@", planningUnitList)
    for (var pul = 0; pul < planningUnitList.length; pul++) {
      console.log("In loop@@@@@@@@@")
      // if (planningUnitList[i].planningUnit.id != this.state.selectedConsumptionUnitId) {
      var consumptionList = this.state.consumptionList.filter(c => c.planningUnit.id == planningUnitList[pul].planningUnit.id);
      csvRow.push('')
      csvRow.push('')
      csvRow.push('"' + (i18n.t('static.dashboard.planningunitheader') + ' : ' + getLabelText(planningUnitList[pul].planningUnit.label, this.state.lang)).replaceAll(' ', '%20') + '"')
      csvRow.push('')
      headers = [];
      var columns = [];
      columns.push(i18n.t('static.inventoryDate.inventoryReport').replaceAll(' ', '%20'))
      this.state.monthArray.map(item => (
        columns.push(moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE))
      ))
      columns.push('')
      columns.map((item, idx) => { headers[idx] = (item).replaceAll(' ', '%20') });
      var C = []
      C.push([this.addDoubleQuoteToRowContent(headers)]);
      var B = [];
      var monthArray = this.state.monthArray;
      var regionList = this.state.regionList;
      var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
      B.push(i18n.t('static.program.noOfDaysInMonth').replaceAll('#', '%23').replaceAll(' ', '%20'))
      for (var j = 0; j < monthArray.length; j++) {
        B.push(monthArray[j].noOfDays)
      }
      C.push(this.addDoubleQuoteToRowContent(B));

      for (var r = 0; r < regionList.length; r++) {
        B = [];
        B.push((getLabelText(regionList[r].label)).replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push("")
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.supplyPlan.actualConsumption').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
          B.push(consumptionData.length > 0 ? consumptionData[0].amount.toString().replaceAll("\,", "") : "")
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.reportingRate').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
          B.push(consumptionData.length > 0 && consumptionData[0].reportingRate > 0 ? consumptionData[0].reportingRate.toString().replaceAll("\,", "") : 100);
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.stockedOut').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
          B.push(consumptionData.length > 0 && consumptionData[0].daysOfStockOut > 0 ? consumptionData[0].daysOfStockOut.toString().replaceAll("\,", "") : 0)
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.stockedOutPer').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
          var percentage = consumptionData.length > 0 && consumptionData[0].daysOfStockOut > 0 ? Math.round((consumptionData[0].daysOfStockOut / monthArray[j].noOfDays) * 100) : 0;
          console.log("Percentage@@@@@@@@@@@@@@@@@@@", percentage)
          B.push(percentage.toString().replaceAll("\,", ""))
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];

        B.push(i18n.t('static.dataentry.adjustedConsumption').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
          B.push(consumptionData.length > 0 ? consumptionData[0].adjustedAmount != undefined ? consumptionData[0].adjustedAmount.toString().replaceAll("\,", "") : consumptionData[0].amount.toString().replaceAll("\,", "") : "")
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];

        B.push(i18n.t('static.dataentry.convertedToPlanningUnit').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
          B.push(consumptionData.length > 0 ? consumptionData[0].puAmount != undefined ? consumptionData[0].puAmount.toString().replaceAll("\,", "") : consumptionData[0].amount : "")
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];
      }

      for (var i = 0; i < C.length; i++) {
        csvRow.push(C[i].join(","))
      }
      // }
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
        var datasetList = this.state.datasetList;
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
        dataEl: "",
        showSmallTable: false,
        showDetailTable: false,
      }, () => {
        try {
          this.el = jexcel(document.getElementById("tableDiv"), '');
          // this.el.destroy();
          jexcel.destroy(document.getElementById("tableDiv"), true);
        } catch (error) {

        }
        if (datasetId != "") {
          this.getDatasetData();
        } else {
          this.setState({
            showSmallTable: false,
            showDetailTable: false,
            dataEl: ""
          })
        }
      })
    }
  }

  getDatasetData() {
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
      var dsRequest = datasetOs.get(this.state.datasetId);
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
              // var datasetData = this.state.datasetList.filter(c => c.id == )[0].dataset;
              var datasetData = dsRequest.result;
              var datasetDataBytes = CryptoJS.AES.decrypt(datasetData.programData, SECRET_KEY);
              var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
              var datasetJson = JSON.parse(datasetData);
              console.log("datasetJson@@@@@@@@@@@@@@", datasetJson);
              var consumptionList = datasetJson.actualConsumptionList;
              var planningUnitList = datasetJson.planningUnitList.filter(c => c.consuptionForecast && c.active);
              planningUnitList.sort((a, b) => {
                var itemLabelA = (this.state.showInPlanningUnit ? getLabelText(a.planningUnit.label, this.state.lang) : a.consumptionDataType == 1 ? getLabelText(a.planningUnit.forecastingUnit.label, this.state.lang) : a.consumptionDataType == 2 ? getLabelText(a.planningUnit.label, this.state.lang) : getLabelText(a.otherUnit.label, this.state.lang)).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = (this.state.showInPlanningUnit ? getLabelText(b.planningUnit.label, this.state.lang) : b.consumptionDataType == 1 ? getLabelText(b.planningUnit.forecastingUnit.label, this.state.lang) : b.consumptionDataType == 2 ? getLabelText(b.planningUnit.label, this.state.lang) : getLabelText(b.otherUnit.label, this.state.lang)).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
              });
              var regionList = datasetJson.regionList;
              regionList.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
              });
              var rangeValue = this.state.singleValue2;
              console.log("RangeValuie@@@@@@@@@@@@", rangeValue);
              var startDate = moment(rangeValue.from.year + '-' + rangeValue.from.month + '-01').format("YYYY-MM-DD");
              var stopDate = moment(rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate()).format("YYYY-MM-DD");
              console.log("stopDate@@@@@@@@@@@@", stopDate);
              var daysInMonth = datasetJson.currentVersion.daysInMonth;
              var monthArray = [];
              var curDate = startDate;
              var planningUnitTotalList = [];
              var planningUnitTotalListRegion = [];
              var totalPlanningUnitData = [];
              for (var m = 0; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); m++) {
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
                    console.log("consumptionDataForMonth--------->", consumptionDataForMonth)
                    if (consumptionDataForMonth.length > 0) {
                      console.log("consumptionDataForMonth--------->", consumptionDataForMonth)

                      var c = consumptionDataForMonth[0];
                      reportingRate = c.reportingRate > 0 ? c.reportingRate : 100;
                      actualConsumption = c.amount;
                      daysOfStockOut = c.daysOfStockOut;
                      qty = (Number(actualConsumption) / Number(reportingRate) / Number(1 - (Number(daysOfStockOut) / Number(noOfDays)))) * 100;
                      qty = qty.toFixed(2)
                      var multiplier = 0;
                      if (planningUnitList[cul].consumptionDataType == 1) {
                        multiplier = 1
                      } else if (planningUnitList[cul].consumptionDataType == 2) {
                        multiplier = planningUnitList[cul].planningUnit.multiplier
                      } else {
                        multiplier = planningUnitList[cul].otherUnit.multiplier
                      }
                      if (planningUnitList[cul].consumptionDataType == 1) {
                        qtyInPU = (Number(qty) / Number(planningUnitList[cul].planningUnit.multiplier)).toFixed(2)
                      } else if (planningUnitList[cul].consumptionDataType == 2) {
                        qtyInPU = (Number(qty));
                      } else if (planningUnitList[cul].consumptionDataType == 3) {
                        qtyInPU = Number((Number(qty) * Number(planningUnitList[cul].otherUnit.multiplier)) / Number(planningUnitList[cul].planningUnit.multiplier)).toFixed(2)
                      }
                    } else {
                      qty = "";
                      reportingRate = 100;
                      daysOfStockOut = 0;
                      qtyInPU = ""
                    }
                    planningUnitTotalListRegion.push({ planningUnitId: planningUnitList[cul].planningUnit.id, month: curDate, qty: qty != "" ? Math.round(qty) : "", qtyInPU: qty !== "" ? Math.round(qtyInPU) : "", reportingRate: reportingRate, region: regionList[r], multiplier: multiplier, actualConsumption: actualConsumption, daysOfStockOut: daysOfStockOut, noOfDays: noOfDays })
                    console.log("planningUnitTotalListRegion-->", planningUnitTotalListRegion);
                    if (qty !== "") {
                      totalQty = Number(totalQty) + Number(qty);
                      totalQtyPU = Number(totalQtyPU) + Number(qtyInPU);
                    }
                  }
                  console.log("&&totalQty--->", totalQty)
                  planningUnitTotalList.push({ planningUnitId: planningUnitList[cul].planningUnit.id, month: curDate, qty: totalQty !== "" ? Math.round(totalQty) : "", qtyInPU: totalQty !== "" ? Math.round(totalQtyPU) : "" })
                  console.log("&&planningUnitTotalList------>", planningUnitTotalList)
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
              console.log("&&planningUnitList------>", planningUnitList)

              this.setState({
                consumptionList: consumptionList,
                tempConsumptionList: consumptionList,
                regionList: regionList,
                startDate: startDate,
                stopDate: stopDate,
                // consumptionUnitList: consumptionUnitList,
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
                console.log("this.props.match.params.planningUnitId+++", this.props.match.params.planningUnitId)
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
  }

  // getARUList(e) {
  //   var planningUnitId = e.target.value;
  //   if (planningUnitId > 0) {
  //     var planningUnitListFiltered = this.state.allPlanningUnitList.filter(c => c.planningUnitId == planningUnitId)[0];
  //     var elInstance = this.state.smallTableEl;
  //     elInstance.setValueFromCoords(2, 1, getLabelText(planningUnitListFiltered.label, this.state.lang), true);
  //     elInstance.setValueFromCoords(3, 1, 1, true);
  //     elInstance.setValueFromCoords(4, 1, planningUnitListFiltered.planningUnitId, true);
  //     elInstance.setValueFromCoords(2, 0, getLabelText(planningUnitListFiltered.forecastingUnit.label, this.state.lang), true);
  //     elInstance.setValueFromCoords(3, 0, planningUnitListFiltered.multiplier, true);
  //     elInstance.setValueFromCoords(4, 0, planningUnitListFiltered.forecastingUnit.forecastingUnitId, true);

  //   }
  //   this.setState({
  //     selectedPlanningUnitId: planningUnitId,
  //     consumptionChanged: true
  //   })
  // }

  toggleShowGuidance() {
    this.setState({
      showGuidance: !this.state.showGuidance
    })
  }

  setShowInPlanningUnits(e) {
    this.setState({
      showInPlanningUnit: e.target.checked
    })
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
    window.onbeforeunload = null;
  }

  componentDidUpdate = () => {
    if (this.state.consumptionChanged) {
      window.onbeforeunload = () => true
    } else {
      window.onbeforeunload = undefined
    }
  }


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


      //  var file = new File('QAT-logo.png','../../../assets/img/QAT-logo.png');
      // var reader = new FileReader();

      //var data='';
      // Use fs.readFile() method to read the file 
      //fs.readFile('../../assets/img/logo.svg', 'utf8', function(err, data){ 
      //}); 
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

        /*doc.addImage(data, 10, 30, {
          align: 'justify'
        });*/
        doc.setTextColor("#002f6c");
        doc.text(i18n.t('static.common.dataCheck'), doc.internal.pageSize.width / 2, 60, {
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
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "landscape"; // portrait or landscape

    const marginLeft = 10;
    const doc = new jsPDF(orientation, unit, size, true);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal')


    var y = 110;

    doc.setFont('helvetica', 'bold')
    var planningText = doc.splitTextToSize(i18n.t('static.commitTree.consumptionForecast'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    y = y + 20;
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;

      }
      doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
      y = y + 10;
    }

    doc.setFont('helvetica', 'normal')
    planningText = doc.splitTextToSize("a. " + i18n.t('static.commitTree.monthsMissingActualConsumptionValues'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    y = y + 10;
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;

      }
      doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
      y = y + 10;
    }
    this.state.missingMonthList.map((item, i) => {
      doc.setFont('helvetica', 'bold')
      planningText = doc.splitTextToSize(getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " : ", doc.internal.pageSize.width * 3 / 4);
      // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
      y = y + 10;
      for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
          doc.addPage();
          y = 80;

        }
        doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
        y = y + 10;
      }
      doc.setFont('helvetica', 'normal')
      planningText = doc.splitTextToSize("" + item.monthsArray, doc.internal.pageSize.width * 3 / 4);
      // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
      y = y + 3;
      for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
          doc.addPage();
          y = 80;

        }
        doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
        y = y + 10;
      }
    })

    doc.setFont('helvetica', 'normal')
    planningText = doc.splitTextToSize("b. " + i18n.t('static.commitTree.puThatDoNotHaveAtleast24MonthsOfActualConsumptionValues'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    y = y + 20;
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;

      }
      doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
      y = y + 10;
    }
    this.state.consumptionListlessTwelve.map((item, i) => {
      doc.setFont('helvetica', 'bold')
      planningText = doc.splitTextToSize(getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " : ", doc.internal.pageSize.width * 3 / 4);
      // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
      y = y + 10;
      for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
          doc.addPage();
          y = 80;

        }
        doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
        y = y + 10;
      }
      doc.setFont('helvetica', 'normal')
      planningText = doc.splitTextToSize("" + item.noOfMonths + " month(s)", doc.internal.pageSize.width * 3 / 4);
      // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
      y = y + 3;
      for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
          doc.addPage();
          y = 80;

        }
        doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
        y = y + 10;
      }
    })
    addHeaders(doc)
    addFooters(doc)
    doc.save(document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[0] + "-" + document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[1] + "-" + i18n.t('static.dashboard.dataEntryAndAdjustment') + "-" + i18n.t('static.common.dataCheck') + '.pdf');
  }

  handleAMonthChange2 = (value, text) => {
  }

  handleClickMonthBox2 = (e) => {
    this.refs.pickAMonth2.show()
  }

  handleAMonthDissmis2 = (value) => {
    //
    //
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
    console.log("Value@@@@@@@@@@@@@@@", value)
    let startDate = moment(value.from.year + '-' + value.from.month + '-01').format("YYYY-MM");
    let endDate = moment(value.to.year + '-' + value.to.month + '-' + new Date(value.to.year, value.to.month, 0).getDate()).format("YYYY-MM");
    console.log("startDate-->", startDate);
    console.log("endDate-->", endDate);
    // var monthsDiff = moment(endDate).diff(startDate, 'months', true);
    const monthsDiff = moment(new Date(endDate)).diff(new Date(startDate), 'months', true);
    if (cont == true) {
      if (monthsDiff <= 36) {
        this.setState({
          consumptionChanged: false
        }, () => {
          this.setState({ singleValue2: value, }, () => {
            localStorage.setItem("sesDataentryDateRange", JSON.stringify(value))
            this.getDatasetData()
          })
        })
      } else {
        alert(i18n.t('static.dataentry.maxRange'));
        let rangeValue = this.state.singleValue2;
        let startDate = moment(rangeValue.from.year + '-' + rangeValue.from.month + '-01').format("YYYY-MM");
        let stopDate = moment(rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate()).format("YYYY-MM");
        this.setState({ singleValue2: { from: { year: Number(moment(startDate).startOf('month').format("YYYY")), month: Number(moment(startDate).startOf('month').format("M")) }, to: { year: Number(moment(stopDate).startOf('month').format("YYYY")), month: Number(moment(stopDate).startOf('month').format("M")) } } });
      }
    }

  }

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

    const { allPlanningUnitList } = this.state;
    let planningUnits = allPlanningUnitList.length > 0
      && allPlanningUnitList.map((item, i) => {
        return (
          <option key={i} value={item.planningUnitId}>
            {getLabelText(item.label, this.state.lang)}
          </option>
        )
      }, this);

    var chartOptions = {
      title: {
        display: true,
        text: this.state.selectedConsumptionUnitId > 0 ? i18n.t('static.dashboard.dataEntryAndAdjustments') + " - " + document.getElementById("datasetId").selectedOptions[0].text + " - " + getLabelText(this.state.selectedConsumptionUnitObject.planningUnit.label, this.state.lang) : ""
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: getLabelText(this.state.tempConsumptionUnitObject.consumptionDataType == "" ? "" : this.state.tempConsumptionUnitObject.consumptionDataType == 1 ? this.state.tempConsumptionUnitObject.planningUnit.forecastingUnit.label : this.state.tempConsumptionUnitObject.consumptionDataType == 2 ? this.state.tempConsumptionUnitObject.planningUnit.label : this.state.tempConsumptionUnitObject.otherUnit.label, this.state.lang),
            fontColor: 'black'
          },
          stacked: true,
          ticks: {
            beginAtZero: true,
            fontColor: 'black',
            callback: function (value) {
              return value.toLocaleString();
            }
          },
          gridLines: {
            drawBorder: true, lineWidth: 0
          },
          position: 'left',
        }],
        xAxes: [{
          ticks: {
            fontColor: 'black'
          },
          gridLines: {
            drawBorder: true, lineWidth: 0
          },
          // stacked: true
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

    let bar = {}
    var datasetListForGraph = [];
    var colourArray = ["#002F6C", "#BA0C2F", "#118B70", "#EDB944", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721"]
    if (this.state.showDetailTable) {
      var elInstance = this.state.dataEl;
      if (elInstance != undefined) {
        var colourCount = 0;
        datasetListForGraph.push({
          label: getLabelText(this.state.tempConsumptionUnitObject.consumptionDataType == 1 ? this.state.tempConsumptionUnitObject.planningUnit.forecastingUnit.label : this.state.tempConsumptionUnitObject.consumptionDataType == 2 ? this.state.tempConsumptionUnitObject.planningUnit.label : this.state.tempConsumptionUnitObject.otherUnit.label, this.state.lang),
          data: this.state.planningUnitTotalList.filter(c => c.planningUnitId == this.state.selectedConsumptionUnitObject.planningUnit.id).map(item => (item.qty !== "" ? item.qty : null)),
          type: 'line',
          // stack: 1,
          backgroundColor: 'transparent',
          // backgroundColor: "#002F6C",
          borderStyle: 'dotted',
          ticks: {
            fontSize: 2,
            fontColor: 'transparent',
          },
          // lineTension: 0,
          pointStyle: 'line',
          pointBorderWidth: 5,
          borderColor: '#CFCDC9',
          // pointRadius: 0,
          showInLegend: true,
        })

        var actualConsumptionCount = 6;
        this.state.regionList.map((item, count) => {
          if (colourCount > 7) {
            colourCount = 0;
          }

          // var columnData = elInstance.getRowData(actualConsumptionCount, true);
          // columnData.shift()
          datasetListForGraph.push({
            label: getLabelText(item.label, this.state.lang),
            data: this.state.planningUnitTotalListRegion.filter(c => c.planningUnitId == this.state.selectedConsumptionUnitObject.planningUnit.id && c.region.regionId == item.regionId).map(item => (item.qty > 0 ? item.qty : null)),
            // type: 'line'
            stack: 1,
            // backgroundColor: 'transparent',
            backgroundColor: colourArray[colourCount],
            borderStyle: 'dotted',
            ticks: {
              fontSize: 2,
              fontColor: 'transparent',
            },
            // lineTension: 0,
            // pointStyle: 'line',
            // pointRadius: 0,
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

    //Consumption : planning unit less 12 month
    const { consumptionListlessTwelve } = this.state;
    let consumption = consumptionListlessTwelve.length > 0 && consumptionListlessTwelve.map((item, i) => {
      return (
        <li key={i}>
          <div><span><b>{getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " : "}</b></span><span>{item.noOfMonths + " month(s)"}</span></div>
        </li>
      )
    }, this);
    console.log("PlanningUnitList@@@@@@@@@@@@@@", this.state.planningUnitList);
    return (
      <div className="animated fadeIn">
        <Prompt
          // when={this.state.consumptionChangedFlag == 1 || this.state.consumptionBatchInfoChangedFlag == 1}
          when={this.state.consumptionChanged == 1}
          message={i18n.t("static.dataentry.confirmmsg")}
        />
        <AuthenticationServiceComponent history={this.props.history} />
        <h5 className={this.state.messageColor} id="div1">{this.state.message}</h5>
        <h5 className={this.props.match.params.color} id="div2">{i18n.t(this.props.match.params.message, { entityname })}</h5>
        <Card>
          <div className="card-header-actions">
            <div className="Card-header-reporticon">
              <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>
              <span className="compareAndSelect-rarrow"> <i className="cui-arrow-right icons " > </i></span>
              <span className="compareAndSelect-larrowText"> {i18n.t('static.common.backTo')} <a href="/#/importFromQATSupplyPlan/listImportFromQATSupplyPlan" className="supplyplanformulas">{i18n.t('static.importFromQATSupplyPlan.importFromQATSupplyPlan')}</a></span>
              <span className="compareAndSelect-rarrowText"> {i18n.t('static.common.continueTo')} <a href="/#/extrapolation/extrapolateData" className="supplyplanformulas">{i18n.t('static.dashboard.extrapolation')}</a></span><br />
              {/* <strong>{i18n.t('static.dashboard.supplyPlan')}</strong> */}

              {/* <a className="card-header-action">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
                            </a>
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} /> */}
              {/* <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} /> */}
            </div>
          </div>
          <div className="Card-header-addicon pb-0">
            <div className="card-header-actions">
              {/* <img style={{ height: '23px', width: '23px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} /> */}
              <a className="card-header-action">
                <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
              </a>
              <img style={{ height: '23px', width: '23px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
              {/* <span className="card-header-action">
                {this.state.datasetId != "" && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} ><i className="fa fa-plus-square" style={{ fontSize: '20px' }} onClick={() => this.buildDataJexcel(0)}></i></a>}</span> */}

              {/* <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} /> */}
            </div>
          </div>

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
                            // onChange={this.filterVersion}
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
                      <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                      <div className="controls edit">
                        <Picker
                          ref="pickAMonth2"
                          years={{ min: this.state.minDate, max: this.state.maxDate }}
                          value={this.state.singleValue2}
                          key={JSON.stringify(this.state.singleValue2)}
                          lang={pickerLang}
                          onChange={this.handleAMonthChange2}
                          onDismiss={this.handleAMonthDissmis2}
                        //theme="light"
                        // onChange={this.handleRangeChange}
                        // onDismiss={this.handleRangeDissmis}
                        >
                          <MonthBox value={makeText(this.state.singleValue2.from) + ' ~ ' + makeText(this.state.singleValue2.to)} onClick={this.handleClickMonthBox2} />
                        </Picker>
                      </div>
                    </FormGroup>

                  </div>
                  <div className="row">
                    <FormGroup className="tab-ml-0 mb-md-3 ml-3">
                      <Col md="12" >
                        <Input className="form-check-input" type="checkbox" id="checkbox1" name="checkbox1" value={this.state.showInPlanningUnit} onChange={(e) => this.setShowInPlanningUnits(e)} />
                        <Label check className="form-check-label" htmlFor="checkbox1">{i18n.t('static.dataentry.showInPlanningUnits')}</Label>
                      </Col>
                    </FormGroup>
                  </div>
                </div>
              </Form>
              <div style={{ display: this.state.loading ? "none" : "block" }}>
                {this.state.showSmallTable &&
                  <div className="row">
                    <div className="col-md-12">
                      <div className="table-scroll">
                        <div className="table-wrap DataEntryTable table-responsive">
                          <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" options={this.options}>
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
                                        // item.consumptionDataType == 1 ? getLabelText(item.planningUnit.forecastingUnit.label, this.state.lang) : item.consumptionDataType == 2 ? getLabelText(item.planningUnit.label, this.state.lang) : getLabelText(item.otherUnit.label, this.state.lang)
                                      }</td>
                                    {this.state.monthArray.map((item1, count) => {
                                      var data = this.state.planningUnitTotalList.filter(c => c.planningUnitId == item.planningUnit.id && moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                                      total += Number(data[0].qty);
                                      totalPU += Number(data[0].qtyInPU);
                                      return (<td style={{ backgroundColor: (this.state.showInPlanningUnit ? data[0].qtyInPU : data[0].qty) === "" ? 'yellow' : 'transparent' }} onClick={() => { this.buildDataJexcel(item.planningUnit.id, 0) }}><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.showInPlanningUnit ? data[0].qtyInPU : data[0].qty} /></td>)
                                    })}
                                    <td><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.showInPlanningUnit ? this.state.planningUnitTotalList.filter(c => c.planningUnitId == item.planningUnit.id && c.qty !== "").length > 0 ? Math.round(totalPU) : "" : this.state.planningUnitTotalList.filter(c => c.planningUnitId == item.planningUnit.id && c.qty !== "").length > 0 ? Math.round(total) : ""} /></td>
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
                                        return (<td onClick={() => { this.buildDataJexcel(item.planningUnit.id, 0) }} style={{ backgroundColor: (this.state.showInPlanningUnit ? data[0].qtyInPU : data[0].qty) === "" ? 'yellow' : 'transparent' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.showInPlanningUnit ? data[0].qtyInPU : data[0].qty} /></td>)
                                      })}
                                      <td><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.showInPlanningUnit ? (this.state.planningUnitTotalListRegion.filter(c => c.planningUnitId == item.planningUnit.id && c.region.regionId == r.regionId && c.qty !== "").length > 0 ? Math.round(totalRegionPU) : "") : (this.state.planningUnitTotalListRegion.filter(c => c.planningUnitId == item.planningUnit.id && c.region.regionId == r.regionId && c.qty !== "").length > 0 ? Math.round(totalRegion) : "")} /></td>
                                      <td>{this.state.showInPlanningUnit ? (this.state.planningUnitTotalListRegion.filter(c => c.planningUnitId == item.planningUnit.id && c.region.regionId == r.regionId && c.qty !== "").length > 0 ? (totalPU == 0 ? 100 : Math.round((totalRegionPU / totalPU) * 100)) : "") : (this.state.planningUnitTotalListRegion.filter(c => c.planningUnitId == item.planningUnit.id && c.region.regionId == r.regionId && c.qty !== "").length > 0 ? (total == 0 ? 100 : Math.round((totalRegion / total) * 100)) : "")}</td>
                                    </tr>)
                                  })}
                                </>)
                              }
                              )}

                            </tbody>
                          </Table>
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
                                <a className="card-header-action">
                                  {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_CONSUMPTION_DATA_ENTRY_ADJUSTMENT') && <span style={{ cursor: 'pointer' }} className="hoverDiv" onClick={() => { this.changeUnit(this.state.selectedConsumptionUnitId) }}>({i18n.t('static.dataentry.change')})</span>}
                                </a>
                              </Label><br />
                              <Label htmlFor="appendedInputButton">{i18n.t('static.dataentry.conversionToPu')}: <b>{this.state.tempConsumptionUnitObject.consumptionDataType == 1 ? Number(1 / this.state.tempConsumptionUnitObject.planningUnit.multiplier).toFixed(4) : this.state.tempConsumptionUnitObject.consumptionDataType == 2 ? 1 : Number(1 / this.state.tempConsumptionUnitObject.planningUnit.multiplier * this.state.tempConsumptionUnitObject.otherUnit.multiplier).toFixed(4)}</b>
                              </Label>

                            </FormGroup></>}
                        <FormGroup className="col-md-4" style={{ display: this.state.showDetailTable ? 'block' : 'none' }}>
                          <Label htmlFor="appendedInputButton">{i18n.t('static.dataentry.consumptionNotes')}</Label>
                          <div className="controls ">
                            <InputGroup>
                              <Input
                                type="textarea"
                                name="consumptionNotes"
                                id="consumptionNotes"
                                bsSize="sm"
                                readOnly={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_CONSUMPTION_DATA_ENTRY_ADJUSTMENT') ? false : true}
                                onChange={(e) => this.setState({ consumptionChanged: true })}
                              >
                              </Input>
                            </InputGroup>
                          </div>
                        </FormGroup>
                        <FormGroup className="col-md-4" style={{ paddingTop: '30px', display: this.state.showDetailTable ? 'block' : 'none' }}>
                          {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_CONSUMPTION_DATA_ENTRY_ADJUSTMENT') && <Button type="button" id="formSubmitButton" size="md" color="success" className="float-right mr-1" onClick={() => this.interpolationMissingActualConsumption()}>
                            <i className="fa fa-check"></i>{i18n.t('static.pipeline.interpolateMissingValues')}</Button>}
                        </FormGroup>
                      </div>
                      {/* <div className="table-scroll">
                          <div className="table-wrap table-responsive">
                            <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" options={this.options}>
                              <tbody>
                                {this.state.consumptionUnitList.map(c => {
                                  return (<tr>
                                    <td>{this.state.selectedConsumptionUnitId != 0 ? <input type="radio" id="dataType" name="dataType" checked={c.dataType == this.state.selectedConsumptionUnitId ? true : false} readOnly ></input> : <input type="radio" id="dataType" name="dataType" checked={c.dataType == this.state.selectedConsumptionUnitId ? true : false}></input>}</td>
                                    <td>{c.dataType == 1 ? "Forecasting Unit" : c.dataType == 2 ? "Planning Unit" : "Other"}</td>
                                    <td>{c.dataType == 1 ? getLabelText(c.forecastingUnit.label, this.state.lang) : c.dataType == 2 ? getLabelText(c.planningUnit.label, this.state.lang) : getLabelText(c.otherUnit.label, this.state.label)}</td>
                                    <td>{c.dataType == 1 ? c.forecastingUnit.multiplier : c.dataType == 2 ? c.planningUnit.multiplier : c.otherUnit.multiplier}</td>
                                  </tr>)
                                })}
                                {this.state.selectedConsumptionUnitId==0 && 
                                <tr></tr>
                              }
                              </tbody>
                              
                            </Table>
                          </div></div> */}
                      {/* </> */}

                      {/* <div className="row">
                        <div className="col-md-12 pl-2 pr-2">
                          <div id="smallTableDiv" className="dataentryTable">
                          </div>
                        </div>
                      </div> */}
                      {/* <br></br> */}
                      {/* <br></br> */}
                      <div className="row">
                        <div className="col-md-12 pl-2 pr-2 datdEntryRow">
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
                          <b>{i18n.t('static.dataentry.graphNotes')}</b>
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
              <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
              {this.state.consumptionChanged && <><Button type="button" id="formSubmitButton" size="md" color="success" className="float-right mr-1" onClick={() => this.saveConsumptionList()}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>&nbsp;</>}
              {this.state.showSmallTable && <> <Button type="button" id="dataCheck" size="md" color="info" className="float-right mr-1" onClick={() => this.openDataCheckModel()}><i className="fa fa-check"></i>{i18n.t('static.common.dataCheck')}</Button></>}
              &nbsp;
            </FormGroup>
          </CardFooter>
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

                      <li>{i18n.t('static.dataEntryAndAdjustments.Interpolating')}: {i18n.t('static.dataEntryAndAdjustments.ClickInterpolate')}  {i18n.t('static.dataEntryAndAdjustments.InterpolateForMonths')}
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
                  {/* <li>The detailed data table allows users to add, edit, adjust, or delete historical consumption records. 
                                   <ol type="a">
                                     <li><b>Interpolating missing values:</b> Click the green 'Interpolate' button above the top right corner of the unit table to search for periods where the consumption value is blank and replace them with an interpolated value. QAT interpolates by finding the nearest values on either side (before or after the blank), calculates the straight line in between them and uses that straight-line formula to calculate the value for the blank(s).  Note that QAT will not interpolate for months where actual consumption is zero. QAT will only interpolate if there is at least one data point before and one data point after the blank <br></br>value(s).
                                     Mathematically:<br></br>
                                    Where x's represent months, and y's represent actual consumption,<br></br>
                                    Where known data values are (x0 , y0) and (x1 , y1)<br></br>
                                    Where any unknown data values are (x, y)<br></br>
                                    The formula for the interpolated line is<br></br>
                                    <span><img className="formula-img-mr img-fluid mb-lg-0" src={dataentryScreenshot1} style={{border:'1px solid #fff',width:'250px'}}/></span><br></br>
                                    <span><img className="formula-img-mr img-fluid mb-lg-0 mt-lg-0" src={dataentryScreenshot2} style={{border:'1px solid #fff',width:'250px'}}/></span>

                                     </li>
                                     <li><b>Adjust for under-reporting:</b> The default value is 100% reporting every month. The user can change this to the correct value. QAT will calculate the adjusted consumption due to underreporting using the formula below. </li>
                                     <li><b>Adjust for stock outs:</b> For imported data, the number of stock out days is pulled in from the QAT supply plan program, if data is collected. The default value for stock out days is zero days (product assumed always in stock). The user can change this to the correct value. The default value for number of days in a month are based on the calendar days, but users can adjust the number of days used for the stock out calculation in '<a href="/#/Extrapolation/extrapolateData" target="_blank" style={{textDecoration:'underline'}}>Update Version Settings</a>'.</li><br></br>
                                     <p>
                                      <span style={{fontStyle:'italic'}}><b>Stock Out Rate</b> = Stocked Out (days)/ (# of Days in Month).</span><br></br>
                                      <span style={{fontStyle:'italic'}}><b> Adjusted Consumption</b> = Actual Consumption / Reporting Rate / (1 - Stock Out Rate)</span></p>
                                      <p>
                                      For example, if for a given month, a product had a consumption of 1,000 units, was out-of-stock for 5 out of 31 days in the month and the reporting rate was 98%:<br></br>
                                      Stock Out Rate = 5 days stocked out /31 days in a month = 16.1%.<br></br>
                                      Adjusted Consumption = 1,000 units / 98% Reporting / (1 - 16.1%) = 1,217

                                 </p>
                                 <li>Use the graph below the Detailed Data table to view the adjusted data</li>
                                
                                   </ol>
                                   </li>
                                */}
                  <li>{i18n.t('static.dataEntryAndAdjustments.ClickSubmit')} </li>
                  <li>{i18n.t('static.dataEntryAndAdjustments.RepeatSteps')}

                    {/* <span><img className="formula-img-mr img-fluid mb-lg-0 mt-lg-0" src={dataentryScreenshot3} style={{border:'1px solid #fff'}}/></span> */}
                  </li>


                </ol>
              </p>
              {/* <p>Methods are organized from simple to robust

                More sophisticated models are more sensitive to problems in the data

                If you have poorer data (missing data points, variable reporting rates, less than 12 months of data), use simpler forecast methods
              </p> */}
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
            // initialValues={initialValues}
            enableReinitialize={true}
            // initialValues={{
            //   otherUnitMultiplier: this.state.selectedPlanningUnitMultiplier,
            //   otherUnitName: this.state.otherUnitName
            // }}
            // validate={validate(validationSchema)}
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
                  {/* <CardBody style={{ display: this.state.loading ? "none" : "block" }}> */}
                  <ModalBody>
                    <div className="dataEnteredTable">
                      <div id="mapPlanningUnit">
                      </div>
                    </div>
                    <Label id="dataEnteredInTableExLabel" style={{ display: "none" }} htmlFor="appendedInputButton">{i18n.t('static.dataentry.dataEnteredInTableEx')} <NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.dataEnteredInTableExSpan} /> {i18n.t('static.common.planningUnits')}
                    </Label>
                  </ModalBody>
                  <ModalFooter>
                    <Button type="submit" size="md" onClick={(e) => { this.touchAll(setTouched, errors) }} color="success" className="submitBtn float-right mr-1"> <i className="fa fa-check"></i>Submit</Button>
                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ toggleDataChangeForSmallTable: false })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                  </ModalFooter>
                  {/* </CardBody> */}
                </Form>
              )
            }
          />
          {/* </div> */}
        </Modal>
      </div >
    );
  }

  openDataCheckModel() {
    this.setState({
      toggleDataCheck: !this.state.toggleDataCheck
    }, () => {
      if (this.state.toggleDataCheck) {
        this.calculateData();
      }
    })
  }

  setOtherUnitName(e) {
    this.setState({
      otherUnitName: e.target.value,
    })
  }

  calculateData() {
    this.setState({ loading: true })
    var datasetJson = this.state.datasetJson;
    var startDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
    var stopDate = moment(Date.now()).format("YYYY-MM-DD");

    var consumptionList = datasetJson.actualConsumptionList;
    var datasetPlanningUnit = datasetJson.planningUnitList.filter(c => c.consuptionForecast);
    var datasetRegionList = datasetJson.regionList;
    var missingMonthList = [];

    //Consumption : planning unit less 24 month
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

        //Consumption : missing months
        var consumptionListFilteredForMonth = consumptionList.filter(c => c.planningUnit.id == puId && c.region.id == regionId);
        let actualMin = moment.min(consumptionListFilteredForMonth.map(d => moment(d.month)));
        curDate = moment(actualMin).format("YYYY-MM");
        for (var i = 0; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); i++) {
          // var consumptionListFilteredForMonth = consumptionList.filter(c => c.planningUnit.id == puId && c.region.id == regionId);
          // let actualMin = moment.min(consumptionListFilteredForMonth.map(d => moment(d.month)));
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

  submitChangedUnit(consumptionUnitId) {
    var elInstance = this.state.dataEl;
    var elInstance1 = this.state.jexcelDataEl;
    var consumptionUnitTemp = {};
    consumptionUnitTemp = this.state.selectedConsumptionUnitObject;
    var multiplier = 1;
    if (this.state.dataEnteredIn == 1) {
      multiplier = consumptionUnitTemp.planningUnit.multiplier;
      // changedConsumptionDataDesc = getLabelText(consumptionUnit.planningUnit.forecastingUnit.label, this.state.lang) + ' | ' + consumptionUnit.planningUnit.forecastingUnit.id;
    } else if (this.state.dataEnteredIn == 2) {
      multiplier = 1;
      // changedConsumptionDataDesc = getLabelText(consumptionUnit.planningUnit.label, this.state.lang) + ' | ' + consumptionUnit.planningUnit.id;;
    } else {
      multiplier = (1 / Number((elInstance1.D3).toString().replaceAll(",", ""))) * consumptionUnitTemp.planningUnit.multiplier;
      // multiplier = 1 / (document.getElementById('otherUnitMultiplier').value / consumptionUnitTemp.planningUnit.multiplier);

      // changedConsumptionDataDesc = getLabelText(consumptionUnit.otherUnit.label, this.state.lang);
    }
    console.log("test", multiplier, "======", Number((elInstance1.D3).toString().replaceAll(",", "")), "======", consumptionUnitTemp.planningUnit.multiplier)

    var consumptionUnitForUpdate = {};
    consumptionUnitForUpdate = {
      consumptionDataType: this.state.dataEnteredIn,
      planningUnit: consumptionUnitTemp.planningUnit,
      otherUnit: this.state.dataEnteredIn == 3 ? {
        label: {
          labelId: null,
          label_en: elInstance1.C3,
          // label_en: this.state.otherUnitName,
          label_fr: "",
          label_sp: "",
          label_pr: ""
        },
        // multiplier: this.state.selectedPlanningUnitMultiplier
        multiplier: Number((elInstance1.D3).toString().replaceAll(",", ""))

      } : null
    }
    this.setState({
      tempConsumptionUnitObject: consumptionUnitForUpdate,
      consumptionChanged: true,
      toggleDataChangeForSmallTable: false,
    }, () => {
      elInstance.setValueFromCoords(38, 0, multiplier, true);
    })
  }

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

  resetClicked() {
    this.buildDataJexcel(this.state.selectedConsumptionUnitId, 0)
  }

  changed = function (instance, cell, x, y, value) {
    // console.log("this.state.tempConsumptionUnitObject", this.el.getValueFromCoords(1, y))
    // console.log("start----", new Date())

    var elInstance = instance.jexcel;
    var rowData = elInstance.getRowData(y);

    var consumptionDataType = rowData[5];
    var cell1 = elInstance.getCell(`C1`)//other name
    var cell2 = elInstance.getCell(`C2`)//other name
    cell1.classList.add('readonly');
    cell2.classList.add('readonly');

    var cell1 = elInstance.getCell(`D1`)//other name
    var cell2 = elInstance.getCell(`D2`)//other multiplier
    cell1.classList.add('readonly');
    cell2.classList.add('readonly');

    if (consumptionDataType == 3) {// grade out
      var cell1 = elInstance.getCell(`C3`)//other name
      var cell2 = elInstance.getCell(`D3`)//other multiplier
      cell1.classList.remove('readonly');
      cell2.classList.remove('readonly');
      document.getElementById("dataEnteredInTableExLabel").style.display = "block";
      // document.getElementById("dataEnteredInTableExSpan").innerHTML = Math.round(1 / this.state.selectedConsumptionUnitObject.planningUnit.multiplier * Number(rowData[3].toString().replaceAll(',', '')) * 1000);
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
      // console.log("consumptionDataType", consumptionDataType)
      var cell1 = elInstance.getCell(`C3`)//other name
      var cell2 = elInstance.getCell(`D3`)//other multiplier
      cell1.classList.add('readonly');
      cell2.classList.add('readonly');
      document.getElementById("dataEnteredInTableExLabel").style.display = "none";
    }
    this.setState({
      dataEnteredIn: consumptionDataType,
      // showOtherUnitNameField: value == "3" ? true : false,
      selectedPlanningUnitMultiplier: consumptionDataType == 1 ? 1 : consumptionDataType == 2 ? this.state.tempConsumptionUnitObject.planningUnit.multiplier : this.state.tempConsumptionUnitObject.otherUnit != null ? this.state.tempConsumptionUnitObject.otherUnit.multiplier : "",
      otherUnitName: consumptionDataType == 3 && this.state.tempConsumptionUnitObject.otherUnit != null ? this.state.tempConsumptionUnitObject.otherUnit.label.label_en : ""
    })
    // console.log("stop----", new Date())

  }

  buildJexcel() {
    var data = [];
    let dataArray1 = [];

    if (this.state.selectedConsumptionUnitId != 0) {
      var data = [];

      data[0] = this.state.tempConsumptionUnitObject.consumptionDataType == 2 ? true : false;
      data[1] = 'Planning Unit';
      data[2] = getLabelText(this.state.selectedConsumptionUnitObject.planningUnit.label, this.state.lang);
      data[3] = this.state.selectedConsumptionUnitObject.planningUnit.multiplier;
      data[4] = Number(1).toFixed(4);
      data[5] = 2

      dataArray1.push(data);
      data = [];
      data[0] = this.state.tempConsumptionUnitObject.consumptionDataType == 1 ? true : false;
      data[1] = 'Forecasting Unit';
      data[2] = getLabelText(this.state.selectedConsumptionUnitObject.planningUnit.forecastingUnit.label, this.state.lang);
      data[3] = 1;
      data[4] = Number(1 / this.state.selectedConsumptionUnitObject.planningUnit.multiplier).toFixed(4);
      data[5] = 1
      dataArray1.push(data);
      data = [];
      data[0] = this.state.tempConsumptionUnitObject.consumptionDataType == 3 ? true : false;
      data[1] = 'Other Unit';
      data[2] = this.state.tempConsumptionUnitObject.consumptionDataType == 3 ? this.state.otherUnitName : "";
      data[3] = this.state.tempConsumptionUnitObject.consumptionDataType == 3 ? this.state.selectedPlanningUnitMultiplier : "";
      data[4] = `=ROUND(1/D1*ROUND(D3,4),4)`;
      data[5] = 3
      dataArray1.push(data);
    }

    this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
    // this.el.destroy();
    jexcel.destroy(document.getElementById("mapPlanningUnit"), true);

    var data = dataArray1;
    var options = {
      data: data,
      columnDrag: true,
      colWidths: [20, 100, 200, 50, 50, 50],
      columns: [
        { title: ' ', type: 'radio' },//0 A
        { title: ' ', type: 'text', readOnly: true },//1 B
        { title: ' ', type: 'text', textEditor: true },//2 C
        { title: i18n.t('static.dataentry.conversionToFu'), type: 'numeric', mask: '#,##.00', decimal: '.', textEditor: true },//3 D
        { title: i18n.t('static.dataentry.conversionToPu'), type: 'numeric', decimal: '.', readOnly: true },//4 E
        { title: 'Conversion Type', type: 'hidden' }//5 F
      ],
      // text: {
      //   // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
      //   showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
      //   show: '',
      //   entries: '',
      // },
      editable: true,
      updateTable: function (el, cell, x, y, source, value, id) {
      },
      onload: this.loadedJexcel,
      onchange: this.changed,
      pagination: false,
      search: false,
      columnSorting: false,
      // tableOverflow: true,
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
      freezeColumns: 1,
      license: JEXCEL_PRO_KEY,
      parseFormulas: true,
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