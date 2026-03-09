import CryptoJS from 'crypto-js';
import classNames from 'classnames';
import moment from 'moment';
import React, { Component } from 'react';
import Picker from 'react-month-picker';
import MonthBox from '../../CommonComponent/MonthBox.js';
import { MultiSelect } from 'react-multi-select-component';
import Select from 'react-select';
import { Chart, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import "../../scss/shipmentsByCountry.scss"
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
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { LOGO } from '../../CommonComponent/Logo.js';
import { API_URL, INDEXED_DB_NAME, INDEXED_DB_VERSION, QAT_HELPDESK_CUSTOMER_PORTAL_URL, SECRET_KEY, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, PROGRAM_TYPE_SUPPLY_PLAN, REPORT_DATEPICKER_END_MONTH, REPORT_DATEPICKER_START_MONTH } from '../../Constants.js';
import DashboardService from "../../api/DashboardService";
import ProgramService from "../../api/ProgramService";
import DropdownService from "../../api/DropdownService";
import imageHelp from '../../assets/img/help-icon.png';
import i18n from '../../i18n';
import AuthenticationService from '../../views/Common/AuthenticationService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideFirstComponent, hideSecondComponent, roundARU, filterOptions, formatter, makeText } from '../../CommonComponent/JavascriptCommonFunctions';
import { Dashboard } from '../Dashboard/Dashboard.js';

const targetLinePlugin = {
    afterDraw: function(chart) {
        if (!chart.scales['x-axis-0'] || !chart.scales['y-axis-0']) return;
        const ctx = chart.ctx;
        const xAxis = chart.scales['x-axis-0'];
        const yAxis = chart.scales['y-axis-0'];
        const datasets = chart.data.datasets;
        let targetDataset = null;
        let targetIndex = -1;
        for (let i = 0; i < datasets.length; i++) {
            if (datasets[i].label === 'Target') {
                targetDataset = datasets[i];
                targetIndex = i;
                break;
            }
        }
        if (!targetDataset || targetIndex === -1) return;
        const meta = chart.getDatasetMeta(targetIndex);
        if (meta.hidden) return;
        if (!targetDataset.data || targetDataset.data.length === 0) return;
        const yValue = targetDataset.data[0];
        const yPos = yAxis.getPixelForValue(yValue);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(xAxis.left, yPos);
        ctx.lineTo(xAxis.right, yPos);
        ctx.lineWidth = targetDataset.borderWidth || 4;
        ctx.strokeStyle = targetDataset.borderColor || 'black';
        if (targetDataset.borderDash) {
            ctx.setLineDash(targetDataset.borderDash);
        } else {
            ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.restore();
    }
};

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
      initialCount:0,
      dashboardBottomDataList: [],
      countryExpandedMap: {},
      sortedLabels: [],
      collapseAllChecked: false,
      large: false,
      loadingForNotes: false,
      notesTransTableEl: ""
    };
    this.getCountrys = this.getCountrys.bind(this);
    this.getHealthAreaList = this.getHealthAreaList.bind(this);
    this.getPrograms = this.getPrograms.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.exportCSV = this.exportCSV.bind(this);
    this.exportPDF = this.exportPDF.bind(this);
    this.toggleLarge = this.toggleLarge.bind(this);
    this.getNotes = this.getNotes.bind(this);
    this.redirectToSPVR = this.redirectToSPVR.bind(this);
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
   * Toggles the expansion state of all country accordions in the summary table.
   * @param {Object} event - The checkbox change event.
   */
  toggleCollapseExpandAll(event) {
    const isChecked = event.target.checked;
    this.setState({ collapseAllChecked: isChecked }, () => {
      if (isChecked) {
        // Collapse All
        this.setState({ countryExpandedMap: {} }, () => {
          this.buildJexcel();
        });
      } else {
        // Expand All
        const list = this.state.dashboardBottomDataList || [];
        let newExpandedMap = {};
        list.forEach(dbd => {
          if (!dbd) return;
          const cId = dbd.realmCountry ? dbd.realmCountry.realmCountryId : 0;
          const cLabel = dbd.realmCountry ? getLabelText(dbd.realmCountry.label, this.state.lang) : 'Unknown';
          const cKey = `${cId}_${cLabel}`;
          newExpandedMap[cKey] = true;
        });
        this.setState({ countryExpandedMap: newExpandedMap }, () => {
          this.buildJexcel();
        });
      }
    });
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
   * Redirects to the Supply Plan Version and Review report for the specified program.
   * @param {number|string} programId - The ID of the program.
   */
  redirectToSPVR(programId) {
    localStorage.setItem("sesProgramIdSPVR", programId.toString().split("_").length > 0 ? programId.toString().split("_")[0] : programId);
    this.props.history.push('/report/supplyPlanVersionAndReview/1');
  }
  /**
   * Toggles the visibility of the large modal.
   */
  toggleLarge() {
    this.setState({
      large: !this.state.large,
    });
  }
  /**
   * Fetches version notes history for a specific program and displays them in a Jexcel table modal.
   * @param {number} programId - The ID of the program to fetch notes for.
   */
  getNotes(programId) {
    this.toggleLarge();
    this.setState({
      loadingForNotes: true
    })
    ProgramService.getNotesHistory(programId)
      .then(response => {
        var data = response.data;
        const listArray = [];
        const grouped = data.reduce((acc, item) => {
          acc[item.versionId] = acc[item.versionId] || [];
          acc[item.versionId].push(item);
          return acc;
        }, {});

        Object.values(grouped).forEach(entries => {
          const pendingEntries = entries.filter(e => e.versionStatus.id === 1);
          if (pendingEntries.length) {
            listArray.push(pendingEntries[0]);
            if (pendingEntries.length > 1) {
              listArray.push(pendingEntries[pendingEntries.length - 1]);
            }
          }
          listArray.push(...entries.filter(e => e.versionStatus.id !== 1));
        });

        if (this.state.notesTransTableEl != "" && this.state.notesTransTableEl != undefined) {
          jexcel.destroy(document.getElementById("notesTransTable"), true);
        }
        var json = [];
        for (var sb = listArray.length - 1; sb >= 0; sb--) {
          var data = [];
          data[0] = listArray[sb].versionId;
          data[1] = getLabelText(listArray[sb].versionType.label, this.state.lang);
          data[2] = listArray[sb].versionType.id == 1 ? "" : getLabelText(listArray[sb].versionStatus.label, this.state.lang);
          data[3] = listArray[sb].notes;
          data[4] = listArray[sb].lastModifiedBy.username;
          data[5] = moment(listArray[sb].lastModifiedDate).format("YYYY-MM-DD HH:mm:ss");
          json.push(data);
        }
        var options = {
          data: json,
          columnDrag: false,
          columns: [
            { title: i18n.t('static.report.version'), type: 'text', width: 50 },
            { title: i18n.t('static.report.versiontype'), type: 'text', width: 100 },
            { title: i18n.t('static.report.issupplyplanapprove'), type: 'text', width: 120 },
            { title: i18n.t('static.program.notes'), type: 'text', width: 300 },
            { title: i18n.t("static.common.lastModifiedBy"), type: "text", width: 120 },
            { title: i18n.t("static.common.lastModifiedDate"), type: "calendar", width: 150, options: { isTime: 1, format: "DD-Mon-YY HH24:MI" } },
          ],
          editable: false,
          onload: function (instance, cell) {
            jExcelLoadedFunctionForNotes(instance, 1);
          }.bind(this),
          pagination: localStorage.getItem("sesRecordCount") || 10,
          search: true,
          columnSorting: true,
          wordWrap: true,
          allowInsertColumn: false,
          allowManualInsertColumn: false,
          allowDeleteRow: false,
          copyCompatibility: true,
          allowExport: false,
          paginationOptions: JEXCEL_PAGINATION_OPTION,
          position: "top",
          filters: true,
          license: JEXCEL_PRO_KEY,
          onopenfilter: onOpenFilter,
          allowRenameColumn: false,
          contextMenu: function (obj, x, y, e) {
            return false;
          }.bind(this),
        };
        var scorecardTableDiv = document.getElementById("scorecardTableDiv"); // Dummy check
        setTimeout(() => {
          var elVar = jexcel(document.getElementById("notesTransTable"), options);
          this.setState({ notesTransTableEl: elVar, loadingForNotes: false });
        }, 100);

      }).catch(
        error => {
          this.setState({
            loadingForNotes: false
          })
          console.error(error);
        }
      );
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
        viewByLabel: [viewByLabel],
        sortedLabels: []
    }, () => {
        this.buildJexcel();
    });
  }
  toggleShowDetail = (e) => {
    const checked = e && e.target ? e.target.checked : false;
    const showDetail = checked ? '1' : '0';
    const showDetailLabel = checked ? 'Yes' : 'No';
    this.setState({
        showDetail: showDetail,
        showDetailLabel: [showDetailLabel]
    }, () => {
        this.buildJexcel();
    });
  }
  /**
   * Builds a dashboardBottomData object from a programJson and ppuListForProgram.
   */
  buildDashboardBottomDataFromJson = (programJson, ppuListForProgram) => {
    var dashboardData = programJson.dashboardData;
    if (!dashboardData) return null;
    var bottomPuData = dashboardData.bottomPuData;
    var stockOut = 0, underStock = 0, adequate = 0, overStock = 0, na = 0;
    var puStockOutList = [], expiriesList = [], shipmentDetailsList = [], shipmentWithFundingSourceTbd = [];
    var totalQpl = 0, expiryTotal = 0;
    if (bottomPuData && bottomPuData !== "") {
        var puIds = ppuListForProgram.filter(c => c.active.toString() === "true");
        puIds.forEach(item => {
            var value = bottomPuData[item.planningUnit.id];
            if (value != undefined) {
                stockOut += Number(value.stockStatus.stockOut);
                underStock += Number(value.stockStatus.underStock);
                adequate += Number(value.stockStatus.adequate);
                overStock += Number(value.stockStatus.overStock);
                na += Number(value.stockStatus.na);
                if (Number(value.stockStatus.stockOut)) {
                    puStockOutList.push({ "planningUnit": item.planningUnit, "count": Number(value.stockStatus.stockOut) });
                }
                var expiryList = value.expiriesList;
                expiryList.forEach(expiry => {
                    expiry.planningUnit = item.planningUnit;
                    expiryTotal += Number(Math.round(expiry.expiryAmt));
                });
                expiriesList = expiriesList.concat(expiryList);
                if (Number(value.countOfTbdFundingSource) > 0) {
                    shipmentWithFundingSourceTbd.push({ "planningUnit": item.planningUnit, "count": Number(value.countOfTbdFundingSource) });
                }
                totalQpl += 1;
            }
        });
    }
    var totalStock = stockOut + underStock + adequate + overStock + na;
    var shipmentTotal = 0;
    shipmentDetailsList.forEach(item => { shipmentTotal += Number(item.cost); });
    var flaggedCountForecast = [...new Set(programJson.problemReportList.filter(c => c.planningUnitActive !== false && c.problemStatus.id === 1 && c.realmProblem.problem.problemId === 8).map(c => c.planningUnit.id))].length;
    var flaggedCountActual = [...new Set(programJson.problemReportList.filter(c => c.planningUnitActive !== false && c.problemStatus.id === 1 && (c.realmProblem.problem.problemId === 1 || c.realmProblem.problem.problemId === 25)).map(c => c.planningUnit.id))].length;
    var flaggedCountInventory = [...new Set(programJson.problemReportList.filter(c => c.planningUnitActive !== false && c.problemStatus.id === 1 && c.realmProblem.problem.problemId === 2).map(c => c.planningUnit.id))].length;
    var flaggedCountShipment = [...new Set(programJson.problemReportList.filter(c => c.planningUnitActive !== false && c.problemStatus.id === 1 && (c.realmProblem.problem.problemId === 3 || c.realmProblem.problem.problemId === 4)).map(c => c.planningUnit.id))].length;

    return {
        "program": { "id": programJson.programId, "label": programJson.label, "code": programJson.programCode, "version": programJson.currentVersion.versionId },
        "versionStatus": programJson.currentVersion.versionStatus,
        "versionNotes": programJson.currentVersionNotes,
        "realmCountry": { "realmCountryId": programJson.realmCountryId, "label": programJson.realmCountry.country.label },
        "healthAreaList": programJson.healthAreaList,
        "totalPus": totalQpl,
        "stockStatus": {
            "stockOut": stockOut, "underStock": underStock, "adequate": adequate, "overStock": overStock, "na": na, "total": totalStock,
            "puStockOutList": puStockOutList,
            "stockOutPerc": totalStock > 0 ? stockOut / totalStock : 0,
            "underStockPerc": totalStock > 0 ? underStock / totalStock : 0,
            "adequatePerc": totalStock > 0 ? adequate / totalStock : 0,
            "overStockPerc": totalStock > 0 ? overStock / totalStock : 0,
            "naPerc": totalStock > 0 ? na / totalStock : 0
        },
        "expiriesList": expiriesList,
        "shipmentDetailsList": shipmentDetailsList,
        "shipmentWithFundingSourceTbd": shipmentWithFundingSourceTbd,
        "forecastErrorList": [],
        "forecastConsumptionQpl": { "puCount": totalQpl, "correctCount": totalQpl - flaggedCountForecast },
        "actualConsumptionQpl": { "puCount": totalQpl, "correctCount": totalQpl - flaggedCountActual },
        "inventoryQpl": { "puCount": totalQpl, "correctCount": totalQpl - flaggedCountInventory },
        "shipmentQpl": { "puCount": totalQpl, "correctCount": totalQpl - flaggedCountShipment },
        "expiryTotal": expiryTotal,
        "shipmentTotal": shipmentTotal,
        "versionCreatedDate": programJson.currentVersion.createdDate,
        "versionLastModifiedDate": programJson.currentVersion.lastModifiedDate,
        "supplyPlanQualityScore": totalQpl > 0 ? (((1 - flaggedCountForecast/totalQpl) + (1 - flaggedCountActual/totalQpl) + (1 - flaggedCountInventory/totalQpl) + (1 - flaggedCountShipment/totalQpl)) / 4) * 100 : 0,
        "stockStatusScore": (stockOut + underStock + adequate + overStock) > 0 ? (adequate / (stockOut + underStock + adequate + overStock)) * 100 : 0,
        "programId": programJson.programId
    };
  }

  fetchData = () => {
    if (localStorage.getItem("sessionType") === 'Online' && !this.state.onlyDownloadedProgram) {
      var dt = new Date();
      dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
      var dt1 = new Date();
      dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
      var inputJson = {
        programIds: this.state.programValues.map(p => p.value),
        startDate: dt.getFullYear() + "-" + dt.getMonth() + "-01",
        stopDate: dt1.getFullYear() + "-" + dt1.getMonth() + "-01",
        displayShipmentsBy: 1
      }
      DashboardService.getDashboardBottom(inputJson)
        .then(response => {
          var data = response.data;
          this.setState({
            dashboardBottomDataList: data.map(item => ({
              ...item,
              stockStatusScore: item.stockStatusScore * 100,
              supplyPlanQualityScore: item.supplyPlanQualityScore * 100
            }))
          }, () => {
            this.buildJexcel();
          })
        }
        ).catch(
          error => {
            this.setState({
              bottomSubmitLoader: true,
            })
            if (error.message === "Network Error") {
              this.setState({
                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
              });
            } else {
              switch (error.response ? error.response.status : "") {
                case 500:
                case 401:
                case 404:
                case 406:
                case 412:
                  this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                  break;
                default:
                  this.setState({ message: 'static.unkownError' });
                  break;
              }
            }
          }
        );
          
    } else {
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
            // Load ALL selected programs
            var programIds = this.state.programValues.map(p => p.value);
            var results = [];
            var loaded = 0;
            if (programIds.length === 0) return;
            programIds.forEach(progId => {
                var pdRequest = pdObjectStore.get(progId);
                pdRequest.onsuccess = function (event) {
                    var programData = pdRequest.result;
                    if (programData) {
                        try {
                            var ppuListForProgram = ppuList.filter(c => c.program.id == programData.programId);
                            var programDataBytes = CryptoJS.AES.decrypt(programData.programData.generalData, SECRET_KEY);
                            var programDataStr = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var programJson = JSON.parse(programDataStr);
                            var dbd = this.buildDashboardBottomDataFromJson(programJson, ppuListForProgram);
                            if (dbd) results.push(dbd);
                        } catch (err) {
                            console.error('Error loading program', progId, err);
                        }
                    }
                    loaded++;
                    if (loaded === programIds.length) {
                        // All programs loaded
                        var firstDbd = results.length > 0 ? results[0] : {};
                        let newExpandedMap = { ...this.state.countryExpandedMap };
                        if (!this.state.collapseAllChecked) {
                            results.forEach(dbd => {
                                if (!dbd) return;
                                const cId = dbd.realmCountry ? dbd.realmCountry.realmCountryId : 0;
                                const cLabel = dbd.realmCountry ? getLabelText(dbd.realmCountry.label, this.state.lang) : 'Unknown';
                                const cKey = `${cId}_${cLabel}`;
                                newExpandedMap[cKey] = true;
                            });
                        }
                        this.setState({ 
                            dashboardBottomData: firstDbd, 
                            dashboardBottomDataList: results,
                            countryExpandedMap: newExpandedMap
                        }, () => {
                            this.buildJexcel();
                        });
                    }
                }.bind(this);
            });
        }.bind(this)
    }.bind(this)
    }
  }

  buildJexcel = () => {
    let scorecardTableDiv = document.getElementById("scorecardTableDiv");
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scorecardTableDiv) {
        const currentHeight = scorecardTableDiv.offsetHeight;
        if (currentHeight > 0) {
            scorecardTableDiv.style.minHeight = currentHeight + 'px';
        }
    }

    if (this.el) {
        try { jexcel.destroy(scorecardTableDiv, true); } catch(e){}
        this.el = null;
    }


    let isCountryView = String(this.state.viewBy) === '1';
    let isMatrixView = String(this.state.viewBy) === '2';
    let data = [];
    const list = this.state.dashboardBottomDataList || [];

    let matrixCols = [];
    if (isMatrixView) {
        const countriesMap = {}; 
        const healthAreasMap = {}; 
        const scoresMap = {}; 
        
        list.forEach(dbd => {
            if (!dbd) return;
            const countryLabel = dbd.realmCountry ? getLabelText(dbd.realmCountry.label, this.state.lang) : 'Unknown';
            const score = Math.round(((dbd.supplyPlanQualityScore || 0) + (dbd.stockStatusScore || 0)) / 2);
            
            if (!countriesMap[countryLabel]) countriesMap[countryLabel] = true;
            
            (dbd.healthAreaList || []).forEach(ha => {
                const haLabel = getLabelText(ha.label, this.state.lang);
                if (!healthAreasMap[haLabel]) healthAreasMap[haLabel] = true;
                
                if (!scoresMap[haLabel]) scoresMap[haLabel] = {};
                if (!scoresMap[haLabel][countryLabel]) scoresMap[haLabel][countryLabel] = { sum: 0, count: 0 };
                
                scoresMap[haLabel][countryLabel].sum += score;
                scoresMap[haLabel][countryLabel].count += 1;
            });
        });
        
        const countryList = Object.keys(countriesMap).sort();
        const healthAreaList = Object.keys(healthAreasMap).sort();
        
        matrixCols = [{ title: 'Technical Area', type: 'text', readOnly: true, align: 'left' }];
        countryList.forEach(c => {
            matrixCols.push({ title: c, type: 'text', readOnly: true, align: 'center' });
        });
        matrixCols.push({ title: 'RowType', type: 'hidden' });
        matrixCols.push({ title: 'CountryKey', type: 'hidden' });

        healthAreaList.forEach(ha => {
            const row = [ha];
            countryList.forEach(c => {
                const s = scoresMap[ha][c];
                row.push(s ? `${Math.round(s.sum / s.count)}%` : '');
            });
            row.push('matrix_row');
            row.push('');
            data.push(row);
        });
        this.matrixCountryCount = countryList.length;
    } else if (isCountryView) {
        let countryGroupsMap = {};
        list.forEach(dbd => {
            if (!dbd || !dbd.program) return;
            const cId = dbd.realmCountry ? dbd.realmCountry.realmCountryId : 0;
            const cLabel = dbd.realmCountry ? getLabelText(dbd.realmCountry.label, this.state.lang) : 'Unknown';
            const cKey = `${cId}_${cLabel}`;
            if (!countryGroupsMap[cKey]) countryGroupsMap[cKey] = { label: cLabel, programs: [], key: cKey };
            countryGroupsMap[cKey].programs.push(dbd);
        });

        Object.values(countryGroupsMap).sort((a,b) => a.label.localeCompare(b.label)).forEach(cg => {
            cg.programs.sort((p1, p2) => (p1.program?.code || '').localeCompare(p2.program?.code || ''));
            const isExpanded = !!this.state.countryExpandedMap[cg.key];
            const toggleIcon = isExpanded ? '-' : '+';
            const n = cg.programs.length;
            const activePUs = cg.programs.reduce((s,d)=>s+(d.totalPus||0),0);
            const sumForecast = cg.programs.reduce((s,d)=>s+(d.forecastConsumptionQpl?.correctCount||0),0);
            const sumActual = cg.programs.reduce((s,d)=>s+(d.actualConsumptionQpl?.correctCount||0),0);
            const sumInventory = cg.programs.reduce((s,d)=>s+(d.inventoryQpl?.correctCount||0),0);
            const sumShipments = cg.programs.reduce((s,d)=>s+(d.shipmentQpl?.correctCount||0),0);
            const avgQ = n > 0 ? cg.programs.reduce((s,d)=>s+(d.supplyPlanQualityScore||0),0)/n : 0;
            const avgS = n > 0 ? cg.programs.reduce((s,d)=>s+(d.stockStatusScore||0),0)/n : 0;
            const avgT = (avgQ + avgS) / 2;
            
            const totalSO = cg.programs.reduce((s,d)=>s+(d.stockStatus?.stockOut||0),0);
            const totalUS = cg.programs.reduce((s,d)=>s+(d.stockStatus?.underStock||0),0);
            const totalAd = cg.programs.reduce((s,d)=>s+(d.stockStatus?.adequate||0),0);
            const totalOv = cg.programs.reduce((s,d)=>s+(d.stockStatus?.overStock||0),0);
            const totalNA = cg.programs.reduce((s,d)=>s+(d.stockStatus?.na||0),0);
            const totalSt = totalSO+totalUS+totalAd+totalOv+totalNA;
            
            const soPerc = totalSt>0 ? Math.round((totalSO/totalSt)*100) : 0;
            const usPerc = totalSt>0 ? Math.round((totalUS/totalSt)*100) : 0;
            const adPerc = totalSt>0 ? Math.round((totalAd/totalSt)*100) : 0;
            const ovPerc = totalSt>0 ? Math.round((totalOv/totalSt)*100) : 0;
            const naPerc = totalSt>0 ? Math.round((totalNA/totalSt)*100) : 0;

            data.push([
                toggleIcon,
                cg.label,
                '-',
                activePUs,
                sumForecast,
                sumActual,
                sumInventory,
                sumShipments,
                `${Math.round(avgQ)}%`,
                `${soPerc},${usPerc},${adPerc},${ovPerc},${naPerc}`,
                `${Math.round(avgS)}%`,
                `${Math.round(avgT)}%`,
                '-',
                '-',
                'row_parent',
                cg.key,
                ''
            ]);

            if (isExpanded) {
                cg.programs.forEach(dbd => {
                    let totalScore = Math.round((dbd.supplyPlanQualityScore + dbd.stockStatusScore) / 2) || 0;
                    let reviewStatus = dbd.versionStatus ? (dbd.versionStatus.label ? `${dbd.program.version ? `v${dbd.program.version} - ` : ''}${getLabelText(dbd.versionStatus.label, this.state.lang)}` : dbd.versionStatus.id) : '';
                    reviewStatus += (dbd.versionLastModifiedDate ? ' (' + moment(dbd.versionLastModifiedDate).format('MMM DD, YYYY') + ')' : '');
                    data.push([
                        '',
                        `${dbd.program.code}`,
                        this.state.onlyDownloadedProgram ? `v${dbd.program.version}${dbd.versionCreatedDate ? ' (' + moment(dbd.versionCreatedDate).format('MMM DD, YYYY') + ')' : ''}`
                        : `v${dbd.versionId}${dbd.versionCreatedDate ? ' (' + moment(dbd.versionCreatedDate).format('MMM DD, YYYY') + ')' : ''}`,
                        dbd.totalPus,
                        dbd.forecastConsumptionQpl?.correctCount || 0,
                        dbd.actualConsumptionQpl?.correctCount || 0,
                        dbd.inventoryQpl?.correctCount || 0,
                        dbd.shipmentQpl?.correctCount || 0,
                        `${Math.round(dbd.supplyPlanQualityScore || 0)}%`,
                        `${Math.round((dbd.stockStatus.stockOutPerc || 0) * 100)},${Math.round((dbd.stockStatus.underStockPerc || 0) * 100)},${Math.round((dbd.stockStatus.adequatePerc || 0) * 100)},${Math.round((dbd.stockStatus.overStockPerc || 0) * 100)},${Math.round((dbd.stockStatus.naPerc || 0) * 100)}`,
                        `${Math.round(dbd.stockStatusScore || 0)}%`,
                        `${totalScore}%`,
                        reviewStatus,
                        dbd.versionNotes || '',
                        'row_child',
                        cg.key,
                        this.state.onlyDownloadedProgram ? dbd.programId : dbd.program.id
                    ]);
                });
            }
        });
    } else {
        const sortedList = [...list].sort((a, b) => (a.program?.code || '').localeCompare(b.program?.code || ''));
        sortedList.forEach(dbd => {
            if (!dbd || !dbd.program) return;
            let totalScore = Math.round((dbd.supplyPlanQualityScore + dbd.stockStatusScore) / 2) || 0;
            let reviewStatus = dbd.versionStatus ? (dbd.versionStatus.label ? `${dbd.program.version ? `v${dbd.program.version} - ` : ''}${getLabelText(dbd.versionStatus.label, this.state.lang)}` : dbd.versionStatus.id) : '';
            reviewStatus += (dbd.versionLastModifiedDate ? ' (' + moment(dbd.versionLastModifiedDate).format('MMM DD, YYYY') + ')' : '');
            data.push([
                '',
                dbd.program.code,
                this.state.onlyDownloadedProgram ? `v${dbd.program.version}${dbd.versionCreatedDate ? ' (' + moment(dbd.versionCreatedDate).format('MMM DD, YYYY') + ')' : ''}`
                : `v${dbd.versionId}${dbd.versionCreatedDate ? ' (' + moment(dbd.versionCreatedDate).format('MMM DD, YYYY') + ')' : ''}`,
                dbd.totalPus,
                dbd.forecastConsumptionQpl?.correctCount || 0,
                dbd.actualConsumptionQpl?.correctCount || 0,
                dbd.inventoryQpl?.correctCount || 0,
                dbd.shipmentQpl?.correctCount || 0,
                `${Math.round(dbd.supplyPlanQualityScore || 0)}%`,
                `${Math.round((dbd.stockStatus.stockOutPerc || 0) * 100)},${Math.round((dbd.stockStatus.underStockPerc || 0) * 100)},${Math.round((dbd.stockStatus.adequatePerc || 0) * 100)},${Math.round((dbd.stockStatus.overStockPerc || 0) * 100)},${Math.round((dbd.stockStatus.naPerc || 0) * 100)}`,
                `${Math.round(dbd.stockStatusScore || 0)}%`,
                `${totalScore}%`,
                reviewStatus,
                dbd.versionNotes || '',
                'program',
                '',
                this.state.onlyDownloadedProgram ? dbd.programId : dbd.program.id
            ]);
        });
    }

    const reapplyFormatting = (instance) => {
        if (!instance || !instance.tbody) return;

        // Hide filter and text for the collapse column
        if (isCountryView && instance.thead) {
            const filterRow = instance.thead.querySelector('.jexcel_filter') || instance.thead.querySelector('.jss_filter');
            if (filterRow && filterRow.children[1]) {
                const filterCell = filterRow.children[1];
                filterCell.innerHTML = '';
                filterCell.innerText = '';
                filterCell.style.setProperty('background', 'none', 'important');
                filterCell.style.setProperty('background-image', 'none', 'important');
                filterCell.style.setProperty('pointer-events', 'none', 'important');
            }
        }
        
        // Align headers based on view
        const headers = instance.thead.querySelectorAll('td');
        headers.forEach((h, idx) => {
            const headTitle = (h.innerText || h.textContent || '').trim();
            if (headTitle !== '') {
                h.style.textAlign = 'center';
                h.style.setProperty('text-align', 'center', 'important');
                h.style.verticalAlign = 'middle';
                h.style.setProperty('vertical-align', 'middle', 'important');
            }
        });

        const rows = instance.tbody.children;
        const allData = instance.options.data;

        let childRowIndex = 0;
        for (let r = 0; r < rows.length; r++) {
            const tr = rows[r];
            if (!tr || tr.style.display === 'none') continue;
            const dataY = parseInt(tr.getAttribute('data-y'), 10);
            if (isNaN(dataY) || !allData[dataY]) continue;
            const rowData = allData[dataY];
            const activePUs = Number(rowData[2]) || 0;
            const rowType = isMatrixView ? rowData[rowData.length - 2] : rowData[14];
            
            if (isMatrixView) {
                const cell0Matrix = tr.querySelector(`td[data-x="0"]`);
                if (cell0Matrix) {
                    cell0Matrix.style.textAlign = 'left';
                    cell0Matrix.style.setProperty('text-align', 'left', 'important');
                    cell0Matrix.style.paddingLeft = '10px';
                    if (rowType === 'matrix_total') cell0Matrix.style.textAlign = 'center';
                }

                if (rowType === 'matrix_total') {
                    tr.style.fontWeight = 'bold';
                    tr.style.backgroundColor = '#f4f4f4';
                    for (let i = 0; i < tr.children.length; i++) {
                        tr.children[i].style.setProperty('border-right', '1px solid #999', 'important');
                    }
                }

                for (let c = 1; c < rowData.length - 2; c++) {
                    const cell = tr.querySelector(`td[data-x="${c}"]`);
                    if (!cell) continue;
                    const raw = String(rowData[c] || '').replace(/%/g, '').trim();
                    const value = parseInt(raw, 10);
                    if (!isNaN(value)) {
                        let color = value <= 35 ? '#BA0C2F' : value <= 70 ? '#f48521' : value <= 99 ? '#edba26' : '#118b70';
                        cell.innerHTML = `<div style="display: flex; align-items: center; justify-content: center;">
                            <span style="width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; margin-right: 5px; flex-shrink: 0;"></span>
                            <span>${value}%</span>
                        </div>`;
                        cell.style.backgroundImage = 'none';
                        cell.style.paddingLeft = '0px';
                        cell.style.textAlign = 'center';
                        cell.style.setProperty('text-align', 'center', 'important');
                        cell.style.fontWeight = 'bold';
                    }
                }
                continue;
            }

            const cell0 = tr.querySelector(`td[data-x="0"]`);
            if (cell0) {
                let txt = rowData[0];
                if (txt === '+') {
                    cell0.innerHTML = `<i class="fa fa-plus-square-o" style="color: #2baae2; font-size: 14px;"></i>`;
                    cell0.style.textAlign = 'center';
                    cell0.style.setProperty('text-align', 'center', 'important');
                } else if (txt === '-') {
                    cell0.innerHTML = `<i class="fa fa-minus-square-o" style="color: #2baae2; font-size: 14px;"></i>`;
                    cell0.style.textAlign = 'center';
                    cell0.style.setProperty('text-align', 'center', 'important');
                }
            }

            const cell1 = tr.querySelector(`td[data-x="1"]`);
            if (cell1) {
                cell1.style.textAlign = 'left';
                cell1.style.setProperty('text-align', 'left', 'important');
            }

            if (rowType === 'row_parent') {
                childRowIndex = 0;
                tr.style.backgroundColor = '#f4f4f4';
                tr.onclick = null;
                for (let i = 0; i < tr.children.length; i++) {
                    tr.children[i].style.fontWeight = 'bold';
                    tr.children[i].onclick = null;
                    tr.children[i].style.cursor = 'default';
                }
                if (cell1) {
                    cell1.style.paddingLeft = '5px';
                }
                if (cell0) {
                    cell0.style.cursor = 'pointer';
                    cell0.onclick = (e) => {
                        e.stopPropagation();
                        const cKey = rowData[15];
                        this.setState(prev => {
                            const newMap = { ...prev.countryExpandedMap, [cKey]: !prev.countryExpandedMap[cKey] };
                            const anyExpanded = Object.values(newMap).some(v => v === true);
                            return {
                                countryExpandedMap: newMap,
                                collapseAllChecked: !anyExpanded
                            };
                        }, () => {
                            this.buildJexcel();
                        });
                    };
                }
            } else if (rowType === 'row_child') {
                childRowIndex++;
                tr.style.backgroundColor = childRowIndex % 2 === 0 ? '#ffffff' : '#dce8f4';
                if (cell1) {
                    cell1.style.paddingLeft = '30px';
                }
            }

            // Align Latest Version, Review Status, and Version Notes to left
            for (let c of [2, 12]) {
                const cell = tr.querySelector(`td[data-x="${c}"]`);
                if (cell) {
                    cell.style.textAlign = 'left';
                    cell.style.setProperty('text-align', 'left', 'important');
                    cell.style.paddingLeft = '10px';

                    // Reset link styles and handlers
                    cell.style.removeProperty('color');
                    cell.style.removeProperty('text-decoration');
                    cell.style.removeProperty('cursor');
                    cell.style.setProperty('background-image', 'none', 'important');
                    cell.removeAttribute('title');
                    cell.onclick = null;
                    cell.classList.remove('jss_comment');
                    cell.classList.remove('jss_notes');

                    if (c === 12 && (rowType === 'row_child' || rowType === 'program')) {
                        const programId = rowData[rowData.length - 1];
                        if (programId) {
                            const val = rowData[12];
                            const notes = rowData[13];
                            if (val && val !== '-' && val.trim() !== '') {
                                let iconHtml = '';
                                if (notes && notes.trim() !== '' && notes !== '-') {
                                    iconHtml = `<i class="fa fa-book notes-icon icons IconColorD" title="${notes}" aria-hidden="true" style="color: #002f6c; vertical-align: middle; margin-left: 5px; cursor: pointer;"></i>`;
                                }
                                cell.innerHTML = `<span>${val}</span> ${iconHtml}`;
                                cell.style.setProperty('color', '#002f6c', 'important');
                                cell.style.setProperty('text-decoration', 'none', 'important');
                                cell.style.setProperty('cursor', 'pointer', 'important');
                                cell.onclick = (e) => {
                                    e.stopPropagation();
                                    if (e.target.classList.contains('notes-icon')) {
                                        this.getNotes(programId);
                                    } else {
                                        this.redirectToSPVR(programId);
                                    }
                                };
                            }
                        }
                    }
                }
            }

            const activePUsValue = Number(rowData[3]) || 0;
            for (let c = 4; c <= 7; c++) {
                const cell = tr.querySelector(`td[data-x="${c}"]`);
                if (!cell) continue;
                const value = (rowData[c] === null || rowData[c] === undefined || rowData[c] === '') ? 0 : Number(rowData[c]);
                if (!isNaN(value)) {
                    if (value === 0) {
                        cell.style.setProperty('color', '#FF0000', 'important');
                        cell.style.fontWeight = (rowType === 'row_parent') ? 'bold' : 'normal';
                        cell.style.background = 'none';
                        cell.style.textAlign = 'right';
                        cell.innerText = '0';
                    } else {
                        cell.style.color = '';
                        cell.style.removeProperty('color');
                        let percentage = activePUsValue > 0 ? Math.min((value / activePUsValue) * 100, 100) : 0;
                        cell.style.setProperty('background', `linear-gradient(to right, #A9D1E5 ${percentage}%, transparent ${percentage}%)`, 'important');
                        cell.style.backgroundClip = 'content-box';
                        cell.style.padding = '0px 0px';
                        cell.style.textAlign = 'right';
                        cell.style.fontWeight = (rowType === 'row_parent') ? 'bold' : 'normal';
                    }
                }
            }
            for (let c of [8, 10, 11]) {
                const cell = tr.querySelector(`td[data-x="${c}"]`);
                if (!cell) continue;
                const raw = String(rowData[c] || '').replace(/%/g, '').trim();
                const value = parseInt(raw, 10);
                if (!isNaN(value)) {
                    let color = value <= 35 ? '#BA0C2F' : value <= 70 ? '#f48521' : value <= 99 ? '#edba26' : '#118b70';
                    cell.innerHTML = `<div style="display: flex; align-items: center; justify-content: center;">
                            <span style="min-width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; margin-right: 5px; flex-shrink: 0;"></span>
                            <span>${value}%</span>
                        </div>`;
                    cell.style.backgroundImage = 'none';
                    cell.style.paddingLeft = '0px';
                    cell.style.textAlign = 'center';
                    cell.style.setProperty('text-align', 'center', 'important');
                    cell.style.fontWeight = 'bold';
                }
            }
            const stockCell = tr.querySelector('td[data-x="9"]');
            if (stockCell) {
                const parts = String(rowData[9] || '').split(',');
                if (parts.length === 5) {
                    const c1 = Number(parts[0]);
                    const c2 = c1 + Number(parts[1]);
                    const c3 = c2 + Number(parts[2]);
                    const c4 = c3 + Number(parts[3]);
                    stockCell.style.background = `linear-gradient(to right, #BA0C2F 0%, #BA0C2F ${c1}%, #f48521 ${c1}%, #f48521 ${c2}%, #118b70 ${c2}%, #118b70 ${c3}%, #edb944 ${c3}%, #edb944 ${c4}%, #cfcdc9 ${c4}%, #cfcdc9 100%)`;
                    stockCell.title = `🟥 Stock Out: ${parts[0]}%\n🟧 Below Min: ${parts[1]}%\n🟩 Stocked to Plan: ${parts[2]}%\n🟨 Above Max: ${parts[3]}%\n⬜ N/A: ${parts[4]}%`;
                    stockCell.style.backgroundRepeat = 'no-repeat';
                    stockCell.style.backgroundPosition = 'center';
                    stockCell.style.backgroundSize = '95% 14px';
                    stockCell.style.color = 'transparent';
                    stockCell.style.fontSize = '0px';
                    stockCell.style.padding = '0px';
                }
            }
        }
    };

    let options = {
        data: data,
        columnDrag: true,
        columns: isMatrixView ? matrixCols : [
            { title: ' ', type: isCountryView ? 'text' : 'hidden', readOnly: true, align: 'center', width: 25, filter: false },
            { title: isCountryView ? 'Country' : 'Program', type: 'text', readOnly: true, align: 'left' },
            { title: 'Latest Version', type: 'text', readOnly: true, align: 'left' },
            { title: 'Active PUs', type: 'numeric', readOnly: true, align: 'left' },
            { title: 'Forecasted Consumption', type: String(this.state.showDetail) === '0' ? 'hidden' : 'numeric', readOnly: true, align: 'left' },
            { title: 'Actual Consumption', type: String(this.state.showDetail) === '0' ? 'hidden' : 'numeric', readOnly: true, align: 'left' },
            { title: 'Actual Inventory', type: String(this.state.showDetail) === '0' ? 'hidden' : 'numeric', readOnly: true, align: 'left' },
            { title: 'Shipments', type: String(this.state.showDetail) === '0' ? 'hidden' : 'numeric', readOnly: true, align: 'left' },
            { title: 'Quality Score', type: 'text', readOnly: true, align: 'left' },
            { title: 'Stock Status', type: String(this.state.showDetail) === '0' ? 'hidden' : 'text', readOnly: true, align: 'left' },
            { title: 'Stock Status Score', type: 'text', readOnly: true, align: 'left' },
            { title: 'Total Score', type: 'text', readOnly: true, align: 'left' },
            { title: 'Review Status', type: String(this.state.showDetail) === '0' ? 'hidden' : 'text', readOnly: true, align: 'left', width: 200 },
            { title: 'Version Notes', type: 'hidden', readOnly: true, align: 'left', width: 150 },
            { title: 'RowType', type: 'hidden' },
            { title: 'CountryKey', type: 'hidden' },
            { title: 'ProgramId', type: 'hidden' }
        ],
        editable: false,
        onload: function (obj) { jExcelLoadedFunction(obj); },
        onselection: function (instance, cell, x, y, value, e) {
            // accordion logic moved to td.onclick in reapplyFormatting 
        }.bind(this),
        onchangepage: function(obj) { reapplyFormatting(obj); },
        onsort: function(instance, column, dir) { 
            if (isMatrixView) {
                setTimeout(() => { this.recalculateFooter(instance, this.matrixCountryCount); }, 0);
            }
            
            const sortedData = instance.getJson();
            let sortedLabels = [];
            
            if (isMatrixView) {
                // First column is Technical Area
                sortedLabels = sortedData.map(r => r[0]);
            } else if (isCountryView) {
                // First column is icon, second is like "Country", only get parents
                const parentRows = sortedData.filter(r => r[14] === 'row_parent');
                sortedLabels = parentRows.map(r => r[1]);
            } else {
                // Program view: first column is icon (empty), second is Program Code
                sortedLabels = sortedData.map(r => r[1]);
            }
            
            requestAnimationFrame(() => {
                this.setState({ sortedLabels }, () => {
                    setTimeout(() => {
                        reapplyFormatting(instance);
                    }, 0);
                });
            });
        }.bind(this),
        onfilter: function(obj) { 
            if (isMatrixView) {
                this.recalculateFooter(obj, this.matrixCountryCount);
            }
            reapplyFormatting(obj); 
        }.bind(this),
        onsearch: function(obj) { 
            if (isMatrixView) {
                this.recalculateFooter(obj, this.matrixCountryCount);
            }
            reapplyFormatting(obj); 
        }.bind(this),
        search: true,
        columnSorting: true,
        contextMenu: function (obj, x, y, e) {
          return false;
        }.bind(this),
        footers: isMatrixView ? [this.calculateTotals(data, this.matrixCountryCount)] : [],
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
        onopenfilter: (instance, col) => {
            setTimeout(() => {
                const dropdown = document.querySelector('.jss_filters_options');
                if (dropdown) {
                    const options = Array.from(dropdown.querySelectorAll('label'));
                    const actualOptions = options.filter(l => l.querySelector('input'));
                    actualOptions.sort((a, b) => {
                        const valA = a.textContent.trim();
                        const valB = b.textContent.trim();
                        const numA = parseFloat(valA);
                        const numB = parseFloat(valB);
                        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                        return valA.localeCompare(valB, undefined, {numeric: true, sensitivity: 'base'});
                    });
                    actualOptions.forEach(opt => dropdown.appendChild(opt));
                }
            }, 50);
        }
    };

    if (scorecardTableDiv) {
        this.el = jexcel(scorecardTableDiv, options);
        if (scrollY > 0) {
            window.scrollTo(0, scrollY);
        }
        const el = this.el;
        requestAnimationFrame(() => { 
            setTimeout(() => {
                reapplyFormatting(el);
                scorecardTableDiv.style.minHeight = '';
                if (scrollY > 0) {
                    window.scrollTo(0, scrollY);
                }
            }, 50); 
        });

        // Inject "Collapse All" and "Show Detail" checkboxes into the Jexcel toolbar row (same line as search bar)
        requestAnimationFrame(() => {
            setTimeout(() => {
                const toolbarRow = scorecardTableDiv.querySelector('.jexcel_filter') || scorecardTableDiv.querySelector('.jss_search_container');
                if (toolbarRow) {
                    // Remove any previously injected container
                    const existing = toolbarRow.querySelector('#collapseAllContainer');
                    if (existing) existing.remove();

                    const container = document.createElement('div');
                    container.id = 'collapseAllContainer';
                    container.style.cssText = 'display:flex;align-items:center;margin-left:0 !important;margin-right:auto;padding-left:5px;gap:15px;';

                    // Show Detail checkbox
                    if (!isMatrixView) {
                        const detailDiv = document.createElement('div');
                        detailDiv.style.cssText = 'display:flex;align-items:center;';

                        const detailCheckbox = document.createElement('input');
                        detailCheckbox.type = 'checkbox';
                        detailCheckbox.id = 'showDetailInline';
                        detailCheckbox.checked = String(this.state.showDetail) === '1';
                        detailCheckbox.style.cssText = 'margin:0;cursor:pointer;';
                        detailCheckbox.addEventListener('change', (e) => {
                            e.stopPropagation();
                            this.toggleShowDetail(e);
                        });

                        const detailLabel = document.createElement('label');
                        detailLabel.htmlFor = 'showDetailInline';
                        detailLabel.textContent = 'Show Detail';
                        detailLabel.style.cssText = 'font-size:12px;cursor:pointer;margin:0 0 0 5px;';

                        detailDiv.appendChild(detailCheckbox);
                        detailDiv.appendChild(detailLabel);
                        container.appendChild(detailDiv);
                    }

                    // Collapse All checkbox (only for Country view)
                    if (isCountryView) {
                        const collapseDiv = document.createElement('div');
                        collapseDiv.style.cssText = 'display:flex;align-items:center;';

                        const collapseCheckbox = document.createElement('input');
                        collapseCheckbox.type = 'checkbox';
                        collapseCheckbox.id = 'collapseAllInline';
                        collapseCheckbox.checked = this.state.collapseAllChecked || false;
                        collapseCheckbox.style.cssText = 'margin:0;cursor:pointer;';
                        collapseCheckbox.addEventListener('change', (e) => {
                            e.stopPropagation();
                            this.toggleCollapseExpandAll(e);
                        });

                        const collapseLabel = document.createElement('label');
                        collapseLabel.htmlFor = 'collapseAllInline';
                        collapseLabel.textContent = 'Collapse All';
                        collapseLabel.style.cssText = 'font-size:12px;cursor:pointer;margin:0 0 0 5px;';

                        collapseDiv.appendChild(collapseCheckbox);
                        collapseDiv.appendChild(collapseLabel);
                        container.appendChild(collapseDiv);
                    }

                    toolbarRow.insertBefore(container, toolbarRow.firstChild);
                }
            }, 100);
        });
    }
  }

  /**
   * Helper: renders an inline stacked bar for stock status.
   */
  renderStockBar = (ss) => {
    if (!ss || ss.total === 0) return <span style={{color:'#999'}}>N/A</span>;
    const c1 = Math.round((ss.stockOutPerc || 0) * 100);
    const c2 = Math.round((ss.underStockPerc || 0) * 100);
    const c3 = Math.round((ss.adequatePerc || 0) * 100);
    const c4 = Math.round((ss.overStockPerc || 0) * 100);
    const c5 = Math.round((ss.naPerc || 0) * 100);
    const p1 = c1, p2 = p1+c2, p3 = p2+c3, p4 = p3+c4;
    return (
      <div style={{ width: '100%', height: '18px', borderRadius: '3px', overflow: 'hidden',
        background: `linear-gradient(to right, #BA0C2F 0% ${p1}%, #f48521 ${p1}% ${p2}%, #118b70 ${p2}% ${p3}%, #edb944 ${p3}% ${p4}%, #cfcdc9 ${p4}% 100%)` }}
        title={`StockOut:${c1}% Under:${c2}% Adequate:${c3}% Over:${c4}% NA:${c5}%`} />
    );
  }

  /**
   * Helper: renders a colored dot + percentage for score cells.
   */
  renderScoreDot = (val) => {
    const pct = Math.round(val || 0);
    const color = pct <= 35 ? '#BA0C2F' : pct <= 70 ? '#f48521' : pct <= 99 ? '#edba26' : '#118b70';
    return (
      <span>
        <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', backgroundColor:color, marginRight:6, verticalAlign:'middle' }} />
        {pct}%
      </span>
    );
  }

  /**
   * Helper function to calculate totals for Jexcel footer.
   * Relies on the structure of the data: first column is label, subsequent are numeric percentages.
   */
  calculateTotals = (rows, countryCount) => {
    if (!rows || rows.length === 0) return ["Total"];
    let columnSums = new Array(countryCount).fill(0);
    let columnCounts = new Array(countryCount).fill(0);

    rows.forEach(row => {
        for (let i = 0; i < countryCount; i++) {
            const val = String(row[i + 1] || '').replace(/%/g, '').trim();
            const numeric = parseInt(val, 10);
            if (!isNaN(numeric)) {
                columnSums[i] += numeric;
                columnCounts[i] += 1;
            }
        }
    });

    const footer = ["Total"];
    for (let i = 0; i < countryCount; i++) {
        footer.push(columnCounts[i] > 0 ? `${Math.round(columnSums[i] / columnCounts[i])}%` : '');
    }
    // Fill hidden columns with empty strings
    footer.push('matrix_total');
    footer.push('');
    return footer;
  }

  /**
   * Method to recalculate Jexcel footer based on currently visible/filtered results.
   */
  recalculateFooter = (instance, countryCount) => {
    const data = instance.getData();
    // Get visible row indices from results (if filtered) or all rows
    const visibleRows = instance.results && instance.results.length > 0 ? instance.results : data.map((_, idx) => idx);

    if (!visibleRows || visibleRows.length === 0) {
        instance.setFooter([["Total"]]);
        return;
    }

    let columnSums = new Array(countryCount).fill(0);
    let columnCounts = new Array(countryCount).fill(0);

    visibleRows.forEach(rowIndex => {
        const row = data[rowIndex];
        // Skip rows that aren't matrix_row if applicable, but usually results only contains data rows
        for (let col = 1; col <= countryCount; col++) {
            const val = String(row[col] || '').replace(/%/g, '').trim();
            const numeric = parseInt(val, 10);
            if (!isNaN(numeric)) {
                columnSums[col - 1] += numeric;
                columnCounts[col - 1] += 1;
            }
        }
    });

    const footer = ["Total"];
    for (let i = 0; i < countryCount; i++) {
        footer.push(columnCounts[i] > 0 ? `${Math.round(columnSums[i] / columnCounts[i])}%` : '');
    }
    footer.push('matrix_total');
    footer.push('');
    instance.setFooter([footer]);

    // Apply formatting to footer after update
    setTimeout(() => {
        if (instance.footer && instance.footer.children[0]) {
            const tr = instance.footer.children[0];
            tr.style.fontWeight = 'bold';
            tr.style.backgroundColor = '#f4f4f4';
            const cell0Footer = tr.children[0];
            if (cell0Footer) {
                cell0Footer.style.textAlign = 'center';
            }
            for (let i = 0; i < tr.children.length; i++) {
                tr.children[i].style.setProperty('border-right', '1px solid #999', 'important');
            }
            for (let c = 1; c <= countryCount; c++) {
                const cell = tr.children[c];
                if (!cell) continue;
                const raw = String(cell.innerText || '').replace(/%/g, '').trim();
                const value = parseInt(raw, 10);
                if (!isNaN(value)) {
                    let color = value <= 35 ? '#BA0C2F' : value <= 70 ? '#f48521' : value <= 99 ? '#edba26' : '#118b70';
                    cell.innerHTML = `<div style="display: flex; align-items: center; justify-content: center;">
                        <span style="width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; margin-right: 5px; flex-shrink: 0;"></span>
                        <span>${value}%</span>
                    </div>`;
                    cell.style.backgroundImage = 'none';
                    cell.style.paddingLeft = '0px';
                    cell.style.textAlign = 'center';
                    cell.style.setProperty('text-align', 'center', 'important');
                    cell.style.fontWeight = 'bold';
                }
            }
        }
    }, 0);
  }

  /**
   * Helper: renders a data bar for QPL counts.
   */
  renderDataBar = (value, total) => {
    const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
    return (
      <div style={{
        background: `linear-gradient(to right, #A9D1E5 ${pct}%, transparent ${pct}%)`,
        height: '100%', width: '100%', boxSizing: 'border-box',
        padding: '2px 4px', textAlign: 'right', fontWeight: 'bold',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end'
      }}>
        {value}
      </div>
    );
  }

  /** Toggle country expand/collapse in accordion */
  toggleCountry = (countryId) => {
    this.setState(prev => ({
      countryExpandedMap: { ...prev.countryExpandedMap, [countryId]: !prev.countryExpandedMap[countryId] }
    }));
  }
  /**
   * Displays a loading indicator while data is being loaded.
   */
  loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>
  /**
   * Renders the application dashboard.
   * @returns {JSX.Element} - Application Dashboard.
   */

  /**
   * Exports the data to a CSV file including filters and table data.
   */
  exportCSV() {
    if (!this.el) return;
    var csvRow = [];
    // Add filter info
    if (this.state.countryLabels && this.state.countryLabels.length > 0) {
        this.state.countryLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.program.realmcountry') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'));
        csvRow.push('');
    }
    if (this.state.technicalAreaLabels && this.state.technicalAreaLabels.length > 0) {
        this.state.technicalAreaLabels.map(ele =>
            csvRow.push('"' + ('Technical Area' + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'));
        csvRow.push('');
    }
    if (this.state.programLabels && this.state.programLabels.length > 0) {
        this.state.programLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'));
        csvRow.push('');
    }
    var viewByEl = document.getElementById("viewById");
    if (viewByEl) {
        csvRow.push('"' + ('View By' + ' : ' + viewByEl.selectedOptions[0].text).replaceAll(' ', '%20') + '"');
        csvRow.push('');
    }
    var showDetailVal = String(this.state.showDetail) === '1' ? 'Yes' : 'No';
    csvRow.push('"' + ('Show Detail' + ' : ' + showDetailVal).replaceAll(' ', '%20') + '"');
    csvRow.push('');
    csvRow.push('');
    csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"');
    csvRow.push('');

    // Add table headers
    var columns = this.el.options.columns || [];
    var visibleIndexes = [];
    for (var c = 0; c < columns.length; c++) {
        if (columns[c].type !== 'hidden') {
            // Skip the first column (toggle icon) in Country view as it's not needed in CSV
            if (String(this.state.viewBy) === '1' && c === 0) continue;
            visibleIndexes.push(c);
        }
    }
    var headerRow = visibleIndexes.map(idx => '"' + (columns[idx].title || '').toString().replaceAll(' ', '%20') + '"');
    csvRow.push(headerRow.join(","));

    // Add table data
    var data = this.el.getData();
    for (var i = 0; i < data.length; i++) {
        var row = visibleIndexes.map(idx => '"' + ((data[i][idx] !== null && data[i][idx] !== undefined ? data[i][idx].toString() : '').replaceAll(',', ' ').replaceAll(' ', '%20')) + '"');
        csvRow.push(row.join(","));
    }

    // Add table footers (Total row)
    var footers = [];
    try {
        if (typeof this.el.getFooter === 'function') {
            footers = this.el.getFooter();
        } else if (this.el.options && this.el.options.footers) {
            footers = this.el.options.footers;
        }
    } catch (e) { }

    if (footers && footers.length > 0) {
        for (var f = 0; f < footers.length; f++) {
            var fRowData = footers[f];
            if (fRowData && fRowData.length > 0) {
                var fRow = visibleIndexes.map(idx => '"' + ((fRowData[idx] !== null && fRowData[idx] !== undefined ? fRowData[idx].toString() : '').replaceAll(',', ' ').replaceAll(' ', '%20')) + '"');
                csvRow.push(fRow.join(","));
            }
        }
    }

    var csvString = csvRow.join("%0A");
    var a = document.createElement("a");
    a.href = 'data:attachment/csv,' + csvString;
    a.target = "_Blank";
    a.download = "SupplyPlanScoreCard.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /**
   * Exports the data to a PDF file including filters, graph, legends and styled table.
   */
  exportPDF() {
    if (!this.el) return;
    const allData = this.el.options.data || [];
    const columns = this.el.options.columns || [];
    const isMatrixView = String(this.state.viewBy) === '2';

    // Helper: get score color
    const getScoreColor = (val) => {
        const pct = parseInt(String(val || '').replace(/%/g, ''), 10);
        if (isNaN(pct)) return null;
        return pct <= 35 ? [186, 12, 47] : pct <= 70 ? [244, 133, 33] : pct <= 99 ? [237, 186, 38] : [17, 139, 112];
    };

    const addFooters = doc => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        for (var i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 30, {
                align: 'center'
            });
            doc.text('Copyright © 2020 ' + i18n.t('static.footer'), doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
                align: 'center'
            });
        }
    };
    const addHeaders = doc => {
        const pageCount = doc.internal.getNumberOfPages();
        for (var i = 1; i <= pageCount; i++) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setPage(i);
            doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
            doc.setTextColor("#002f6c");
            doc.text('Supply Plan Score Card', doc.internal.pageSize.width / 2, 60, {
                align: 'center'
            });
        }
    };

    const doc = new jsPDF('landscape', 'pt', 'A4', true);
    doc.setFontSize(8);
    doc.setTextColor("#002f6c");
    var y = 90;

    // Print filter values
    if (this.state.countryLabels && this.state.countryLabels.length > 0) {
        var countryText = doc.splitTextToSize(i18n.t('static.program.realmcountry') + ' : ' + this.state.countryLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
        doc.text(doc.internal.pageSize.width / 8, y, countryText);
        y = y + countryText.length * 10;
    }
    if (this.state.technicalAreaLabels && this.state.technicalAreaLabels.length > 0) {
        var taText = doc.splitTextToSize('Technical Area : ' + this.state.technicalAreaLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
        doc.text(doc.internal.pageSize.width / 8, y, taText);
        y = y + taText.length * 10;
    }
    if (this.state.programLabels && this.state.programLabels.length > 0) {
        var programText = doc.splitTextToSize(i18n.t('static.program.program') + ' : ' + this.state.programLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
        doc.text(doc.internal.pageSize.width / 8, y, programText);
        y = y + programText.length * 10;
    }
    var viewByEl = document.getElementById("viewById");
    if (viewByEl) {
        doc.text('View By : ' + viewByEl.selectedOptions[0].text, doc.internal.pageSize.width / 8, y, { align: 'left' });
        y = y + 15;
    }
    var showDetailPdfVal = String(this.state.showDetail) === '1' ? 'Yes' : 'No';
    doc.text('Show Detail : ' + showDetailPdfVal, doc.internal.pageSize.width / 8, y, { align: 'left' });
    y = y + 15;

    // Add chart image
    try {
        var chartWrapper = document.querySelector('.chart-wrapper canvas');
        if (chartWrapper) {
            var canvasImg = chartWrapper.toDataURL("image/png", 1.0);
            var imgWidth = doc.internal.pageSize.width - 100;
            var imgHeight = 250;
            if (y + imgHeight > doc.internal.pageSize.height - 80) {
                doc.addPage();
                y = 80;
            }
            doc.addImage(canvasImg, 'png', 50, y, imgWidth, imgHeight, 'chart', 'FAST');
            y = y + imgHeight + 20;
        }
    } catch (e) {
        console.warn('Could not export chart to PDF:', e);
    }

    // Draw legends
    if (y > doc.internal.pageSize.height - 120) {
        doc.addPage();
        y = 80;
    }
    var legendX = doc.internal.pageSize.width / 8;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor("#002f6c");
    doc.text('Stock Status:', legendX, y);
    var lx = legendX + 65;
    var stockLegendItems = [
        { label: i18n.t('static.supplyPlan.stockOut'), color: [186, 12, 47] },
        { label: i18n.t('static.report.lowstock'), color: [244, 133, 33] },
        { label: i18n.t('static.report.okaystock'), color: [17, 139, 112] },
        { label: i18n.t('static.report.overstock'), color: [237, 185, 68] },
        { label: i18n.t('static.supplyPlanFormula.na'), color: [207, 205, 201] }
    ];
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    stockLegendItems.forEach(item => {
        doc.setFillColor(item.color[0], item.color[1], item.color[2]);
        doc.rect(lx, y - 8, 10, 10, 'F');
        doc.setTextColor("#333");
        doc.text(item.label, lx + 13, y);
        lx = lx + doc.getTextWidth(item.label) + 22;
    });
    y = y + 18;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor("#002f6c");
    doc.text('Scores:', legendX, y);
    lx = legendX + 45;
    var scoreLegendItems = [
        { label: '0%-35%', color: [186, 12, 47] },
        { label: '36%-70%', color: [244, 133, 33] },
        { label: '71%-99%', color: [237, 186, 38] },
        { label: '100%', color: [17, 139, 112] }
    ];
    doc.setFont('helvetica', 'normal');
    scoreLegendItems.forEach(item => {
        doc.setFillColor(item.color[0], item.color[1], item.color[2]);
        doc.circle(lx + 4, y - 3, 4, 'F');
        doc.setTextColor("#333");
        doc.text(item.label, lx + 11, y);
        lx = lx + doc.getTextWidth(item.label) + 22;
    });
    y = y + 20;

    // Add table with preserved colors and alignment
    if (y > doc.internal.pageSize.height - 200) {
        doc.addPage();
        y = 80;
    }

    // Determine visible column indices for mapping
    var visibleColIndexes = [];
    for (var ci = 0; ci < columns.length; ci++) {
        if (columns[ci].type !== 'hidden') {
            visibleColIndexes.push(ci);
        }
    }

    // Initialize autoTable rendering

    doc.autoTable({
        html: '#scorecardTableDiv table',
        startY: y,
        margin: { top: 80, bottom: 70 },
        styles: { lineWidth: 0.5, fontSize: 7, cellPadding: 3, overflow: 'linebreak', halign: 'center', valign: 'middle' },
        headStyles: { fillColor: [0, 47, 108], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', valign: 'middle' },
        theme: 'grid',
        didParseCell: function (data) {
            if (data.section !== 'body') return;
            var tr = data.row.raw;
            var dataY;
            if (tr && typeof tr.getAttribute === 'function') {
                dataY = parseInt(tr.getAttribute('data-y'), 10);
            } else {
                dataY = data.row.index;
            }
            if (isNaN(dataY) || !allData[dataY]) return;
            
            // Map visible column index back to original data column index
            var origColIdx = visibleColIndexes[data.column.index];
            if (origColIdx === undefined) return;
            var rowData = allData[dataY];
            var rowType = isMatrixView ? rowData[rowData.length - 2] : rowData[14];

            // Row background colors
            if (rowType === 'row_parent') {
                data.cell.styles.fillColor = [244, 244, 244];
                data.cell.styles.fontStyle = 'bold';
            } else if (rowType === 'row_child' || rowType === 'program') {
                data.cell.styles.fillColor = (data.row.index % 2 !== 0) ? [255, 255, 255] : [235, 243, 250];
            } else if (rowType === 'matrix_total') {
                data.cell.styles.fillColor = [244, 244, 244];
                data.cell.styles.fontStyle = 'bold';
            }

            // Alignment: first column left
            if (data.column.index === 0) {
                data.cell.styles.halign = 'left';
                if (rowType === 'row_child') {
                    data.cell.styles.cellPadding = { top: 3, bottom: 3, left: 15, right: 3 };
                }
            }
            // Latest Version (col idx 2), Review Status (12), Version Notes (13) -> left align
            if (origColIdx === 2 || origColIdx === 12 || origColIdx === 13) {
                data.cell.styles.halign = 'left';
            }

            // Score columns: set text color to match dot color
            if (!isMatrixView && (origColIdx === 8 || origColIdx === 10 || origColIdx === 11)) {
                var sc = getScoreColor(rowData[origColIdx]);
                if (sc) {
                    data.cell.text = [(rowData[origColIdx] === null || rowData[origColIdx] === undefined) ? '' : String(rowData[origColIdx])];
                    data.cell.styles.textColor = [50, 50, 50]; // Dark text
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.halign = 'left';
                    data.cell.styles.cellPadding = { left: 16, right: 3, top: 3, bottom: 3 };
                }
            }

            // Numeric columns (4, 5, 6, 7): apply centered alignment and hide default rendering for manual redrawing
            if (!isMatrixView && origColIdx >= 4 && origColIdx <= 7) {
                var cellVal = (rowData[origColIdx] === null || rowData[origColIdx] === undefined || rowData[origColIdx] === '') ? 0 : Number(rowData[origColIdx]);
                data.cell.text = [String(cellVal)];
                data.cell.styles.fontStyle = (rowType === 'row_parent') ? 'bold' : 'normal';
                data.cell.styles.halign = 'center';
                data.cell.styles.fontSize = 0; // Hide default to avoid double numbers
            }
            
            // Matrix view: all data cells get score colors
            if (isMatrixView && data.column.index > 0) {
                var mc = getScoreColor(rowData[origColIdx]);
                if (mc) {
                    data.cell.styles.textColor = mc;
                    data.cell.styles.fontStyle = 'bold';
                }
            }

            // Stock Status column: clear text (will be drawn manually)
            if (!isMatrixView && origColIdx === 9) {
                data.cell.styles.textColor = [255, 255, 255];
                data.cell.styles.fontSize = 1;
                data.cell.styles.minCellWidth = 100; // Increased width for the drawing
            }
        },
        didDrawCell: function (data) {
            if (data.section !== 'body') return;
            var tr = data.row.raw;
            var dataY;
            if (tr && typeof tr.getAttribute === 'function') {
                dataY = parseInt(tr.getAttribute('data-y'), 10);
            } else {
                dataY = data.row.index;
            }
            if (isNaN(dataY) || !allData[dataY]) return;
            var origColIdx = visibleColIndexes[data.column.index];
            if (origColIdx === undefined) return;
            var rowData = allData[dataY];

            // Draw score colored dot for score columns
            if (!isMatrixView && (origColIdx === 8 || origColIdx === 10 || origColIdx === 11)) {
                var sc = getScoreColor(rowData[origColIdx]);
                if (sc) {
                    doc.setFillColor(sc[0], sc[1], sc[2]);
                    doc.circle(data.cell.x + 8, data.cell.y + data.cell.height / 2, 3, 'F');
                }
            }
            // Draw score colored dots in matrix view
            if (isMatrixView && data.column.index > 0 && rowData[rowData.length - 2] !== 'matrix_total') {
                var mc = getScoreColor(rowData[origColIdx]);
                if (mc) {
                    doc.setFillColor(mc[0], mc[1], mc[2]);
                    doc.circle(data.cell.x + 10, data.cell.y + data.cell.height / 2, 3, 'F');
                }
            }
            
            // Draw data bars and centered text for numeric columns 4-7
            if (!isMatrixView && origColIdx >= 4 && origColIdx <= 7) {
                var activePUsVal = Number(rowData[3]) || 0;
                var cellValNum = (rowData[origColIdx] === null || rowData[origColIdx] === undefined || rowData[origColIdx] === '') ? 0 : Number(rowData[origColIdx]);
                
                // Draw bar background if value > 0
                if (activePUsVal > 0 && cellValNum > 0) {
                    var barPercentage = Math.min((cellValNum / activePUsVal), 1);
                    doc.setFillColor(169, 209, 229); // #A9D1E5
                    doc.rect(data.cell.x + 0.5, data.cell.y + 0.5, (data.cell.width - 1) * barPercentage, data.cell.height - 1, 'F');
                }
                
                // Centered redraw on top with correct color
                doc.setFont(data.cell.styles.font, data.cell.styles.fontStyle);
                doc.setFontSize(7);
                if (cellValNum === 0) {
                    doc.setTextColor(255, 0, 0);
                } else {
                    doc.setTextColor(0, 0, 0);
                }
                let txCenter = data.cell.x + data.cell.width / 2;
                let tyCenter = data.cell.y + (data.cell.height / 2) + (7 / 3);
                doc.text(String(cellValNum), txCenter, tyCenter, { align: 'center' });
            }

            // Draw stacked stock status bar
            if (!isMatrixView && origColIdx === 9) {
                var parts = String(rowData[9] || '').split(',');
                if (parts.length === 5) {
                    var barX = data.cell.x + 3;
                    var barY = data.cell.y + data.cell.height / 2 - 5;
                    var barW = data.cell.width - 6;
                    var barH = 10;
                    var stockColors = [[186,12,47],[244,133,33],[17,139,112],[237,185,68],[207,205,201]];
                    var cumX = barX;
                    for (var si = 0; si < 5; si++) {
                        var pct = Number(parts[si]) || 0;
                        var segW = (pct / 100) * barW;
                        if (segW > 0) {
                            doc.setFillColor(stockColors[si][0], stockColors[si][1], stockColors[si][2]);
                            doc.rect(cumX, barY, segW, barH, 'F');
                        }
                        cumX += segW;
                    }
                }
            }
        }
    });

    addHeaders(doc);
    addFooters(doc);
    doc.save("SupplyPlanScoreCard.pdf");
  }

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

    const viewBy = String(this.state.viewBy);
    const dataList = this.state.dashboardBottomDataList || [];

    // ---- Build country groups for Country view ----
    const countryGroupsMap = {};
    dataList.forEach(dbd => {
        if (!dbd || !dbd.realmCountry) return;
        const cKey = dbd.realmCountry.realmCountryId || getLabelText(dbd.realmCountry.label, this.state.lang);
        const cLabel = getLabelText(dbd.realmCountry.label, this.state.lang);
        if (!countryGroupsMap[cKey]) {
            countryGroupsMap[cKey] = { label: cLabel, programs: [], key: cKey };
        }
        countryGroupsMap[cKey].programs.push(dbd);
    });
    const countryGroups = Object.values(countryGroupsMap);

    // Aggregate per country: average quality/stock scores
    let countryAggregates = countryGroups.map(cg => {
        const n = cg.programs.length;
        const avgQuality = n > 0 ? cg.programs.reduce((s, d) => s + (d.supplyPlanQualityScore || 0), 0) / n : 0;
        const avgStock = n > 0 ? cg.programs.reduce((s, d) => s + (d.stockStatusScore || 0), 0) / n : 0;
        return { label: cg.label, avgQuality, avgStock, avgTotal: (avgQuality + avgStock) / 2 };
    });

    if (viewBy === '1') {
        if (this.state.sortedLabels && this.state.sortedLabels.length > 0) {
            countryAggregates.sort((a, b) => this.state.sortedLabels.indexOf(a.label) - this.state.sortedLabels.indexOf(b.label));
        } else {
            countryAggregates.sort((a, b) => a.label.localeCompare(b.label));
        }
    }

    // ---- Bar chart data depending on viewBy ----
    let barData;
    if (viewBy === '1') {
        // Country view: one bar group per country
        barData = {
            labels: countryAggregates.map(c => c.label),
            datasets: [
                { type: 'line', label: 'Total Score', borderColor: '#99C1E8', backgroundColor: '#99C1E8', fill: false, showLine: false, pointRadius: 45, pointHoverRadius: 45, pointHitRadius: 0, pointStyle: 'line', borderWidth: 4, hoverBorderWidth: 4, data: countryAggregates.map(c => Math.round(c.avgTotal)) },
                { type: 'bar', label: 'Quality Score', backgroundColor: '#0F263F', borderColor: '#0F263F', borderWidth: 1, data: countryAggregates.map(c => Math.round(c.avgQuality)) },
                { type: 'bar', label: 'Stock Status Score', backgroundColor: '#C50000', borderColor: '#C50000', borderWidth: 1, data: countryAggregates.map(c => Math.round(c.avgStock)) },
                { type: 'line', label: 'Target', borderColor: 'black', backgroundColor: 'black', borderWidth: 4, borderDash: [10, 5], fill: false, pointRadius: 0, pointHoverRadius: 0, pointStyle: 'line', showLine: false, data: countryAggregates.map(() => 90) }
            ]
        };
    } else if (viewBy === '2') {
        // Country x Program (Technical Area) view
        const countriesSet = new Set();
        const haSet = new Set();
        const scoreMatrix = {}; // country -> ha -> { sum, count }
        
        dataList.forEach(d => {
            if (!d) return;
            const cLabel = d.realmCountry ? getLabelText(d.realmCountry.label, this.state.lang) : 'Unknown';
            const score = Math.round(((d.supplyPlanQualityScore || 0) + (d.stockStatusScore || 0)) / 2);
            countriesSet.add(cLabel);
            (d.healthAreaList || []).forEach(ha => {
                const haLabel = getLabelText(ha.label, this.state.lang);
                haSet.add(haLabel);
                if (!scoreMatrix[cLabel]) scoreMatrix[cLabel] = {};
                if (!scoreMatrix[cLabel][haLabel]) scoreMatrix[cLabel][haLabel] = { sum: 0, count: 0 };
                scoreMatrix[cLabel][haLabel].sum += score;
                scoreMatrix[cLabel][haLabel].count += 1;
            });
        });
        
        
        const sortedCountries = Array.from(countriesSet).sort();
        let sortedHAs = Array.from(haSet).sort();

        if (this.state.sortedLabels && this.state.sortedLabels.length > 0) {
            sortedHAs = this.state.sortedLabels.filter(l => haSet.has(l));
        } else {
            sortedHAs.sort();
        }
        
        const darkModeColors = [
            '#A7C6ED', '#BA0C2F', '#118B70', '#EDB944', '#A7C6ED',
            '#20a8d8', '#6C6463', '#F48521', '#49A4A1', '#cfcdc9',
            '#A7C6ED', '#BA0C2F', '#118B70', '#EDB944', '#A7C6ED',
            '#20a8d8', '#6C6463', '#F48521', '#49A4A1', '#cfcdc9',
            '#A7C6ED', '#BA0C2F', '#118B70', '#EDB944', '#A7C6ED',
            '#20a8d8', '#6C6463', '#F48521', '#49A4A1', '#cfcdc9',
            '#A7C6ED', '#BA0C2F', '#118B70', '#EDB944', '#A7C6ED',
        ];
        
        const lightModeColors = [
            '#002F6C', '#BA0C2F', '#118B70', '#EDB944', '#A7C6ED',
            '#651D32', '#6C6463', '#F48521', '#49A4A1', '#212721',
            '#002F6C', '#BA0C2F', '#118B70', '#EDB944', '#A7C6ED',
            '#651D32', '#6C6463', '#F48521', '#49A4A1', '#212721',
            '#002F6C', '#BA0C2F', '#118B70', '#EDB944', '#A7C6ED',
            '#651D32', '#6C6463', '#F48521', '#49A4A1', '#212721',
            '#002F6C', '#BA0C2F', '#118B70', '#EDB944', '#A7C6ED',
        ];
        const palette = isDarkMode ? darkModeColors : lightModeColors;
        
        barData = {
            labels: sortedCountries,
            datasets: [
                ...sortedHAs.map((ha, idx) => ({
                    type: 'bar',
                    label: ha,
                    backgroundColor: palette[idx % palette.length],
                    borderColor: palette[idx % palette.length],
                    borderWidth: 1,
                    data: sortedCountries.map(c => {
                        const s = scoreMatrix[c] && scoreMatrix[c][ha];
                        return s ? Math.round(s.sum / s.count) : 0;
                    })
                })),
                {
                    type: 'line',
                    label: 'Target',
                    borderColor: 'black',
                    backgroundColor: 'black',
                    borderWidth: 4,
                    borderDash: [10, 5],
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    pointStyle: 'line',
                    showLine: false,
                    data: sortedCountries.map(() => 70)
                }
            ]
        };
    } else {
        // Program view: one bar group per program
        let displayList = [...dataList];
        if (this.state.sortedLabels && this.state.sortedLabels.length > 0) {
            displayList.sort((a, b) => {
                const labelA = a.program ? a.program.code : '';
                const labelB = b.program ? b.program.code : '';
                return this.state.sortedLabels.indexOf(labelA) - this.state.sortedLabels.indexOf(labelB);
            });
        } else {
            displayList.sort((a, b) => (a.program?.code || '').localeCompare(b.program?.code || ''));
        }
        barData = {
            labels: displayList.map(d => d.program ? d.program.code : ''),
            datasets: [
                { type: 'line', label: 'Total Score', borderColor: '#99C1E8', backgroundColor: '#99C1E8', fill: false, showLine: false, pointRadius: 45, pointHoverRadius: 45, pointHitRadius: 0, pointStyle: 'line', borderWidth: 4, hoverBorderWidth: 4, data: displayList.map(d => Math.round(((d.supplyPlanQualityScore || 0) + (d.stockStatusScore || 0)) / 2)) },
                { type: 'bar', label: 'Quality Score', backgroundColor: '#0F263F', borderColor: '#0F263F', borderWidth: 1, data: displayList.map(d => Math.round(d.supplyPlanQualityScore || 0)) },
                { type: 'bar', label: 'Stock Status Score', backgroundColor: '#C50000', borderColor: '#C50000', borderWidth: 1, data: displayList.map(d => Math.round(d.stockStatusScore || 0)) },
                { type: 'line', label: 'Target', borderColor: 'black', backgroundColor: 'black', borderWidth: 4, borderDash: [10, 5], fill: false, pointRadius: 0, pointHoverRadius: 0, pointStyle: 'line', showLine: false, data: displayList.map(() => 90) }
            ]
        };
    }

    const barOptions = {
        maintainAspectRatio: false,
        responsive: true,
        tooltips: {
            mode: 'index',
            intersect: false,
            filter: function(tooltipItem, data) {
                const val = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                return val !== null && val !== undefined && val !== 0;
            }
        },
        legend: {
            position: 'bottom',
            labels: {
                usePointStyle: true,
            }
        },
        scales: {
            yAxes: [{
                type: 'linear',
                display: true,
                position: 'left',
                ticks: {
                    min: 0,
                    max: 100,
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
                <div className="Card-header-reporticon">
                    {this.state.programValues && this.state.programValues.length > 0 && dataList.length > 0 &&
                        <div className="card-header-actions">
                            <a className="card-header-action">
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </a>
                        </div>
                    }
                </div>
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

                    </div>
                  
            
            {this.state.programValues && this.state.programValues.length > 0 && dataList.length > 0 && (
              <>
                <div className="col-xl-12 pl-lg-2 pr-lg-2 mt-2">
                  <Card>
                    <CardBody>
                      <div className="chart-wrapper" style={{ height: '400px' }}>
                        <Bar data={barData} options={barOptions} plugins={[targetLinePlugin]} />
                      </div>
                    </CardBody>
                  </Card>
                </div>
                <div className="col-xl-12 pl-lg-2 pr-lg-2 mt-2">
                  <Card>
                    <CardBody>
                      <div>

                        <div className="d-flex flex-wrap mb-2" style={{ gap: '15px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Stock Status:</span>
                          <div className="d-flex align-items-center"><div style={{ width: 12, height: 12, backgroundColor: '#BA0C2F', marginRight: 5 }}></div><span style={{ fontSize: '11px' }}>{i18n.t('static.supplyPlan.stockOut')}</span></div>
                          <div className="d-flex align-items-center"><div style={{ width: 12, height: 12, backgroundColor: '#f48521', marginRight: 5 }}></div><span style={{ fontSize: '11px' }}>{i18n.t('static.report.lowstock')}</span></div>
                          <div className="d-flex align-items-center"><div style={{ width: 12, height: 12, backgroundColor: '#118b70', marginRight: 5 }}></div><span style={{ fontSize: '11px' }}>{i18n.t('static.report.okaystock')}</span></div>
                          <div className="d-flex align-items-center"><div style={{ width: 12, height: 12, backgroundColor: '#edb944', marginRight: 5 }}></div><span style={{ fontSize: '11px' }}>{i18n.t('static.report.overstock')}</span></div>
                          <div className="d-flex align-items-center"><div style={{ width: 12, height: 12, backgroundColor: '#cfcdc9', marginRight: 5 }}></div><span style={{ fontSize: '11px' }}>{i18n.t('static.supplyPlanFormula.na')}</span></div>
                        </div>

                        <div className="d-flex flex-wrap mb-2" style={{ gap: '15px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Scores:</span>
                          <div className="d-flex align-items-center"><div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#BA0C2F', marginRight: 5 }}></div><span style={{ fontSize: '11px' }}>0%-35%</span></div>
                          <div className="d-flex align-items-center"><div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f48521', marginRight: 5 }}></div><span style={{ fontSize: '11px' }}>36%-70%</span></div>
                          <div className="d-flex align-items-center"><div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#edba26', marginRight: 5 }}></div><span style={{ fontSize: '11px' }}>71%-99%</span></div>
                          <div className="d-flex align-items-center"><div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#118b70', marginRight: 5 }}></div><span style={{ fontSize: '11px' }}>100%</span></div>
                        </div>

                      </div>
                      <div className="table-responsive" style={{ marginTop: '0px' }}>
                          <style>{`
                            .jss_filters_options span[style*="border-radius"] {
                                display: none !important;
                            }
                            .jss_filters_options label {
                                display: flex !important;
                                align-items: center !important;
                                white-space: nowrap !important;
                                padding: 2px 5px !important;
                            }
                            .jss_filters_options input[type="checkbox"] {
                                margin-right: 8px !important;
                                vertical-align: middle !important;
                            }
                            .jss_footer tr td {
                                border-right: 1px solid #999 !important;
                            }
                            .jss_footer tr td:first-child {
                                border-left: 1px solid #999 !important;
                            }
                          `}</style>
                          <div id="scorecardTableDiv" className="DashboardreadonlyBg"></div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </>
            )}
            <Modal isOpen={this.state.large} toggle={this.toggleLarge} className={'modal-xl ' + this.props.className}>
              <ModalHeader toggle={this.toggleLarge}>{i18n.t('static.problemContext.transDetails')}</ModalHeader>
              <ModalBody>
                <div className="table-responsive">
                  {this.state.loadingForNotes && <div className="loader"></div>}
                  <div id="notesTransTable" className="DashboardreadonlyBg" style={{ display: this.state.loadingForNotes ? "none" : "block" }}></div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="secondary" onClick={this.toggleLarge}>{i18n.t('static.common.close')}</Button>
              </ModalFooter>
            </Modal>
            </div>
                </div>    
              </div>
        </div>
    );
  }
}
export default SupplyPlanScoreCard;