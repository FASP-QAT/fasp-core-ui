import React, { Component, lazy, Suspense, DatePicker } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  ButtonDropdown,
  ButtonGroup,
  ButtonToolbar,
  Card,
  CardBody,
  // CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Widgets,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Progress,
  Pagination,
  PaginationItem,
  PaginationLink,
  Row,
  CardColumns,
  Table, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { getStyle, hexToRgba } from '@coreui/coreui-pro/dist/js/coreui-utilities'
import i18n from '../../i18n'
import Pdf from "react-to-pdf"
import AuthenticationService from '../Common/AuthenticationService.js';
import RealmService from '../../api/RealmService';
import getLabelText from '../../CommonComponent/getLabelText';
import PlanningUnitService from '../../api/PlanningUnitService';
import ProductService from '../../api/ProductService';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import ProgramService from '../../api/ProgramService';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, REPORT_DATEPICKER_START_MONTH, REPORT_DATEPICKER_END_MONTH } from '../../Constants.js'
import moment, { version } from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import pdfIcon from '../../assets/img/pdf.png';
import { Online, Offline } from "react-detect-offline";
import csvicon from '../../assets/img/csv.png'
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import RealmCountryService from '../../api/RealmCountryService';
import ReportService from '../../api/ReportService';
import SupplyPlanFormulas from '../SupplyPlan/SupplyPlanFormulas';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
//import fs from 'fs'
const Widget04 = lazy(() => import('../Widgets/Widget04'));
// const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));
const ref = React.createRef();

const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')
const pickerLang = {
  months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
  from: 'From', to: 'To',
}







//Random Numbers
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

var elements = 27;
var data1 = [];
var data2 = [];
var data3 = [];

for (var i = 0; i <= elements; i++) {
  data1.push(random(50, 200));
  data2.push(random(80, 100));
  data3.push(65);
}




class ForcastMatrixOverTime extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);
    var dt = new Date();
    dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
    var dt1 = new Date();
    dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
    this.state = {
      loading: true,
      matricsList: [],
      dropdownOpen: false,
      radioSelected: 2,
      programs: [],
      versions: [],
      productCategories: [],
      planningUnits: [],
      categories: [],
      countries: [],
      show: false,
      singleValue2: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
      // rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
      rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
      minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
      maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
      programId: '',
      versionId: '',
      planningUnitLabel: ''


    };

    this.fetchData = this.fetchData.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeChange = this.handleRangeChange.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    // this.getPlanningUnit = this.getPlanningUnit.bind(this);
    // this.getProductCategories = this.getProductCategories.bind(this)
    //this.pickRange = React.createRef()
    this.hideSecondComponent = this.hideSecondComponent.bind(this);
    this.setProgramId = this.setProgramId.bind(this);
    this.setVersionId = this.setVersionId.bind(this);
  }
  hideSecondComponent() {
    document.getElementById('div2').style.display = 'block';
    setTimeout(function () {
      document.getElementById('div2').style.display = 'none';
    }, 30000);
  }

  formatter = value => {
    if (value != null) {
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
    } else {
      return '';
    }
  }
  dateFormatter = value => {
    return moment(value).format('MMM YY')
  }
  makeText = m => {
    if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
    return '?'
  }
  roundN = num => {
    if (num != '' && num != null) {
      return Number(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
    } else {
      return NaN
    }
  }
  round = num => {
    if (num != '' && num != null) {
      return Number(Math.round(num * Math.pow(10, 0)) / Math.pow(10, 0));
    } else {
      return NaN
    }
  }
  PercentageFormatter = num => {

    if (num != '' && num != null) {
      return parseFloat(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2) + '%';
    } else {
      return ''
    }
  }
  toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));
  addDoubleQuoteToRowContent = (arr) => {
    return arr.map(ele => '"' + ele + '"')
  }
  exportCSV() {

    var csvRow = [];
    csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.report.timeWindow') + ' : ' + (document.getElementById("viewById").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.program.program') + ': ' + (document.getElementById("programId").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.report.versionFinal*') + ' : ' + (document.getElementById("versionId").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + (document.getElementById("planningUnitId").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('')
    csvRow.push(('"' + i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    var re;
    var A = [this.addDoubleQuoteToRowContent([(i18n.t('static.report.month')).replaceAll(' ', '%20'), (i18n.t('static.report.forecastConsumption')).replaceAll(' ', '%20'), (i18n.t('static.report.actualConsumption')).replaceAll(' ', '%20'), ((i18n.t('static.report.error')).replaceAll(' ', '%20')).replaceAll(' ', '%20')])]

    re = this.state.matricsList


    for (var item = 0; item < re.length; item++) {
      A.push(this.addDoubleQuoteToRowContent([this.dateFormatter(re[item].month).replaceAll(' ', '%20'), re[item].forecastedConsumption == null ? '' : re[item].forecastedConsumption, re[item].actualConsumption == null ? '' : re[item].actualConsumption, re[item].message == null ? this.PercentageFormatter(re[item].forecastError) : (i18n.t(re[item].message)).replaceAll(' ', '%20')]))
    }
    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","))
    }
    var csvString = csvRow.join("%0A")
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.report.forecasterrorovertime') + ".csv"
    document.body.appendChild(a)
    a.click()
  }


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
    const addHeaders = doc => {
      const pageCount = doc.internal.getNumberOfPages()


      for (var i = 1; i <= pageCount; i++) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')

        doc.setPage(i)

        doc.addImage(LOGO, 'png', 0, 10, 180, 50, '', 'FAST');

        doc.setTextColor("#002f6c");
        doc.text(i18n.t('static.report.forecasterrorovertime'), doc.internal.pageSize.width / 2, 60, {
          align: 'center'
        })
        if (i == 1) {
          doc.setFont('helvetica', 'normal')

          doc.setFontSize(8)
          doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
            align: 'left'
          })
          doc.text(i18n.t('static.report.timeWindow') + ' : ' + document.getElementById("viewById").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
            align: 'left'
          })
          doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
            align: 'left'
          })
          doc.text(i18n.t('static.report.versionFinal*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
            align: 'left'
          })
          doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 170, {
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

    var canvas = document.getElementById("cool-canvas");
    //creates image

    var canvasImg = canvas.toDataURL("image/png", 1.0);
    var width = doc.internal.pageSize.width;
    var height = doc.internal.pageSize.height;
    var h1 = 50;
    var aspectwidth1 = (width - h1);

    doc.addImage(canvasImg, 'png', 50, 220, 750, 210, 'CANVAS');
    const headers = [[i18n.t('static.report.month'),
    i18n.t('static.report.forecastConsumption'), i18n.t('static.report.actualConsumption'), i18n.t('static.report.error')]];
    const data = this.state.matricsList.map(elt => [this.dateFormatter(elt.month), this.formatter(elt.forecastedConsumption), this.formatter(elt.actualConsumption), elt.message == null ? this.PercentageFormatter(elt.forecastError) : i18n.t(elt.message)]);

    let content = {
      margin: { top: 80, bottom: 50 },
      startY: height,
      head: headers,
      body: data,
      styles: { lineWidth: 1, fontSize: 8, halign: 'center' }

    };



    //doc.text(title, marginLeft, 40);
    doc.autoTable(content);
    addHeaders(doc)
    addFooters(doc)
    doc.save(i18n.t('static.report.forecasterrorovertime') + ".pdf")
    //creates PDF from img
    /*  var doc = new jsPDF('landscape');
      doc.setFontSize(20);
      doc.text(15, 15, "Cool Chart");
      doc.save('canvas.pdf');*/
  }
  getPrograms = () => {
    if (isSiteOnline()) {
      // AuthenticationService.setupAxiosInterceptors();
      ProgramService.getProgramList()
        .then(response => {
          console.log(JSON.stringify(response.data))
          this.setState({
            programs: response.data, loading: false
          }, () => { this.consolidatedProgramList() })
        }).catch(
          error => {
            this.setState({
              programs: [], loading: false
            }, () => { this.consolidatedProgramList() })
            if (error.message === "Network Error") {
              this.setState({
                message: 'static.unkownError',
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
      // .catch(
      //   error => {
      //     this.setState({
      //       programs: [], loading: false
      //     }, () => { this.consolidatedProgramList() })
      //     if (error.message === "Network Error") {
      //       this.setState({ loading: false, message: error.message });
      //     } else {
      //       switch (error.response ? error.response.status : "") {
      //         case 500:
      //         case 401:
      //         case 404:
      //         case 406:
      //         case 412:
      //           this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
      //           break;
      //         default:
      //           this.setState({ loading: false, message: 'static.unkownError' });
      //           break;
      //       }
      //     }
      //   }
      // );

    } else {
      console.log('offline')
      this.consolidatedProgramList()
      this.setState({ loading: false })
    }

  }
  consolidatedProgramList = () => {
    const lan = 'en';
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
        // Handle errors!
      };
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        for (var i = 0; i < myResult.length; i++) {
          if (myResult[i].userId == userId) {
            var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
            var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
            var databytes = CryptoJS.AES.decrypt(myResult[i].programData.generalData, SECRET_KEY);
            var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
            console.log(programNameLabel)

            var f = 0
            for (var k = 0; k < this.state.programs.length; k++) {
              if (this.state.programs[k].programId == programData.programId) {
                f = 1;
                console.log('already exist')
              }
            }
            if (f == 0) {
              proList.push(programData)
            }
          }


        }
        var lang = this.state.lang;

        if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined) {
          this.setState({
            programs: proList.sort(function (a, b) {
              a = getLabelText(a.label, lang).toLowerCase();
              b = getLabelText(b.label, lang).toLowerCase();
              return a < b ? -1 : a > b ? 1 : 0;
            }),
            programId: localStorage.getItem("sesProgramIdReport")
          }, () => {
            this.filterVersion();
          })
        } else {
          this.setState({
            programs: proList.sort(function (a, b) {
              a = getLabelText(a.label, lang).toLowerCase();
              b = getLabelText(b.label, lang).toLowerCase();
              return a < b ? -1 : a > b ? 1 : 0;
            }),
          })
        }


      }.bind(this);

    }.bind(this);


  }


  filterVersion = () => {
    // let programId = document.getElementById("programId").value;
    let programId = this.state.programId;
    if (programId != 0) {

      localStorage.setItem("sesProgramIdReport", programId);
      const program = this.state.programs.filter(c => c.programId == programId)
      console.log(program)
      if (program.length == 1) {
        if (isSiteOnline()) {
          this.setState({
            versions: [],
            planningUnits: []
          }, () => {
            this.setState({
              versions: program[0].versionList.filter(function (x, i, a) {
                return a.indexOf(x) === i;
              })
            }, () => { this.consolidatedVersionList(programId) });
          });


        } else {
          this.setState({
            versions: [],
            planningUnits: []
          }, () => { this.consolidatedVersionList(programId) })
        }
      } else {

        this.setState({
          versions: [],
          planningUnits: [],
          planningUnitValues: []
        })
        this.fetchData();
      }
    } else {
      this.setState({
        versions: []
      })
    }
  }
  consolidatedVersionList = (programId) => {
    const lan = 'en';
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
        // Handle errors!
      };
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        for (var i = 0; i < myResult.length; i++) {
          if (myResult[i].userId == userId && myResult[i].programId == programId) {
            var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
            var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
            var databytes = CryptoJS.AES.decrypt(myResult[i].programData.generalData, SECRET_KEY);
            var programData = databytes.toString(CryptoJS.enc.Utf8)
            var version = JSON.parse(programData).currentVersion

            version.versionId = `${version.versionId} (Local)`
            verList.push(version)

          }


        }

        console.log(verList);
        let versionList = verList.filter(function (x, i, a) {
          return a.indexOf(x) === i;
        });
        versionList.reverse();

        if (localStorage.getItem("sesVersionIdReport") != '' && localStorage.getItem("sesVersionIdReport") != undefined) {

          let versionVar = versionList.filter(c => c.versionId == localStorage.getItem("sesVersionIdReport"));
          if (versionVar != '' && versionVar != undefined) {
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

  getPlanningUnit = () => {
    let programId = document.getElementById("programId").value;
    let versionId = document.getElementById("versionId").value;
    this.setState({
      planningUnits: []
    }, () => {

      if (versionId == 0) {
        this.setState({ message: i18n.t('static.program.validversion'), data: [] }, () => {
          this.setState({ message: i18n.t('static.program.validversion'), matricsList: [] });
        })
      } else {
        localStorage.setItem("sesVersionIdReport", versionId);
        if (versionId.includes('Local')) {
          const lan = 'en';
          var db1;
          var storeOS;
          getDatabase();
          var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
          openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
            var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
            var planningunitRequest = planningunitOs.getAll();
            var planningList = []
            planningunitRequest.onerror = function (event) {
              // Handle errors!
            };
            planningunitRequest.onsuccess = function (e) {
              var myResult = [];
              myResult = planningunitRequest.result;
              var programId = (document.getElementById("programId").value).split("_")[0];
              var proList = []
              console.log(myResult)
              for (var i = 0; i < myResult.length; i++) {
                if (myResult[i].program.id == programId && myResult[i].active == true) {

                  proList[i] = myResult[i]
                }
              }
              var lang = this.state.lang;
              this.setState({
                planningUnits: proList.sort(function (a, b) {
                  a = getLabelText(a.planningUnit.label, lang).toLowerCase();
                  b = getLabelText(b.planningUnit.label, lang).toLowerCase();
                  return a < b ? -1 : a > b ? 1 : 0;
                }), message: ''
              }, () => {
                this.fetchData();
              })
            }.bind(this);
          }.bind(this)


        }
        else {
          // AuthenticationService.setupAxiosInterceptors();

          ProgramService.getActiveProgramPlaningUnitListByProgramId(programId).then(response => {
            console.log('**' + JSON.stringify(response.data))
            var listArray = response.data;
            listArray.sort((a, b) => {
              var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
              var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
              return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
              planningUnits: listArray,
              message: ''
            }, () => {
              this.fetchData();
            })
          }).catch(
            error => {
              this.setState({
                planningUnits: [],
              })
              if (error.message === "Network Error") {
                this.setState({
                  message: 'static.unkownError',
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
          // .catch(
          //   error => {
          //     this.setState({
          //       planningUnits: [],
          //     })
          //     if (error.message === "Network Error") {
          //       this.setState({ message: error.message });
          //     } else {
          //       switch (error.response ? error.response.status : "") {
          //         case 500:
          //         case 401:
          //         case 404:
          //         case 406:
          //         case 412:
          //           this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }) });
          //           break;
          //         default:
          //           this.setState({ message: 'static.unkownError' });
          //           break;
          //       }
          //     }
          //   }
          // );
        }
      }
    });

  }

  componentDidMount() {

    this.getPrograms();


  }

  setProgramId(event) {
    this.setState({
      programId: event.target.value,
      versionId: ''
    }, () => {
      localStorage.setItem("sesVersionIdReport", '');
      this.filterVersion();
    })
  }

  setVersionId(event) {
    this.setState({
      versionId: event.target.value
    }, () => {
      if (this.state.matricsList.length != 0) {
        localStorage.setItem("sesVersionIdReport", this.state.versionId);
        this.fetchData();
      } else {
        this.getPlanningUnit();
      }
    })
  }

  rowtextFormatClassName(row) {
    return (row.forecastError > 50) ? 'textcolor-red' : '';
  }

  fetchData() {
    let programId = document.getElementById("programId").value;
    let versionId = document.getElementById("versionId").value;
    let planningUnitId = document.getElementById("planningUnitId").value;
    let monthInCalc = document.getElementById("viewById").value;
    let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
    let stopDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();

    var input = { "programId": programId, "versionId": versionId, "planningUnitId": planningUnitId, "startDate": startDate, "stopDate": stopDate, "previousMonths": monthInCalc }
    if (programId > 0 && planningUnitId > 0 && versionId != 0) {
      if (versionId.includes('Local')) {
        this.setState({ loading: true })

        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
          this.setState({
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
            // this.setState({ loading: true })
            // var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
            // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
            // var programJson = JSON.parse(programData);
            // console.log('programJson', programJson)
            var planningUnitDataList=programRequest.result.programData.planningUnitDataList;
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
            var pu = (this.state.planningUnits.filter(c => c.planningUnit.id == planningUnitId))[0]

            var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);

            var monthstartfrom = this.state.rangeValue.from.month
            for (var from = this.state.rangeValue.from.year, to = this.state.rangeValue.to.year; from <= to; from++) {
              var monthlydata = [];
              for (var month = monthstartfrom; month <= 12; month++) {
                var year = from;
                var actualconsumption = 0;
                var forcastConsumption = 0;
                var montcnt = 0
                var absvalue = 0;
                var currentActualconsumption = null;
                var currentForcastConsumption = null;
                for (var i = month, j = 0; j <= monthInCalc; i--, j++) {
                  if (i == 0) {
                    i = 12;
                    year = year - 1
                  }
                  var dt = year + "-" + String(i).padStart(2, '0') + "-01"
                  var conlist = consumptionList.filter(c => c.consumptionDate === dt)
                  console.log(dt, conlist)
                  var actconsumption = 0;
                  var forConsumption = 0;
                  if (conlist.length == 2) {
                    montcnt = montcnt + 1
                  }
                  for (var l = 0; l < conlist.length; l++) {
                    if (conlist[l].actualFlag.toString() == 'true') {
                      actconsumption = actconsumption + Math.round(Number(conlist[l].consumptionQty))
                    } else {
                      forConsumption = forConsumption + Math.round(Number(conlist[l].consumptionQty))
                    }
                  }
                  actualconsumption = actualconsumption + actconsumption
                  forcastConsumption = forcastConsumption + forConsumption
                  if (j == 0) {
                    console.log(currentActualconsumption, ' ', actconsumption)
                    if (currentActualconsumption == null && actconsumption > 0) {
                      currentActualconsumption = actconsumption
                    } else if (currentActualconsumption != null) {
                      currentActualconsumption = currentActualconsumption + actconsumption
                    }
                    currentForcastConsumption = currentForcastConsumption + forConsumption
                  }
                  if (actconsumption > 0 && forConsumption > 0)
                    absvalue = absvalue + (Math.abs(actconsumption - forConsumption))





                }

                var json = {
                  month: new Date(from, month - 1),
                  actualConsumption: currentActualconsumption,
                  forecastedConsumption: currentForcastConsumption,
                  forecastError: currentActualconsumption > 0 && actualconsumption > 0 ? (((absvalue * 100) / actualconsumption)) : '',
                  message: montcnt == 0 ? "static.reports.forecastMetrics.noConsumptionAcrossPeriod" : currentActualconsumption == null || currentForcastConsumption == null ? "static.reports.forecastMetrics.noConsumption" : (actualconsumption == null || actualconsumption == 0) ? "static.reports.forecastMetrics.totalConsumptionIs0" : null
                }
                data.push(json)
                console.log("Json------------->", json);
                if (month == this.state.rangeValue.to.month && from == to) {
                  this.setState({
                    matricsList: data,
                    message: '',
                    loading: false
                  })

                  return;
                }
              }
              monthstartfrom = 1
              this.setState({
                planningUnitLabel: document.getElementById("planningUnitId").selectedOptions[0].text
              })

            }
            this.setState({ loading: false })

          }.bind(this)
        }.bind(this)
      } else {

        this.setState({ loading: true })
        // AuthenticationService.setupAxiosInterceptors();
        ReportService.getForecastMatricsOverTime(input)
          .then(response => {
            console.log(JSON.stringify(response.data));
            this.setState({
              matricsList: response.data,
              message: '', loading: false,
              planningUnitLabel: document.getElementById("planningUnitId").selectedOptions[0].text

            })
          }).catch(
            error => {
              this.setState({
                matricsList: [], loading: false
              })
              if (error.message === "Network Error") {
                this.setState({
                  message: 'static.unkownError',
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
        // .catch(
        //   error => {
        //     this.setState({
        //       matricsList: [], loading: false
        //     })

        //     if (error.message === "Network Error") {
        //       this.setState({ loading: false, message: error.message });
        //     } else {
        //       switch (error.response ? error.response.status : "") {
        //         case 500:
        //         case 401:
        //         case 404:
        //         case 406:
        //         case 412:
        //           this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
        //           break;
        //         default:
        //           this.setState({ loading: false, message: 'static.unkownError' });
        //           break;
        //       }
        //     }
        //   }
        // );
      }
    }
    else if (programId == 0) {
      this.setState({ message: i18n.t('static.common.selectProgram'), matricsList: [] });

    } else if (versionId == 0) {
      this.setState({ message: i18n.t('static.program.validversion'), matricsList: [] });

    } else {
      this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), matricsList: [], planningUnitLabel: '' });

    }
    /*   this.setState({
         matricsList: [{ACTUAL_DATE:"2019-04",errorperc:30},{ACTUAL_DATE:"2019-05",errorperc:50},{ACTUAL_DATE:"2019-06",errorperc:40},]
       })*/
    console.log('matrix list updated' + this.state.matricsList)
  }



  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }

  onRadioBtnClick(radioSelected) {
    this.setState({
      radioSelected: radioSelected,
    });
  }

  show() {
    /* if (!this.state.showed) {
         setTimeout(() => {this.state.closeable = true}, 250)
         this.setState({ showed: true })
     }*/
  }
  handleRangeChange(value, text, listIndex) {
    //
  }
  handleRangeDissmis(value) {
    this.setState({ rangeValue: value }, () => {
      this.fetchData();
    })

  }

  _handleClickRangeBox(e) {
    this.refs.pickRange.show()
  }

  handleClickMonthBox2 = (e) => {
    this.refs.pickAMonth2.show()
  }
  handleAMonthChange2 = (value, text) => {
    //
    //
  }
  handleAMonthDissmis2 = (value) => {
    this.setState({ singleValue2: value }, () => {
      this.fetchData();
    })

  }
  loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>

  dateFormatterLanguage = value => {
    if (moment(value).format('MM') === '01') {
      return (i18n.t('static.month.jan') + ' ' + moment(value).format('YY'))
    } else if (moment(value).format('MM') === '02') {
      return (i18n.t('static.month.feb') + ' ' + moment(value).format('YY'))
    } else if (moment(value).format('MM') === '03') {
      return (i18n.t('static.month.mar') + ' ' + moment(value).format('YY'))
    } else if (moment(value).format('MM') === '04') {
      return (i18n.t('static.month.apr') + ' ' + moment(value).format('YY'))
    } else if (moment(value).format('MM') === '05') {
      return (i18n.t('static.month.may') + ' ' + moment(value).format('YY'))
    } else if (moment(value).format('MM') === '06') {
      return (i18n.t('static.month.jun') + ' ' + moment(value).format('YY'))
    } else if (moment(value).format('MM') === '07') {
      return (i18n.t('static.month.jul') + ' ' + moment(value).format('YY'))
    } else if (moment(value).format('MM') === '08') {
      return (i18n.t('static.month.aug') + ' ' + moment(value).format('YY'))
    } else if (moment(value).format('MM') === '09') {
      return (i18n.t('static.month.sep') + ' ' + moment(value).format('YY'))
    } else if (moment(value).format('MM') === '10') {
      return (i18n.t('static.month.oct') + ' ' + moment(value).format('YY'))
    } else if (moment(value).format('MM') === '11') {
      return (i18n.t('static.month.nov') + ' ' + moment(value).format('YY'))
    } else {
      return (i18n.t('static.month.dec') + ' ' + moment(value).format('YY'))
    }
  }

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
            {getLabelText(item.label, this.state.lang)}
          </option>
        )
      }, this);
    const { versions } = this.state;
    let versionList = versions.length > 0
      && versions.map((item, i) => {
        return (
          <option key={i} value={item.versionId}>
            {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)}
          </option>
        )
      }, this);

    const options = {
      title: {
        display: true,
        text: this.state.planningUnitLabel != "" && this.state.planningUnitLabel != undefined && this.state.planningUnitLabel != null ? i18n.t('static.report.forecasterrorovertime') + " - " + this.state.planningUnitLabel : i18n.t('static.report.forecasterrorovertime')
        // fontColor: 'black',
        // fontStyle: "normal",
        // fontSize: "12"
      },
      scales: {
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: i18n.t('static.report.error'),
              fontColor: 'black',
              fontStyle: "normal",
              fontSize: "12"
            },
            ticks: {
              yValueFormatString: "$#####%",
              beginAtZero: true,
              Max: 900,
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
                return x1 + x2 + "%";
              }
            }
          }
        ], xAxes: [{

          scaleLabel: {
            display: true,
            labelString: i18n.t('static.report.month'),
            fontColor: 'black',
            fontStyle: "normal",
            fontSize: "12"
          },
          ticks: {
            fontColor: 'black',
            fontStyle: "normal",
            fontSize: "12"
          }
        }]
      },
      hover: {
        animationDuration: 0
      },
      animation: {
        onComplete: function () {
          const chartInstance = this.chart,
            ctx = chartInstance.ctx;


          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          this.data.datasets.forEach(function (dataset, i) {
            const meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
              const data = dataset.data[index];
              ctx.fillStyle = "#000";
              ctx.fillText(data, bar._model.x, bar._model.y - 2);
            });
          });
        }
      },
      tooltips: {
        mode: 'index',
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
        },
        enabled: true,
        //    custom: CustomTooltips
      },
      maintainAspectRatio: false,
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          fontColor: 'black',
          fontStyle: "normal",
          fontSize: "12"
        }
      },

    }

    const bar = {

      // labels: this.state.matricsList.map((item, index) => (this.dateFormatter(item.month))),
      labels: this.state.matricsList.map((item, index) => (this.dateFormatterLanguage(item.month))),
      datasets: [
        {
          type: "line",
          label: i18n.t('static.report.forecasterrorovertime'),
          backgroundColor: 'transparent',
          borderColor: '#ffc107',
          lineTension: 0,
          showActualPercentages: true,
          showInLegend: true,
          pointStyle: 'line',
          yValueFormatString: "$#####%",

          data: this.state.matricsList.map((item, index) => (this.round(item.forecastError)))
        }
      ],




    }
    const pickerLang = {
      months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
      from: 'From', to: 'To',
    }
    const { rangeValue } = this.state
    const { singleValue2 } = this.state

    const makeText = m => {
      if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
      return '?'
    }


    return (
      <div className="animated fadeIn" >
        <AuthenticationServiceComponent history={this.props.history} />
        <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
        <h5 className="red">{i18n.t(this.state.message)}</h5>
        <SupplyPlanFormulas ref="formulaeChild" />
        <Row>
          <Col lg="12">
            <Card>
              <div className="Card-header-reporticon pb-2">
                <div className="card-header-actions">
                  <a className="card-header-action">
                    <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggleForecastMatrix() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
                  </a>
                  {/* <i className="icon-menu"></i><strong>{i18n.t('static.report.forecasterrorovertime')}</strong> */}

                  {
                    this.state.matricsList.length > 0 &&


                    <a className="card-header-action">
                      <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                      <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                    </a>
                  }
                </div>
              </div>
              <CardBody className="pb-lg-2 pt-lg-0">
                <div className="TableCust" >
                  <div ref={ref}>
                    <Form >
                      <div className=" pl-0">
                        <div className="row">
                          <FormGroup className="col-md-3">
                            <Label htmlFor="appendedInputButton">{i18n.t('static.period.selectPeriod')}</Label>
                            <div className="controls  edit">

                              <Picker
                                ref="pickRange"
                                years={{ min: this.state.minDate, max: this.state.maxDate }}
                                value={rangeValue}
                                lang={pickerLang}
                                //theme="light"
                                onChange={this.handleRangeChange}
                                onDismiss={this.handleRangeDissmis}
                              >
                                <MonthBox value={this.makeText(rangeValue.from) + ' ~ ' + this.makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                              </Picker>
                            </div>

                          </FormGroup>

                          <FormGroup className="col-md-3">
                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.timeWindow')}</Label>
                            <div className="controls">
                              <InputGroup>
                                <Input
                                  type="select"
                                  name="viewById"
                                  id="viewById"
                                  bsSize="sm"
                                  onChange={this.fetchData}
                                >
                                  <option value="5">6 {i18n.t('static.dashboard.months')}</option>
                                  <option value="2">3 {i18n.t('static.dashboard.months')}</option>
                                  <option value="8">9 {i18n.t('static.dashboard.months')}</option>
                                  <option value="11">12 {i18n.t('static.dashboard.months')}</option>
                                </Input>
                              </InputGroup>
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
                                  // onChange={this.filterVersion}
                                  onChange={(e) => { this.setProgramId(e) }}
                                  value={this.state.programId}
                                >
                                  <option value="0">{i18n.t('static.common.select')}</option>
                                  {programs.length > 0
                                    && programs.map((item, i) => {
                                      return (
                                        <option key={i} value={item.programId}>
                                          {getLabelText(item.label, this.state.lang)}
                                        </option>
                                      )
                                    }, this)}

                                </Input>

                              </InputGroup>
                            </div>
                          </FormGroup>

                          {/* <FormGroup className="col-md-3">
                              <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.country')}</Label>
                              <div className="controls ">
                                <InputGroup>
                                  <Input
                                    type="select"
                                    name="countryId"
                                    id="countryId"
                                    bsSize="sm"
                                    onChange={this.fetchData}

                                  >
                                    <option value="0">{i18n.t('static.common.select')}</option>
                                    {countryList}
                                  </Input>

                                </InputGroup>
                              </div>
                            </FormGroup>
                            <FormGroup className="col-md-3"> 
                            <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                                        <div className="controls ">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="productCategoryId"
                                                    id="productCategoryId"
                                                    bsSize="sm"
                                                    onChange={this.getPlanningUnit}
                                                >
                                                    <option value="0">{i18n.t('static.common.select')}</option>
                                                    {productCategoryList}
                                                </Input>

                                            </InputGroup>
                                        </div>

                            </FormGroup>*/}
                          <FormGroup className="col-md-3">
                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.versionFinal*')}</Label>
                            <div className="controls">
                              <InputGroup>
                                <Input
                                  type="select"
                                  name="versionId"
                                  id="versionId"
                                  bsSize="sm"
                                  // onChange={(e) => { this.getPlanningUnit(); }}
                                  onChange={(e) => { this.setVersionId(e) }}
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
                            <div className="controls">
                              <InputGroup>
                                <Input
                                  type="select"
                                  name="planningUnitId"
                                  id="planningUnitId"
                                  bsSize="sm"
                                  onChange={this.fetchData}
                                >
                                  <option value="0">{i18n.t('static.common.select')}</option>
                                  {planningUnitList}
                                </Input>
                                {/* <InputGroupAddon addonType="append">
                                    <Button color="secondary Gobtn btn-sm" onClick={this.fetchData}>{i18n.t('static.common.go')}</Button>
                                  </InputGroupAddon> */}
                              </InputGroup>
                            </div>
                          </FormGroup>
                        </div>
                      </div>
                    </Form>
                    <Col md="12 pl-0" style={{ display: this.state.loading ? "none" : "block" }}>
                      <div className="row">
                        {
                          this.state.matricsList.length > 0
                          &&
                          <div className="col-md-12 p-0">
                            <div className="col-md-12">
                              <div className="chart-wrapper chart-graph-report">
                                <Bar id="cool-canvas" data={bar} options={options} />
                              </div>
                            </div>
                            <div className="col-md-12">
                              <button className="mr-1 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                                {this.state.show ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}
                              </button>

                            </div>
                          </div>}
                      </div>

                      <div className="row">
                        <div className="col-md-12">
                          {this.state.show && this.state.matricsList.length > 0 &&
                            <Table responsive className="table-striped table-bordered text-center mt-2">

                              <thead>
                                <tr>
                                  <th className="text-center" style={{ width: '20%' }}> {i18n.t('static.report.month')} </th>
                                  <th className="text-center" style={{ width: '20%' }}> {i18n.t('static.report.forecastConsumption')} </th>
                                  <th className="text-center" style={{ width: '20%' }}>{i18n.t('static.report.actualConsumption')}</th>
                                  <th className="text-center" style={{ width: '20%' }}>{i18n.t('static.report.error')}</th>
                                </tr>
                              </thead>

                              <tbody>
                                {
                                  this.state.matricsList.length > 0
                                  &&
                                  this.state.matricsList.map((item, idx) =>

                                    <tr id="addr0" key={idx} className={this.rowtextFormatClassName(item)} >

                                      <td>{this.dateFormatter(this.state.matricsList[idx].month)}</td>
                                      <td className="textcolor-purple">

                                        {this.formatter(this.state.matricsList[idx].forecastedConsumption)}
                                      </td>
                                      <td>
                                        {this.formatter(this.state.matricsList[idx].actualConsumption)}
                                      </td>
                                      <td>
                                        {this.state.matricsList[idx].message == null ? this.PercentageFormatter(this.state.matricsList[idx].forecastError) : i18n.t(this.state.matricsList[idx].message)}
                                      </td>
                                    </tr>)

                                }
                              </tbody>
                            </Table>}

                        </div>
                      </div></Col>
                    <div style={{ display: this.state.loading ? "block" : "none" }}>
                      <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                          <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                          <div class="spinner-border blue ml-4" role="status">

                          </div>
                        </div>
                      </div>
                    </div>


                  </div>
                </div></CardBody>
            </Card>
          </Col>
        </Row>


      </div>
    );
  }
}

export default ForcastMatrixOverTime;

