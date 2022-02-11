import React from "react";
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import i18n from '../../i18n';
import { Row, Col, Card, CardFooter, Button, Table, CardBody, Form, Modal, ModalBody, PopoverBody, Popover, ModalFooter, ModalHeader, FormGroup, Label, FormFeedback, Input, InputGroupAddon, Collapse, InputGroupText, InputGroup } from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js';
import { DATE_FORMAT_CAP_WITHOUT_DATE,SECRET_KEY, JEXCEL_INTEGER_REGEX_FOR_DATA_ENTRY, INDEXED_DB_VERSION, INDEXED_DB_NAME, DATE_FORMAT_CAP, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE, JEXCEL_DATE_FORMAT_WITHOUT_DATE, ACTUAL_CONSUMPTION_TYPE, FORCASTED_CONSUMPTION_TYPE, JEXCEL_PAGINATION_OPTION, ACTUAL_CONSUMPTION_MONTHS_IN_PAST, FORECASTED_CONSUMPTION_MONTHS_IN_PAST, JEXCEL_PRO_KEY, JEXCEL_MONTH_PICKER_FORMAT, ACTUAL_CONSUMPTION_MODIFIED, FORECASTED_CONSUMPTION_MODIFIED } from "../../Constants";
import moment from "moment";
import CryptoJS from 'crypto-js'
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import { Bar, Line, Pie } from 'react-chartjs-2';
export default class TreeExtrapolationComponent extends React.Component {
 constructor(props) {
 super(props);
 this.pickRange = React.createRef();
 this.pickRange1 = React.createRef();
 var startDate = moment("2021-05-01").format("YYYY-MM-DD");
 var endDate = moment("2022-02-01").format("YYYY-MM-DD")
 this.state = {
 show: false,
 jexcelData: [
 {
 month: '2020-05-01',
 node: '155',
 reportingRate: '98%',
 adjustedActuals: '158',
 ma: '233',
 sa: '233',
 lr: '233',
 arima: '233',
 tesM: '233',
 selectedForecast: '233',
 manualChange: '0',
 monthEndFinal: '233'
 },
 {
 month: '2020-06-01',
 node: '180',
 reportingRate: '98%',
 adjustedActuals: '184',
 ma: '246',
 sa: '246',
 lr: '246',
 arima: '246',
 tesM: '246',
 selectedForecast: '246',
 manualChange: '0',
 monthEndFinal: '246'
 },
 {
 month: '2020-07-01',
 node: '',
 reportingRate: '98%',
 adjustedActuals: '0',
 ma: '260',
 sa: '260',
 lr: '260',
 arima: '260',
 tesM: '260',
 selectedForecast: '260',
 manualChange: '0',
 monthEndFinal: '260'
 },
 {
 month: '2020-08-01',
 node: '',
 reportingRate: '98%',
 adjustedActuals: '0',
 ma: '273',
 sa: '273',
 lr: '273',
 arima: '273',
 tesM: '273',
 selectedForecast: '273',
 manualChange: '0',
 monthEndFinal: '273'
 },
 {
 month: '2020-09-01',
 node: '',
 reportingRate: '98%',
 adjustedActuals: '0',
 ma: '287',
 sa: '287',
 lr: '287',
 arima: '287',
 tesM: '287',
 selectedForecast: '287',
 manualChange: '0',
 monthEndFinal: '287'
 },
 {
 month: '2020-10-01',
 node: '',
 reportingRate: '98%',
 adjustedActuals: '0',
 ma: '300',
 sa: '300',
 lr: '300',
 arima: '300',
 tesM: '300',
 selectedForecast: '300',
 manualChange: '0',
 monthEndFinal: '300'
 },
 {
 month: '2020-11-01',
 node: '',
 reportingRate: '70%',
 adjustedActuals: '0',
 ma: '314',
 sa: '314',
 lr: '314',
 arima: '314',
 tesM: '314',
 selectedForecast: '314',
 manualChange: '0',
 monthEndFinal: '314'
 },
 {
 month: '2020-12-01',
 node: '600',
 reportingRate: '98%',
 adjustedActuals: '612',
 ma: '327',
 sa: '327',
 lr: '327',
 arima: '327',
 tesM: '327',
 selectedForecast: '327',
 manualChange: '0',
 monthEndFinal: '327'
 },
 {
 month: '2021-01-01',
 node: '165',
 reportingRate: '98%',
 adjustedActuals: '168',
 ma: '340',
 sa: '340',
 lr: '340',
 arima: '340',
 tesM: '340',
 selectedForecast: '340',
 manualChange: '0',
 monthEndFinal: '340'
 },
 {
 month: '2021-02-01',
 node: '190',
 reportingRate: '98%',
 adjustedActuals: '194',
 ma: '354',
 sa: '354',
 lr: '354',
 arima: '354',
 tesM: '354',
 selectedForecast: '354',
 manualChange: '0',
 monthEndFinal: '354'
 },
 {
 month: '2021-03-01',
 node: '280',
 reportingRate: '98%',
 adjustedActuals: '286',
 ma: '367',
 sa: '367',
 lr: '367',
 arima: '367',
 tesM: '367',
 selectedForecast: '367',
 manualChange: '0',
 monthEndFinal: '367'
 },
 {
 month: '2021-04-01',
 node: '370',
 reportingRate: '',
 adjustedActuals: '',
 ma: '635',
 sa: '635',
 lr: '635',
 arima: '635',
 tesM: '635',
 selectedForecast: '635',
 manualChange: '0',
 monthEndFinal: '635'
 },
 {
 month: '2021-05-01',
 node: '460',
 reportingRate: '',
 adjustedActuals: '',
 ma: '172',
 sa: '172',
 lr: '172',
 arima: '172',
 tesM: '172',
 selectedForecast: '172',
 manualChange: '0',
 monthEndFinal: '172'
 },
 {
 month: '2021-06-01',
 node: '550',
 reportingRate: '',
 adjustedActuals: '',
 ma: '226',
 sa: '226',
 lr: '226',
 arima: '226',
 tesM: '226',
 selectedForecast: '226',
 manualChange: '0',
 monthEndFinal: '226'
 },
 {
 month: '2021-07-01',
 node: '640',
 reportingRate: '',
 adjustedActuals: '',
 ma: '329',
 sa: '329',
 lr: '329',
 arima: '329',
 tesM: '329',
 selectedForecast: '329',
 manualChange: '0',
 monthEndFinal: '329'
 },
 {
 month: '2021-08-01',
 node: '730',
 reportingRate: '',
 adjustedActuals: '',
 ma: '721',
 sa: '721',
 lr: '721',
 arima: '721',
 tesM: '721',
 selectedForecast: '721',
 manualChange: '0',
 monthEndFinal: '721'
 },
 {
 month: '2021-09-01',
 node: '820',
 reportingRate: '',
 adjustedActuals: '',
 ma: '439',
 sa: '439',
 lr: '439',
 arima: '439',
 tesM: '439',
 selectedForecast: '439',
 manualChange: '0',
 monthEndFinal: '439'
 },
 {
 month: '2021-10-01',
 node: '910',
 reportingRate: '',
 adjustedActuals: '',
 ma: '453',
 sa: '453',
 lr: '453',
 arima: '453',
 tesM: '453',
 selectedForecast: '453',
 manualChange: '0',
 monthEndFinal: '453'
 },
 {
 month: '2021-11-01',
 node: '',
 reportingRate: '',
 adjustedActuals: '',
 ma: '468',
 sa: '468',
 lr: '468',
 arima: '468',
 tesM: '468',
 selectedForecast: '468',
 manualChange: '0',
 monthEndFinal: '468'
 },
 {
 month: '2021-12-01',
 node: '',
 reportingRate: '',
 adjustedActuals: '',
 ma: '482',
 sa: '482',
 lr: '482',
 arima: '482',
 tesM: '482',
 selectedForecast: '482',
 manualChange: '0',
 monthEndFinal: '482'
 },
 {
 month: '2022-01-01',
 node: '',
 reportingRate: '',
 adjustedActuals: '',
 ma: '496',
 sa: '496',
 lr: '496',
 arima: '496',
 tesM: '496',
 selectedForecast: '496',
 manualChange: '0',
 monthEndFinal: '496'
 },
 {
 month: '2022-02-01',
 node: '',
 reportingRate: '',
 adjustedActuals: '',
 ma: '510',
 sa: '510',
 lr: '510',
 arima: '510',
 tesM: '510',
 selectedForecast: '510',
 manualChange: '0',
 monthEndFinal: '510'
 },
 {
 month: '2022-03-01',
 node: '',
 reportingRate: '',
 adjustedActuals: '',
 ma: '525',
 sa: '525',
 lr: '525',
 arima: '525',
 tesM: '525',
 selectedForecast: '525',
 manualChange: '0',
 monthEndFinal: '525'
 },
 {
 month: '2022-04-01',
 node: '',
 reportingRate: '',
 adjustedActuals: '',
 ma: '539',
 sa: '539',
 lr: '539',
 arima: '539',
 tesM: '539',
 selectedForecast: '539',
 manualChange: '0',
 monthEndFinal: '539'
 },
 {
 month: '2022-05-01',
 node: '',
 reportingRate: '',
 adjustedActuals: '',
 ma: '553',
 sa: '553',
 lr: '553',
 arima: '553',
 tesM: '553',
 selectedForecast: '553',
 manualChange: '0',
 monthEndFinal: '553'
 },
 {
 month: '2022-06-01',
 node: '',
 reportingRate: '',
 adjustedActuals: '',
 ma: '567',
 sa: '567',
 lr: '567',
 arima: '567',
 tesM: '567',
 selectedForecast: '567',
 manualChange: '0',
 monthEndFinal: '567'
 },
 {
 month: '2022-07-01',
 node: '',
 reportingRate: '',
 adjustedActuals: '',
 ma: '582',
 sa: '582',
 lr: '582',
 arima: '582',
 tesM: '582',
 selectedForecast: '582',
 manualChange: '0',
 monthEndFinal: '582'
 },
 {
 month: '2022-08-01',
 node: '',
 reportingRate: '',
 adjustedActuals: '',
 ma: '596',
 sa: '596',
 lr: '596',
 arima: '596',
 tesM: '596',
 selectedForecast: '596',
 manualChange: '0',
 monthEndFinal: '596'
 },
 {
 month: '2022-09-01',
 node: '',
 reportingRate: '',
 adjustedActuals: '',
 ma: '610',
 sa: '610',
 lr: '610',
 arima: '610',
 tesM: '610',
 selectedForecast: '610',
 manualChange: '0',
 monthEndFinal: '610'
 },
 {
 month: '2022-10-01',
 node: '',
 reportingRate: '',
 adjustedActuals: '',
 ma: '624',
 sa: '624',
 lr: '624',
 arima: '624',
 tesM: '624',
 selectedForecast: '624',
 manualChange: '0',
 monthEndFinal: '624'
 },
 {
 month: '2022-11-01',
 node: '',
 reportingRate: '',
 adjustedActuals: '',
 ma: '638',
 sa: '638',
 lr: '638',
 arima: '638',
 tesM: '638',
 selectedForecast: '638',
 manualChange: '0',
 monthEndFinal: '638'
 },
 {
 month: '2022-12-01',
 node: '',
 reportingRate: '',
 adjustedActuals: '',
 ma: '653',
 sa: '653',
 lr: '653',
 arima: '653',
 tesM: '653',
 selectedForecast: '653',
 manualChange: '0',
 monthEndFinal: '653'
 }
 ],
 dataList: [
 {
 months: '2022-01-01',
 actuals: '1000',
 movingAverages: '2000',
 semiAveragesForecast: '30000',
 linearRegression: '40000',
 tesLcb: '50000',
 arimaForecast: '60000',
 tesMedium: '80000',
 tesUcb: '97000'
 },
 {
 months: '2022-02-01',
 actuals: '10000',
 movingAverages: '20000',
 semiAveragesForecast: '30000',
 linearRegression: '400000',
 tesLcb: '500000',
 arimaForecast: '60000',
 tesMedium: '80000',
 tesUcb: '97000'
 }
 ],
 minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
 maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
 rangeValue: { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(endDate).getFullYear(), month: new Date(endDate).getMonth() + 1 } },
 movingAvgId: true,
 semiAvgId: true,
 linearRegressionId: true,
 smoothingId: true,
 arimaId: true,
 popoverChooseMethod: false,
 popoverOpenMa: false,
 popoverOpenSa: false,
 popoverOpenLr: false,
 popoverOpenTes: false,
 popoverOpenArima: false
 }
 this.buildJexcel = this.buildJexcel.bind(this);
 }
 buildJexcel() {
 let dataArray = [];
 let data = [];
 var list = this.state.jexcelData;
 let count = 0;
 for (var j = 0; j < list.length; j++) {
 data = [];
 data[0] = list[j].month
 data[1] = list[j].node
 data[2] = list[j].reportingRate
 data[3] = list[j].adjustedActuals
 data[4] = list[j].ma
 data[5] = list[j].sa
 data[6] = list[j].lr
 data[7] = list[j].arima
 data[8] = list[j].tesM
 data[9] = list[j].selectedForecast
 data[10] = list[j].manualChange
 data[11] = list[j].monthEndFinal
 dataArray[count] = data;
 count++;
 }

 this.el = jexcel(document.getElementById("tableDiv"), '');
 this.el.destroy();

 let nestedHeaders = [];
                                    nestedHeaders.push(
                                        {
                                            title: '',
                                            colspan: '4'
                                        },

                                    );
                                    nestedHeaders.push(
                                        {
                                            title: 'Forecast',
                                            colspan: '5'
                                        },
                                    );
                                    nestedHeaders.push(
                                        {
                                            title: '',
                                            colspan: '3'
                                        },
                                    );

 var options = {
 data: dataArray,
 columnDrag: true,
 nestedHeaders: [nestedHeaders],
 columns: [
 {
 title: 'Month',
 type: 'calendar', options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100
 },
 {
 title: '1L ARV Patients',
 type: 'number'
 },
 {
 title: 'Reporting Rate',
 type: 'number'
 },
 {
 title: '1L ARV Patients(Adjusted)',
 type: 'number',
 readOnly: true
 },
 {
 title: 'Moving Averages',
 type: 'number',
 readOnly: true
 },
 {
 title: 'Semi-Averages',
 type: 'number',
 readOnly: true
 },
 {
 title: 'Linear Regression',
 type: 'number',
 readOnly: true
 },
 {
 title: 'TES',
 type: 'number',
 readOnly: true
 },
 {
 title: 'ARIMA',
 type: 'number',
 readOnly: true
 },

 {
 title: 'Selected Forecast',
 type: 'number',
 readOnly: true
 },
 {
 title: 'Manual Change (+/-)',
 type: 'number'
 },
 {
 title: 'Month End (Final)',
 type: 'number',
 readOnly: true
 },
 ],

 text: {
 // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
 showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
 show: '',
 entries: '',
 },
 onload: this.loadedExtrapolation,
 pagination: false,
 search: false,
 columnSorting: true,
 tableOverflow: true,
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
 var dataEl = jexcel(document.getElementById("tableDiv"), options);
 this.el = dataEl;
 this.setState({
 // dataEl: dataEl, loading: false,
 // inputDataFilter: inputData,
 // inputDataAverageFilter: inputDataAverage,
 // inputDataRegressionFilter: inputDataRegression,
 // startMonthForExtrapolation: startMonth
 })
 }
 loadedExtrapolation = function (instance, cell, x, y, value) {
//  jExcelLoadedFunctionWithoutPagination(instance);
 jExcelLoadedFunctionOnlyHideRow(instance);
 var asterisk = document.getElementsByClassName("resizable")[0];
 var tr = asterisk.firstChild.nextSibling;
 console.log("asterisk",asterisk.firstChild.nextSibling)

 tr.children[3].classList.add('InfoTr');
 tr.children[5].classList.add('InfoTr');
 tr.children[6].classList.add('InfoTr');
 tr.children[7].classList.add('InfoTr');
 tr.children[8].classList.add('InfoTr');
 tr.children[9].classList.add('InfoTr');


 }

 setMovingAvgId(e) {
 var movingAvgId = e.target.checked;
 this.setState({
 movingAvgId: movingAvgId
 })
 }
 setSemiAvgId(e) {
 var semiAvgId = e.target.checked;
 this.setState({
 semiAvgId: semiAvgId
 })
 }
 setLinearRegressionId(e) {
 var linearRegressionId = e.target.checked;
 this.setState({
 linearRegressionId: linearRegressionId
 })
 }
 setSmoothingId(e) {
 var smoothingId = e.target.checked;
 this.setState({
 smoothingId: smoothingId
 })
 }
 setArimaId(e) {
 var arimaId = e.target.checked;
 this.setState({
 arimaId: arimaId
 })
 }
 getDatasetData(e) {

 }

 toggleChooseMethod() {
    this.setState({
        popoverChooseMethod: !this.state.popoverChooseMethod,
    });
  }
  toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

 render() {
 const pickerLang = {
 months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
 from: 'From', to: 'To',
 }
 const makeText = m => {
 if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
 return '?'
 }
 const { rangeValue, rangeValue1 } = this.state;
 const options = {
 title: {
 display: false,
 },

 scales: {
 yAxes: [{
 scaleLabel: {
 display: true,
 labelString: 'People',
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
 }
 }],
 xAxes: [
 {
 id: 'xAxis1',
 gridLines: {
 color: "rgba(0, 0, 0, 0)",
 },
 scaleLabel: {
 display: true,
 labelString: 'Month',
 fontColor: 'black'
 },
 ticks: {
 fontColor: 'black',
 callback: function (label) {
 console.log("month label---",label);
 var xAxis1 = label
 xAxis1 += '';
 console.log("month graph---",xAxis1.split('-')[0])
 var month = moment(label).format(DATE_FORMAT_CAP_WITHOUT_DATE);
 return month;
 }
 }
 },
 {
 id: 'xAxis2',
 gridLines: {
 drawOnChartArea: false, // only want the grid lines for one axis to show up
 },
 ticks: {
 callback: function (label) {
 var xAxis2 = label
 xAxis2 += '';
 var month = xAxis2.split('-')[0];
 var year = xAxis2.split('-')[1];
 if (month === "Feb") {
 return year;
 } else {
 return "";
 }
 }
 }
 }]
 },

 // tooltips: {
 // enabled: false,
 // custom: CustomTooltips,
 // callbacks: {
 // label: function (tooltipItem, data) {

 // let label = data.labels[tooltipItem.index];
 // let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

 // var cell1 = value
 // cell1 += '';
 // var x = cell1.split('.');
 // var x1 = x[0];
 // var x2 = x.length > 1 ? '.' + x[1] : '';
 // var rgx = /(\d+)(\d{3})/;
 // while (rgx.test(x1)) {
 // x1 = x1.replace(rgx, '$1' + ',' + '$2');
 // }
 // return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
 // }
 // }

 // },

 maintainAspectRatio: false,
 legend: {
 display: true,
 position: 'bottom',
 labels: {
 usePointStyle: true,
 fontColor: "black"
 }
 }
 }


 let line = "";
 line = {
 labels: this.state.jexcelData.map((item, index) => (item.month)),
 datasets: [
 {
 type: "line",
 pointRadius: 0,
 lineTension: 0,
 label: 'Adjusted Actuals',
 backgroundColor: 'transparent',
 borderColor: '#CFCDC9',
 ticks: {
 fontSize: 2,
 fontColor: 'transparent',
 },
 showInLegend: true,
 pointStyle: 'line',
 pointBorderWidth: 5,
 yValueFormatString: "###,###,###,###",
 data: this.state.jexcelData.map((item, index) => (item.adjustedActuals > 0 ? item.adjustedActuals : null))
 },
 {
 type: "line",
 pointRadius: 0,
 lineTension: 0,
 label: 'Moving Averages',
 backgroundColor: 'transparent',
 borderColor: '#A7C6ED',
 ticks: {
 fontSize: 2,
 fontColor: 'transparent',
 },
 showInLegend: true,
 pointStyle: 'line',
 pointBorderWidth: 5,
 yValueFormatString: "###,###,###,###",
 data: this.state.jexcelData.map((item, index) => (item.ma > 0 ? item.ma : null))
 },
 {
 type: "line",
 pointRadius: 0,
 lineTension: 0,
 label: 'Semi-Averages',
 backgroundColor: 'transparent',
 borderColor: '#49A4A1',
 ticks: {
 fontSize: 2,
 fontColor: 'transparent',
 },
 showInLegend: true,
 pointStyle: 'line',
 pointBorderWidth: 5,
 yValueFormatString: "###,###,###,###",
 data: this.state.jexcelData.map((item, index) => (item.sa > 0 ? item.sa : null))
 },
 {
 type: "line",
 pointRadius: 0,
 lineTension: 0,
 label: 'Linear Regression',
 backgroundColor: 'transparent',
 borderColor: '#118B70',
 ticks: {
 fontSize: 2,
 fontColor: 'transparent',
 },
 showInLegend: true,
 pointStyle: 'line',
 pointBorderWidth: 5,
 yValueFormatString: "###,###,###,###",
 data: this.state.jexcelData.map((item, index) => (item.lr > 0 ? item.lr : null))
 },
 {
 type: "line",
 pointRadius: 0,
 lineTension: 0,
 label: 'TES (Lower Confidence Bound)',
 backgroundColor: 'transparent',
 borderColor: '#002FC6',
 ticks: {
 fontSize: 2,
 fontColor: 'transparent',
 },
 showInLegend: true,
 pointStyle: 'line',
 pointBorderWidth: 5,
 yValueFormatString: "###,###,###,###",
 data: this.state.jexcelData.map((item, index) => (item.tesM > 0 ? item.tesM : null))
 },
 {
 type: "line",
 pointRadius: 0,
 lineTension: 0,
 label: 'TES (Medium)',
 backgroundColor: 'transparent',
 borderColor: '#651D32',
 ticks: {
 fontSize: 2,
 fontColor: 'transparent',
 },
 showInLegend: true,
 pointStyle: 'line',
 pointBorderWidth: 5,
 yValueFormatString: "###,###,###,###",
 data: this.state.jexcelData.map((item, index) => (item.tesM > 0 ? item.tesM : null))
 },
 {
 type: "line",
 pointRadius: 0,
 lineTension: 0,
 label: 'TES (Upper Confidence Bound)',
 backgroundColor: 'transparent',
 borderColor: '#6c6463',
 ticks: {
 fontSize: 2,
 fontColor: 'transparent',
 },
 showInLegend: true,
 pointStyle: 'line',
 pointBorderWidth: 5,
 yValueFormatString: "###,###,###,###",
 data: this.state.jexcelData.map((item, index) => (item.tesM > 0 ? item.tesM : null))
 },
 {
 type: "line",
 pointRadius: 0,
 lineTension: 0,
 label: 'ARIMA',
 backgroundColor: 'transparent',
 borderColor: '#BA0C2F',
 ticks: {
 fontSize: 2,
 fontColor: 'transparent',
 },
 showInLegend: true,
 pointStyle: 'line',
 pointBorderWidth: 5,
 yValueFormatString: "###,###,###,###",
 data: this.state.jexcelData.map((item, index) => (item.arima > 0 ? item.arima : null))
 }
 ]
 }
 return (
 <div className="animated fadeIn">
 <CardBody className="pb-lg-2 pt-lg-0">
 <div className="row pt-lg-0" style={{ float: 'right',marginTop:'-42px' }}>
 <div className="col-md-12">
 {/* <SupplyPlanFormulas ref="formulaeChild" /> */}
 <a className="">
 <span style={{ cursor: 'pointer', color: '20a8d8' }} ><small className="supplyplanformulas">{i18n.t('Show Guidance')}</small></span>

 </a>
 </div>
 </div>
 <Form name='simpleForm'>
 <div className=" pl-0">
 <div className="row">
 <FormGroup className="col-md-3 pl-lg-0">
 <Label htmlFor="appendedInputButton">Start Month for Historical Data<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
 <div className="controls edit">

 <Picker
 years={{ min: this.state.minDate, max: this.state.maxDate }}
 ref={this.pickRange1}
 years={{ min: this.state.minDate, max: this.state.maxDate }}
 value={{
 year: new Date().getFullYear(), month: ("0" + (new Date().getMonth() + 1)).slice(-2)
 }}
 lang={pickerLang}
 // theme="light"
 onChange={this.handleRangeChange5}
 onDismiss={this.handleRangeDissmis5}
 readOnly
 >
 <MonthBox value={makeText({ year: new Date().getFullYear(), month: ("0" + (new Date().getMonth() + 1)).slice(-2) })} onClick={this._handleClickRangeBox5} />
 </Picker>
 </div>
 </FormGroup>
 <FormGroup className="col-md-3">
 <Label htmlFor="appendedInputButton">Forecast Period<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
 <div className="controls edit">

 <Picker
 years={{ min: this.state.minDate, max: this.state.maxDate }}
 ref={this.pickRange}
 value={rangeValue}
 lang={pickerLang}
 // theme="light"
 // onChange={this.handleRangeChange}
 // onDismiss={this.handleRangeDissmis}
 className="greyColor"
 >
 <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} />
 </Picker>
 </div>
 </FormGroup>
 {/* <FormGroup className="col-md-3">
 
 <div>
 Show Guidance
 </div>
 </FormGroup> */}
 </div>
 <div className="row">
 <FormGroup className="col-md-12 " style={{ display: this.state.show ? "block" : "none" }}>
 <div className="check inline pl-lg-3 pt-lg-2">
  <div className="row pl-lg-1 pb-lg-2">   
 <div>
 <Popover placement="top" isOpen={this.state.popoverOpenMa} target="Popover1" trigger="hover" toggle={() => this.toggle('popoverOpenMa', !this.state.popoverOpenMa)}>
 <PopoverBody>Need to add Info.</PopoverBody>
 </Popover>
 </div>
 <div>
 <Input
 className="form-check-input"
 type="checkbox"
 id="movingAvgId"
 name="movingAvgId"
 checked={this.state.movingAvgId}
 onClick={(e) => { this.setMovingAvgId(e); }}
 />
 <Label
 className="form-check-label"
 check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
 <b>Moving Averages</b>
 <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenMa', !this.state.popoverOpenMa)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
 </Label>
 </div>
 {this.state.movingAvgId &&
 <div className="col-md-3 pt-lg-0">
 <Label htmlFor="appendedInputButton"># of Months</Label>
 <Input
 className="controls"
 type="text"
 bsSize="sm"
 id="noOfMonthsId"
 name="noOfMonthsId"
 onChange={(e) => { this.getDatasetData(e); }}
 />
 </div>
 }
 </div>
 <div className="row pl-lg-1 pb-lg-2">
 <div>
 <Popover placement="top" isOpen={this.state.popoverOpenSa} target="Popover1" trigger="hover" toggle={() => this.toggle('popoverOpenMa', !this.state.popoverOpenSa)}>
 <PopoverBody>Need to add Info.</PopoverBody>
 </Popover>
 </div>
 <div className="pt-lg-2">
 <Input
 className="form-check-input"
 type="checkbox"
 id="semiAvgId"
 name="semiAvgId"
 checked={this.state.semiAvgId}
 onClick={(e) => { this.setSemiAvgId(e); }}
 />
 <Label
 className="form-check-label"
 check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
 <b>Semi-Averages</b>
 <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenSa', !this.state.popoverOpenSa)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
 </Label>
 </div>
 </div>
 <div className="row pl-lg-1 pb-lg-2">
 <div>
 <Popover placement="top" isOpen={this.state.popoverOpenLr} target="Popover1" trigger="hover" toggle={() => this.toggle('popoverOpenLr', !this.state.popoverOpenLr)}>
 <PopoverBody>Need to add Info.</PopoverBody>
 </Popover>
 </div>
 <div className="pt-lg-2">
 <Input
 className="form-check-input"
 type="checkbox"
 id="linearRegressionId"
 name="linearRegressionId"
 checked={this.state.linearRegressionId}
 onClick={(e) => { this.setLinearRegressionId(e); }}
 />
 <Label
 className="form-check-label"
 check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
 <b>Linear Regression</b>
 <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenLr', !this.state.popoverOpenLr)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
 </Label>
 </div>
 </div>
 <div className="row pl-lg-1 pb-lg-2">
 <div>
 <Popover placement="top" isOpen={this.state.popoverOpenTes} target="Popover1" trigger="hover" toggle={() => this.toggle('popoverOpenMa', !this.state.popoverOpenTes)}>
 <PopoverBody>Need to add Info.</PopoverBody>
 </Popover>
 </div>
 <div className="pt-lg-2">
 <Input
 className="form-check-input"
 type="checkbox"
 id="smoothingId"
 name="smoothingId"
 checked={this.state.smoothingId}
 onClick={(e) => { this.setSmoothingId(e); }}
 />
 <Label
 className="form-check-label"
 check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
 <b>Triple-Exponential Smoothing (Holts-Winters)</b>
 <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenTes', !this.state.popoverOpenTes)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
 </Label>
 </div>
 {this.state.smoothingId &&
 <div className="pt-lg-0" style={{display:'contents'}}>
 <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
 <Label htmlFor="appendedInputButton">Confidence level</Label>
 <Input
 className="controls"
 type="text"
 bsSize="sm"
 id="confidenceLevelId"
 name="confidenceLevelId"
 />
 </div>
 <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
 <Label htmlFor="appendedInputButton">Seasonality</Label>
 <Input
 className="controls"
 type="text"
 bsSize="sm"
 id="seasonalityId"
 name="seasonalityId"
 />
 </div>
 {/* <div className="col-md-3">
 <Input
 className="form-check-input"
 type="checkbox"
 id="showAdvanceId"
 name="showAdvanceId"
 checked={this.state.showAdvanceId}
 onClick={(e) => { this.setShowAdvanceId(e); }}
 />
 <Label
 className="form-check-label"
 check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
 Show Advance
 </Label>
 </div> */}

<div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
 <Label htmlFor="appendedInputButton">Alpha</Label>
 <Input
 className="controls"
 type="text"
 id="alphaId"
 bsSize="sm"
 name="alphaId"
 />
 </div>
 <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
 <Label htmlFor="appendedInputButton">Beta</Label>
 <Input
 className="controls"
 type="text"
 id="betaId"
 bsSize="sm"
 name="betaId"
 />
 </div>
 <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
 <Label htmlFor="appendedInputButton">Gamma</Label>
 <Input
 className="controls"
 type="text"
 bsSize="sm"
 id="gammaId"
 name="gammaId"
 />
 </div>
 <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
 <Label htmlFor="appendedInputButton">Phi</Label>
 <Input
 className="controls"
 type="text"
 id="phiId"
 bsSize="sm"
 name="phiId"
 />
 </div>
 </div>
 }
 </div>
 <div className="row pl-lg-1 pb-lg-2">
 <div>
 <Popover placement="top" isOpen={this.state.popoverOpenArima} target="Popover1" trigger="hover" toggle={() => this.toggle('popoverOpenArima', !this.state.popoverOpenArima)}>
 <PopoverBody>Need to add Info.</PopoverBody>
 </Popover>
 </div>
 <div className="pt-lg-2">
 <Input
 className="form-check-input"
 type="checkbox"
 id="arimaId"
 name="arimaId"
 checked={this.state.arimaId}
 onClick={(e) => { this.setArimaId(e); }}
 />
 <Label
 className="form-check-label"
 check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
 <b>Autoregressive Integrated Moving Average (ARIMA)</b>
 <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenArima', !this.state.popoverOpenArima)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
 </Label>
 </div>
 {this.state.arimaId &&
 <div className="pt-lg-0" style={{display:'contents'}}>
 <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
 <Label htmlFor="appendedInputButton">p</Label>
 <Input
 className="controls"
 type="text"
 id="pId"
 bsSize="sm"
 name="pId"
 />
 </div>
 <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
 <Label htmlFor="appendedInputButton">d</Label>
 <Input
 className="controls"
 type="text"
 id="dId"
 bsSize="sm"
 name="dId"
 />
 </div>
 <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
 <Label htmlFor="appendedInputButton">q</Label>
 <Input
 className="controls"
 type="text"
 id="qId"
 bsSize="sm"
 name="qId"
 />
 </div>
 </div>
 }
 </div>
 </div>
 </FormGroup>
 </div>
 <div className="col-md-12 text-center pt-lg-3">
 <Button className="mr-1 btn btn-info btn-md " onClick={this.toggledata}>
  {this.state.show ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}
</Button>
 <Button type="submit" color="success" className="mr-1" size="md">Interpolate</Button>
 </div>
 </div>
 </Form>
 <div className="col-md-12 pl-lg-0 pr-lg-0 pt-lg-3">
 <div className="col-md-6">
 {/* <Button type="button" size="md" color="info" className="float-left mr-1" onClick={this.resetTree}>{'Show/hide data'}</Button> */}
 </div>
 <div className="col-md-4 float-right" style={{marginTop:'-42px'}}>
 <FormGroup className="float-right" >
 <div className="check inline pl-lg-1 pt-lg-0">
 <div>
 <Input
 className="form-check-input checkboxMargin"
 type="checkbox"
 id="manualChangeExtrapolation"
 name="manualChangeExtrapolation"
 // checked={true}
 checked={false}
 // onClick={(e) => { this.momCheckbox(e); }}
 />
 <Label
 className="form-check-label"
 check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
 <b>{'Manual change affects future months (cumulative)'}</b>
 </Label>
 </div>
 </div>
 </FormGroup>
 </div>
 </div>
 <div id="tableDiv" className="extrapolateTable consumptionDataEntryTable"></div>
 {/* Graph */}
 <div className="col-md-12 pt-lg-4">
 <div className="chart-wrapper chart-graph-report pl-0 ml-0" style={{ marginLeft: '50px' }}>
 <Line id="cool-canvas" data={line} options={options} />
 <div>

 </div>
 </div>
 </div>
 <div className="table-scroll">
 <div className="table-wrap table-responsive">
 <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" >
 <thead>
 <tr>
 <td width="60px" className="text-left" title="Errors"><b>Errors</b> <i className="fa fa-info-circle icons" style={{cursor:'pointer',color:'#002f6c'}}></i></td>
 {this.state.movingAvgId &&
 <td width="110px"><b>Moving Averages</b></td>
 }
 <td width="110px"><b>Semi Averages</b></td>
 <td width="110px"><b>Linear Regression</b></td>
 <td width="110px"><b>TES</b></td>
 <td width="110px"><b>ARIMA</b></td>
 </tr>
 </thead>
 <tbody>
 <tr>
 <td className="text-left">RMSE</td>
 {this.state.movingAvgId &&
 <td>199.896015</td>
 }
 <td>180.873394</td>
 <td className="ErrortdBg">176.258641</td>
 <td></td>
 <td></td>
 </tr>
 <tr>
 <td className="text-left">MAPE</td>
 {this.state.movingAvgId &&
 <td>0.506926</td>
 }
 <td>0.531222</td>
 <td className="ErrortdBg">0.506034</td>
 <td></td>
 <td></td>
 </tr>
 <tr>
 <td className="text-left">MSE</td>
 {this.state.movingAvgId &&
 <td>39958.416892</td>
 }
 <td>32715.184570</td>
 <td className="ErrortdBg">31067.108640</td>
 <td></td>
 <td></td>
 </tr>
 <tr>
 <td className="text-left">WAPE</td>
 {this.state.movingAvgId &&
 <td></td>
 }
 <td></td>
 <td></td>
 <td></td>
 <td></td>
 </tr>
 <tr>
 <td className="text-left">R^2</td>
 {this.state.movingAvgId &&
 <td></td>
 }
 <td></td>
 <td></td>
 <td></td>
 <td></td>
 </tr>
 </tbody>
 </Table>
 </div>
 </div>
 <div className="col-md-12 pl-lg-0 pt-lg-3 pb-lg-3">
                    <ul className="legendcommitversion pl-lg-0">
                                <li><span className="lowestErrorGreenLegend legendcolor"></span> <span className="legendcommitversionText">Lowest Error</span></li>
                                
                            </ul>
                    </div>
 <div className="col-md-12 pl-lg-0">
 <Row>
 <FormGroup className="col-md-3">
 <Label htmlFor="currencyId">Choose Method<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.togglepopoverChooseMethod('popoverChooseMethod', !this.state.popoverChooseMethod)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
 <InputGroup>
 <Input
 type="select"
 name="extrapolationMethodId"
 id="extrapolationMethodId"
 bsSize="sm"
 // value={this.state.programId}
 // onChange={(e) => { this.setStartAndStopDateOfProgram(e.target.value) }}
 >
 <option value="">{"Linear Regression"}</option>
 <option value="">{"Semi-Averages"}</option>
 <option value="">{"Moving Averages"}</option>
 <option value="">{"ARIMA"}</option>
 <option value="">{"Triple Exponential Smoothing (Holtz-Wnters)"}</option>
 </Input>

 </InputGroup>

 </FormGroup>
 <div>
 <Popover placement="top" isOpen={this.state.popoverChooseMethod} target="Popover1" trigger="hover" toggleChooseMethod={() => this.toggleChooseMethod('popoverChooseMethod', !this.state.popoverChooseMethod)}>
 <PopoverBody>Need to add Info.</PopoverBody>
 </Popover>
 </div>
 <FormGroup className="col-md-5">
 <Label htmlFor="currencyId">Notes</Label>
 <InputGroup>
 <Input
 type="textarea"
 name="notesExtrapolation"
 id="notesExtrapolation"
 bsSize="sm"
 // value={this.state.programId}
 // onChange={(e) => { this.setStartAndStopDateOfProgram(e.target.value) }}
 ></Input>

 </InputGroup>

 </FormGroup>
 <FormGroup className="pl-lg-3 ExtrapolateSaveBtn">
 <Button type="submit" color="success" className="mr-1 float-right" size="md"><i className="fa fa-check"></i>{i18n.t('static.pipeline.save')}</Button>
 </FormGroup>
 </Row>
 </div>
 </CardBody>
 </div>
 )
 }
}