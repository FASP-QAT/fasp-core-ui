import CryptoJS from 'crypto-js';
import classNames from 'classnames';
import moment from 'moment';
import React, { Component } from 'react';
import Picker from 'react-month-picker';
import MonthBox from '../../CommonComponent/MonthBox.js';
import { MultiSelect } from 'react-multi-select-component';
import Select from 'react-select';
import { Chart, ArcElement, Tooltip, Legend, Title } from 'chart.js';
// import 'chart.piecelabel.js';
import { Doughnut, HorizontalBar, Pie, Bar } from 'react-chartjs-2';
import { Search } from 'react-bootstrap-table2-toolkit';
import { confirmAlert } from 'react-confirm-alert';
import jexcel from 'jspreadsheet';
import { onOpenFilter } from "../../CommonComponent/JExcelCommonFunctions.js";
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import Skeleton from 'react-loading-skeleton'
import '../../../node_modules/react-loading-skeleton/dist/skeleton.css'
import { jExcelLoadedFunction, jExcelLoadedFunctionForNotes, jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js';
import { encryptFCData, decryptFCData } from '../../CommonComponent/JavascriptCommonFunctions';
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Carousel,
  CarouselCaption,
  CarouselIndicators,
  CarouselItem,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  Input,
  FormGroup,
  Label,
  InputGroup,
  Popover,
  Table,
  PopoverBody,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
} from 'reactstrap';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import QatProblemActionNew from '../../CommonComponent/QatProblemActionNew';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, INDEXED_DB_NAME, INDEXED_DB_VERSION, QAT_HELPDESK_CUSTOMER_PORTAL_URL, SECRET_KEY, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, PROGRAM_TYPE_SUPPLY_PLAN, REPORT_DATEPICKER_END_MONTH, REPORT_DATEPICKER_START_MONTH } from '../../Constants.js';
import DashboardService from "../../api/DashboardService";
import ProgramService from "../../api/ProgramService";
import DropdownService from "../../api/DropdownService";
import imageHelp from '../../assets/img/help-icon.png';
import i18n from '../../i18n';
import AuthenticationService from '../../views/Common/AuthenticationService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideFirstComponent, hideSecondComponent, roundARU, filterOptions, formatter } from '../../CommonComponent/JavascriptCommonFunctions';
import { Dashboard } from '../Dashboard/Dashboard.js';
/**
 * Component for showing the dashboard.
 */
class SupplyPlanScoreCard extends Component {
  constructor(props) {
    super(props);
    var dt = new Date();
    dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
    var dt1 = new Date();
    dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
    this.state = {
      isDarkMode: false,
      popoverOpenMa: false,
      id: this.props.match.params.id,
      dropdownOpen: false,
      radioSelected: 2,
      activeIndex: 0,
      activeIndexProgram: 0,
      activeIndexRealm: 0,
      activeIndexUser: 0,
      activeIndexErp: 0,
      problemActionList: [],
      countryList: [],
      countrys: [],
      countryValues: [],
      countryLabels: [],
      technicalAreas: [],
      technicalAreaValues: [],
      technicalAreaLabels: [],
      programLst: [],
      programValues: [],
      programLabels: [],
      shipmentStatusList: [],
      viewBy: 0,
      viewByLabel: [],
      showDetail: 0,
      showDetailLabel: [],
      onlyDownloadedProgram: AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_DOWNLOAD_PROGARM') ? localStorage.getItem('sessionType') === 'Online' ? false : true : false,
      message: '',
      dashboard: '',
      users: [],
      lang: localStorage.getItem('lang'),
      openIssues: '',
      addressedIssues: '',
      supplyPlanReviewCount: '',
      roleArray: [],
      dashboardTopList: [],
      topProgramId: localStorage.getItem('topProgramId') ? localStorage.getItem('sessionType') === 'Online' ? JSON.parse(localStorage.getItem('topProgramId')) : localStorage.getItem("topLocalProgram") == "false" ? [] : JSON.parse(localStorage.getItem('topProgramId')) : [],
      topCountryId: [],
      topTechnicalAreaId: [],
      bottomProgramId: localStorage.getItem('bottomProgramId') ? localStorage.getItem('sessionType') === 'Online' ? localStorage.getItem('bottomProgramId') : localStorage.getItem("bottomLocalProgram") == "false" ? "" : localStorage.getItem('bottomProgramId') : "",
      displayBy: 1,
      rangeValue: localStorage.getItem("bottomReportPeriod") ? JSON.parse(localStorage.getItem("bottomReportPeriod")) : { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
      minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
      maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
      topSubmitLoader: false,
      bottomSubmitLoader: false,
      fullDashbaordTopList: [],
      topProgramIdChange: false,
      multipleQPLRebuild: false,
      totalCount:0,
      initialCount:0
    };
    this.getCountrys = this.getCountrys.bind(this);
    this.getHealthAreaList = this.getHealthAreaList.bind(this);
    this.getPrograms = this.getPrograms.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  /**
   * Reterives dashboard data from server on component mount
   */
  componentDidMount() {
    this.getCountrys();
  }
  /**
    * Handles the change event of the diplaying only downloaded programs.
    * @param {Object} event - The event object containing the checkbox state.
    */
  changeOnlyDownloadedProgram(event) {
    var flag = event.target.checked ? 1 : 0
    if (flag) {
      this.setState({
        onlyDownloadedProgram: true,
        programValues: []
      }, () => {
        this.getPrograms();
      })
    } else {
      this.setState({
        onlyDownloadedProgram: false,
        programValues: []
      }, () => {
        this.getCountrys();
      })
    }
  }
  /**
   * Handles the change event for countries.
   * @param {Array} countrysId - An array containing the selected country IDs.
   */
  handleChange(countrysId) {
    countrysId = countrysId.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
      countryValues: countrysId.map(ele => ele),
      countryLabels: countrysId.map(ele => ele.label)
    }, () => {
      this.getHealthAreaList();
    })
  }
  /**
   * Handles the change event for program selection.
   * @param {array} programIds - The array of selected program IDs.
   */
  handleChangeProgram = (programIds) => {
    programIds = programIds.sort(function (a, b) {
        return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
        programValues: programIds.map(ele => ele),
        programLabels: programIds.map(ele => ele.label)
    }, () => {
        this.fetchData();
    })
  }
  handleTechnicalAreaIdChange = (technicalAreaIds) => {
    technicalAreaIds = technicalAreaIds.sort(function (a, b) {
        return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
        technicalAreaValues: technicalAreaIds.map(ele => ele),
        technicalAreaLabels: technicalAreaIds.map(ele => ele.label)
    }, () => {
      this.getPrograms();
        // this.fetchData();
    })
  }
  /**
   * Retrieves the list of countries based on the realm ID and updates the state with the list.
   */
  getCountrys() {
    this.setState({ loading: true })
    if (localStorage.getItem("sessionType") === 'Online') {
      let realmId = AuthenticationService.getRealmId();
      DropdownService.getRealmCountryDropdownList(realmId)
        .then(response => {
          if (response.status == 200) {
            var listArray = response.data;
            listArray.sort((a, b) => {
              var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
              var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
              return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
              countrys: listArray,
              loading: false
            }, () => { })
          } else {
            this.setState({ message: response.data.messageCode, loading: false },
              () => { this.hideSecondComponent(); })
          }
        })
        .catch(
          error => {
            this.setState({
              countrys: []
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
                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
                    loading: false
                  });
                  break;
                case 412:
                  this.setState({
                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
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
    this.getHealthAreaList();
    // this.filterData(this.state.rangeValue);
  }
  
  getHealthAreaList() {
    this.setState({ loading: true })
    if (localStorage.getItem("sessionType") === 'Online') {
      let realmId = AuthenticationService.getRealmId();
      ProgramService.getHealthAreaListByRealmCountryIds(this.state.countrys.map(ele => (ele.id).toString()))
        .then(response => {
          if (response.status == 200) {
            var listArray = response.data;
            listArray.sort((a, b) => {
              var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
              var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
              return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
              technicalAreas: listArray,
              loading: false
            }, () => { this.getPrograms() })
          } else {
            this.setState({ message: response.data.messageCode, loading: false },
              () => { this.hideSecondComponent(); })
          }
        })
        .catch(
          error => {
            this.setState({
              technicalAreas: []
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
                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
                    loading: false
                  });
                  break;
                case 412:
                  this.setState({
                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
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
    // this.filterData(this.state.rangeValue);
  }
  /**
   * Retrieves the list of programs.
   */
  getPrograms = () => {
      if (localStorage.getItem("sessionType") === 'Online' && !this.state.onlyDownloadedProgram) {
          let countryIds = this.state.countryValues.map((ele) => ele.value);
          let newCountryList = [...new Set(countryIds)];
          let technicalAreaIds = this.state.technicalAreaValues.map((ele) => ele.value);
          let newTechnicalAreaList = [...new Set(technicalAreaIds)];
          let inputJson = {
            "realmCountryIds": newCountryList,
            "healthAreaIds": newTechnicalAreaList 
          }
          if (newCountryList.length > 0) {
              DropdownService.getProgramListBasedOnRealmCountryIdsAndHealthAreaIds(inputJson)
                  .then(response => {
                      const newProgramList = response.data;
                      const prevSelectedIds = this.state.programValues.map(p => p.value);
                      const filteredProgramList = newProgramList
                        .filter(p => prevSelectedIds.includes(p.id))
                        .map(p => ({ label: p.code, value: p.id }));;
                      var listArray = response.data;
                      listArray.sort((a, b) => {
                          var itemLabelA = a.code.toUpperCase();
                          var itemLabelB = b.code.toUpperCase();
                          return itemLabelA > itemLabelB ? 1 : -1;
                      });
                      this.setState({
                          programValues: filteredProgramList,
                          programLst: listArray, loading: false
                      })
                  }).catch(
                      error => {
                          this.setState({
                              programLst: [], loading: false
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
      } else {
          this.consolidatedProgramList()
      }
  }
  /**
   * Consolidates the list of program obtained from Server and local programs.
   */
  consolidatedProgramList = () => {
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
      this.setState({
        message: i18n.t('static.program.errortext'),
        color: '#BA0C2F'
      })
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
      var program = transaction.objectStore('programQPLDetails');
      var getRequest = program.getAll();
      var programList = this.state.programLst;
      let tempProgramList = [];
      getRequest.onerror = function (event) {
        this.setState({
          message: i18n.t('static.program.errortext'),
          color: '#BA0C2F',
          loading: false
        })
      }.bind(this);
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        var filteredGetRequestList = myResult.filter(c => c.userId == userId);
        for (var i = 0; i < filteredGetRequestList.length; i++) {
          var f = 0
          for (var k = 0; k < programList.length; k++) {
            if (filteredGetRequestList[i].programId == programList[k].programId) {
              f = 1;
            }
          }
          tempProgramList.push({
            openCount: filteredGetRequestList[i].openCount,
            addressedCount: filteredGetRequestList[i].addressedCount,
            code: filteredGetRequestList[i].programCode + " ~v" + filteredGetRequestList[i].version + " (Local)",
            programVersion: filteredGetRequestList[i].version,
            programId: filteredGetRequestList[i].programId,
            versionId: filteredGetRequestList[i].version,
            id: filteredGetRequestList[i].id,
            loading: false,
            local: true,
            cutOffDate: filteredGetRequestList[i].cutOffDate != undefined && filteredGetRequestList[i].cutOffDate != null && filteredGetRequestList[i].cutOffDate != "" ? filteredGetRequestList[i].cutOffDate : ""
          });
        }
        tempProgramList.sort(function (a, b) {
          a = a.code.toLowerCase();
          b = b.code.toLowerCase();
          return a < b ? -1 : a > b ? 1 : 0;
        });
        this.setState({
          programLst: tempProgramList
        }, () => this.fetchData() )
      }.bind(this);
    }.bind(this)
  }
  toggleView = () => {
    let viewBy = document.getElementById("viewById").value;
    var viewByLabel = document.getElementById("viewById").selectedOptions[0].text.toString();
    this.setState({
        viewBy: viewBy,
        viewByLabel: [viewByLabel]
    });
  }
  toggleShowDetail = () => {
    let showDetail = document.getElementById("showDetailId").value;
    var showDetailLabel = document.getElementById("showDetailId").selectedOptions[0].text.toString();
    this.setState({
        showDetail: showDetail,
        showDetailLabel: [showDetailLabel]
    });
  }
  fetchData = () => {
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var ppuTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
        var ppuObjectStore = ppuTransaction.objectStore('programPlanningUnit');
        var ppuRequest = ppuObjectStore.getAll();
        ppuRequest.onsuccess = function (event) {
            var ppuList = ppuRequest.result;
            var pdTransaction = db1.transaction(['programData'], 'readwrite');
            var pdObjectStore = pdTransaction.objectStore('programData');
            var pdRequest = pdObjectStore.get(this.state.programValues.map(p => p.value)[0]);
            pdRequest.onsuccess = function (event) {
                var programData = pdRequest.result;
                var ppuListForProgram = ppuList.filter(c => c.program.id == programData.programId);
                var programDataBytes = CryptoJS.AES.decrypt(programData.programData.generalData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                var generalProgramJson = programJson;
                var dashboardBottomData = {};
                var dashboardData = generalProgramJson.dashboardData;
                if (dashboardData != undefined) {
                    var bottomPuData = dashboardData.bottomPuData;
                    var stockOut = 0;
                    var underStock = 0;
                    var adequate = 0;
                    var overStock = 0;
                    var na = 0;
                    var puStockOutList = [];
                    var expiriesList = [];
                    var shipmentDetailsList = [];
                    var shipmentWithFundingSourceTbd = [];
                    var forecastConsumptionQplCount = 0;
                    var actualConsumptionQplCount = 0;
                    var inventoryQplCount = 0;
                    var shipmentQplCount = 0;
                    var totalQpl = 0;
                    var expiryTotal = 0;
                    if (bottomPuData != "" && bottomPuData != undefined) {
                        var puIds = ppuListForProgram.filter(c => c.active.toString() == "true")
                        puIds.map(item => {
                            var value = bottomPuData[item.planningUnit.id];
                            if (value != undefined) {
                                stockOut += Number(value.stockStatus.stockOut);
                                underStock += Number(value.stockStatus.underStock);
                                adequate += Number(value.stockStatus.adequate);
                                overStock += Number(value.stockStatus.overStock);
                                na += Number(value.stockStatus.na);
                                if (Number(value.stockStatus.stockOut)) {
                                    puStockOutList.push({
                                        "planningUnit": item.planningUnit,
                                        "count": Number(value.stockStatus.stockOut)
                                    })
                                }
                                var expiryList = value.expiriesList;
                                expiryList.forEach(expiry => {
                                    expiry.planningUnit = item.planningUnit;
                                    expiryTotal += Number(Math.round(expiry.expiryAmt));
                                });
                                expiriesList = expiriesList.concat(expiryList);
                                // if (reportBy == 1) {
                                //     shipmentDetailsList = shipmentDetailsList.concat(value.shipmentDetailsByFundingSource)
                                // } else if (reportBy == 2) {
                                //     shipmentDetailsList = shipmentDetailsList.concat(value.shipmentDetailsByProcurementAgent)
                                // } else {
                                //     shipmentDetailsList = shipmentDetailsList.concat(value.shipmentDetailsByShipmentStatus)
                                // }
                                if (Number(value.countOfTbdFundingSource) > 0) {
                                    shipmentWithFundingSourceTbd.push({
                                        "planningUnit": item.planningUnit,
                                        "count": Number(value.countOfTbdFundingSource)
                                    })
                                }
                                totalQpl += 1;
                                if (value.forecastConsumptionQplPassed.toString() == "true") {
                                    forecastConsumptionQplCount += 1;
                                }
                                if (value.actualConsumptionQplPassed.toString() == "true") {
                                    actualConsumptionQplCount += 1;
                                }
                                if (value.inventoryQplPassed.toString() == "true") {
                                    inventoryQplCount += 1;
                                }
                                if (value.shipmentQplPassed.toString() == "true") {
                                    shipmentQplCount += 1;
                                }
                            }
                        });
                        var totalStock = Number(stockOut) + Number(underStock) + Number(adequate) + Number(overStock) + Number(na);
                        var shipmentTotal = 0;
                        shipmentDetailsList.map(item => {
                            shipmentTotal += Number(item.cost)
                        })
                        var flaggedCountForecastConsumptionData = [...new Set(generalProgramJson.problemReportList.filter(c=> c.planningUnitActive != false && c.problemStatus.id==1 && c.realmProblem.problem.problemId==8).map(c => c.planningUnit.id))].length;
                        var flaggedCountActualConsumptionData = [...new Set(generalProgramJson.problemReportList.filter(c=> c.planningUnitActive != false && c.problemStatus.id==1 && (c.realmProblem.problem.problemId==1 || c.realmProblem.problem.problemId==25)).map(c => c.planningUnit.id))].length;
                        var flaggedCountInventoryData = [...new Set(generalProgramJson.problemReportList.filter(c=>  c.planningUnitActive != false && c.problemStatus.id==1 && c.realmProblem.problem.problemId==2).map(c => c.planningUnit.id))].length;
                        var flaggedCountShipmentData = [...new Set(generalProgramJson.problemReportList.filter(c=> c.planningUnitActive != false && c.problemStatus.id==1 && (c.realmProblem.problem.problemId==3 || c.realmProblem.problem.problemId==4)).map(c => c.planningUnit.id))].length
console.log("StockStatusScore",Number(stockOut),Number(underStock),Number(adequate),Number(overStock))
console.log("Flagged",Number(flaggedCountForecastConsumptionData),Number(flaggedCountActualConsumptionData),Number(flaggedCountInventoryData),Number(flaggedCountShipmentData))
                        dashboardBottomData = {
                            "stockStatus": {
                                "stockOut": stockOut,
                                "underStock": underStock,
                                "adequate": adequate,
                                "overStock": overStock,
                                "na": na,
                                "total": totalStock,
                                "puStockOutList": puStockOutList,
                                "stockOutPerc": Number(stockOut) / Number(totalStock),
                                "underStockPerc": Number(underStock) / Number(totalStock),
                                "adequatePerc": Number(adequate) / Number(totalStock),
                                "overStockPerc": Number(overStock) / Number(totalStock),
                                "naPerc": Number(na) / Number(totalStock)
                            },
                            "expiriesList": expiriesList,
                            "shipmentDetailsList": shipmentDetailsList,
                            "shipmentWithFundingSourceTbd": shipmentWithFundingSourceTbd,
                            "forecastErrorList": [],
                            "forecastConsumptionQpl": {
                                "puCount": totalQpl,
                                "correctCount": totalQpl-flaggedCountForecastConsumptionData
                            },
                            "actualConsumptionQpl": {
                                "puCount": totalQpl,
                                "correctCount": totalQpl-flaggedCountActualConsumptionData
                            },
                            "inventoryQpl": {
                                "puCount": totalQpl,
                                "correctCount": totalQpl-flaggedCountInventoryData
                            },
                            "shipmentQpl": {
                                "puCount": totalQpl,
                                "correctCount": totalQpl-flaggedCountShipmentData
                            },
                            "expiryTotal": expiryTotal,
                            "shipmentTotal": shipmentTotal,
                            "supplyPlanQualityScore": (((1-(flaggedCountForecastConsumptionData/totalQpl)) + (1-(flaggedCountActualConsumptionData/totalQpl)) + (1-(flaggedCountInventoryData/totalQpl)) + (1-(flaggedCountShipmentData/totalQpl)))/4)*100,
                            "stockStatusScore": (Number(adequate)/(Number(stockOut)+Number(underStock)+Number(adequate)+Number(overStock)))*100
                        }
                        this.setState({ dashboardBottomData }, () => {
                            this.buildJexcel();
                        });
                        // props.updateStateDashboard("dashboardStartDateBottom", generalProgramJson.dashboardData.startDateBottom);
                        // props.updateStateDashboard("dashboardStopDateBottom", generalProgramJson.dashboardData.stopDateBottom);
                        // props.updateStateDashboard("dashboardBottomData", dashboardBottomData);
                        // props.updateStateDashboard("bottomSubmitLoader", false);
                    } else {
                        // props.updateStateDashboard("dashboardBottomData", "");
                        // props.updateStateDashboard("bottomSubmitLoader", false);
                    }
                } else {
                    // props.updateStateDashboard("dashboardBottomData", "");
                    // props.updateStateDashboard("bottomSubmitLoader", false);
                }
            }.bind(this)
        }.bind(this)
    }.bind(this)
  }

  buildJexcel = () => {
    if (this.el) {
        jexcel.destroy(document.getElementById("scorecardTableDiv"), true);
        this.el = null;
    }

    let data = [
        ['FSP-ARV-MOH', 'v12 (Dec 12, 2025)', 10, 3, 2, 2, 4, '78%', '5,10,40,30,15', '16%', '43%', 'Approved (Nov 5, 2025)', 'xxxx'],
        ['FSP-NUTR-MOH', 'v12 (Dec 12, 2025)', 12, 8, 3, 3, 11, '6%', '10,10,30,40,10', '69%', '62%', 'Rejected (Oct 10, 2025)', 'xxxx'],
        ['FSP-MAL-MOH', 'v12 (Dec 12, 2025)', 20, 5, 13, 11, 20, '33%', '15,10,25,35,15', '60%', '35%', 'Approved (Nov 5, 2025)', 'xxxx'],
        ['FSP-Lab-MOH', 'v12 (Dec 12, 2025)', 32, 18, 30, 13, 12, '32%', '20,15,30,25,10', '18%', '13%', 'Rejected (Oct 10, 2025)', 'xxxx'],
        ['CTRY-ARV-MOH', 'v12 (Dec 12, 2025)', 11, 8, 4, 7, 1, '19%', '5,25,45,15,10', '8%', '46%', 'Approved (Nov 5, 2025)', 'xxxx'],
        ['CTRY-NUTR-MOH', 'v12 (Dec 12, 2025)', 22, 19, 18, 8, 2, '74%', '10,20,50,15,5', '86%', '100%', 'Rejected (Oct 10, 2025)', 'xxxx'],
        ['CTRY-MAL-MOH', 'v12 (Dec 12, 2025)', 34, 24, 29, 5, 19, '53%', '15,15,40,20,10', '89%', '74%', 'Approved (Nov 5, 2025)', 'xxxx'],
        ['CTRY-Lab-MOH', 'v12 (Dec 12, 2025)', 13, 11, 3, 9, 10, '30%', '5,15,50,25,5', '21%', '61%', 'Rejected (Oct 10, 2025)', 'xxxx'],
    ];

    // Standalone formatting function — reads from data array, applies CSS to visible DOM rows
    const reapplyFormatting = (instance) => {
        if (!instance || !instance.tbody) return;
        const rows = instance.tbody.children;
        const allData = instance.options.data;

        for (let r = 0; r < rows.length; r++) {
            const tr = rows[r];
            if (!tr || tr.style.display === 'none') continue;

            // Get the data row index from the DOM row's data-y attribute
            const dataY = parseInt(tr.getAttribute('data-y'), 10);
            if (isNaN(dataY) || !allData[dataY]) continue;

            const rowData = allData[dataY];
            const activePUs = Number(rowData[2]) || 0;

            // Cols 3-6: blue data bars (Forecasted, Actual Consumption, Inventory, Shipments)
            for (let c = 3; c <= 6; c++) {
                const cell = tr.querySelector(`td[data-x="${c}"]`);
                if (!cell) continue;
                const value = Number(rowData[c]);
                if (!isNaN(value)) {
                    let percentage = activePUs > 0 ? Math.min((value / activePUs) * 100, 100) : 0;
                    cell.style.background = `linear-gradient(to right, #A9D1E5 ${percentage}%, transparent ${percentage}%)`;
                    cell.style.backgroundClip = 'content-box';
                    cell.style.padding = '0px 0px';
                    cell.style.textAlign = 'right';
                    cell.style.fontWeight = 'bold';
                }
            }

            // Cols 7, 9, 10: colored dot with percentage
            for (let c of [7, 9, 10]) {
                const cell = tr.querySelector(`td[data-x="${c}"]`);
                if (!cell) continue;
                const raw = String(rowData[c] || '').replace(/%/g, '').trim();
                const value = parseInt(raw, 10);
                if (!isNaN(value)) {
                    let color = value <= 35 ? '%23BA0C2F' : value <= 70 ? '%23f48521' : value <= 99 ? '%23edba26' : '%23118b70';
                    cell.innerText = value + '%';
                    cell.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Ccircle cx='8' cy='8' r='6' fill='${color}'/%3E%3C/svg%3E")`;
                    cell.style.backgroundRepeat = 'no-repeat';
                    cell.style.backgroundPosition = 'center left 20%';
                    cell.style.paddingLeft = '30px';
                    cell.style.textAlign = 'left';
                    cell.style.fontWeight = 'bold';
                }
            }

            // Col 8: Stock Status stacked bar
            const stockCell = tr.querySelector('td[data-x="8"]');
            if (stockCell) {
                const parts = String(rowData[8] || '').split(',');
                if (parts.length === 5) {
                    const c1 = Number(parts[0]);
                    const c2 = c1 + Number(parts[1]);
                    const c3 = c2 + Number(parts[2]);
                    const c4 = c3 + Number(parts[3]);
                    stockCell.style.background = `linear-gradient(to right, #BA0C2F 0%, #BA0C2F ${c1}%, #f48521 ${c1}%, #f48521 ${c2}%, #118b70 ${c2}%, #118b70 ${c3}%, #edb944 ${c3}%, #edb944 ${c4}%, #cfcdc9 ${c4}%, #cfcdc9 100%)`;
                    stockCell.style.backgroundClip = 'content-box';
                    stockCell.style.color = 'transparent';
                    stockCell.style.fontSize = '0px';
                    stockCell.style.padding = '8px 5px';
                }
            }
        }
    };

    let options = {
        data: data,
        columnDrag: true,
        columns: [
            { title: 'Program', type: 'text', readOnly: true },
            { title: 'Latest Version ', type: 'text', readOnly: true },
            { title: 'Active PUs', type: 'numeric', readOnly: true },
            { title: 'Forecasted Consumption ', type: 'numeric', readOnly: true },
            { title: 'Actual Consumption ', type: 'numeric', readOnly: true },
            { title: 'Actual Inventory ', type: 'numeric', readOnly: true },
            { title: 'Shipments ', type: 'numeric', readOnly: true },
            { title: 'Quality Score ', type: 'text', readOnly: true },
            { title: 'Stock Status ', type: 'text', readOnly: true },
            { title: 'Stock Status Score ', type: 'text', readOnly: true },
            { title: 'Total Score ', type: 'text', readOnly: true },
            { title: 'Review Status', type: 'text', readOnly: true },
            { title: 'Version Notes', type: 'text', readOnly: true },
        ],
        editable: false,
        onload: function (obj) {
            jExcelLoadedFunction(obj);
        },
        onchangepage: function(obj) {
            reapplyFormatting(obj);
        },
        onsort: function(obj) {
            reapplyFormatting(obj);
        },
        onfilter: function(obj) {
            reapplyFormatting(obj);
        },
        onsearch: function(obj) {
            reapplyFormatting(obj);
        },
        search: true,
        columnSorting: true,
        wordWrap: true,
        allowInsertColumn: false,
        allowManualInsertColumn: false,
        allowDeleteRow: false,
        allowExport: true,
        allowInsertRow: false,
        allowManualInsertRow: false,
        copyCompatibility: true,
        parseFormulas: true,
        filters: true,
        license: JEXCEL_PRO_KEY,
        pagination: localStorage.getItem("sesRecordCount") || 10,
        paginationOptions: JEXCEL_PAGINATION_OPTION,
    };

    let scorecardTableDiv = document.getElementById("scorecardTableDiv");
    if (scorecardTableDiv) {
        this.el = jexcel(scorecardTableDiv, options);
        // Apply formatting after browser finishes first paint
        const el = this.el;
        requestAnimationFrame(() => {
            setTimeout(() => reapplyFormatting(el), 50);
        });
    }
  }
  /**
   * Displays a loading indicator while data is being loaded.
   */
  loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>
  /**
   * Renders the application dashboard.
   * @returns {JSX.Element} - Application Dashboard.
   */
  render() {
    jexcel.setDictionary({
      Show: " ",
      entries: " ",
    });
    const { isDarkMode } = this.state;
    // const backgroundColor = isDarkMode ? darkModeColors : lightModeColors;
    const fontColor = isDarkMode ? '#e4e5e6' : '#212721';
    const gridLineColor = isDarkMode ? '#444' : '#ddd';

    const { countrys } = this.state;
    let countryList = countrys.length > 0 && countrys.map((item, i) => {
      return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
    }, this);
    const { technicalAreas } = this.state;
    let technicalAreaList = technicalAreas.length > 0 && technicalAreas.map((item, i) => {
      return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
    }, this);
    const { programLst } = this.state;
    let programList = [];
    programList = programLst.length > 0
        && programLst.map((item, i) => {
            return (
                { label: (item.code), value: item.id }
            )
        }, this);
    const checkOnline = localStorage.getItem('sessionType');
    let defaultModuleId;
    if (localStorage.getItem('curUser') != null && localStorage.getItem('curUser') != "") {
      defaultModuleId = sessionStorage.getItem('defaultModuleId');
    }
    if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SUPPLY_PLANNING_MODULE') && AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_FORECASTING_MODULE')) {
      defaultModuleId = defaultModuleId != undefined ? defaultModuleId : 1;
    } else if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SUPPLY_PLANNING_MODULE')) {
      defaultModuleId = 2;
    } else {
      defaultModuleId = 1;
    }
    const activeTab1 = defaultModuleId;
    const { activeIndex } = this.state;
    const { activeIndexRealm } = this.state;
    const { activeIndexUser } = this.state;
    const { activeIndexErp } = this.state;
    const { SearchBar, ClearSearchButton } = Search;
    const customTotal = (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        {i18n.t('static.common.result', { from, to, size })}
      </span>
    );
    const options = {
      hidePageListOnlyOnePage: true,
      firstPageText: i18n.t('static.common.first'),
      prePageText: i18n.t('static.common.back'),
      nextPageText: i18n.t('static.common.next'),
      lastPageText: i18n.t('static.common.last'),
      nextPageTitle: i18n.t('static.common.firstPage'),
      prePageTitle: i18n.t('static.common.prevPage'),
      firstPageTitle: i18n.t('static.common.nextPage'),
      lastPageTitle: i18n.t('static.common.lastPage'),
      showTotal: true,
      paginationTotalRenderer: customTotal,
      disablePageTitle: true,
      sizePerPageList: [{
        text: '10', value: 10
      }, {
        text: '30', value: 30
      }
        ,
      {
        text: '50', value: 50
      },
      {
        text: 'All', value: this.state.problemActionList.length
      }]
    }

    let supplyPlanQualityScore = 0;
    let stockStatusScore = 0;
    let totalScore = 0;

    if (this.state.dashboardBottomData != null && this.state.dashboardBottomData !== "") {
        supplyPlanQualityScore = this.state.dashboardBottomData.supplyPlanQualityScore || 0;
        stockStatusScore = this.state.dashboardBottomData.stockStatusScore || 0;
        totalScore = (supplyPlanQualityScore + stockStatusScore) / 2;
    }

    const barData = {
        labels: this.state.programValues.map(p => p.label),
        datasets: [
            {
                type: 'line',
                label: 'Total Score',
                borderColor: '#99C1E8',
                borderWidth: 3,
                fill: false,
                data: this.state.programValues.map(() => totalScore)
            },
            {
                type: 'bar',
                label: 'Quality Score',
                backgroundColor: '#0F263F',
                data: this.state.programValues.map(() => supplyPlanQualityScore)
            },
            {
                type: 'bar',
                label: 'Stock Status Score',
                backgroundColor: '#C50000',
                data: this.state.programValues.map(() => stockStatusScore)
            },
            {
                type: 'line',
                label: 'Target',
                borderColor: 'black',
                borderWidth: 4,
                borderDash: [10, 5],
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 0,
                data: this.state.programValues.map(() => 90)
            }
        ]
    };

    const barOptions = {
        maintainAspectRatio: false,
        responsive: true,
        tooltips: {
            mode: 'index',
            intersect: false,
        },
        legend: {
            position: 'bottom',
            labels: {
                usePointStyle: false,
                filter: function(item, chart) {
                    return item.text !== 'Target';
                }
            }
        },
        scales: {
            yAxes: [{
                type: 'linear',
                display: true,
                position: 'left',
                ticks: {
                    min: 0,
                    max: 120,
                    callback: function(value) {
                        return value + "%";
                    }
                }
            }],
            xAxes: [{
                gridLines: { display: false }
            }]
        }
    };

    return (
      <div className="animated fadeIn">
        <QatProblemActionNew ref="problemListChild" updateState={this.updateState} fetchData={this.fetchData} objectStore="programData" page="dashboard"></QatProblemActionNew>
        <AuthenticationServiceComponent history={this.props.history} message={(message) => {
          this.setState({ message: message })
        }} />
        <h5 className={this.props.match.params.color} id="div1" style={{ display: this.props.match.params.message == 'Success' ? 'none' : 'block' }}>{i18n.t(this.props.match.params.message)}</h5>
        <h5 className={this.state.color} id="div2">{i18n.t(this.state.message)}</h5>
        <Row className="mt-2">
        </Row>
        <div className='row pb-lg-2'>
            
            {/* <div class="col-xl-12 pl-lg-2 pr-lg-2"> */}
            <div class="card custom-card DashboardBg1">
                <div class="card-body py-1">
                    <div className='row'>
                        <FormGroup className='FormGroupD col-10' style={{ marginBottom: '0px'}}>
                          <Label htmlFor="topProgramId" style={{ display: 'flex', gap: '10px', marginBottom: '0px' }}>
                            <FormGroup className='MarginTopCheckBox'>
                              <div className="pl-lg-4">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_DOWNLOAD_PROGARM') && <Input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="onlyDownloadedProgram"
                                  name="onlyDownloadedProgram"
                                  disabled={!(localStorage.getItem('sessionType') === 'Online')}
                                  checked={this.state.onlyDownloadedProgram}
                                  onClick={(e) => { this.changeOnlyDownloadedProgram(e); }}
                                />}
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_DOWNLOAD_PROGARM') && <Label
                                  className="form-check-label"
                                  check htmlFor="onlyDownloadedProgram" style={{ fontSize: '12px', marginTop: '2px' }}>
                                  {i18n.t("static.common.onlyDownloadedProgram")} <i class="fa fa-info-circle icons" title={i18n.t("static.dashboard.localTooltip")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                </Label>}
                                {!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_DOWNLOAD_PROGARM') && <Label
                                  className="form-check-label"
                                  check htmlFor="onlyDownloadedProgram" style={{ fontSize: '12px', marginTop: '2px' }}>
                                  {""}
                                </Label>}
                              </div>
                            </FormGroup>
                          </Label>
                        </FormGroup>
                      </div>
                      <div className='row'>
                        {!this.state.onlyDownloadedProgram && <FormGroup className="col-md-3">
                          <Label htmlFor="countrysId">{i18n.t('static.program.realmcountry')}</Label>
                          <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                          <div className="controls edit">
                            <MultiSelect
                              bsSize="sm"
                              name="countrysId"
                              id="countrysId"
                              value={this.state.countryValues}
                              onChange={(e) => { this.handleChange(e) }}
                              options={countryList && countryList.length > 0 ? countryList : []}
                              filterOptions={filterOptions}
                              disabled={this.state.loading}
                              overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                              selectSomeItems: i18n.t('static.common.select')}}
                            />
                            {!!this.props.error &&
                              this.props.touched && (
                                <div style={{ color: '#BA0C2F', marginTop: '.5rem' }}>{this.props.error}</div>
                              )}
                          </div>
                        </FormGroup>}
                        {!this.state.onlyDownloadedProgram && <FormGroup className='col-md-3 FormGroupD'>
                          <Label htmlFor="technicalAreaId">Technical Area<span class="red Reqasterisk">*</span></Label>
                          <MultiSelect
                              name="technicalAreaId"
                              id="technicalAreaId"
                              bsSize="sm"
                              value={this.state.technicalAreaValues}
                              onChange={(e) => { this.handleTechnicalAreaIdChange(e) }}
                              options={technicalAreaList && technicalAreaList.length > 0 ? technicalAreaList : []}
                              labelledBy={i18n.t('static.common.regiontext')}
                              disabled={this.state.loading}
                              overrideStrings={{
                                  allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                  selectSomeItems: i18n.t('static.common.select')
                              }}
                              filterOptions={filterOptions}
                          />
                        </FormGroup>}
                        <FormGroup className="col-md-3">
                          <Label htmlFor="programIds">{i18n.t('static.program.program')}</Label>
                          <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                          <div className="controls ">
                              <MultiSelect
                                  bsSize="sm"
                                  name="programIds"
                                  id="programIds"
                                  value={this.state.programValues}
                                  onChange={(e) => { this.handleChangeProgram(e) }}
                                  options={programList && programList.length > 0 ? programList : []}
                                  disabled={this.state.loading}
                                  overrideStrings={{
                                      allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                      selectSomeItems: i18n.t('static.common.select')
                                  }}
                              />
                          </div>
                      </FormGroup>
                      <FormGroup className="col-md-3">
                          <Label htmlFor="viewById">View By</Label>
                          <div className="controls ">
                              <InputGroup>
                                  <Input
                                      type="select"
                                      name="viewById"
                                      id="viewById"
                                      bsSize="sm"
                                      onChange={this.toggleView}
                                  >
                                      <option value="0">Program</option>
                                      <option value="1">Country</option>
                                      <option value="2">Country x Program</option>
                                  </Input>
                              </InputGroup>
                          </div>
                      </FormGroup>
                      <FormGroup className="col-md-3">
                          <Label htmlFor="showDetailId">Show Detail</Label>
                          <div className="controls ">
                              <InputGroup>
                                  <Input
                                      type="select"
                                      name="showDetailId"
                                      id="showDetailId"
                                      bsSize="sm"
                                      onChange={this.toggleShowDetail}
                                  >
                                      <option value="0">No</option>
                                      <option value="1">Yes</option>
                                  </Input>
                              </InputGroup>
                          </div>
                      </FormGroup>
                    </div>
                </div>
              </div>    
            </div>
            
            {this.state.programValues && this.state.programValues.length > 0 && this.state.dashboardBottomData && (
              <>
                <div className="col-xl-12 pl-lg-2 pr-lg-2 mt-2">
                  <Card>
                    <CardBody>
                      <div className="chart-wrapper" style={{ height: '400px' }}>
                        <Bar data={barData} options={barOptions} />
                      </div>
                    </CardBody>
                  </Card>
                </div>
                <div className="col-xl-12 pl-lg-2 pr-lg-2 mt-2">
                  <Card>
                    <CardBody>
                      <div className="table-responsive">
                        <div id="scorecardTableDiv" className="DashboardreadonlyBg"></div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </>
            )}
        </div>
    );
  }
}
export default SupplyPlanScoreCard;