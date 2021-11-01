import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import React from "react";
import { Bar, Line, Pie } from 'react-chartjs-2';
import ReactDOM from 'react-dom';
import {
  Card, CardBody,
  Label, Input, FormGroup,
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
    }
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeChange = this.handleRangeChange.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.pickRange = React.createRef();
    this.importFile = this.importFile.bind(this);
    this.buildJExcel = this.buildJExcel.bind(this);
    this.buildSummaryJExcel = this.buildSummaryJExcel.bind(this);
  }
  componentDidMount() {
    bsCustomFileInput.init()
    this.setState({
      dataList: [{
        "type": "Days in Month", "monthjan": "31", "monthfeb": "28", "monthmar": "31",
        "monthapr": "30", "monthmay": "31", "monthjun": "30", "monthjul": "31", "monthaug": "31",
        "monthsep": "30", "monthoct": "31", "monthnov": "30", "monthdes": "31"
      },
      {
        "type": "Region A", "monthjan": "", "monthfeb": "", "monthmar": "",
        "monthapr": "", "monthmay": "", "monthjun": "", "monthjul": "", "monthaug": "",
        "monthsep": "", "monthoct": "", "monthnov": "", "monthdes": ""
      },
      {
        "type": "Actual Consumption*", "monthjan": "", "monthfeb": "2000", "monthmar": "195",
        "monthapr": "", "monthmay": "197", "monthjun": "500", "monthjul": "195", "monthaug": "192",
        "monthsep": "1", "monthoct": "199", "monthnov": "199", "monthdes": "199"
      },
      {
        "type": "Reporting Rate (%)", "monthjan": "89%", "monthfeb": "91%", "monthmar": "93%",
        "monthapr": "99%", "monthmay": "97%", "monthjun": "100%", "monthjul": "98%", "monthaug": "97%",
        "monthsep": "98%", "monthoct": "100%", "monthnov": "98%", "monthdes": "90%"
      },
      {
        "type": "Stockout Rate (days)", "monthjan": "1", "monthfeb": "0", "monthmar": "2",
        "monthapr": "0", "monthmay": "0", "monthjun": "2", "monthjul": "2", "monthaug": "0",
        "monthsep": "1", "monthoct": "1", "monthnov": "0", "monthdes": "0"
      },
      {
        "type": "Stockout Rate (%)", "monthjan": "3%", "monthfeb": "0%", "monthmar": "6%",
        "monthapr": "0%", "monthmay": "0%", "monthjun": "7%", "monthjul": "6%", "monthaug": "0%",
        "monthsep": "3%", "monthoct": "3%", "monthnov": "0%", "monthdes": "0%"
      },
      {
        "type": "Exclude?", "monthjan": "", "monthfeb": "", "monthmar": "",
        "monthapr": "", "monthmay": "", "monthjun": "", "monthjul": "", "monthaug": "",
        "monthsep": "", "monthoct": "", "monthnov": "", "monthdes": ""
      },
      {
        "type": "Adjusted Consumption", "monthjan": "0", "monthfeb": "2198", "monthmar": "224",
        "monthapr": "0", "monthmay": "203", "monthjun": "536", "monthjul": "213", "monthaug": "198",
        "monthsep": "1", "monthoct": "206", "monthnov": "203", "monthdes": "221"
      },
      { "type": "Converted to Planning Unit" },
      {
        "type": "Region B", "monthjan": "", "monthfeb": "", "monthmar": "",
        "monthapr": "", "monthmay": "", "monthjun": "", "monthjul": "", "monthaug": "",
        "monthsep": "", "monthoct": "", "monthnov": "", "monthdes": ""
      },
      {
        "type": "Actual Consumption*", "monthjan": "18", "monthfeb": "19.8", "monthmar": "21.78",
        "monthapr": "23.958", "monthmay": "26.3538", "monthjun": "28.98918", "monthjul": "31.888098", "monthaug": "35.0769078",
        "monthsep": "38.58459858", "monthoct": "42.44305844", "monthnov": "46.68736428", "monthdes": "51.35610071"
      },
      {
        "type": "Reporting Rate (%)", "monthjan": "99%", "monthfeb": "91%", "monthmar": "93%",
        "monthapr": "99%", "monthmay": "97%", "monthjun": "100%", "monthjul": "98%", "monthaug": "97%",
        "monthsep": "98%", "monthoct": "100%", "monthnov": "98%", "monthdes": "90%"
      },
      {
        "type": "Stockout Rate (days)", "monthjan": "1", "monthfeb": "0", "monthmar": "2",
        "monthapr": "0", "monthmay": "0", "monthjun": "2", "monthjul": "2", "monthaug": "0",
        "monthsep": "1", "monthoct": "1", "monthnov": "0", "monthdes": "0"
      },
      {
        "type": "Stockout Rate (%)", "monthjan": "3%", "monthfeb": "0%", "monthmar": "6%",
        "monthapr": "0%", "monthmay": "0%", "monthjun": "7%", "monthjul": "6%", "monthaug": "0%",
        "monthsep": "3%", "monthoct": "3%", "monthnov": "0%", "monthdes": "0%"
      },
      {
        "type": "Exclude?", "monthjan": "", "monthfeb": "", "monthmar": "",
        "monthapr": "", "monthmay": "", "monthjun": "", "monthjul": "", "monthaug": "",
        "monthsep": "", "monthoct": "", "monthnov": "", "monthdes": ""
      },
      {
        "type": "Adjusted Consumption", "monthjan": "0", "monthfeb": "2198", "monthmar": "224",
        "monthapr": "0", "monthmay": "203", "monthjun": "536", "monthjul": "213", "monthaug": "198",
        "monthsep": "1", "monthoct": "206", "monthnov": "203", "monthdes": "221"
      },
      { "type": "Converted to Planning Unit" },
      {
        "type": "Region C", "monthjan": "", "monthfeb": "", "monthmar": "",
        "monthapr": "", "monthmay": "", "monthjun": "", "monthjul": "", "monthaug": "",
        "monthsep": "", "monthoct": "", "monthnov": "", "monthdes": ""
      },
      {
        "type": "Actual Consumption*", "monthjan": "18", "monthfeb": "19.8", "monthmar": "21.78",
        "monthapr": "23.958", "monthmay": "26.3538", "monthjun": "28.98918", "monthjul": "31.888098", "monthaug": "35.0769078",
        "monthsep": "38.58459858", "monthoct": "42.44305844", "monthnov": "46.68736428", "monthdes": "51.35610071"
      },
      {
        "type": "Reporting Rate (%)", "monthjan": "99%", "monthfeb": "91%", "monthmar": "93%",
        "monthapr": "99%", "monthmay": "97%", "monthjun": "100%", "monthjul": "98%", "monthaug": "97%",
        "monthsep": "98%", "monthoct": "100%", "monthnov": "98%", "monthdes": "90%"
      },
      {
        "type": "Stockout Rate (days)", "monthjan": "1", "monthfeb": "0", "monthmar": "2",
        "monthapr": "0", "monthmay": "0", "monthjun": "2", "monthjul": "2", "monthaug": "0",
        "monthsep": "1", "monthoct": "1", "monthnov": "0", "monthdes": "0"
      },
      {
        "type": "Stockout Rate (%)", "monthjan": "3%", "monthfeb": "0%", "monthmar": "6%",
        "monthapr": "0%", "monthmay": "0%", "monthjun": "7%", "monthjul": "6%", "monthaug": "0%",
        "monthsep": "3%", "monthoct": "3%", "monthnov": "0%", "monthdes": "0%"
      },
      {
        "type": "Exclude?", "monthjan": "", "monthfeb": "", "monthmar": "",
        "monthapr": "", "monthmay": "", "monthjun": "", "monthjul": "", "monthaug": "",
        "monthsep": "", "monthoct": "", "monthnov": "", "monthdes": ""
      },
      {
        "type": "Adjusted Consumption", "monthjan": "0", "monthfeb": "2198", "monthmar": "224",
        "monthapr": "0", "monthmay": "203", "monthjun": "536", "monthjul": "213", "monthaug": "198",
        "monthsep": "1", "monthoct": "206", "monthnov": "203", "monthdes": "221"
      },
      { "type": "Converted to Planning Unit" }],
      
      dataList1: [{
        "type": "Planning Unit 1", "monthjan": "77", "monthfeb": "298", "monthmar": "293",
        "monthapr": "55", "monthmay": "300", "monthjun": "587", "monthjul": "264", "monthaug": "247",
        "monthsep": "52","monthOct":"40","monthNov":"70","monthDec":"40"
      },
      {
        "type": "ARU 2", "monthjan": "30", "monthfeb": "20", "monthmar": "24",
        "monthapr": "35", "monthmay": "27", "monthjun": "23", "monthjul": "21", "monthaug": "26",
        "monthsep": "40","monthOct":"38","monthNov":"48","monthDec":"31"
      },
      {
        "type": "Forecasting Unit 3", "monthjan": "25", "monthfeb": "22", "monthmar": "20",
        "monthapr": "20", "monthmay": "20", "monthjun": "29", "monthjul": "20", "monthaug": "24",
        "monthsep": "39","monthOct":"46","monthNov":"68","monthDec":"27"
      }],
    },
      () => {
        // this.filterData();
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

  buildJExcel() {
    console.log("Inside Build Jexcel");
    let dataList = this.state.dataList;
    let dataListArray = [];
    let count = 0;

    for (var j = 0; j < dataList.length; j++) {
      data = [];
      data[0] = dataList[j].type;
      data[1] = dataList[j].monthjan;
      data[2] = dataList[j].monthfeb;
      data[3] = dataList[j].monthmar;
      data[4] = dataList[j].monthapr;
      data[5] = dataList[j].monthmay;
      data[6] = dataList[j].monthjun;
      data[7] = dataList[j].monthjul;
      data[8] = dataList[j].monthaug;
      data[9] = dataList[j].monthsep;
      data[10] = dataList[j].monthoct;
      data[11] = dataList[j].monthnov;
      data[12] = dataList[j].monthdes;
      dataListArray[count] = data;
      count++;
    }
    this.el = jexcel(document.getElementById("tableDiv"), '');
    this.el.destroy();
    var json = [];
    var data = dataListArray;

    var options = {
      Headers: "Details ",
      data: data,
      columnDrag: true,
      colWidths: [200, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
      colHeaderClasses: ["Reqasterisk"],
      columns: [
        {
          title: ' ',
          type: 'text',
          readOnly: true
        },
        {
          title: 'Jan-21',
          type: 'text',
          readOnly: false
        },
        {
          title: 'Feb-21',
          type: 'text',
          readOnly: false
        },
        {
          title: 'Mar-21',
          type: 'text',
          readOnly: false
        },
        {
          title: 'Apr-21',
          type: 'text',
          readOnly: false
        },
        {
          title: 'May-21',
          type: 'text',
          readOnly: false
        },
        {
          title: 'June-21',
          type: 'text',
          readOnly: false
        },
        {
          title: 'Jul-21',
          type: 'text',
          readOnly: false
        },
        {
          title: 'Aug-21',
          type: 'text',
          readOnly: false
        },
        {
          title: 'Sep-21',
          type: 'text',
          readOnly: false
        },
        {
          title: 'Oct-21',
          type: 'text',
          readOnly: false
        },
        {
          title: 'Nov-21',
          type: 'text',
          readOnly: false
        },
        {
          title: 'Dec-21',
          type: 'text',
          readOnly: false
        }
      ],
      mergeCells: {
        A1: [1, 2]
      },
      text: {
        // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
        // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
        show: '',
        entries: '',
      },
      onload: this.loaded,
      pagination: localStorage.getItem("sesRecordCount"),
      search: true,
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
      paginationOptions: JEXCEL_PAGINATION_OPTION,
      position: 'top',
      filters: true,
      license: JEXCEL_PRO_KEY,
      contextMenu: function (obj, x, y, e) {
        return [];
      }.bind(this),
    };
    var countryEl = jexcel(document.getElementById("tableDiv"), options);
    this.el = countryEl;
    this.setState({
      countryEl: countryEl, loading: false
    })
    // this.buildSummaryJExcel();
  }

  buildSummaryJExcel() {
    console.log("Inside Build Jexcel");
    let dataList = this.state.dataList1;
    let dataListArray = [];
    let count = 0;

    for (var j = 0; j < dataList.length; j++) {
      data = [];
      data[0] = dataList[j].type;
      data[1] = dataList[j].monthjan;
      data[2] = dataList[j].monthfeb;
      data[3] = dataList[j].monthmar;
      data[4] = dataList[j].monthapr;
      data[5] = dataList[j].monthmay;
      data[6] = dataList[j].monthjun;
      data[7] = dataList[j].monthjul;
      data[8] = dataList[j].monthaug;
      data[9] = dataList[j].monthsep;
      data[10] = dataList[j].monthOct;
      data[11] = dataList[j].monthNov;
      data[12] = dataList[j].monthDec;
      dataListArray[count] = data;
      count++;
    }
    this.el = jexcel(document.getElementById("tableSummaryDiv"), '');
    this.el.destroy();
    var json = [];
    var data = dataListArray;

    var options = {
      data: data,
      columnDrag: true,
      colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
      colHeaderClasses: ["Reqasterisk"],
      columns: [
        {
          title: 'PU or FU or ARU',
          type: 'text',
          readOnly: true
        },
        {
          title: 'Jan-21',
          type: 'text',
          readOnly: true
        },
        {
          title: 'Feb-21',
          type: 'text',
          readOnly: true
        },
        {
          title: 'Mar-21',
          type: 'text',
          readOnly: true
        },
        {
          title: 'Apr-21',
          type: 'text',
          readOnly: true
        },
        {
          title: 'May-21',
          type: 'text',
          readOnly: true
        },
        {
          title: 'June-21',
          type: 'text',
          readOnly: true
        },
        {
          title: 'Jul-21',
          type: 'text',
          readOnly: true
        },
        {
          title: 'Aug-21',
          type: 'text',
          readOnly: true
        },
        {
          title: 'Sep-21',
          type: 'text',
          readOnly: true
        },
        {
          title: 'Oct-21',
          type: 'text',
          readOnly: true
        },
        {
          title: 'Nov-21',
          type: 'text',
          readOnly: true
        },
        {
          title: 'Dec-21',
          type: 'text',
          readOnly: true
        }
      ],

      text: {
        // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
        // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
        show: '',
        entries: '',
      },
      onload: this.loadedSummary,
      pagination: localStorage.getItem("sesRecordCount"),
      search: true,
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
      paginationOptions: JEXCEL_PAGINATION_OPTION,
      position: 'top',
      filters: true,
      license: JEXCEL_PRO_KEY,
      contextMenu: function (obj, x, y, e) {
        return [];
      }.bind(this),
    };
    var countryEl = jexcel(document.getElementById("tableSummaryDiv"), options);
    this.el = countryEl;
    this.setState({
      countryEl: countryEl, loading: false
    })
  }

  selected = function (instance, cell, x, y, value) {

    if ((x == 0 && value != 0) || (y == 0)) {
      // console.log("HEADER SELECTION--------------------------");
    } else {
      this.buildJExcel()
      document.getElementById("canvas-graph").style = { display: "block" }
      document.getElementById("extraploation").style = { display: "block" }
      document.getElementById("conversionTable").style = { display: "block" }
    }
  }.bind(this);

  importFile() {
    this.setState({ loading: true })
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      if (document.querySelector('input[type=file]').files[0] == undefined) {
        alert(i18n.t('static.program.selectfile'));
        this.setState({
          loading: false
        })
      } else {
        var file = document.querySelector('input[type=file]').files[0];
        var fileName = file.name;
        var fileExtenstion = fileName.split(".");
        if (fileExtenstion[fileExtenstion.length - 1] == "csv") {
          const lan = 'en'
          JSZip.loadAsync(file).then(function (zip) {
            var i = 0;
            var fileName = []
            var programListArray = []
            var size = 0;
            Object.keys(zip.files).forEach(function (filename) {
              size++;
            })
            Object.keys(zip.files).forEach(function (filename) {
              zip.files[filename].async('string').then(function (fileData) {

                var programDataJson;
                console.log("File Data", fileData.split("@~-~@")[0]);
                try {
                  programDataJson = JSON.parse(fileData.split("@~-~@")[0]);
                }
                catch (err) {
                  this.setState({ message: i18n.t('static.program.zipfilereaderror'), loading: false },
                    () => {
                      //  this.hideSecondComponent();
                    })

                }
                var bytes = CryptoJS.AES.decrypt(programDataJson.programData, SECRET_KEY);
                var plaintext = bytes.toString(CryptoJS.enc.Utf8);
                var programDataJsonDecrypted = JSON.parse(plaintext);
                console.log("programDatajson", programDataJsonDecrypted.label);
                console.log("displayName", getLabelText((programDataJsonDecrypted.label), lan));
                console.log("filename", filename);
                programDataJson.filename = filename;
                fileName[i] = {
                  value: filename, label: (getLabelText((programDataJsonDecrypted.label), lan)) + "~v" + programDataJson.version
                }
                programListArray[i] = programDataJson;
                i++;
                console.log("Program data list in import", programListArray)
                if (i === size) {
                  this.setState({
                    programList: fileName,
                    programListArray: programListArray,
                    loading: false
                  })
                  console.log("programList", fileName)
                  console.log("programDataArrayList after state set", programListArray)

                  document.getElementById("programIdDiv").style.display = "block";
                  document.getElementById("formSubmitButton").style.display = "block";
                  document.getElementById("fileImportDiv").style.display = "none";
                  document.getElementById("fileImportButton").style.display = "none";
                }
              }.bind(this))

            }.bind(this))

          }.bind(this))
        } else {
          this.setState({ loading: false })
          alert(i18n.t('static.program.selectzipfile'))
        }
      }

    }

  }

  render() {
    const state = {
      labels: ['Jan-21', 'Feb-21', 'Mar-21',
        'Apr-21', 'May-21', 'Jun-21', 'Jul-21', 'Aug-21', 'Sept-21', 'Oct-21', 'Nov-21', 'Dec-21'],
      style: { width: '10%', outerHeight: '40%' },
      datasets: [
        {
          label: 'RegionA',
          fill: false,
          lineTension: 0.5,
          backgroundColor: 'rgba(75,192,192,1)',
          borderColor: 'rgba(255, 0, 0, 0.3)',
          //borderWidth: 2,
          data: [780, 598, 534, 234, 666, 566, 444, 0, 456, 273, 678, 234]
        },
        {
          label: 'Region B',
          fill: false,
          lineTension: 0.5,
          backgroundColor: 'rgba(75,192,192,1)',
          borderColor: 'rgba(0, 255, 0, 0.3)',
          // borderWidth: 2,
          data: [780, 500, 300, 100, 0, 0, 120, 480, 350, 290, 456, 0]
        }, {
          label: 'Region C',
          fill: false,
          //lineTension: 0.5,
          backgroundColor: 'rgba(75,192,192,1)',
          borderColor: 'rgba(0, 0, 255, 0.3)',
          borderWidth: 2,
          data: [600, 610, 480, 240, 366, 564, 123, 768, 345, 789, 109, 123]
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
                    <FormGroup id="fileImportDiv">
                      <Col md="3">
                        <Label className="uploadfilelable" htmlFor="file-input">{i18n.t('File input (must be .csv format)')}</Label>
                      </Col>
                      <Col xs="12" md="4" className="custom-file">
                        {/* <Input type="file" id="file-input" name="file-input" /> */}
                        <Input type="file" className="custom-file-input" id="file-input" name="file-input" accept=".csv" />
                        <label className="custom-file-label" id="file-input" data-browse={i18n.t('static.uploadfile.Browse')}>{i18n.t('static.chooseFile.chooseFile')}</label>
                      </Col>
                    </FormGroup>
                    
                    <div className="ReportSearchMarginTop">
                      {/* <lable>Summary</lable> */}
                      <div id="tableSummaryDiv" className="jexcelremoveReadonlybackground RowClickable">
                      </div>
                    </div>
                    <div className="row" id="conversionTable" style={{ display: "none" }}>
                      <div className="col-md-6">
                        <table responsive className="table-striped table-bordered text-center mt-2">
                          <thead>
                            <tr>
                              <th className="text-center" style={{ width: '10%' }}> {i18n.t('enter data in')} </th>
                              <th className="text-center" style={{ width: '20%' }}>{i18n.t('')}</th>
                              <th className="text-center" style={{ width: '10%' }}>{i18n.t('click to go into one PU')}</th>
                              <th className="text-center" style={{ width: '10%' }}>{i18n.t('Conversion to PU')}</th>
                            </tr>
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
                              <td>
                                <select class="form-control-sm form-control">
                                  <option value="volvo">-</option>
                                  <option value="saab">Saab</option>
                                  <option value="mercedes">Mercedes</option>
                                  <option value="audi">Audi</option>
                                </select>
                              </td>
                              <td>
                                <Label
                                  className="form-check-label"
                                  check htmlFor="inline-radio1"
                                  title={i18n.t('Planning Unit')}>
                                  {i18n.t('1')}
                                </Label>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <Input
                                  type="radio"
                                  id="active1"
                                  name="active"
                                  value={false}
                                  title={i18n.t('forcasting Unit')}
                                  style={{ position: 'relative', marginLeft: 20 }}

                                />
                              </td>
                              <td>
                                <Label
                                  className="form-check-label"
                                  check htmlFor="inline-radio2"
                                  title={i18n.t('forcasting Unit')}>
                                  {i18n.t('forcasting Unit')}
                                </Label>

                              </td>
                              <td>
                                <Label
                                  className="form-check-label"
                                  check htmlFor="inline-radio2"
                                  title={i18n.t('forcasting Unit')}>
                                  </Label>
                              </td>
                              <td>
                                <Label
                                  className="form-check-label"
                                  check htmlFor="inline-radio1"
                                  title={i18n.t('Planning Unit')}>
                                  
                                </Label>
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
                    </div>
                    <div id="extraploation" style={{ display: "none" }}>
                      <div className="d-md-flex">
                        <FormGroup className="tab-ml-0 mt-md-2 mb-md-3 ">
                          <Label>{i18n.t('Notes')}</Label>
                          <Col md="12" className="pl-lg-0">
                            <Input type="text"
                              name="notes"
                              id="notes"
                            />
                          </Col>
                        </FormGroup>
                        <FormGroup className="tab-ml-0 mb-md-3 " style={{ marginTop: '32px' }}>
                          <Col md="12" >
                            <center><Button type="button" color="success" className="mr-1 text-white" >{i18n.t('Interpolate Missing values')}</Button></center>
                          </Col>
                        </FormGroup>
                      </div>
                    </div>
                    <div className="">
                      <div id="tableDiv" className="jexcelremoveReadonlybackground RowClickable">
                      </div>
                    </div>


                    <div id="canvas-graph" style={{ display: "none" }}>
                      <Line
                        data={state}
                        options={{
                          title: {
                            display: true,
                            text: 'Raltegravir 400 mg Tablet, 60 Tablets',
                            fontSize: 20
                          }
                        }}
                      />
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

                      <Button type="button" id="formSubmitButton" size="md" color="success" className="float-right mr-1" onClick={this.buildSummaryJExcel}><i className="fa fa-check"></i>Save</Button>
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
      </div>
    );
  }

  _handleClickRangeBox(e) {
    this.pickRange.current.show()
  }
}