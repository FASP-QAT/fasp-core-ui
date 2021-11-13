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
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, DELIVERED_SHIPMENT_STATUS, ACTUAL_CONSUMPTION_TYPE, FORCASTED_CONSUMPTION_TYPE, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE, API_URL, polling, DATE_FORMAT_CAP_WITHOUT_DATE } from '../../Constants.js'
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
import NumberFormat from 'react-number-format';

const entityname = i18n.t('static.consumption.consumptionDataEntryandAdjustment');

export default class ConsumptionDataEntryandAdjustment extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      datasetList: [],
      datasetId: "",
      showInPlanningUnit: false,
      showTable: false,
      lang: localStorage.getItem("lang"),
      consumptionUnitShowArr: [],
      dataEl: ""
    }
    this.loaded = this.loaded.bind(this)
  }

  buildDataJexcel(consumptionUnitId) {

    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK']
    var consumptionList = this.state.consumptionList;
    var consumptionUnit = this.state.consumptionUnitList.filter(c => c.forecastConsumptionUnitId == consumptionUnitId)[0];
    this.setState({
      selectedConsumptionUnitId: consumptionUnitId,
      selectedConsumptionUnitObject: consumptionUnit
    })
    var multiplier = 1;
    if (consumptionUnitId != 0) {
      if (consumptionUnit.dataType == 1) {
        multiplier = consumptionUnit.forecastingUnit.multiplier;
      } else if (consumptionUnit.dataType == 2) {
        multiplier = consumptionUnit.planningUnit.multiplier;
      } else {
        multiplier = consumptionUnit.otherUnit.multiplier;
      }
    }
    consumptionList = consumptionList.filter(c => c.consumptionUnit.forecastConsumptionUnitId == consumptionUnitId);
    console.log("ConsumptionList+++", consumptionList);
    var monthArray = this.state.monthArray;
    var regionList = this.state.regionList;
    let dataArray = [];
    let data = [];
    let columns = [];
    columns.push({ title: '', type: 'text', width: 200 })
    data[0] = "Days in Month";
    for (var j = 0; j < monthArray.length - 2; j++) {
      data[j + 1] = monthArray[j].noOfDays;
      columns.push({ title: moment(monthArray[j].date).format(DATE_FORMAT_CAP_WITHOUT_DATE), type: 'text', width: 100 })
    }
    dataArray.push(data)
    data = [];
    for (var r = 0; r < regionList.length; r++) {
      data = [];
      data[0] = getLabelText(regionList[r].label);
      for (var j = 0; j < monthArray.length - 2; j++) {
        data[j + 1] = "";
      }

      dataArray.push(data);
      data = [];
      data[0] = "Actual Consumption"
      for (var j = 0; j < monthArray.length - 2; j++) {
        console.log("+++", consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM")));
        console.log("+++", consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId));
        var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
        console.log("consumptionData+++", consumptionData)
        data[j + 1] = consumptionData.length > 0 ? consumptionData[0].actualConsumption : "";
      }
      dataArray.push(data);

      data = [];
      data[0] = "Reporting Rate"
      for (var j = 0; j < monthArray.length - 2; j++) {
        var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
        data[j + 1] = consumptionData.length > 0 && consumptionData[0].reportingRate > 0 ? consumptionData[0].reportingRate : 100;
      }
      dataArray.push(data);

      data = [];
      data[0] = "Stockout Rate (days)"
      for (var j = 0; j < monthArray.length - 2; j++) {
        var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
        data[j + 1] = consumptionData.length > 0 && consumptionData[0].daysOfStockOut > 0 ? consumptionData[0].daysOfStockOut : 0;
      }
      dataArray.push(data);

      data = [];
      data[0] = "Stockout Rate (%)"
      for (var j = 0; j < monthArray.length - 2; j++) {
        data[j + 1] = `=ROUND(${colArr[j + 1]}${parseInt(dataArray.length)}/${colArr[j + 1] + "1"}*100,0)`;
      }
      dataArray.push(data);

      data = [];
      data[0] = "Adjusted Consumption"
      for (var j = 0; j < monthArray.length - 2; j++) {
        data[j + 1] = `=ROUND((${colArr[j + 1]}${parseInt(dataArray.length - 3)}/${colArr[j + 1]}${parseInt(dataArray.length - 2)}/(1-(${colArr[j + 1]}${parseInt(dataArray.length)})/100))*100,0)`;
      }
      dataArray.push(data);

      data = [];
      data[0] = "Converted to Planning Unit"
      for (var j = 0; j < monthArray.length - 2; j++) {
        data[j + 1] = `=ROUND(${colArr[j + 1]}${parseInt(dataArray.length)}/${multiplier},0)`;
      }
      dataArray.push(data);
      if (r != regionList.length - 1) {
        data = [];
        dataArray.push([]);
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
    this.el = jexcel(document.getElementById("tableDiv"), '');
    this.el.destroy();
    var options = {
      data: dataArray,
      columnDrag: true,
      columns: columns,
      text: {
        // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
        show: '',
        entries: '',
      },
      updateTable: function (el, cell, x, y, source, value, id) {
      },
      onload: this.loaded,
      pagination: false,
      search: false,
      columnSorting: false,
      tableOverflow: true,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      copyCompatibility: true,
      allowExport: false,
      paginationOptions: JEXCEL_PAGINATION_OPTION,
      position: 'top',
      filters: false,
      license: JEXCEL_PRO_KEY,
      contextMenu: function (obj, x, y, e) {
        return [];
      }.bind(this),
    };
    var dataEl = jexcel(document.getElementById("tableDiv"), options);
    this.el = dataEl;
    this.setState({
      dataEl: dataEl, loading: false
    })

  }

  saveConsumptionList() {
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
        var fullConsumptionList = this.state.consumptionList;
        var consumptionUnit = this.state.selectedConsumptionUnitObject;
        var monthArray = this.state.monthArray;
        var regionList = this.state.regionList;
        var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
        var curUser = AuthenticationService.getLoggedInUserId();
        for (var i = 0; i < monthArray.length - 2; i++) {
          var columnData = elInstance.getColumnData([i + 1]);
          console.log("Column Data+++", columnData)
          var actualConsumptionCount = 2;
          var reportingRateCount = 3;
          var daysOfStockOutCount = 4;
          for (var r = 0; r < regionList.length; r++) {
            var index = fullConsumptionList.findIndex(c => c.consumptionUnit.forecastConsumptionUnitId == consumptionUnit.forecastConsumptionUnitId && c.region.id == regionList[r].regionId && moment(c.month).format("YYYY-MM") == moment(monthArray[i].date).format("YYYY-MM"));
            console.log("Index+++", index)
            if (columnData[actualConsumptionCount] > 0) {
              if (index != -1) {
                fullConsumptionList[index].actualConsumption = columnData[actualConsumptionCount];
                fullConsumptionList[index].reportingRate = columnData[reportingRateCount];
                fullConsumptionList[index].daysOfStockOut = columnData[daysOfStockOutCount];
              } else {
                var json = {
                  actualConsumption: columnData[actualConsumptionCount],
                  consumptionUnit: consumptionUnit,
                  createdBy: {
                    userId: curUser
                  },
                  createdDate: curDate,
                  daysOfStockOut: columnData[daysOfStockOutCount],
                  exculde: false,
                  forecastConsumptionId: 0,
                  month: moment(monthArray[i].date).format("YYYY-MM-DD"),
                  region: {
                    id: regionList[r].regionId
                  },
                  reportingRate: columnData[reportingRateCount]
                }
                fullConsumptionList.push(json);
              }
            }
            actualConsumptionCount += 8;
            reportingRateCount += 8;
            daysOfStockOutCount += 8
          }
        }
        console.log("New ConsumptionList+++", fullConsumptionList);
        datasetJson.consumptionList = fullConsumptionList;
        console.log("DatasetJson+++", datasetJson);
        datasetData = (CryptoJS.AES.encrypt(JSON.stringify(datasetJson), SECRET_KEY)).toString()
        myResult.programData = datasetData;
        var putRequest = datasetTransaction.put(myResult);

        putRequest.onerror = function (event) {
        }.bind(this);
        putRequest.onsuccess = function (event) {
          console.log("Complete success+++")
        }.bind(this)
      }.bind(this)
    }.bind(this)
  }

  loaded = function (instance, cell, x, y, value) {
    jExcelLoadedFunctionOnlyHideRow(instance);
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK'];
    var elInstance = instance.jexcel;
    var json = elInstance.getJson(null, false);
    for (var j = 0; j < json.length; j++) {
      var cell = elInstance.getCell(("A").concat(parseInt(j) + 1))
      cell.classList.add('readonly');
    }

    for (var j = 0; j < this.state.monthArray.length - 2; j++) {
      var count = 2;
      var count1 = 1;
      var count2 = 6;
      var count3 = 7;
      var count4 = 8;
      for (var r = 0; r < this.state.regionList.length; r++) {
        var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count)))
        cell.classList.add('readonly');
        var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count1)))
        cell.classList.add('readonly');
        var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count2)))
        cell.classList.add('readonly');
        var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count3)))
        cell.classList.add('readonly');
        var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count4)))
        cell.classList.add('readonly');
        count = count + 8;
        count1 = count1 + 8;
        count2 = count2 + 8;
        count3 = count3 + 8;
        count4 = count4 + 8;
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
    this.getDatasetList();
  }

  getDatasetList() {
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
        console.log("MyResult+++", myResult);
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
        this.setState({
          datasetList: datasetList
        })
      }.bind(this)
    }.bind(this)
  }

  setDatasetId(e) {
    var datasetId = e.target.value;
    this.setState({
      datasetId: datasetId
    }, () => {
      if (datasetId != "") {
        this.getDatasetData();
      } else {

      }
    })
    if (datasetId == "") {
      this.setState({
        showTable: false
      })
    }
  }

  getDatasetData() {
    var datasetData = this.state.datasetList.filter(c => c.id == this.state.datasetId)[0].dataset;
    console.log("DatasetData+++", datasetData)
    var datasetDataBytes = CryptoJS.AES.decrypt(datasetData.programData, SECRET_KEY);
    var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
    var datasetJson = JSON.parse(datasetData);
    console.log("DatasetJson+++", datasetJson);
    var consumptionList = datasetJson.consumptionList;
    var consumptionUnitId = [...new Set(consumptionList.map(ele => (ele.consumptionUnit.forecastConsumptionUnitId)))];
    console.log("ConsumptionUnit+++", consumptionUnitId)
    var consumptionUnitList = [];
    consumptionUnitId.map(item => {
      consumptionUnitList.push(consumptionList.filter(c => c.consumptionUnit.forecastConsumptionUnitId == item)[0].consumptionUnit)
    })
    console.log("ConsumptionUnitList+++", consumptionUnitList)
    var regionList = datasetJson.regionList;
    var startDate = moment(datasetJson.currentVersion.forecastStartDate).add(-36, 'months').format("YYYY-MM-DD");
    var stopDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
    var daysInMonth = datasetJson.currentVersion.daysInMonth;
    console.log("regionList+++", regionList);
    console.log("StartDate+++", startDate);
    console.log("StopDate+++", stopDate);
    var monthArray = [];
    var curDate = startDate;
    for (var m = 0; curDate < stopDate; m++) {
      curDate = moment(startDate).add(m, 'months').format("YYYY-MM-DD");
      var daysInCurrentDate = moment(curDate, "YYYY-MM").daysInMonth();
      monthArray.push({ date: curDate, noOfDays: daysInMonth > 0 ? daysInMonth > daysInCurrentDate ? daysInCurrentDate : daysInMonth : daysInCurrentDate })
    }
    monthArray.push({});
    console.log("MonthArray+++", monthArray)
    this.setState({
      consumptionList: consumptionList,
      regionList: regionList,
      startDate: startDate,
      stopDate: stopDate,
      consumptionUnitList: consumptionUnitList,
      monthArray: monthArray,
      datasetJson: datasetJson,
      showTable: true
    })
  }

  setShowInPlanningUnits(e) {
    console.log("e.target.value+++", e.target.checked)
    this.setState({
      showInPlanningUnit: e.target.checked
    })
  }

  render() {
    const { datasetList } = this.state;
    let datasets = datasetList.length > 0
      && datasetList.map((item, i) => {
        return (
          <option key={i} value={item.id}>
            {item.name}
          </option>
        )
      }, this);
    return (
      <div className="animated fadeIn">
        <AuthenticationServiceComponent history={this.props.history} />
        <Card>
          <div className="Card-header-reporticon pb-2">
            <div className="card-header-actions">
              <div className="card-header-action">
                <a className="card-header-action">
                  <span style={{ cursor: 'pointer' }}><small className="supplyplanformulas">{i18n.t('Show Guidance')}</small></span>
                </a>
                <img style={{ verticalAlign: 'bottom', height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title="Export CSV" /> &nbsp;
                &nbsp;&nbsp;
                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_PROBLEM') && this.state.datasetId != "" && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} ><i className="fa fa-plus-square" onClick={() => this.buildDataJexcel(0)}></i></a>}
              </div>
            </div>
          </div>

          <CardBody >
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
                    <FormGroup className="col-md-4">
                      <Label htmlFor="appendedInputButton"></Label>
                      <div className="controls ">
                        <center><Button type="button" color="success" className="text-white" >Pull in data from supply plan</Button></center>
                      </div>
                    </FormGroup>

                  </div>
                  <div className="row">
                    <FormGroup className="tab-ml-0 mb-md-3 ml-3">
                      <Col md="12" >
                        <Input className="form-check-input" type="checkbox" id="checkbox1" name="checkbox1" value={this.state.showInPlanningUnit} onChange={(e) => this.setShowInPlanningUnits(e)} />
                        <Label check className="form-check-label" htmlFor="checkbox1">Show everything in planning units</Label>
                      </Col>
                    </FormGroup>
                  </div>
                </div>
              </Form>
              {this.state.showTable &&
                <>
                  <div className="table-scroll">
                    <div className="table-wrap table-responsive">
                      <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" options={this.options}>
                        <thead>
                          <tr>
                            <th className="BorderNoneSupplyPlan sticky-col first-col clone1"></th>
                            <th>Product</th>
                            {this.state.monthArray.map((item, count) => {
                              return (<th>{count == this.state.monthArray.length - 1 ? "Regional%" : count == this.state.monthArray.length - 2 ? "Total" : moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE)}</th>)
                            })}
                            {/* <th>Regional%</th> */}
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.consumptionUnitList.map(item => (
                            <>
                              <tr className="hoverTd" onClick={() => { this.buildDataJexcel(item.forecastConsumptionUnitId) }}>
                                <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordion(item.forecastConsumptionUnitId)}>
                                  {this.state.consumptionUnitShowArr.includes(item.forecastConsumptionUnitId) ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                </td>
                                <td align="left">{item.dataType == 1 ? item.forecastingUnit.id : item.dataType == 2 ? item.planningUnit.id : item.otherUnit.id}</td>
                                {this.state.monthArray.map((item1, count) => {
                                  if (count == this.state.monthArray.length - 1) {
                                    return (<td>100%</td>)
                                  } else if (count == this.state.monthArray.length - 2) {
                                    var consumptionDataForMonth = this.state.consumptionList.filter(c => c.consumptionUnit.forecastConsumptionUnitId == item.forecastConsumptionUnitId)
                                    var qty = 0;
                                    if (consumptionDataForMonth.length > 0) {
                                      consumptionDataForMonth.map(c => {
                                        var reportingRate = c.reportingRate > 0 ? c.reportingRate : 100;
                                        qty += (Number(c.actualConsumption) / Number(reportingRate) / Number(1 - (Number(c.daysOfStockOut) / Number(moment(c.month, "YYYY-MM").daysInMonth())))) * 100;
                                      })
                                      qty = qty.toFixed(2)
                                    } else {
                                      qty = ""
                                    }
                                    var multiplier = 1;
                                    if (this.state.showInPlanningUnit) {
                                      if (item.dataType == 1) {
                                        multiplier = item.forecastingUnit.multiplier
                                      } else if (item.dataType == 2) {
                                        multiplier = item.planningUnit.multiplier
                                      } else {
                                        multiplier = item.otherUnit.multiplier
                                      }
                                    }
                                    if (qty != "") {
                                      qty = (Number(qty) / Number(multiplier)).toFixed(2)
                                    }
                                    return (<td><NumberFormat displayType={'text'} thousandSeparator={true} value={qty} /></td>)
                                  }
                                  else {
                                    var consumptionDataForMonth = this.state.consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM") && c.consumptionUnit.forecastConsumptionUnitId == item.forecastConsumptionUnitId)
                                    var qty = 0;
                                    if (consumptionDataForMonth.length > 0) {
                                      consumptionDataForMonth.map(c => {
                                        var reportingRate = c.reportingRate > 0 ? c.reportingRate : 100;
                                        qty += (Number(c.actualConsumption) / Number(reportingRate) / Number(1 - (Number(c.daysOfStockOut) / Number(item1.noOfDays)))) * 100;
                                      })
                                      qty = qty.toFixed(2)
                                    } else {
                                      qty = ""
                                    }
                                    var multiplier = 1;
                                    if (this.state.showInPlanningUnit) {
                                      if (item.dataType == 1) {
                                        multiplier = item.forecastingUnit.multiplier
                                      } else if (item.dataType == 2) {
                                        multiplier = item.planningUnit.multiplier
                                      } else {
                                        multiplier = item.otherUnit.multiplier
                                      }
                                    }
                                    if (qty != "") {
                                      qty = (Number(qty) / Number(multiplier)).toFixed(2)
                                    }
                                    return (<td><NumberFormat displayType={'text'} thousandSeparator={true} value={qty} /></td>)
                                  }
                                })}
                              </tr>
                              {this.state.regionList.map(r => (
                                <tr style={{ display: this.state.consumptionUnitShowArr.includes(item.forecastConsumptionUnitId) ? "" : "none" }}>
                                  <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                  <td align="left">{"       " + getLabelText(r.label, this.state.lang)}</td>
                                  {
                                    this.state.monthArray.map((item1, count) => {
                                      if (count == this.state.monthArray.length - 1) {
                                        var consumptionDataForMonth = this.state.consumptionList.filter(c => c.region.id == r.regionId && c.consumptionUnit.forecastConsumptionUnitId == item.forecastConsumptionUnitId)
                                        var qty = 0;
                                        if (consumptionDataForMonth.length > 0) {
                                          consumptionDataForMonth.map(c => {
                                            var reportingRate = c.reportingRate > 0 ? c.reportingRate : 100;
                                            qty += (Number(c.actualConsumption) / Number(reportingRate) / Number(1 - (Number(c.daysOfStockOut) / Number(moment(c.month, "YYYY-MM").daysInMonth())))) * 100;
                                            qty = qty
                                          })
                                        } else {
                                          qty = 0
                                        }


                                        var consumptionDataForMonth = this.state.consumptionList.filter(c => c.consumptionUnit.forecastConsumptionUnitId == item.forecastConsumptionUnitId)
                                        var qty1 = 0;
                                        if (consumptionDataForMonth.length > 0) {
                                          consumptionDataForMonth.map(c => {
                                            var reportingRate = c.reportingRate > 0 ? c.reportingRate : 100;
                                            qty1 += (Number(c.actualConsumption) / Number(reportingRate) / Number(1 - (Number(c.daysOfStockOut) / Number(moment(c.month, "YYYY-MM").daysInMonth())))) * 100;
                                          })
                                          qty1 = qty1.toFixed(2)
                                        } else {
                                          qty1 = 0
                                        }
                                        var per = (Number(qty) / Number(qty1)) * 100;
                                        return (<td>{Math.round(per)}%</td>)
                                      } else if (count == this.state.monthArray.length - 2) {
                                        var multiplier = 1;
                                        if (this.state.showInPlanningUnit) {
                                          if (item.dataType == 1) {
                                            multiplier = item.forecastingUnit.multiplier
                                          } else if (item.dataType == 2) {
                                            multiplier = item.planningUnit.multiplier
                                          } else {
                                            multiplier = item.otherUnit.multiplier
                                          }
                                        }
                                        var consumptionDataForMonth = this.state.consumptionList.filter(c => c.region.id == r.regionId && c.consumptionUnit.forecastConsumptionUnitId == item.forecastConsumptionUnitId)
                                        var qty = 0;
                                        if (consumptionDataForMonth.length > 0) {
                                          consumptionDataForMonth.map(c => {
                                            var reportingRate = c.reportingRate > 0 ? c.reportingRate : 100;
                                            qty += (Number(c.actualConsumption) / Number(reportingRate) / Number(1 - (Number(c.daysOfStockOut) / Number(moment(c.month, "YYYY-MM").daysInMonth())))) * 100;
                                            qty = qty
                                          })
                                        } else {
                                          qty = ""
                                        }
                                        if (qty != "") {
                                          qty = (Number(qty) / Number(multiplier)).toFixed(2)
                                        }
                                        return (<td align="left"><NumberFormat displayType={'text'} thousandSeparator={true} value={qty} /></td>)
                                      } else {
                                        var multiplier = 1;
                                        if (this.state.showInPlanningUnit) {
                                          if (item.dataType == 1) {
                                            multiplier = item.forecastingUnit.multiplier
                                          } else if (item.dataType == 2) {
                                            multiplier = item.planningUnit.multiplier
                                          } else {
                                            multiplier = item.otherUnit.multiplier
                                          }
                                        }
                                        var consumptionDataForMonth = this.state.consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM") && c.region.id == r.regionId && c.consumptionUnit.forecastConsumptionUnitId == item.forecastConsumptionUnitId)
                                        var qty = 0;
                                        if (consumptionDataForMonth.length > 0) {
                                          var reportingRate = consumptionDataForMonth[0].reportingRate > 0 ? consumptionDataForMonth[0].reportingRate : 100;
                                          qty = (Number(consumptionDataForMonth[0].actualConsumption) / Number(reportingRate) / Number(1 - (Number(consumptionDataForMonth[0].daysOfStockOut) / Number(item1.noOfDays)))) * 100;
                                          qty = (Number(qty) / Number(multiplier)).toFixed(2)
                                        } else {
                                          qty = ""
                                        }
                                        return (<td align="left"><NumberFormat displayType={'text'} thousandSeparator={true} value={qty} /></td>)
                                      }

                                    })}
                                </tr>
                              ))}
                            </>
                          )
                          )}

                        </tbody>
                      </Table>
                    </div>
                  </div>
                  <br></br>
                  <br></br>

                  {this.state.dataEl != "" &&
                    <div className="table-scroll">
                      <div className="table-wrap table-responsive">
                        <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" options={this.options}>
                          <tbody>
                            {this.state.consumptionUnitList.map(c => {
                              return (<tr>
                                <td>{this.state.selectedConsumptionUnitId != 0 ? <input type="radio" id="dataType" name="dataType" checked={c.dataType == this.state.selectedConsumptionUnitId ? true : false} readOnly ></input> : <input type="radio" id="dataType" name="dataType" checked={c.dataType == this.state.selectedConsumptionUnitId ? true : false}></input>}</td>
                                <td>{c.dataType == 1 ? "Forecasting Unit" : c.dataType == 2 ? "Planning Unit" : "Other"}</td>
                                <td>{c.dataType == 1 ? c.forecastingUnit.id : c.dataType == 2 ? c.planningUnit.id : c.otherUnit.id}</td>
                                <td>{c.dataType == 1 ? c.forecastingUnit.multiplier : c.dataType == 2 ? c.planningUnit.multiplier : c.otherUnit.multiplier}</td>
                              </tr>)
                            })}
                          </tbody>
                        </Table>
                      </div></div>
                  }
                  <br></br>
                  <br></br>
                  <div className="row">
                    <div className="col-md-12 pl-0 pr-0">
                      <div id="tableDiv" className="leftAlignTable">
                      </div>
                    </div>
                  </div>
                </>

              }
            </div>
          </CardBody>
          <CardFooter>
            <FormGroup>
              <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
              <Button type="button" id="formSubmitButton" size="md" color="success" className="float-right mr-1" onClick={() => this.saveConsumptionList()}><i className="fa fa-check"></i>Save</Button>
              &nbsp;
            </FormGroup>
          </CardFooter>
        </Card>
      </div >
    );
  }
}