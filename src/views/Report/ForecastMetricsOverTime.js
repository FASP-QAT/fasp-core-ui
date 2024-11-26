import CryptoJS from 'crypto-js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import Picker from 'react-month-picker';
import {
  Card,
  CardBody,
  Col,
  Form,
  FormGroup, Input, InputGroup,
  Label,
  Row,
  Table
} from 'reactstrap';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { LOGO } from '../../CommonComponent/Logo.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP_FOUR_DIGITS, INDEXED_DB_NAME, INDEXED_DB_VERSION, PROGRAM_TYPE_SUPPLY_PLAN, REPORT_DATEPICKER_END_MONTH, REPORT_DATEPICKER_START_MONTH, SECRET_KEY } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import SupplyPlanFormulas from '../SupplyPlan/SupplyPlanFormulas';
import { PercentageFormatter, addDoubleQuoteToRowContent, dateFormatter, dateFormatterCSV, dateFormatterLanguage, formatter, makeText, round } from '../../CommonComponent/JavascriptCommonFunctions';
const ref = React.createRef();
const pickerLang = {
  months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
  from: 'From', to: 'To',
}
/**
 * Component for Forecast Matrix Over Time Report.
 */
class ForcastMatrixOverTime extends Component {
  constructor(props) {
    super(props);
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
      rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
      minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
      maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
      programId: '',
      versionId: '',
      planningUnitLabel: ''
    };
    this.fetchData = this.fetchData.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.setProgramId = this.setProgramId.bind(this);
    this.setVersionId = this.setVersionId.bind(this);
  }
  /**
   * Toggles the value of the 'show' state variable.
   */
  toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));
  /**
   * Exports the data to a CSV file.
   */
  exportCSV() {
    var csvRow = [];
    csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
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
    var A = [addDoubleQuoteToRowContent([(i18n.t('static.report.month')).replaceAll(' ', '%20'), (i18n.t('static.report.forecastConsumption')).replaceAll(' ', '%20'), (i18n.t('static.report.actualConsumption')).replaceAll(' ', '%20'), ((i18n.t('static.report.error')).replaceAll(' ', '%20')).replaceAll(' ', '%20')])]
    re = this.state.matricsList
    for (var item = 0; item < re.length; item++) {
      A.push(addDoubleQuoteToRowContent([dateFormatterCSV(re[item].month).replaceAll(' ', '%20'), re[item].forecastedConsumption == null ? '' : re[item].forecastedConsumption, re[item].actualConsumption == null ? '' : re[item].actualConsumption, re[item].message == null ? PercentageFormatter(re[item].forecastError) : (i18n.t(re[item].message)).replaceAll(' ', '%20')]))
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
  /**
   * Exports the data to a CSV file.
   */
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
          doc.text(i18n.t('static.report.dateRange') + ' : ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
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
    const size = "A4";
    const orientation = "landscape";
    const marginLeft = 10;
    const doc = new jsPDF(orientation, unit, size, true);
    doc.setFontSize(8);
    var canvas = document.getElementById("cool-canvas");
    var canvasImg = canvas.toDataURL("image/png", 1.0);
    var height = doc.internal.pageSize.height;
    doc.addImage(canvasImg, 'png', 50, 220, 750, 210, 'CANVAS');
    const headers = [[i18n.t('static.report.month'),
    i18n.t('static.report.forecastConsumption'), i18n.t('static.report.actualConsumption'), i18n.t('static.report.error')]];
    const data = this.state.matricsList.map(elt => [dateFormatter(elt.month), formatter(elt.forecastedConsumption, 0), formatter(elt.actualConsumption, 0), elt.message == null ? PercentageFormatter(elt.forecastError) : i18n.t(elt.message)]);
    let content = {
      margin: { top: 80, bottom: 50 },
      startY: height,
      head: headers,
      body: data,
      styles: { lineWidth: 1, fontSize: 8, halign: 'center' }
    };
    doc.autoTable(content);
    addHeaders(doc)
    addFooters(doc)
    doc.save(i18n.t('static.report.forecasterrorovertime') + ".pdf")
  }
  /**
   * Retrieves the list of programs.
   */
  getPrograms = () => {
    if (localStorage.getItem("sessionType") === 'Online') {
      let realmId = AuthenticationService.getRealmId();
      DropdownService.getSPProgramBasedOnRealmId(realmId)
        .then(response => {
          var proList = []
          for (var i = 0; i < response.data.length; i++) {
            var programJson = {
              programId: response.data[i].id,
              label: response.data[i].label,
              programCode: response.data[i].code
            }
            proList[i] = programJson
          }
          this.setState({
            programs: proList, loading: false
          }, () => { this.consolidatedProgramList() })
        }).catch(
          error => {
            this.setState({
              programs: [], loading: false
            }, () => { this.consolidatedProgramList() })
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
      this.consolidatedProgramList()
      this.setState({ loading: false })
    }
  }
  /**
   * Consolidates the list of programs obtained from Server and local programs.
   */
  consolidatedProgramList = () => {
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
            var f = 0
            for (var k = 0; k < this.state.programs.length; k++) {
              if (this.state.programs[k].programId == programData.programId) {
                f = 1;
              }
            }
            if (f == 0) {
              proList.push(programData)
            }
          }
        }
        if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined) {
          this.setState({
            programs: proList.sort(function (a, b) {
              a = a.programCode.toLowerCase();
              b = b.programCode.toLowerCase();
              return a < b ? -1 : a > b ? 1 : 0;
            }),
            programId: localStorage.getItem("sesProgramIdReport")
          }, () => {
            this.filterVersion();
          })
        } else {
          this.setState({
            programs: proList.sort(function (a, b) {
              a = a.programCode.toLowerCase();
              b = b.programCode.toLowerCase();
              return a < b ? -1 : a > b ? 1 : 0;
            }),
          })
        }
      }.bind(this);
    }.bind(this);
  }
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
      const program = this.state.programs.filter(c => c.programId == programId)
      if (program.length == 1) {
        if (localStorage.getItem("sessionType") === 'Online') {
          this.setState({
            versions: [],
            planningUnits: []
          }, () => {
            DropdownService.getVersionListForSPProgram(programId)
              .then(response => {
                this.setState({
                  versions: []
                }, () => {
                  this.setState({
                    versions: response.data
                  }, () => {
                    this.consolidatedVersionList(programId)
                  });
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
  /**
   * Retrieves data from IndexedDB and combines it with fetched versions to create a consolidated version list.
   * Filters out duplicate versions and reverses the list.
   * Sets the version list in the state and triggers fetching of planning units.
   * Handles cases where a version is selected from local storage or the default version is selected.
   * @param {number} programId - The ID of the selected program
   */
  consolidatedVersionList = (programId) => {
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
      };
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        for (var i = 0; i < myResult.length; i++) {
          if (myResult[i].userId == userId && myResult[i].programId == programId) {
            var databytes = CryptoJS.AES.decrypt(myResult[i].programData.generalData, SECRET_KEY);
            var programData = databytes.toString(CryptoJS.enc.Utf8)
            var version = JSON.parse(programData).currentVersion
            version.versionId = `${version.versionId} (Local)`
            verList.push(version)
          }
        }
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
  /**
   * Retrieves the list of planning units for a selected program and version.
   */
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
          var db1;
          getDatabase();
          var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
          openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
            var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
            var planningunitRequest = planningunitOs.getAll();
            var planningList = []
            planningunitRequest.onerror = function (event) {
            };
            planningunitRequest.onsuccess = function (e) {
              var myResult = [];
              myResult = planningunitRequest.result;
              var programId = (document.getElementById("programId").value).split("_")[0];
              var proList = []
              for (var i = 0; i < myResult.length; i++) {
                if (myResult[i].program.id == programId && myResult[i].active == true) {
                  proList[i] = myResult[i].planningUnit
                }
              }
              var lang = this.state.lang;
              this.setState({
                planningUnits: proList.sort(function (a, b) {
                  a = getLabelText(a.label, lang).toLowerCase();
                  b = getLabelText(b.label, lang).toLowerCase();
                  return a < b ? -1 : a > b ? 1 : 0;
                }), message: ''
              }, () => {
                this.fetchData();
              })
            }.bind(this);
          }.bind(this)
        }
        else {
          var programJson = {
            tracerCategoryIds: [],
            programIds: [programId]
          }
          DropdownService.getProgramPlanningUnitDropdownList(programJson).then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
              var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
              var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
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
        }
      }
    });
  }
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
    this.setState({
      programId: event.target.value,
      versionId: ''
    }, () => {
      localStorage.setItem("sesVersionIdReport", '');
      this.filterVersion();
    })
  }
  /**
   * Sets the version ID and updates the tracer category list.
   * @param {Object} event - The event object containing the version ID value.
   */
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
  /**
   * Fetches data based on selected filters.
   */
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
            var planningUnitDataList = programRequest.result.programData.planningUnitDataList;
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
            var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
            var monthstartfrom = this.state.rangeValue.from.month
            for (var from = this.state.rangeValue.from.year, to = this.state.rangeValue.to.year; from <= to; from++) {
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
                  var actconsumption = null;
                  var forConsumption = null;
                  if (conlist.length == 2) {
                    montcnt = montcnt + 1
                  }
                  for (var l = 0; l < conlist.length; l++) {
                    if (conlist[l].actualFlag.toString() == 'true') {
                      actconsumption = (actconsumption == null ? 0 : actconsumption) + Math.round(Number(conlist[l].consumptionQty))
                    } else {
                      forConsumption = (forConsumption == null ? 0 : forConsumption) + Math.round(Number(conlist[l].consumptionQty))
                    }
                  }
                  actualconsumption = actualconsumption + actconsumption
                  forcastConsumption = forcastConsumption + forConsumption
                  if (j == 0) {
                    if (currentActualconsumption == null && actconsumption != null) {
                      currentActualconsumption = actconsumption
                    } else if (currentActualconsumption != null) {
                      currentActualconsumption = currentActualconsumption + actconsumption
                    }
                    currentForcastConsumption = forConsumption == null ? null : currentForcastConsumption + forConsumption
                  }
                  if (actconsumption != null && forConsumption != null)
                    absvalue = absvalue + (Math.abs(actconsumption - forConsumption))
                }
                var json = {
                  month: new Date(from, month - 1),
                  actualConsumption: currentActualconsumption,
                  forecastedConsumption: currentForcastConsumption,
                  forecastError: currentActualconsumption != null && actualconsumption != null ? (((absvalue * 100) / actualconsumption)) : '',
                  message: montcnt == 0 ? "static.reports.forecastMetrics.noConsumptionAcrossPeriod" : currentActualconsumption == null || currentForcastConsumption == null ? "static.reports.forecastMetrics.noConsumption" : (actualconsumption == null) ? "static.reports.forecastMetrics.totalConsumptionIs0" : null
                }
                data.push(json)
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
        ReportService.getForecastMatricsOverTime(input)
          .then(response => {
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
      }
    }
    else if (programId == 0) {
      this.setState({ message: i18n.t('static.common.selectProgram'), matricsList: [] });
    } else if (versionId == 0) {
      this.setState({ message: i18n.t('static.program.validversion'), matricsList: [] });
    } else {
      this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), matricsList: [], planningUnitLabel: '' });
    }
  }
  /**
   * Handles the dismiss of the range picker component.
   * Updates the component state with the new range value and triggers a data fetch.
   * @param {object} value - The new range value selected by the user.
   */
  handleRangeDissmis(value) {
    this.setState({ rangeValue: value }, () => {
      this.fetchData();
    })
  }
  /**
   * Handles the click event on the range picker box.
   * Shows the range picker component.
   * @param {object} e - The event object containing information about the click event.
   */
  _handleClickRangeBox(e) {
    this.refs.pickRange.show()
  }
  /**
   * Displays a loading indicator while data is being loaded.
   */
  loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>
  /**
   * Renders the Forecast metrics over time report table.
   * @returns {JSX.Element} - Forecast metrics over time report table.
   */
  render() {
    const { planningUnits } = this.state;
    let planningUnitList = planningUnits.length > 0
      && planningUnits.map((item, i) => {
        return (
          <option key={i} value={item.id}>
            {getLabelText(item.label, this.state.lang)}
          </option>
        )
      }, this);
    const { programs } = this.state;
    const { versions } = this.state;
    let versionList = versions.length > 0
      && versions.map((item, i) => {
        return (
          <option key={i} value={item.versionId}>
            {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)} ({(moment(item.createdDate).format(`MMM DD YYYY`))})
          </option>
        )
      }, this);
    const options = {
      title: {
        display: true,
        text: this.state.planningUnitLabel != "" && this.state.planningUnitLabel != undefined && this.state.planningUnitLabel != null ? i18n.t('static.report.forecasterrorovertime') + " - " + this.state.planningUnitLabel : i18n.t('static.report.forecasterrorovertime')
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
      labels: this.state.matricsList.map((item, index) => (dateFormatterLanguage(item.month))),
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
          data: this.state.matricsList.map((item, index) => (round(item.forecastError)))
        }
      ],
    }
    const pickerLang = {
      months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
      from: 'From', to: 'To',
    }
    const { rangeValue } = this.state

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
                  {
                    this.state.matricsList.length > 0 &&
                    <a className="card-header-action">
                      <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => {
                        var curTheme = localStorage.getItem("theme");
                        if (curTheme == "dark") {
                          this.setState({
                            isDarkMode: false
                          }, () => {
                            setTimeout(() => {
                              this.exportPDF();
                              if (curTheme == "dark") {
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
                                onDismiss={this.handleRangeDissmis}
                              >
                                <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
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
                                  onChange={(e) => { this.setProgramId(e) }}
                                  value={this.state.programId}
                                >
                                  <option value="0">{i18n.t('static.common.select')}</option>
                                  {programs.length > 0
                                    && programs.map((item, i) => {
                                      return (
                                        <option key={i} value={item.programId}>
                                          {(item.programCode)}
                                        </option>
                                      )
                                    }, this)}
                                </Input>
                              </InputGroup>
                            </div>
                          </FormGroup>
                          <FormGroup className="col-md-3">
                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.versionFinal*')}</Label>
                            <div className="controls">
                              <InputGroup>
                                <Input
                                  type="select"
                                  name="versionId"
                                  id="versionId"
                                  bsSize="sm"
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
                        <div className="col-md-12 mt-2">
                          {this.state.show && this.state.matricsList.length > 0 &&
                            <div className='fixTableHead table-responsive'>
                              <Table className="table-striped table-bordered text-center ">
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
                                        <td>{dateFormatter(this.state.matricsList[idx].month)}</td>
                                        <td className="textcolor-purple">
                                          {formatter(this.state.matricsList[idx].forecastedConsumption, 0)}
                                        </td>
                                        <td>
                                          {formatter(this.state.matricsList[idx].actualConsumption, 0)}
                                        </td>
                                        <td>
                                          {this.state.matricsList[idx].message == null ? PercentageFormatter(this.state.matricsList[idx].forecastError) : i18n.t(this.state.matricsList[idx].message)}
                                        </td>
                                      </tr>)
                                  }
                                </tbody>
                              </Table>
                            </div>}
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
