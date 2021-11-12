import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import React from "react";
import { Bar, Line, Pie } from 'react-chartjs-2';
import ReactDOM from 'react-dom';
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png'
import {
  Card, CardBody,
  Label, Input, FormGroup, Table,
  CardFooter, Button, Col, Form, InputGroup, Modal, ModalHeader, ModalFooter, ModalBody
} from 'reactstrap';
import { Prompt } from 'react-router'
import { Formik } from 'formik';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, DELIVERED_SHIPMENT_STATUS, ACTUAL_CONSUMPTION_TYPE, FORCASTED_CONSUMPTION_TYPE, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE, API_URL, polling } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import ConsumptionInSupplyPlanComponent from "../SupplyPlan/ConsumptionInSupplyPlan";
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import AuthenticationService from "../Common/AuthenticationService.js";
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import moment from "moment"
import { Online } from "react-detect-offline";
import { isSiteOnline } from "../../CommonComponent/JavascriptCommonFunctions.js";
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import jexcel from 'jexcel-pro';
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DATE_FORMAT_SM } from '../../Constants.js';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import bsCustomFileInput from 'bs-custom-file-input'
import JSZip from 'jszip';
import { da } from 'date-fns/locale';

const entityname = i18n.t('static.consumption.consumptionDataEntryandAdjustment');

export default class ConsumptionDataEntryandAdjustment extends React.Component {

  constructor(props) {
    super(props);
    this.options = props.options;
    var startDate = moment(Date.now()).subtract(6, 'months').startOf('month').format("YYYY-MM-DD");
    var endDate = moment(Date.now()).add(18, 'months').startOf('month').format("YYYY-MM-DD")

    this.state = {

      loading: true,
      rangeValue: localStorage.getItem("sesRangeValue") != "" ? JSON.parse(localStorage.getItem("sesRangeValue")) : { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(endDate).getFullYear(), month: new Date(endDate).getMonth() + 1 } },
      minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
      maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
      message: '',
      lang: localStorage.getItem('lang'),
      dataList: [],
      dataList1: [],
      regionList: [],
      consumptionList: [],
      programList: [],
      datasetsLableList: [],
      datasetsLable: 2551,
      programId: '',
      showPlanningRegion: false,
    }
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeChange = this.handleRangeChange.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.pickRange = React.createRef();
    // this.importFile = this.importFile.bind(this);
    this.buildJExcel = this.buildJExcel.bind(this);
    this.getProgramDetails = this.getProgramDetails.bind(this);
    this.addMonths = this.addMonths.bind(this);
    this.toggleAccordionPlanningUnit = this.toggleAccordionPlanningUnit.bind(this);
    // this.buildSummaryJExcel = this.buildSummaryJExcel.bind(this);
  }
  componentDidMount() {
    bsCustomFileInput.init()
    this.setState({
      dataList: [{
        "type": "Days in Month", "monthjan": "31", "monthfeb": "28", "monthmar": "31",
        "monthapr": "30", "monthmay": "31", "monthjun": "30", "monthjul": "31", "monthaug": "31",
        "monthsep": "30", "monthoct": "31", "monthnov": "30", "monthdes": "31", "isgradeOut": "0"
      },
      {
        "type": "Region A", "monthjan": "", "monthfeb": "", "monthmar": "",
        "monthapr": "", "monthmay": "", "monthjun": "", "monthjul": "", "monthaug": "",
        "monthsep": "", "monthoct": "", "monthnov": "", "monthdes": "", "isgradeOut": "1"
      },
      {
        "type": "Actual Consumption", "monthjan": "", "monthfeb": "250", "monthmar": "195",
        "monthapr": "", "monthmay": "197", "monthjun": "500", "monthjul": "195", "monthaug": "192",
        "monthsep": "1", "monthoct": "199", "monthnov": "199", "monthdes": "199", "isgradeOut": "0"
      },
      {
        "type": "Reporting Rate (%)", "monthjan": "89%", "monthfeb": "91%", "monthmar": "93%",
        "monthapr": "99%", "monthmay": "97%", "monthjun": "100%", "monthjul": "98%", "monthaug": "97%",
        "monthsep": "98%", "monthoct": "100%", "monthnov": "98%", "monthdes": "90%", "isgradeOut": "0"
      },
      {
        "type": "Stockout Rate (days)", "monthjan": "1", "monthfeb": "0", "monthmar": "2",
        "monthapr": "0", "monthmay": "0", "monthjun": "2", "monthjul": "2", "monthaug": "0",
        "monthsep": "1", "monthoct": "1", "monthnov": "0", "monthdes": "0", "isgradeOut": "0"
      },
      {
        "type": "Stockout Rate (%)", "monthjan": "3%", "monthfeb": "0%", "monthmar": "6%",
        "monthapr": "0%", "monthmay": "0%", "monthjun": "7%", "monthjul": "6%", "monthaug": "0%",
        "monthsep": "3%", "monthoct": "3%", "monthnov": "0%", "monthdes": "0%", "isgradeOut": "0"
      },
      {
        "type": "Adjusted Consumption", "monthjan": "0", "monthfeb": "275", "monthmar": "224",
        "monthapr": "0", "monthmay": "203", "monthjun": "536", "monthjul": "213", "monthaug": "198",
        "monthsep": "1", "monthoct": "206", "monthnov": "203", "monthdes": "221", "isgradeOut": "0"
      },
      {
        "type": "Converted to Planning Unit", "monthjan": "0.00", "monthfeb": "274.73", "monthmar": "224.14",
        "monthapr": "0.00", "monthmay": "203.09", "monthjun": "535.71", "monthjul": "212.70", "monthaug": "197.94",
        "monthsep": "1.06", "monthoct": "205.63", "monthnov": "203.06", "monthdes": "221.11", "isgradeOut": "0"
      },
      {
        "type": "Region B", "monthjan": "", "monthfeb": "", "monthmar": "",
        "monthapr": "", "monthmay": "", "monthjun": "", "monthjul": "", "monthaug": "",
        "monthsep": "", "monthoct": "", "monthnov": "", "monthdes": "", "isgradeOut": "1"
      },
      {
        "type": "Actual Consumption", "monthjan": "18", "monthfeb": "19.8", "monthmar": "21.78",
        "monthapr": "23.95", "monthmay": "26.35", "monthjun": "28.98", "monthjul": "31.88", "monthaug": "35.07",
        "monthsep": "38.58", "monthoct": "42.44", "monthnov": "46.68", "monthdes": "51.35", "isgradeOut": "0"
      },
      {
        "type": "Reporting Rate (%)", "monthjan": "99%", "monthfeb": "91%", "monthmar": "93%",
        "monthapr": "99%", "monthmay": "97%", "monthjun": "100%", "monthjul": "98%", "monthaug": "97%",
        "monthsep": "98%", "monthoct": "92%", "monthnov": "98%", "monthdes": "90%", "isgradeOut": "0"
      },
      {
        "type": "Stockout Rate (days)", "monthjan": "1", "monthfeb": "0", "monthmar": "2",
        "monthapr": "0", "monthmay": "0", "monthjun": "2", "monthjul": "2", "monthaug": "0",
        "monthsep": "1", "monthoct": "1", "monthnov": "0", "monthdes": "0", "isgradeOut": "0"
      },
      {
        "type": "Stockout Rate (%)", "monthjan": "3%", "monthfeb": "0%", "monthmar": "6%",
        "monthapr": "0%", "monthmay": "0%", "monthjun": "7%", "monthjul": "6%", "monthaug": "0%",
        "monthsep": "3%", "monthoct": "3%", "monthnov": "0%", "monthdes": "0%", "isgradeOut": "0"
      },
      {
        "type": "Adjusted Consumption", "monthjan": "19", "monthfeb": "22", "monthmar": "25",
        "monthapr": "24", "monthmay": "27", "monthjun": "31", "monthjul": "35", "monthaug": "36",
        "monthsep": "41", "monthoct": "48", "monthnov": "48", "monthdes": "57", "isgradeOut": "0"
      },
      {
        "type": "Converted to Planning Unit", "monthjan": "18.79", "monthfeb": "21.76", "monthmar": "25.03",
        "monthapr": "24.20", "monthmay": "27.17", "monthjun": "31.06", "monthjul": "34.78", "monthaug": "36.16",
        "monthsep": "40.73", "monthoct": "47.67", "monthnov": "47.64", "monthdes": "57.06", "isgradeOut": "0"
      },
      {
        "type": "Region C", "monthjan": "", "monthfeb": "", "monthmar": "",
        "monthapr": "", "monthmay": "", "monthjun": "", "monthjul": "", "monthaug": "",
        "monthsep": "", "monthoct": "", "monthnov": "", "monthdes": "", "isgradeOut": "1"
      },
      {
        "type": "Actual Consumption", "monthjan": "59", "monthfeb": "47.2", "monthmar": "37.76",
        "monthapr": "30.20", "monthmay": "24.16", "monthjun": "19.33", "monthjul": "15.46", "monthaug": "12.37",
        "monthsep": "9.89", "monthoct": "7.91", "monthnov": "6.33", "monthdes": "5.06", "isgradeOut": "0"
      },
      {
        "type": "Reporting Rate (%)", "monthjan": "99%", "monthfeb": "91%", "monthmar": "93%",
        "monthapr": "99%", "monthmay": "97%", "monthjun": "100%", "monthjul": "98%", "monthaug": "97%",
        "monthsep": "98%", "monthoct": "92%", "monthnov": "98%", "monthdes": "90%", "isgradeOut": "0"
      },
      {
        "type": "Stockout Rate (days)", "monthjan": "1", "monthfeb": "0", "monthmar": "2",
        "monthapr": "0", "monthmay": "0", "monthjun": "2", "monthjul": "2", "monthaug": "0",
        "monthsep": "1", "monthoct": "1", "monthnov": "0", "monthdes": "0", "isgradeOut": "0"
      },
      {
        "type": "Stockout Rate (%)", "monthjan": "3%", "monthfeb": "0%", "monthmar": "6%",
        "monthapr": "0%", "monthmay": "0%", "monthjun": "7%", "monthjul": "6%", "monthaug": "0%",
        "monthsep": "3%", "monthoct": "3%", "monthnov": "0%", "monthdes": "0%", "isgradeOut": "0"
      },
      {
        "type": "Adjusted Consumption", "monthjan": "62", "monthfeb": "52", "monthmar": "42",
        "monthapr": "31", "monthmay": "70", "monthjun": "21", "monthjul": "17", "monthaug": "13",
        "monthsep": "10", "monthoct": "9", "monthnov": "6", "monthdes": "6", "isgradeOut": "0"
      },
      {
        "type": "Converted to Planning Unit", "monthjan": "61.58", "monthfeb": "51.87", "monthmar": "43.40",
        "monthapr": "30.51", "monthmay": "70.00", "monthjun": "20.71", "monthjul": "16.87", "monthaug": "12.76",
        "monthsep": "10.45", "monthoct": "8.89", "monthnov": "6.46", "monthdes": "5.63", "isgradeOut": "0"
      },],

      dataList1: [{
        "type": "Planning Unit 1", "monthjan": "77", "monthfeb": "298", "monthmar": "293",
        "monthapr": "55", "monthmay": "300", "monthjun": "587", "monthjul": "264", "monthaug": "247",
        "monthsep": "52", "monthOct": "40", "monthNov": "70", "monthDec": "40"
      },
      {
        "type": "ARU 2", "monthjan": "30", "monthfeb": "20", "monthmar": "24",
        "monthapr": "35", "monthmay": "27", "monthjun": "23", "monthjul": "21", "monthaug": "26",
        "monthsep": "40", "monthOct": "38", "monthNov": "48", "monthDec": "31"
      },
      {
        "type": "Forecasting Unit 3", "monthjan": "25", "monthfeb": "22", "monthmar": "20",
        "monthapr": "20", "monthmay": "20", "monthjun": "29", "monthjul": "20", "monthaug": "24",
        "monthsep": "39", "monthOct": "46", "monthNov": "68", "monthDec": "27"
      }],

      programList: [
        { "id": "1", "name": "TZA - PRH/CON" },
        { "id": "2", "name": "ZMB - ARV" },
        { "id": "2", "name": "Botswana ARV/RTK" }
      ],
    },
      () => {
        // this.filterData();
        // this.buildSummaryJExcel();
        this.getDataSetList();
      })


  }
  handleRangeChange(value, text, listIndex) {
    //
  }

  handleRangeDissmis(value) {
    var cont = false;
  }

  loaded = function (instance, cell, x, y, value) {
    jExcelLoadedFunction(instance, 1);
  }
  loadedSummary = function (instance, cell, x, y, value) {
    jExcelLoadedFunction(instance);
  }
  getProgramDetails() {
    let programId = this.state.datasetsLableList;
    let datasetJson = this.state.datasetJson;
    let startDate = datasetJson.currentVersion.forecastStartDate;
    let stopDate = datasetJson.currentVersion.forecastStopDate;

    let startDateSplit = startDate.split('-');
    let stopDateSplit = stopDate.split('-');

    let newStartDate = startDateSplit[0] - 3 + '-' + startDateSplit[1] + '-' + startDateSplit[2];
    let forecastStopDate = new Date(startDate);
    forecastStopDate.setMonth(forecastStopDate.getMonth() - 1);
    let newStopDate = forecastStopDate.getFullYear() + '-' + (forecastStopDate.getMonth() + 1) + '-' + '01';

    console.log("datasetJson", newStartDate + "-----" + newStopDate);

    var resultList = [];
    var date = new Date(newStartDate);
    var endDate = new Date(newStopDate);
    var monthNameList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    while (date.getTime() <= endDate.getTime()) {
      var stringDate = monthNameList[date.getMonth()] + " " + date.getFullYear();
      resultList.push(stringDate);
      date = this.addMonths(date, 1);
    }

    this.setState({
      month: resultList
    }, () => {
      this.buildJExcel();
    });
    console.log("datasetJson", resultList);

  }
  addMonths(date, months) {
    var d = date.getDate();
    date.setMonth(date.getMonth() + +months);
    if (date.getDate() != d) {
      date.setDate(0);
    }
    return date;
  }

  getDataSetList() {
    console.log("inside getDataSetList");
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
      this.setState({
        message: i18n.t('static.program.errortext'),
        color: 'red'
      })
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['datasetData'], 'readwrite');
      var datasetData = transaction.objectStore('datasetData');
      var getRequest = datasetData.getAll();
      var proList = []
      getRequest.onerror = function (event) {
        this.setState({
          message: i18n.t('static.program.errortext'),
          color: 'red'
        })

      }.bind(this);
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        for (var i = 0; i < myResult.length; i++) {
          var programData = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
          var datasetData = programData.toString(CryptoJS.enc.Utf8);
          var datasetJson = JSON.parse(datasetData);
          console.log("datasetJson", datasetJson);
          var programJson =
          {
            label: datasetJson.programCode,
            value: datasetJson.programId
          }
          proList.push(programJson);
          var regionListJson = datasetJson.regionList;
          var consumptionListJson = datasetJson.consumptionList;
          console.log("proList", proList);
          console.log("regionListJson", regionListJson);
          console.log("consumptionListJson", consumptionListJson);

        }
        console.log("proListdfgdfgfdg", proList);
        this.setState({
          datasetsLableList: proList,
          regionList: regionListJson,
          consumptionList: consumptionListJson,
          datasetJson: datasetJson
        }, () => {
          this.getProgramDetails();
        });

      }.bind(this)
    }.bind(this)
  };

  buildConsumptionList() {
    let consumptionList = this.state.consumptionList;
    for (var j = 0; j < consumptionList.length; j++) {
      var s = consumptionList[j].month;
      var month = new Date(s).getMonth();
      var type, monthjanactualConsumption, monthjanreportingRate, monthjanstockOutrateP, monthjanstockOutrate, monthJanAdjustedConsumption,
        monthjanconvertedPU,


        monthfeb, monthmar, monthapr, monthmay, monthjun, monthjul, monthaug, monthsep,
        monthoct, monthnov, monthdes, isgradeOut;
      if (month == 1) {
        monthjanactualConsumption = consumptionList[j].actualConsumption;
        monthjanreportingRate = consumptionList[j].reportingRate;
        monthjanstockOutrate = consumptionList[j].daysOfStockOut;
        // monthJanAdjustedConsumption=
      }

    }
  };
  buildJExcel() {
    console.log("Inside Build Jexcel");
    let dataList = this.state.dataList;
    let monthDisplay = this.state.month;
    let dataListArray = [];
    let count = 0;

    // for (var j = 0; j < dataList.length; j++) {
    //   data = [];
    //   data[0] = dataList[j].type;
    //   data[1] = dataList[j].monthjan;
    //   data[2] = dataList[j].monthfeb;
    //   data[3] = dataList[j].monthmar;
    //   data[4] = dataList[j].monthapr;
    //   data[5] = dataList[j].monthmay;
    //   data[6] = dataList[j].monthjun;
    //   data[7] = dataList[j].monthjul;
    //   data[8] = dataList[j].monthaug;
    //   data[9] = dataList[j].monthsep;
    //   data[10] = dataList[j].monthoct;
    //   data[11] = dataList[j].monthnov;
    //   data[12] = dataList[j].monthdes;
    //   data[13] = dataList[j].isgradeOut;
    //   dataListArray[count] = data;
    //   count++;
    // }
    for (let x = 0; x < 5; x++) {
      let data = [];
      data[0] = 'Product'
      for (var i = 0; i < monthDisplay.length; i++) {

        data[i + 1] = monthDisplay[i]
        dataListArray[x] = data;
      }
    }

    // dataListArray[0] = tempColumn;
    // dataListArray[1] = data;

    this.el = jexcel(document.getElementById("leftAlignAdjustedJexcel"), '');
    this.el.destroy();
    var json = [];
    // var data = dataListArray;
    let tempColumn = [monthDisplay.length + 1];
    tempColumn[0] = {
      title: ' Product', //A
      type: 'text',
      readOnly: true
    };

    for (var i = 0; i < monthDisplay.length; i++) {
      tempColumn[i + 1] = {
        title: monthDisplay[i], //A
        type: 'text',
        readOnly: true
      }
    }



    var options = {
      Headers: "Details ",
      data: dataListArray,
      columnDrag: true,
      colWidths: [200],
      colHeaderClasses: ["Reqasterisk"],
      columns:
        tempColumn,

      // updateTable: function (el, cell, x, y, source, value, id) {
      //   if (y != null) {
      //     var elInstance = el.jexcel;
      //     var rowData = elInstance.getRowData(y);
      //     var addRowId = rowData[13];
      //     console.log("addRowId------>", addRowId);
      //     if (addRowId == '1') {//active grade out
      //       var cell1 = elInstance.getCell(`A${parseInt(y) + 1}`)
      //       cell1.classList.add('readonly');
      //       var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
      //       cell1.classList.add('readonly');
      //       var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
      //       cell1.classList.add('readonly');
      //       var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
      //       cell1.classList.add('readonly');
      //       var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
      //       cell1.classList.add('readonly');
      //       var cell1 = elInstance.getCell(`F${parseInt(y) + 1}`)
      //       cell1.classList.add('readonly');
      //       var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
      //       cell1.classList.add('readonly');
      //       var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
      //       cell1.classList.add('readonly');
      //       var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
      //       cell1.classList.add('readonly');
      //       var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
      //       cell1.classList.add('readonly');
      //       var cell1 = elInstance.getCell(`K${parseInt(y) + 1}`)
      //       cell1.classList.add('readonly');
      //       var cell1 = elInstance.getCell(`L${parseInt(y) + 1}`)
      //       cell1.classList.add('readonly');
      //       var cell1 = elInstance.getCell(`M${parseInt(y) + 1}`)
      //       cell1.classList.add('readonly');
      //     } else {
      //       var cell1 = elInstance.getCell(`A${parseInt(y) + 1}`)
      //       cell1.classList.remove('readonly');
      //       var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
      //       cell1.classList.remove('readonly');
      //       var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
      //       cell1.classList.remove('readonly');
      //       var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
      //       cell1.classList.remove('readonly');
      //       var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
      //       cell1.classList.remove('readonly');
      //       var cell1 = elInstance.getCell(`F${parseInt(y) + 1}`)
      //       cell1.classList.remove('readonly');
      //       var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
      //       cell1.classList.remove('readonly');
      //       var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
      //       cell1.classList.remove('readonly');
      //       var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
      //       cell1.classList.remove('readonly');
      //       var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
      //       cell1.classList.remove('readonly');
      //       var cell1 = elInstance.getCell(`K${parseInt(y) + 1}`)
      //       cell1.classList.remove('readonly');
      //       var cell1 = elInstance.getCell(`L${parseInt(y) + 1}`)
      //       cell1.classList.remove('readonly');
      //       var cell1 = elInstance.getCell(`M${parseInt(y) + 1}`)
      //       cell1.classList.remove('readonly');
      //     }
      //   }
      // },
      text: {
        // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
        // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
        show: '',
        entries: '',
      },
      // onload: this.loaded,
      // pagination: false,
      // search: true,
      columnSorting: true,
      // tableOverflow: true,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      onselection: this.selected,
      oneditionend: this.onedit,
      copyCompatibility: true,
      allowExport: false,
      // paginationOptions: JEXCEL_PAGINATION_OPTION,
      position: 'top',
      // filters: true,
      license: JEXCEL_PRO_KEY,
      contextMenu: function (obj, x, y, e) {
        return [];
      }.bind(this),
    };
    var countryEl = jexcel(document.getElementById("leftAlignAdjustedJexcel"), options);
    this.el = countryEl;
    this.setState({
      countryEl: countryEl, loading: false
    })
    // this.buildSummaryJExcel();
  }

  selected = function (instance, cell, x, y, value) {

    if ((x == 0 && value != 0) || (y == 0)) {
      // console.log("HEADER SELECTION--------------------------");
    } else {
      document.getElementById("canvas-graph").style = { display: "block" }
      document.getElementById("extraploation").style = { display: "block" }
      document.getElementById("conversionTable").style = { display: "block" }
    }
  }.bind(this);


  toggleAccordionPlanningUnit() {
    this.setState({
      showPlanningRegion: !this.state.showPlanningRegion
    })
    var fields = document.getElementsByClassName("displayregion");
    for (var i = 0; i < fields.length; i++) {
      if (!this.state.showPlanningRegion == true) {
        fields[i].style.display = "";
      } else {
        fields[i].style.display = "none";
      }
    }
  }



  // buildSummaryJExcel() {
  //   console.log("Inside Build Jexcel");
  //   let dataList = this.state.dataList1;
  //   let dataListArray = [];
  //   let count = 0;

  //   for (var j = 0; j < dataList.length; j++) {
  //     data = [];
  //     data[0] = dataList[j].type;
  //     data[1] = dataList[j].monthjan;
  //     data[2] = dataList[j].monthfeb;
  //     data[3] = dataList[j].monthmar;
  //     data[4] = dataList[j].monthapr;
  //     data[5] = dataList[j].monthmay;
  //     data[6] = dataList[j].monthjun;
  //     data[7] = dataList[j].monthjul;
  //     data[8] = dataList[j].monthaug;
  //     data[9] = dataList[j].monthsep;
  //     data[10] = dataList[j].monthOct;
  //     data[11] = dataList[j].monthNov;
  //     data[12] = dataList[j].monthDec;
  //     dataListArray[count] = data;
  //     count++;
  //   }
  //   this.el = jexcel(document.getElementById("tableSummaryDiv"), '');
  //   this.el.destroy();
  //   var json = [];
  //   var data = dataListArray;

  //   var options = {
  //     data: data,
  //     columnDrag: true,
  //     colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
  //     colHeaderClasses: ["Reqasterisk"],
  //     columns: [
  //       {
  //         title: 'Product',
  //         type: 'text',
  //         readOnly: true
  //       },
  //       {
  //         title: 'Jan-21',
  //         type: 'text',
  //         readOnly: true
  //       },
  //       {
  //         title: 'Feb-21',
  //         type: 'text',
  //         readOnly: true
  //       },
  //       {
  //         title: 'Mar-21',
  //         type: 'text',
  //         readOnly: true
  //       },
  //       {
  //         title: 'Apr-21',
  //         type: 'text',
  //         readOnly: true
  //       },
  //       {
  //         title: 'May-21',
  //         type: 'text',
  //         readOnly: true
  //       },
  //       {
  //         title: 'June-21',
  //         type: 'text',
  //         readOnly: true
  //       },
  //       {
  //         title: 'Jul-21',
  //         type: 'text',
  //         readOnly: true
  //       },
  //       {
  //         title: 'Aug-21',
  //         type: 'text',
  //         readOnly: true
  //       },
  //       {
  //         title: 'Sep-21',
  //         type: 'text',
  //         readOnly: true
  //       },
  //       {
  //         title: 'Oct-21',
  //         type: 'text',
  //         readOnly: true
  //       },
  //       {
  //         title: 'Nov-21',
  //         type: 'text',
  //         readOnly: true
  //       },
  //       {
  //         title: 'Dec-21',
  //         type: 'text',
  //         readOnly: true
  //       }
  //     ],
  //     //   updateTable: function (el, cell, x, y, source, value, id) {
  //     //     if (y != null) {
  //     //         var elInstance = el.jexcel;
  //     //         var rowData = elInstance.getRowData(y);
  //     //         var addRowId = rowData[1];
  //     //         console.log("addRowId------>", addRowId);
  //     //         if (addRowId == 'RegionA') {//active grade out
  //     //             var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
  //     //             cell1.classList.add('readonly');
  //     //         } else {
  //     //             var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
  //     //             cell1.classList.add('readonly');
  //     //         }
  //     //     }
  //     // },

  //     text: {
  //       // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
  //       // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
  //       show: '',
  //       entries: '',
  //     },
  //     onload: this.loadedSummary,
  //     pagination: localStorage.getItem("sesRecordCount"),
  //     search: true,
  //     columnSorting: true,
  //     // tableOverflow: true,
  //     wordWrap: true,
  //     allowInsertColumn: false,
  //     allowManualInsertColumn: false,
  //     allowDeleteRow: false,
  //     onselection: this.selected,
  //     oneditionend: this.onedit,
  //     copyCompatibility: true,
  //     allowExport: false,
  //     paginationOptions: JEXCEL_PAGINATION_OPTION,
  //     position: 'top',
  //     filters: true,
  //     license: JEXCEL_PRO_KEY,
  //     contextMenu: function (obj, x, y, e) {
  //       return [];
  //     }.bind(this),
  //   };
  //   var countryEl = jexcel(document.getElementById("tableSummaryDiv"), options);
  //   this.el = countryEl;
  //   this.setState({
  //     countryEl: countryEl, loading: false
  //   })
  // }

  // selected = function (instance, cell, x, y, value) {

  //   if ((x == 0 && value != 0) || (y == 0)) {
  //     // console.log("HEADER SELECTION--------------------------");
  //   } else {
  //     this.buildJExcel()
  //     document.getElementById("canvas-graph").style = { display: "block" }
  //     document.getElementById("extraploation").style = { display: "block" }
  //     document.getElementById("conversionTable").style = { display: "block" }
  //   }
  // }.bind(this);


  render() {
    const state = {
      labels: ['Jan-21', 'Feb-21', 'Mar-21',
        'Apr-21', 'May-21', 'Jun-21', 'Jul-21', 'Aug-21', 'Sept-21', 'Oct-21', 'Nov-21', 'Dec-21'],
      datasets: [
        {
          label: 'RegionA',
          fill: false,
          lineTension: 0.5,
          backgroundColor: 'rgba(75,192,192,1)',
          borderColor: '#002F6C',
          //borderWidth: 2,
          data: [0.00, 274.73, 224.14, 0.00, 203.09, 535.71, 212.70, 197.94, 1.06, 205.63, 203.06, 221.11]
        },
        {
          label: 'Region B',
          fill: false,
          lineTension: 0.5,
          backgroundColor: 'rgba(75,192,192,1)',
          borderColor: '#BA0C2F',
          // borderWidth: 2,
          data: [18.79, 21.76, 25.03, 24.20, 27.17, 31.06, 34.78, 36.16, 40.73, 47.67, 47.64, 57.06]
        }, {
          label: 'Region C',
          fill: false,
          //lineTension: 0.5,
          backgroundColor: 'rgba(75,192,192,1)',
          borderColor: '#212721',
          borderWidth: 2,
          data: [61.58, 51.87, 43.40, 30.51, 70.00, 20.71, 16.87, 12.76, 10.45, 8.89, 6.46, 5.63]
        }
      ]
    }

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
      <div className="animated fadeIn">
        <AuthenticationServiceComponent history={this.props.history} />
        <Card className="mt-2">
          <div className="Card-header-addicon problemListMarginTop">
            <div className="card-header-actions">
              <div className="card-header-action">
                <a className="card-header-action">
                  <span style={{ cursor: 'pointer' }}><small className="supplyplanformulas">{i18n.t('Show Guidance')}</small></span>
                </a>
                <img style={{ verticalAlign: 'bottom', height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title="Export CSV" /> &nbsp;
                &nbsp;&nbsp;
                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_PROBLEM') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} ><i className="fa fa-plus-square"></i></a>}
              </div>
            </div>
          </div>
          <Formik
            // initialValues={initialValues}
            render={
              ({
                errors,
                touched,
                handleChange,
                handleBlur,
              }) => (
                <Form noValidate name='simpleForm'>
                  {/* <CardHeader>
                                            <strong>{i18n.t('static.program.import')}</strong>
                                        </CardHeader> */}
                  <CardBody className="pb-lg-2 pt-lg-2">
                    <div>
                      <div className="d-md-flex">

                        <FormGroup className="col-md-3">

                          <div className="controls ">
                            <Select
                              name="datasetSelect"
                              id="datasetSelect"
                              bsSize="sm"
                              options={this.state.datasetsLableList}
                              value={this.state.datasetsLable}
                              onChange={(e) => { this.getProgramDetails(e); }}
                            />
                          </div>

                          {/* <InputGroup>
                            <Input
                              type="select"
                              name="programId"
                              id="programId"
                              bsSize="sm"
                              // onChange={(e) => { this.getPlanningUnit(); }}
                              //onChange={(e) => { this.setVersionId(e); }}
                              options={this.state.datasetsLableList}
                              value={this.state.datasetsLable} >
                            </Input>
                          </InputGroup> */}
                        </FormGroup>

                        <FormGroup className="tab-ml-0 mb-md-3 " style={{ marginLeft: '30px' }}>
                          <Col md="12" >
                            <center><Button type="button" color="success" className="mr-1 text-white" >{i18n.t('Pull in data from supply plan')}</Button></center>
                          </Col>
                        </FormGroup>
                      </div>
                    </div>
                    <FormGroup className="tab-ml-0 mb-md-3 ">
                      <Col md="12" >
                        <Input className="form-check-input" type="checkbox" id="checkbox1" name="checkbox1" value="option1" />
                        <Label check className="form-check-label" htmlFor="checkbox1">Show everything in planning units</Label>
                      </Col>
                    </FormGroup>

                    <div className="table-scroll">
                      <div className="table-wrap table-responsive">
                        <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm">
                          <thead>
                            <tr>
                              <th className="BorderNoneSupplyPlan sticky-col first-col clone1"></th>
                              <th style={{ textAlign: "left" }}>Product</th>
                              <th>Jan-21</th>
                              <th>Feb-21</th>
                              <th>Mar-21</th>
                              <th>Apr-21</th>
                              <th>May-21</th>
                              <th>June-21</th>
                              <th>July-21</th>
                              <th>Aug-21</th>
                              <th>Sept-21</th>
                              <th>Oct-21</th>
                              <th>Nov-21</th>
                              <th>Dec-21</th>
                              <th>Total</th>
                              <th>Regional%</th>
                            </tr>
                          </thead>
                          <tbody className="readonly">
                            <tr>
                              <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordionPlanningUnit()}>
                                {this.state.showPlanningRegion ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                              </td>
                              <td style={{ textAlign: "left" }} onClick={() => this.buildJExcel()}><b>Planning Unit 1</b></td>
                              <td>77</td>
                              <td>298</td>
                              <td>293</td>
                              <td>55</td>
                              <td>300</td>
                              <td>587</td>
                              <td>264</td>
                              <td>247</td>
                              <td>52</td>
                              <td>40</td>
                              <td>70</td>
                              <td>40</td>
                              <td>2173</td>
                              <td>100%</td>
                            </tr>
                            <tr className="displayregion">
                              <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>

                              <td>Region A</td>
                              <td></td>
                              <td>224</td>
                              <td>224</td>
                              <td>0</td>
                              <td>203</td>
                              <td>536</td>
                              <td>213</td>
                              <td>198</td>
                              <td>1</td>
                              <td>0</td>
                              <td>0</td>
                              <td>0</td>
                              <td>1599</td>
                              <td>74%</td>
                            </tr>
                            <tr className="displayregion">
                              <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>

                              <td>Region B</td>
                              <td>18</td>
                              <td>22</td>
                              <td>25</td>
                              <td>24</td>
                              <td>27</td>
                              <td>31</td>
                              <td>35</td>
                              <td>36</td>
                              <td>41</td>
                              <td>0</td>
                              <td>0</td>
                              <td>0</td>
                              <td>259</td>
                              <td>12%</td>

                            </tr>
                            <tr className="displayregion">
                              <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>

                              <td>Region C</td>
                              <td>59</td>
                              <td>52</td>
                              <td>43</td>
                              <td>31</td>
                              <td>70</td>
                              <td>21</td>
                              <td>17</td>
                              <td>13</td>
                              <td>10</td>
                              <td>0</td>
                              <td>0</td>
                              <td>0</td>
                              <td>316</td>
                              <td>15%</td>
                            </tr>
                            <tr>
                              <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>

                              <td style={{ textAlign: "left" }}><b>ARU 2</b></td>
                              <td>30</td>
                              <td>20</td>
                              <td>24</td>
                              <td>35</td>
                              <td>27</td>
                              <td>23</td>
                              <td>21</td>
                              <td>26</td>
                              <td>40</td>
                              <td>0</td>
                              <td>0</td>
                              <td>0</td>
                              <td>246</td>
                              <td>100%</td>
                            </tr>
                            <tr>
                              <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>

                              <td style={{ textAlign: "left" }}><b>Forecasting Unit 3</b></td>
                              <td>25</td>
                              <td>22</td>
                              <td>20</td>
                              <td>20</td>
                              <td>20</td>
                              <td>29</td>
                              <td>20</td>
                              <td>24</td>
                              <td>39</td>
                              <td>0</td>
                              <td>0</td>
                              <td>0</td>
                              <td>219</td>
                              <td>100%</td>
                            </tr>
                          </tbody>
                        </Table>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <FormGroup className="col-md-6"></FormGroup>
                    </div>
                    <div className="col-md-12">
                      <FormGroup className="col-md-6"></FormGroup>
                    </div>
                    <div className="row" id="conversionTable" style={{ display: "none" }}>
                      <div className="col-md-12">
                        <FormGroup className="col-md-3">
                          <div className="controls ">
                            <InputGroup>
                              <Input
                                type="select"
                                name="programId"
                                id="programId"
                                bsSize="sm"
                                // onChange={(e) => { this.getPlanningUnit(); }}
                                //onChange={(e) => { this.setVersionId(e); }}
                                value={this.state.programId}                            >
                                <option value="">{i18n.t('No logo Condoms 3000')}</option>
                              </Input>
                            </InputGroup>
                          </div>
                        </FormGroup>
                      </div>
                      <div className="col-md-6">
                        <table>
                          <thead>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th>Convert to PU</th>
                          </thead>
                          <tbody>
                            <tr>
                              <td>
                                <Input
                                  type="radio"
                                  id="active1"
                                  name="active"
                                  value={true}
                                  title={i18n.t('Planning Unit')}
                                  style={{ position: 'relative', marginLeft: 20 }}
                                />
                              </td>
                              <td>
                                <Label
                                  className="form-check-label"
                                  check htmlFor="inline-radio1"
                                  title={i18n.t('Planning Unit')}>
                                  {i18n.t('Planning Unit')}
                                </Label>
                              </td>
                              <td className="readonly">
                                Condom 3000
                              </td>
                              <td className="readonly">
                                1
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <Input
                                  type="radio"
                                  id="active1"
                                  name="active"
                                  value={false}
                                  title={i18n.t('Forcasting Unit')}
                                  style={{ position: 'relative', marginLeft: 20 }}
                                />
                              </td>
                              <td>
                                <Label
                                  className="form-check-label"
                                  check htmlFor="inline-radio2"
                                  title={i18n.t('Forcasting Unit')}>
                                  {i18n.t('Forcasting Unit')}
                                </Label>
                              </td>
                              <td className="readonly">
                                Condom
                              </td>
                              <td className="readonly">
                                3000
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <Input
                                  type="radio"
                                  id="active3"
                                  name="active"
                                  value={false}
                                  title={i18n.t('ARU')}
                                  style={{ position: 'relative', marginLeft: 20 }}
                                />
                              </td>
                              <td>
                                <Label
                                  className="form-check-label"
                                  check htmlFor="inline-radio3"
                                  title={i18n.t('ARU')}>
                                  {i18n.t('Something else (ARU)')}
                                </Label>
                              </td>
                              <td>
                                <Input
                                  type="text"
                                  id="ARUtext"
                                  name="ARUtext"
                                  value=""
                                  title={i18n.t('ARU')}
                                />
                              </td>
                              <td>
                                <Input
                                  type="text"
                                  id="ARUtext"
                                  name="ARUtext"
                                  value=""
                                  title={i18n.t('ARU')}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      {/* <div className="col-md-6"> */}
                      <div className="col-md-3">
                        <FormGroup>
                          <Label>{i18n.t('Notes')}</Label>
                          <Col md="12" className="pl-lg-0">
                            <textarea className="form-control"
                              name="notes"
                              id="notes"
                              rows={3}
                              cols={20}
                            />
                          </Col>
                        </FormGroup>
                      </div>
                      <div className="col-md-3">
                        <FormGroup className="tab-ml-0 mt-md-2 mb-md-3 ">
                          <Col md="12" className="pl-lg-0">
                            <center><Button type="button" backgroundColor="#49A4A1" className="mr-1 text-white" >{i18n.t('Interpolate Missing values')}</Button></center>
                          </Col>
                        </FormGroup>
                      </div>
                    </div>
                    {/* </div> */}



                    <div className="row">
                      <div className="col-md-12">
                        {/* <div className="chart-wrapper chart-graph-report"> */}
                        <div id="canvas-graph" class="adjustedGraph" style={{ display: "none" }}>
                          <Line
                            data={state}
                            options={{
                              title: {
                                display: true,
                                text: 'No logo Condoms 3000',
                                fontSize: 30
                              }
                            }}
                          />
                        </div>
                        {/* </div> */}
                      </div>
                    </div>

                    <div id="extraploation" style={{ display: "none" }}>
                    </div>
                    <div className="col-md-12">
                      <FormGroup className="col-md-6"></FormGroup>
                    </div>
                    <div className="">
                      <div id="leftAlignAdjustedJexcel" className="leftAlignTable">
                      </div>
                    </div>

                  </CardBody>
                  {/* <div>
                                            <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                                <div class="align-items-center">
                                                    <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>
                                                    <div class="spinner-border blue ml-4" role="status">
                                                    </div>
                                                </div>
                                            </div>
                                        </div> */}

                  <CardFooter>
                    <FormGroup>

                      <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                      <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                      {/* <Button type="button" id="fileImportButton" size="md" color="success" className="float-right mr-1" onClick={() => this.importFile()}><i className="fa fa-check"></i>Upload</Button> */}

                      <Button type="button" id="formSubmitButton" size="md" color="success" className="float-right mr-1"><i className="fa fa-check"></i>Save</Button>
                      &nbsp;
                    </FormGroup>
                  </CardFooter>
                </Form>
              )} />
          {/* <div id="tableDiv" style={{ display:"block" }}>
                        { <h3>Interpolate Missing values</h3>		 }
                        </div> */}
          {/* <div id="" style={{ display: "block" }}>
             <h4>Adjusted Consumption</h4>
          </div> */}


        </Card>
      </div >
    );
  }

  _handleClickRangeBox(e) {
    this.pickRange.current.show()
  }
}