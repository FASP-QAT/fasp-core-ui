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
import { Doughnut, HorizontalBar, Pie } from 'react-chartjs-2';
import { Search } from 'react-bootstrap-table2-toolkit';
import { confirmAlert } from 'react-confirm-alert';
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionForNotes, jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js';
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
 * Formats a numerical value by adding commas as thousand separators.
 * @param {string|number} cell1 - The numerical value to be formatted.
 * @param {Object} row - The row object if applicable.
 * @returns {string} The formatted numerical value with commas as thousand separators.
 */
function addCommas(cell1, row) {
  if (cell1 != null && cell1 != "") {
    cell1 += '';
    var x = cell1.replaceAll(",", "").split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1].slice(0, 8) : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  } else {
    return "";
  }
}
/**
 * Component for showing the dashboard.
 */
class ApplicationDashboard extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
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
      problemActionList: [],
      programList: [],
      datasetList: [],
      countryList: [],
      technicalAreaList: [],
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
      onlyDownloadedTopProgram: localStorage.getItem('sessionType') === 'Online' ? localStorage.getItem("topLocalProgram") == "false" ? false : true : true,
      onlyDownloadedBottomProgram: localStorage.getItem('sessionType') === 'Online' ? localStorage.getItem("bottomLocalProgram") == "false" ? false : true : true,
      rangeValue: localStorage.getItem("bottomReportPeriod") ? JSON.parse(localStorage.getItem("bottomReportPeriod")) : { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
      minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
      maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
      topSubmitLoader: false
    };
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.goToIndex = this.goToIndex.bind(this);
    this.onExiting = this.onExiting.bind(this);
    this.onExited = this.onExited.bind(this);
    this.getPrograms = this.getPrograms.bind(this);
    this.consolidatedProgramList = this.consolidatedProgramList.bind(this);
    this.checkNewerVersions = this.checkNewerVersions.bind(this);
    this.checkNewerVersionsDataset = this.checkNewerVersionsDataset.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateStateDashboard = this.updateStateDashboard.bind(this);
    this.getDataSetList = this.getDataSetList.bind(this);
    this.deleteProgram = this.deleteProgram.bind(this);
    this.deleteSupplyPlanProgram = this.deleteSupplyPlanProgram.bind(this);
    this.buildForecastErrorJexcel = this.buildForecastErrorJexcel.bind(this);
    this.buildShipmentsTBDJexcel = this.buildShipmentsTBDJexcel.bind(this);
    this.buildExpiriesJexcel = this.buildExpiriesJexcel.bind(this);
    this.buildStockedOutJexcel = this.buildStockedOutJexcel.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.getOnlineDashboardBottom = this.getOnlineDashboardBottom.bind(this);
    this.onTopSubmit = this.onTopSubmit.bind(this);
    this.getRealmCountryList = this.getRealmCountryList.bind(this);
    this.getHealthAreaListByRealmCountryIds = this.getHealthAreaListByRealmCountryIds.bind(this);
    this.toggleLarge=this.toggleLarge.bind(this);
    this.actionCanceled=this.actionCanceled.bind(this);
  }
  /**
   * Deletes a supply plan program.
   * @param {string} programId - The ID of the program to be deleted.
   * @param {string} versionId - The version ID of the program to be deleted.
   */
  deleteSupplyPlanProgram(programId, versionId) {
    confirmAlert({
      title: i18n.t('static.program.confirm'),
      message: i18n.t("static.dashboard.deleteThisProgram"),
      buttons: [
        {
          label: i18n.t('static.program.yes'),
          onClick: () => {
            this.setState({
              loading: true
            })
            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
            var userId = userBytes.toString(CryptoJS.enc.Utf8);
            var id = programId + "_v" + versionId + "_uId_" + userId;
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
            }.bind(this);
            openRequest.onsuccess = function (e) {
              db1 = e.target.result;
              var transaction = db1.transaction(['programData'], 'readwrite');
              var programTransaction = transaction.objectStore('programData');
              var deleteRequest = programTransaction.delete(id);
              deleteRequest.onsuccess = function (event) {
                var transaction1 = db1.transaction(['downloadedProgramData'], 'readwrite');
                var programTransaction1 = transaction1.objectStore('downloadedProgramData');
                var deleteRequest1 = programTransaction1.delete(id);
                deleteRequest1.onsuccess = function (event) {
                  var transaction2 = db1.transaction(['programQPLDetails'], 'readwrite');
                  var programTransaction2 = transaction2.objectStore('programQPLDetails');
                  var deleteRequest2 = programTransaction2.delete(id);
                  deleteRequest2.onsuccess = function (event) {
                    var transaction3 = db1.transaction(['planningUnitBulkExtrapolation'], 'readwrite');
                    var programTransaction3 = transaction3.objectStore('planningUnitBulkExtrapolation');
                    var deleteRequest3 = programTransaction3.delete(id);
                    deleteRequest3.onsuccess = function (event) {
                      this.setState({
                        loading: false,
                        message: i18n.t("static.dashboard.programDeletedSuccessfully"),
                        color: 'green'
                      }, () => {
                        hideSecondComponent()
                        this.onTopSubmit();
                      })
                      this.getPrograms();
                    }.bind(this)
                  }.bind(this)
                }.bind(this)
              }.bind(this)
            }.bind(this)
          }
        }, {
          label: i18n.t('static.program.no'),
          onClick: () => {
            this.setState({
              message: i18n.t('static.actionCancelled'), loading: false, color: "red"
            })
            this.setState({ loading: false, color: "red" }, () => {
              hideSecondComponent()
            })
          }
        }
      ]
    })
  }
  /**
   * Deletes a program.
   * @param {string} programId - The ID of the program to be deleted.
   * @param {string} versionId - The version ID of the program to be deleted.
   */
  deleteProgram(programId, versionId) {
    confirmAlert({
      title: i18n.t('static.program.confirm'),
      message: i18n.t("static.dashboard.deleteThisProgram"),
      buttons: [
        {
          label: i18n.t('static.program.yes'),
          onClick: () => {
            this.setState({
              loading: true
            })
            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
            var userId = userBytes.toString(CryptoJS.enc.Utf8);
            var id = programId + "_v" + versionId + "_uId_" + userId;
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
            }.bind(this);
            openRequest.onsuccess = function (e) {
              db1 = e.target.result;
              var transaction = db1.transaction(['datasetData'], 'readwrite');
              var programTransaction = transaction.objectStore('datasetData');
              var deleteRequest = programTransaction.delete(id);
              deleteRequest.onsuccess = function (event) {
                var transaction2 = db1.transaction(['datasetDetails'], 'readwrite');
                var programTransaction2 = transaction2.objectStore('datasetDetails');
                var deleteRequest2 = programTransaction2.delete(id);
                deleteRequest2.onsuccess = function (event) {
                  var transaction3 = db1.transaction(['planningUnitBulkExtrapolation'], 'readwrite');
                  var programTransaction3 = transaction3.objectStore('planningUnitBulkExtrapolation');
                  var deleteRequest3 = programTransaction3.delete(id);
                  deleteRequest3.onsuccess = function (event) {
                    this.setState({
                      loading: false,
                      message: i18n.t("static.loadDelDataset.datasetDeleteSuccessfully"),
                      color: 'green'
                    }, () => {
                      hideSecondComponent()
                    })
                    this.getDataSetList();
                  }.bind(this)
                }.bind(this)
              }.bind(this)
            }.bind(this)
          }
        }, {
          label: i18n.t('static.program.no'),
          onClick: () => {
            this.setState({
              message: i18n.t('static.actionCancelled'), loading: false, color: "red"
            })
            this.setState({ loading: false, color: "red" }, () => {
              hideSecondComponent()
            })
          }
        }
      ]
    })
  }
  /**
   * Redirects the user to a specified URL.
   * @param {string} url - The URL to redirect to.
   */
  redirectToCrud = (url) => {
    this.props.history.push(url);
  }
  /**
   * Redirects the user to a specified URL and stores data in local storage based on the provided parameters.
   * @param {string} url - The URL to redirect to.
   * @param {string} programId - The program ID.
   * @param {string} versionId - The version ID.
   * @param {number} typeId - The type ID.
   */
  redirectToCrudWithValue = (url, programId, versionId, typeId) => {
    if (typeId == 1) {
      let obj = { label: this.state.datasetList.filter(c => c.programId == programId && c.versionId == versionId)[0].programCode, value: programId }
      localStorage.setItem("sesForecastProgramIds", JSON.stringify([obj]));
    } else {
      localStorage.setItem("sesDatasetId", this.state.datasetList.filter(c => c.programId == programId && c.versionId == versionId)[0].id);
    }
    this.props.history.push(url);
  }
   /**
   * Redirects the user to a specified URL.
   * @param {string} url - The URL to redirect to.
   */
   redirectToCrudWindow = (url, isMultiSelect, programId) => {
    if(isMultiSelect) {
      localStorage.setItem("sesProgramIdSPVR", programId.toString().split("_").length > 0 ? programId.toString().split("_")[0] : programId)
    } else {
      let pId, vId;
      if(this.state.bottomProgramId.toString().split("_").length > 0){
        pId = this.state.bottomProgramId.toString().split("_")[0];
        vId = this.state.programList.filter(x => x.id == this.state.bottomProgramId)[0].versionId+" (Local)";
      } else {
        pId = this.state.bottomProgramId;
        vId = this.state.programList.filter(x => x.programId == this.state.bottomProgramId)[0].versionId;
      }
      localStorage.setItem("sesProgramIdReport", pId)
      localStorage.setItem("sesVersionIdReport", vId)
    }
    this.props.history.push(url)
  }
  /**
   * Clears the timeout when the component is unmounted.
   */
  componentWillUnmount() {
    clearTimeout(this.timeout);
  }
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
                    { title: i18n.t('static.report.versiontype'), type: 'text', width: 80 },
                    { title: i18n.t('static.report.issupplyplanapprove'), type: 'text', width: 80 },
                    { title: i18n.t('static.program.notes'), type: 'text', width: 250 },
                    {
                        title: i18n.t("static.common.lastModifiedBy"),
                        type: "text",
                    },
                    {
                        title: i18n.t("static.common.lastModifiedDate"),
                        type: "calendar",
                        options: { isTime: 1, format: "DD-Mon-YY HH24:MI" },
                    },
                ],
                editable: false,
                onload: function (instance, cell) {
                  if(this.state.bottomProgramId==""){
                    jExcelLoadedFunctionForNotes(instance,0);
                  }else{
                    jExcelLoadedFunctionForNotes(instance,4);
                  }
                }.bind(this),
                pagination: localStorage.getItem("sesRecordCount"),
                search: true,
                columnSorting: true,
                wordWrap: true,
                allowInsertColumn: false,
                allowManualInsertColumn: false,
                allowDeleteRow: false,
                // onselection: this.selected,
                oneditionend: this.onedit,
                copyCompatibility: true,
                allowExport: false,
                paginationOptions: JEXCEL_PAGINATION_OPTION,
                position: "top",
                filters: true,
                license: JEXCEL_PRO_KEY,
                contextMenu: function (obj, x, y, e) {
                    return false;
                }.bind(this),
            };
            var elVar = jexcel(document.getElementById("notesTransTable"), options);
            this.el = elVar;
            this.setState({ notesTransTableEl: elVar, loadingForNotes: false });

        }).catch(
            error => {
                this.setState({
                    loadingForNotes: false
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
                                message: error.response.data.messageCode,
                                loading: false
                            });
                            break;
                        case 412:
                            this.setState({
                                message: error.response.data.messageCode,
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
  /**
     * This function is used to toggle the notes history model
     */
  toggleLarge() {
    this.setState({
        notesPopup: !this.state.notesPopup,
    });
  }
  /**
     * This function is called when cancel button for notes modal popup is clicked
     */
  actionCanceled() {
    this.setState({
        message: i18n.t('static.actionCancelled'),
        color: "#BA0C2F",
    }, () => {
        hideSecondComponent();
        this.toggleLarge();
    })
  }
  /**
   * Toggles the state of the dropdownOpen variable in the component's state.
   */
  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }
  /**
   * Handles the dismiss of the range picker component.
   * Updates the component state with the new range value and triggers a data fetch.
   * @param {object} value - The new range value selected by the user.
   */
  handleRangeDissmis(value) {
    this.setState({ rangeValue: value }, () => {
      localStorage.setItem("bottomReportPeriod", JSON.stringify(value))
      if (localStorage.getItem("bottomProgramId") && localStorage.getItem("bottomProgramId").split("_").length == 1) {
        var inputJson = {
          programId: this.state.bottomProgramId,
          startDate: this.state.rangeValue.from.year + "-" + this.state.rangeValue.from.month + "-01",
          stopDate: this.state.rangeValue.to.year + "-" + this.state.rangeValue.to.month + "-01",
          displayShipmentsBy: this.state.displayBy
        }
        this.getOnlineDashboardBottom(inputJson);
      }
    })
  }
  /**
   * Handles the click event on the range picker box.
   * Shows the range picker component.
   * @param {object} e - The event object containing information about the click event.
   */
  _handleClickRangeBox(e) {
    this.refs.reportPeriod.show()
  }
  /**
   * Checks for newer versions of programs and updates local storage with the latest program information.
   * @param {Array} programs - List of programs to check for newer versions.
   */
  checkNewerVersions(programs) {
    if (localStorage.getItem('sessionType') === 'Online') {
      ProgramService.checkNewerVersions(programs)
        .then(response => {
          localStorage.removeItem("sesLatestProgram");
          localStorage.setItem("sesLatestProgram", response.data);
        })
    }
  }
  /**
   * Checks for newer versions of datasets and updates local storage with the latest dataset information.
   * @param {Array} datasets - List of datasets to check for newer versions.
   */
  checkNewerVersionsDataset(programs) {
    if (localStorage.getItem('sessionType') === 'Online') {
      ProgramService.checkNewerVersions(programs)
        .then(response => {
          localStorage.removeItem("sesLatestDataset");
          localStorage.setItem("sesLatestDataset", response.data);
        })
    }
  }
  /**
    * Retrieves the list of Realm Country.
    */
  getHealthAreaListByRealmCountryIds() {
    if (localStorage.getItem("sessionType") === 'Online' && AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_DROPDOWN_SP') && this.state.topCountryId.length > 0) {
      DropdownService.getHealthAreaListByRealmCountryIds(this.state.topCountryId.map(x => x.value))
        .then(response => {
          var proList = []
          for (var i = 0; i < response.data.length; i++) {
            // var programJson = {
            //   id: response.data[i].id,
            //   programId: response.data[i].id,
            //   label: response.data[i].label,
            //   programCode: response.data[i].code
            // }
            // proList[i] = programJson
          }
          this.setState({
            technicalAreaList: proList, loading: false
          }, () => { this.consolidatedProgramList() })
        }).catch(
          error => {
            this.setState({
              technicalAreaList: []
            }, () => { this.consolidatedProgramList() })
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
      this.consolidatedProgramList()
    }
  }
  /**
    * Retrieves the list of programs.
    */
  getPrograms() {
    if (localStorage.getItem("sessionType") === 'Online' && AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_DROPDOWN_SP')) {
      let realmId = AuthenticationService.getRealmId();
      DropdownService.getSPProgramBasedOnRealmId(realmId)
        .then(response => {
          var proList = []
          for (var i = 0; i < response.data.length; i++) {
            var programJson = {
              id: response.data[i].id,
              programId: response.data[i].id,
              label: response.data[i].label,
              programCode: response.data[i].code,
              versionId: response.data[i].currentVersionId
            }
            proList[i] = programJson
          }
          this.setState({
            programList: proList, loading: false
          }, () => { this.consolidatedProgramList() })
        }).catch(
          error => {
            this.setState({
              programList: []
            }, () => { this.consolidatedProgramList() })
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
      this.consolidatedProgramList()
    }
  }
  /**
   * Retrieves supply plan programs from indexedDB and updates the state with the fetched program list.
   */
  consolidatedProgramList() {
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
      var programList = this.state.programList;
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
          // if (f == 0) {
          tempProgramList.push({
            openCount: filteredGetRequestList[i].openCount,
            addressedCount: filteredGetRequestList[i].addressedCount,
            programCode: filteredGetRequestList[i].programCode + " ~v" + filteredGetRequestList[i].version + " (Local)",
            programVersion: filteredGetRequestList[i].version,
            programId: filteredGetRequestList[i].programId,
            versionId: filteredGetRequestList[i].version,
            id: filteredGetRequestList[i].id,
            loading: false,
            local: true,
            cutOffDate: filteredGetRequestList[i].cutOffDate != undefined && filteredGetRequestList[i].cutOffDate != null && filteredGetRequestList[i].cutOffDate != "" ? filteredGetRequestList[i].cutOffDate : ""
          });
          // }
        }
        tempProgramList.sort(function (a, b) {
          a = a.programCode.toLowerCase();
          b = b.programCode.toLowerCase();
          return a < b ? -1 : a > b ? 1 : 0;
        });
        this.setState({
          programList: tempProgramList.concat(programList)
        })
        this.checkNewerVersions(programList.filter(x => x.local));
      }.bind(this);
    }.bind(this)
  }
  /**
   * Retrieves forecast programs from indexedDB and updates the state with the fetched program list.
   */
  getDataSetList() {
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
      var program = transaction.objectStore('datasetData');
      var getRequest = program.getAll();
      var datasetList = [];
      getRequest.onerror = function (event) {
        this.setState({
          message: i18n.t('static.program.errortext'),
          color: 'red',
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
          var bytes = CryptoJS.AES.decrypt(filteredGetRequestList[i].programName, SECRET_KEY);
          var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
          var programDataBytes = CryptoJS.AES.decrypt(filteredGetRequestList[i].programData, SECRET_KEY);
          var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
          var programJson1 = JSON.parse(programData);
          datasetList.push({
            programCode: filteredGetRequestList[i].programCode,
            programVersion: filteredGetRequestList[i].version,
            programId: filteredGetRequestList[i].programId,
            versionId: filteredGetRequestList[i].version,
            id: filteredGetRequestList[i].id,
            loading: false,
            forecastStartDate: (programJson1.currentVersion.forecastStartDate ? moment(programJson1.currentVersion.forecastStartDate).format(`MMM-YYYY`) : ''),
            forecastStopDate: (programJson1.currentVersion.forecastStopDate ? moment(programJson1.currentVersion.forecastStopDate).format(`MMM-YYYY`) : ''),
          });
        }
        this.setState({
          datasetList: datasetList
        })
        this.checkNewerVersionsDataset(datasetList);
      }.bind(this);
    }.bind(this)
  }
  /**
     * Reterives realm country list
     */
  getRealmCountryList() {
    let realmId = AuthenticationService.getRealmId();
    if (localStorage.getItem('sessionType') === 'Online') {
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
              countryList: listArray
            })
          } else {
            this.setState({
              message: response.data.messageCode
            })
          }
        }).catch(
          error => {
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
                case 403:
                  this.props.history.push(`/accessDenied`)
                  break;
                case 500:
                case 404:
                case 406:
                  this.setState({
                    message: error.response.data.messageCode,
                    loading: false
                  });
                  break;
                case 412:
                  this.setState({
                    message: error.response.data.messageCode,
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
  /**
   * Reterives health area list
   */
  getHealthAreaList() {
    if (localStorage.getItem('sessionType') === 'Online') {
      ProgramService.getHealthAreaListByRealmCountryId(this.state.program.realmCountry.realmCountryId)
        .then(response => {
          if (response.status == 200) {
            var json = (response.data).filter(c => c.active == true);
            var regList = [];
            for (var i = 0; i < json.length; i++) {
              regList[i] = { healthAreaCode: json[i].healthAreaCode, value: json[i].healthAreaId, label: getLabelText(json[i].label, this.state.lang) }
            }
            var listArray = regList;
            listArray.sort((a, b) => {
              var itemLabelA = a.label.toUpperCase();
              var itemLabelB = b.label.toUpperCase();
              return itemLabelA > itemLabelB ? 1 : -1;
            });
            let { program } = this.state;
            program.healthAreaArray = [];
            this.setState({
              healthAreaList: listArray,
              healthAreaId: '',
              program
            }, (
            ) => {
            })
          } else {
            this.setState({
              message: response.data.messageCode
            })
          }
        }).catch(
          error => {
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
                case 403:
                  this.props.history.push(`/accessDenied`)
                  break;
                case 500:
                case 404:
                case 406:
                  this.setState({
                    message: error.response.data.messageCode,
                    loading: false
                  });
                  break;
                case 412:
                  this.setState({
                    message: error.response.data.messageCode,
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
  /**
    * Handle region change function.
    * This function updates the state with the selected region values and generates a list of regions.
    * @param {array} regionIds - An array containing the IDs and labels of the selected regions.
    */
  handleTopProgramIdChange = (programIds) => {
    // localStorage.setItem("topProgramId", JSON.stringify(programIds))//programIds.map(x => x.value).toString())
    this.setState({
      topProgramId: programIds //this.state.programList.filter(x => programIds.map(ids => ids.value).includes(x.id)),
    });
  }
  /**
    * Handle region change function.
    * This function updates the state with the selected region values and generates a list of regions.
    * @param {array} regionIds - An array containing the IDs and labels of the selected regions.
    */
  handleBottomProgramIdChange = (programId) => {
    localStorage.setItem("bottomProgramId", programId ? programId.value : "");
    this.setState({
      bottomProgramId: programId ? programId.value : "",
      dashboardStartDateBottom: this.state.rangeValue.from.year + "-" + this.state.rangeValue.from.month,
      dashboardStopDateBottom: this.state.rangeValue.to.year + "-" + this.state.rangeValue.to.month,
    }, () => {
      if (this.state.bottomProgramId && this.state.bottomProgramId.toString().split("_").length == 1) {
        var inputJson = {
          programId: this.state.bottomProgramId,
          startDate: this.state.rangeValue.from.year + "-" + this.state.rangeValue.from.month + "-01",
          stopDate: this.state.rangeValue.to.year + "-" + this.state.rangeValue.to.month + "-01",
          displayShipmentsBy: this.state.displayBy
        }
        this.getOnlineDashboardBottom(inputJson);
      } else {
        Dashboard(this, this.state.bottomProgramId, this.state.displayBy, false, true);
      }
    });
  }
  /**
    * Handle region change function.
    * This function updates the state with the selected region values and generates a list of regions.
    * @param {array} regionIds - An array containing the IDs and labels of the selected regions.
    */
  handleTopCountryIdChange = (countryIds) => {
    // localStorage.setItem("topProgramId", JSON.stringify(programIds))//programIds.map(x => x.value).toString())
    this.setState({
      topCountryId: countryIds //this.state.programList.filter(x => programIds.map(ids => ids.value).includes(x.id)),
    }, () => {
      this.getHealthAreaListByRealmCountryIds();
    });
  }
  /**
    * Handle region change function.
    * This function updates the state with the selected region values and generates a list of regions.
    * @param {array} regionIds - An array containing the IDs and labels of the selected regions.
    */
  handleTopTechnicalAreaIdChange = (technicalAreaIds) => {
    // localStorage.setItem("topProgramId", JSON.stringify(programIds))//programIds.map(x => x.value).toString())
    this.setState({
      topTechnicalAreaId: technicalAreaIds //this.state.programList.filter(x => programIds.map(ids => ids.value).includes(x.id)),
    });
  }

  onTopSubmit() {
    this.setState({
      topSubmitLoader: true
    })
    localStorage.setItem("topLocalProgram", this.state.onlyDownloadedTopProgram);
    localStorage.setItem("topProgramId", JSON.stringify(this.state.topProgramId))
    if (this.state.topProgramId.length == 0) {
      this.setState({
        dashboardTopList: [],
        topSubmitLoader: false
      })
    } else if (this.state.onlyDownloadedTopProgram) {
      Dashboard(this, this.state.bottomProgramId, this.state.displayBy, true, false);
      this.setState({
        topSubmitLoader: false
      })
    } else {
      if (localStorage.getItem('sessionType') === 'Online') {
        DashboardService.getDashboardTop(this.state.topProgramId.map(x => x.value.toString())).then(response => {
          localStorage.setItem("dashboardTopList", JSON.stringify(response.data))
          this.setState({
            dashboardTopList: response.data,
            topSubmitLoader: false
          })
        }).catch(e => {
          this.setState({
            topSubmitLoader: false
          })
        })
      }
    }
  }
  /**
    * Handles data change in the budget form.
    * @param {Event} event - The change event.
    */
  dataChange(event) {
    let bottomProgramId = this.state.bottomProgramId;
    let displayBy = this.state.displayBy;
    if (event.target.name === "displayBy") {
      displayBy = event.target.value;
    }
    this.setState({
      bottomProgramId,
      displayBy
    }, () => {
      if (this.state.bottomProgramId && this.state.bottomProgramId.toString().split("_").length == 1) {
        var inputJson = {
          programId: this.state.bottomProgramId,
          startDate: this.state.rangeValue.from.year + "-" + this.state.rangeValue.from.month + "-01",
          stopDate: this.state.rangeValue.to.year + "-" + this.state.rangeValue.to.month + "-01",
          displayShipmentsBy: this.state.displayBy
        }
        this.getOnlineDashboardBottom(inputJson);
      } else {
        Dashboard(this, this.state.bottomProgramId, this.state.displayBy, false, true);
      }
    });
  };
  /**
    * Handles the change event of the diplaying only downloaded programs.
    * @param {Object} event - The event object containing the checkbox state.
    */
  changeOnlyDownloadedTopProgram(event) {
    var flag = event.target.checked ? 1 : 0
    if (flag) {
      this.setState({
        onlyDownloadedTopProgram: true,
        topProgramId: []
      }, () => {
        this.getPrograms();
      })
    } else {
      this.setState({
        onlyDownloadedTopProgram: false,
        topProgramId: []
      }, () => {
        this.getPrograms();
      })
    }
  }
  /**
    * Handles the change event of the diplaying only downloaded programs.
    * @param {Object} event - The event object containing the checkbox state.
    */
  changeOnlyDownloadedBottomProgram(event) {
    localStorage.setItem("bottomLocalProgram", event.target.checked);
    var flag = event.target.checked ? 1 : 0
    if (flag) {
      this.setState({
        onlyDownloadedBottomProgram: true,
        bottomProgramId: ""
      }, () => {
        this.getPrograms();
      })
    } else {
      var dt = new Date();
      dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
      var dt1 = new Date();
      dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
      this.setState({
        onlyDownloadedBottomProgram: false,
        bottomProgramId: "",
        rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } }
      }, () => {
        this.getPrograms();
      })
    }
  }
  getOnlineDashboardBottom(inputJson) {
    var dt = new Date();
    dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
    var dt1 = new Date();
    dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
    if (localStorage.getItem('sessionType') === 'Online') {
      DashboardService.getDashboardBottom(inputJson)
        .then(response => {
          this.setState({
            dashboardBottomData: response.data,
            rangeValue: this.state.rangeValue ? this.state.rangeValue : { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } }
          }, () => {
            if (document.getElementById("shipmentsTBDJexcel")) {
              this.buildStockedOutJexcel();
              this.buildForecastErrorJexcel();
              this.buildShipmentsTBDJexcel();
              this.buildExpiriesJexcel();
            }
          })
        }
        ).catch(
          error => {
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
    }
  }
  /**
   * Reterives dashboard data from server on component mount
   */
  componentDidMount() {
    var db1;
    let tempProgramList = [];
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
          tempProgramList.push({
            openCount: filteredGetRequestList[i].openCount,
            addressedCount: filteredGetRequestList[i].addressedCount,
            programCode: filteredGetRequestList[i].programCode + " ~v" + filteredGetRequestList[i].version + " (Local)",
            programVersion: filteredGetRequestList[i].version,
            programId: filteredGetRequestList[i].programId,
            versionId: filteredGetRequestList[i].version,
            id: filteredGetRequestList[i].id,
            loading: false,
            local: true,
            cutOffDate: filteredGetRequestList[i].cutOffDate != undefined && filteredGetRequestList[i].cutOffDate != null && filteredGetRequestList[i].cutOffDate != "" ? filteredGetRequestList[i].cutOffDate : ""
          });
        }
        if (localStorage.getItem("bottomProgramId") && localStorage.getItem("bottomProgramId").split("_").length == 1) {
          var dt = new Date();
          dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
          var dt1 = new Date();
          dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
          if(!localStorage.getItem("bottomReportPeriod"))
            localStorage.setItem("bottomReportPeriod", JSON.stringify({ from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } }));
          var inputJson = {
            programId: this.state.bottomProgramId,
            startDate: this.state.rangeValue.from.year + "-" + this.state.rangeValue.from.month + "-01",
            stopDate: this.state.rangeValue.to.year + "-" + this.state.rangeValue.to.month + "-01",
            displayShipmentsBy: this.state.displayBy
          }
          this.getOnlineDashboardBottom(inputJson);
        } else if (tempProgramList.length > 0) {
          Dashboard(this, localStorage.getItem("bottomProgramId"), this.state.displayBy, false, true);
        }
        if (this.state.onlyDownloadedTopProgram) {
          Dashboard(this, this.state.bottomProgramId, this.state.displayBy, true, false);
        } else if (localStorage.getItem("dashboardTopList") && !this.state.onlyDownloadedTopProgram) {
          this.setState({
            dashboardTopList: JSON.parse(localStorage.getItem("dashboardTopList"))
          })
        }
        tempProgramList.sort(function (a, b) {
          a = a.programCode.toLowerCase();
          b = b.programCode.toLowerCase();
          return a < b ? -1 : a > b ? 1 : 0;
        });
      }.bind(this);
    }.bind(this);
    Chart.plugins.register({
      afterDraw: function (chart) {
        if (chart.config.type === 'pie') {
            const ctx = chart.chart.ctx;
            const total = chart.data.datasets[0].data.reduce((sum, value) => sum + parseInt(value), 0);
            chart.data.datasets.forEach((dataset, datasetIndex) => {
                const meta = chart.getDatasetMeta(datasetIndex);
                if (!meta.hidden) {
                    meta.data.forEach((element, index) => {
                        if (!chart.getDatasetMeta(datasetIndex).data[index].hidden) {
                            // Draw the connecting lines
                            ctx.save();
                            const model = element._model;
                            const midRadius = model.innerRadius + (model.outerRadius - model.innerRadius) / 2;
                            const startAngle = model.startAngle;
                            const endAngle = model.endAngle;
                            const midAngle = startAngle + (endAngle - startAngle) / 2;

                            const x = Math.cos(midAngle);
                            const y = Math.sin(midAngle);

                            // Calculate the end point for the line
                            const lineX = model.x + x * model.outerRadius;
                            const lineY = model.y + y * model.outerRadius;
                            const labelX = model.x + x * (model.outerRadius + 10);
                            const labelY = model.y + y * (model.outerRadius + 10);

                            const label = chart.data.labels[index];
                            const value = dataset.data[index];
                            const percentage = ((value / total) * 100).toFixed(2) + '%';
                            if (((value / total) * 100).toFixed(2) > 2) {
                                ctx.beginPath();
                                ctx.moveTo(model.x, model.y);
                                ctx.lineTo(lineX, lineY);
                                ctx.lineTo(labelX, labelY);
                                ctx.strokeStyle = dataset.backgroundColor[index];
                                ctx.stroke();
                                ctx.textAlign = x >= 0 ? 'left' : 'right';
                                ctx.font = 'number 10px Arial';
                                // ctx.textBaseline = 'middle';
                                ctx.fillStyle = dataset.backgroundColor[index];
                                ctx.fillText(`${percentage}`, x < 0 ? x < -0.5 ? labelX : labelX + 8 : x < 0.5 ? labelX - 8 : labelX, y < 0 ? y < -0.5 ? labelY - 8 : labelY : y < 0.5 ? labelY : labelY + 8);
                                ctx.restore();
                            }
                        }
                    });
                }
            });
        } else if (chart.config.type === 'doughnut') {
          const ctx = chart.chart.ctx;
          const total = chart.data.datasets[0].data.reduce((sum, value) => sum + parseInt(value), 0);
          chart.data.datasets.forEach((dataset, datasetIndex) => {
              const meta = chart.getDatasetMeta(datasetIndex);
              if (!meta.hidden) {
                  meta.data.forEach((element, index) => {
                      if (!chart.getDatasetMeta(datasetIndex).data[index].hidden) {
                          // Draw the connecting lines
                          ctx.save();
                          const model = element._model;
                          const startAngle = model.startAngle;
                          const endAngle = model.endAngle;
                          const midAngle = startAngle + (endAngle - startAngle) / 2;

                          const x = Math.cos(endAngle);
                          const y = Math.sin(endAngle);

                          const labelX = model.x + x * (model.outerRadius + 10);
                          const labelY = model.y + y * (model.outerRadius + 10);

                          const value = dataset.data[index];
                          if ((((value / total) * 100).toFixed(2) >= 0 && index == 0)) {
                              ctx.beginPath();
                              ctx.moveTo(model.x, model.y);
                              ctx.strokeStyle = "#000000" //dataset.backgroundColor[index];
                              ctx.stroke();
                              ctx.textAlign = x >= 0 ? 'left' : 'right';
                              ctx.font = 'number 14px Arial';
                              ctx.fillStyle =  (dataset.data[0] == 0) ? "red" : localStorage.getItem("theme") == "dark" ? "#FFFFFF" : "#000000" //dataset.backgroundColor[index];
                              ctx.fillText(`${value}`, labelX - 4, labelY + 2);
                              ctx.restore();
                          }
                      }
                  });
              }
          });
        }
      }
    });
    if (localStorage.getItem('sessionType') === 'Online') {
      if (this.state.id == 1) {
        DashboardService.applicationLevelDashboard()
          .then(response => {
            this.setState({
              dashboard: response.data
            })
          })
        DashboardService.applicationLevelDashboardUserList()
          .then(response => {
            this.setState({
              users: response.data
            })
          })
      }
      if (this.state.id == 2) {
        DashboardService.realmLevelDashboard(this.state.realmId)
          .then(response => {
            this.setState({
              dashboard: response.data
            })
          })
        DashboardService.realmLevelDashboardUserList()
          .then(response => {
            this.setState({
              users: response.data
            })
          })
      }
      let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
      let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
      var roleList = decryptedUser.roleList;
      var roleArray = []
      for (var r = 0; r < roleList.length; r++) {
        roleArray.push(roleList[r].roleId)
      }
      this.setState({
        roleArray: roleArray
      })
      if (roleArray.includes('ROLE_SUPPLY_PLAN_REVIEWER') && this.state.id != 2) {
        DashboardService.supplyPlanReviewerLevelDashboard()
          .then(response => {
            this.setState({
              supplyPlanReviewCount: response.data
            })
          })
      }
    }
    this.getPrograms();
    if (this.state.topCountryId.length > 0) {
      this.getHealthAreaListByRealmCountryIds();
    }
    this.getDataSetList();
    this.getRealmCountryList();
    if (localStorage.getItem('sessionType') === 'Online') {
      DashboardService.openIssues()
        .then(response => {
          this.setState({
            openIssues: response.data.openIssues,
            addressedIssues: response.data.addressedIssues
          })
        })
    }
    hideFirstComponent();

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



  }
  /**
   * Callback function invoked when an animation is about to start exiting.
   * Used in components that utilize animations or transitions to perform specific actions just before the exit animation begins.
   */
  onExiting() {
    this.animating = true;
  }
  /**
   * Callback function invoked when an animation has completed exiting.
   * Used in components that utilize animations or transitions to perform specific actions after the exit animation has finished.
   */
  onExited() {
    this.animating = false;
  }
  /**
   * Move to the next item in the carousel.
   */
  next() {
    if (this.animating) return;
    const nextIndex = this.state.activeIndex === this.state.users.length - 1 ? 0 :
      this.state.activeIndex + 1;
    this.setState({ activeIndex: nextIndex });
  }
  /**
   * Move to the previous item in the carousel.
   */
  previous() {
    if (this.animating) return;
    const nextIndex = this.state.activeIndex === 0 ? this.state.users.length - 1 :
      this.state.activeIndex - 1;
    this.setState({ activeIndex: nextIndex });
  }
  /**
   * Navigate to a specific index in the carousel.
   * @param {number} newIndex The index of the item to navigate to.
   * @returns 
   */
  goToIndex(newIndex) {
    if (this.animating) return;
    this.setState({ activeIndex: newIndex });
  }
  /**
   * Update a specific key-value pair in the state's programList array.
   * @param {string} key The key of the item in the programList array to update.
   * @param {any} value The new value to set for the specified key.
   */
  updateState(key, value) {
    var programList = this.state.programList;
    var index = programList.findIndex(c => c.id == key);
    programList[index].loading = value;
    this.setState({
      'programList': programList
    })
  }
  /**
   * Update a specific key-value pair in the state's programList array.
   * @param {string} key The key of the item in the programList array to update.
   * @param {any} value The new value to set for the specified key.
   */
  updateStateDashboard(key, value) {
    var dt = new Date();
    dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
    var dt1 = new Date();
    dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
    this.setState({
      [key]: value
    }, () => {
      if (key == "dashboardBottomData") {
        if (document.getElementById("shipmentsTBDJexcel")) {
          this.buildStockedOutJexcel();
          this.buildForecastErrorJexcel();
          this.buildShipmentsTBDJexcel();
          this.buildExpiriesJexcel();
        }
        this.setState({
          rangeValue: (this.state.onlyDownloadedBottomProgram && this.state.bottomProgramId && this.state.bottomProgramId.split("_").length > 1 && this.state.dashboardStartDateBottom) || this.state.bottomProgramId == "" ? { from: { year: this.state.dashboardStartDateBottom.split("-")[0], month: this.state.dashboardStartDateBottom.split("-")[1] }, to: { year: this.state.dashboardStopDateBottom.split("-")[0], month: this.state.dashboardStopDateBottom.split("-")[1] } } : { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
        }, () => {
          localStorage.setItem("bottomReportPeriod", JSON.stringify(this.state.rangeValue))
        })
      } else if(key == "dashboardTopList") {
        this.setState({
          dashboardTopList: value.filter(p => this.state.topProgramId.map(m => m.value.toString()).includes(p.program.id))
        })
      }
    })
  }
  /**
   * Retrieves the problem list after calculation for a specific program ID.
   * @param {number} id The ID of the program for which to retrieve the problem list. 
   */
  getProblemListAfterCalculation(id) {
    this.updateState(id, true);
    if (id != 0) {
      this.refs.problemListChild.qatProblemActions(id, id, false);
    } else {
      this.updateState(id, false);
    }
    this.onTopSubmit();
  }
  /**
   * Retrieves the problem list after calculation for a specific program ID.
   * @param {number} id The ID of the program for which to retrieve the problem list. 
   */
  getProblemListAfterCalculationMultiple() {
    let i = 0;
    for(i = 0; i < this.state.topProgramId.length; i++){
      this.updateState(this.state.topProgramId[i].value, true);
      if (this.state.topProgramId[i].value != 0) {
        this.refs.problemListChild.qatProblemActions(this.state.topProgramId[i].value, this.state.topProgramId[i].value, false);
      } else {
        this.updateState(this.state.topProgramId[i].value, false);
      }
    }
    if(i == this.state.topProgramId.length){
      this.onTopSubmit();
    }
  }
  /**
   * Toggles info for confidence level
   */
  togglepopoverOpenMa() {
    this.setState({
      popoverOpenMa: !this.state.popoverOpenMa,
    });
  }

  buildForecastErrorJexcel() {
    var forecastErrorList = this.state.dashboardBottomData.forecastErrorList;
    var dataArray = [];
    let count = 0;
    if (forecastErrorList.length > 0) {
      for (var j = 0; j < forecastErrorList.length; j++) {
        data = [];
        data[0] = forecastErrorList[j].planningUnit.label.label_en + " | " + forecastErrorList[j].planningUnit.id
        data[1] = forecastErrorList[j].errorPerc!="" && forecastErrorList[j].errorPerc!=null && forecastErrorList[j].errorPerc!="null" && forecastErrorList[j].errorPerc!=undefined?formatter(Number(Number(forecastErrorList[j].errorPerc) * 100).toFixed(2))+"%":"<i class='fa fa-exclamation-triangle' title='Current report period does not contain forecasted consumption and/or actual consumption'></i>";
        data[2] = forecastErrorList[j].aboveForecastThreshold
        dataArray[count] = data;
        count++;
      }
    }
    this.el = jexcel(document.getElementById("forecastErrorJexcel"), '');
    jexcel.destroy(document.getElementById("forecastErrorJexcel"), true);
    var data = dataArray;
    var options = {
      data: data,
      columnDrag: false,
      colWidths: [100, 20],
      colHeaderClasses: ["Reqasterisk"],
      columns: [
        {
          title: "Planning Unit",
          type: 'text',
          editable: false,
          readOnly: true,
          width:'110px'
        },
        {
          title: "Average %",
          type: 'html',
          editable: false,
          readOnly: true,
          mask: "#,##.00%",
          decimal: ".",
          width:'70px'
        },
        {
          title: "Threshold",
          type: 'hidden'
        }
      ],
      onload: function(instance, cell, x, y, value) { 
        jExcelLoadedFunctionWithoutPagination(instance, 1);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        // tr.children[2].classList.add('InfoTr');
        // tr.children[2].title = "Hello";
        var elInstance = instance.worksheets[0];
        var json = elInstance.getJson();
        for (var j = 0; j < json.length; j++) {
          var rowData = elInstance.getRowData(j);
          if (rowData[2] || rowData[1].includes("exclamation")) {
            var cell = elInstance.getCell('B'.concat(parseInt(j) + 1));
            cell.classList.add("shipmentEntryEmergency");
          }
        }
      },
      pagination: false,
      search: false,
      columnSorting: true,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      copyCompatibility: true,
      allowExport: false,
      position: 'top',
      filters: true,
      license: JEXCEL_PRO_KEY,
      height: 10,
      contextMenu: function (obj, x, y, e) {
        return false;
      }.bind(this),
    };
    var forecastErrorJexcel = jexcel(document.getElementById("forecastErrorJexcel"), options);
    this.el = forecastErrorJexcel;
    this.setState({
      forecastErrorJexcel
    });
  }

  buildShipmentsTBDJexcel() {
    var shipmentWithFundingSourceTbdList = this.state.dashboardBottomData.shipmentWithFundingSourceTbd;
    var dataArray = [];
    let count = 0;
    if (shipmentWithFundingSourceTbdList.length > 0) {
      for (var j = 0; j < shipmentWithFundingSourceTbdList.length; j++) {
        data = [];
        data[0] = shipmentWithFundingSourceTbdList[j].planningUnit.label.label_en + " | " + shipmentWithFundingSourceTbdList[j].planningUnit.id
        data[1] = shipmentWithFundingSourceTbdList[j].count
        dataArray[count] = data;
        count++;
      }
    }
    this.el = jexcel(document.getElementById("shipmentsTBDJexcel"), '');
    jexcel.destroy(document.getElementById("shipmentsTBDJexcel"), true);
    var data = dataArray;
    var options = {
      data: data,
      columnDrag: false,
      colWidths: [20, 80],
      colHeaderClasses: ["Reqasterisk"],
      columns: [
        {
          title: "Planning Unit",
          type: 'text',
          editable: false,
          readOnly: true,
          width:'110px'
        },
        {
          title: "# of Shipments",
          type: 'number',
          editable: false,
          readOnly: true,
          mask: "#,##",
          width:'70px'
        }
      ],
      onload: (instance, cell) => { jExcelLoadedFunctionWithoutPagination(instance, 2) },
      pagination: false,
      search: false,
      columnSorting: true,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      copyCompatibility: true,
      allowExport: false,
      position: 'top',
      filters: true,
      license: JEXCEL_PRO_KEY,
      height: 100,
      contextMenu: function (obj, x, y, e) {
        return false;
      }.bind(this),
    };
    var shipmentsTBDJexcel = jexcel(document.getElementById("shipmentsTBDJexcel"), options);
    this.el = shipmentsTBDJexcel;
    this.setState({
      shipmentsTBDJexcel
    }
    );
  }

  buildStockedOutJexcel() {
    var stockedOutList = this.state.dashboardBottomData.stockStatus.puStockOutList;
    var dataArray = [];
    let count = 0;
    if (stockedOutList.length > 0) {
      for (var j = 0; j < stockedOutList.length; j++) {
        data = [];
        data[0] = stockedOutList[j].planningUnit.label.label_en + " | " + stockedOutList[j].planningUnit.id
        data[1] = stockedOutList[j].count
        dataArray[count] = data;
        count++;
      }
    }
    this.el = jexcel(document.getElementById("stockedOutJexcel"), '');
    jexcel.destroy(document.getElementById("stockedOutJexcel"), true);
    var data = dataArray;
    var options = {
      data: data,
      columnDrag: false,
      colWidths: [20, 80],
      colHeaderClasses: ["Reqasterisk"],
      columns: [
        {
          title: "Planning Unit",
          type: 'text',
          editable: false,
          readOnly: true,
          width:'110px'
        },
        {
          title: "# of Months",
          type: 'number',
          editable: false,
          readOnly: true,
          mask: "#,##",
          width:'70px'
        }
      ],
      onload: (instance, cell) => { jExcelLoadedFunctionWithoutPagination(instance) },
      pagination: false,
      search: false,
      columnSorting: true,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      copyCompatibility: true,
      allowExport: false,
      position: 'top',
      filters: true,
      license: JEXCEL_PRO_KEY,
      height: 100,
      contextMenu: function (obj, x, y, e) {
        return false;
      }.bind(this),
    };
    var stockedOutJexcel = jexcel(document.getElementById("stockedOutJexcel"), options);
    this.el = stockedOutJexcel;
    this.setState({
      stockedOutJexcel
    }
    );
  }

  buildExpiriesJexcel() {
    var expiriesList = this.state.dashboardBottomData.expiriesList;
    var dataArray = [];
    let count = 0;
    if (expiriesList.length > 0) {
      for (var j = 0; j < expiriesList.length; j++) {
        data = [];
        data[0] = expiriesList[j].planningUnit.label.label_en + " | " + expiriesList[j].planningUnit.id
        data[1] = roundARU(expiriesList[j].expiringQty, 1)
        data[2] = moment(expiriesList[j].expDate).format("DD-MMMM-YY")
        data[3] = roundARU(expiriesList[j].expiryAmt, 1)
        dataArray[count] = data;
        count++;
      }
    }
    this.el = jexcel(document.getElementById("expiriesJexcel"), '');
    jexcel.destroy(document.getElementById("expiriesJexcel"), true);
    var data = dataArray;
    var options = {
      data: data,
      columnDrag: false,
      colWidths: [20, 80],
      colHeaderClasses: ["Reqasterisk"],
      columns: [
        {
          title: "Planning Unit",
          type: 'text',
          editable: false,
          readOnly: true
        },
        {
          title: "Expired/Expiring Quantity",
          type: 'number',
          editable: false,
          readOnly: true,
          mask: (localStorage.getItem("roundingEnabled") != undefined && localStorage.getItem("roundingEnabled").toString() == "false") ? '#,##.000' : '#,##', decimal: '.',
        },
        {
          title: "Expiry Date",
          type: 'text',
          editable: false,
          readOnly: true
        },
        {
          title: "Total Cost",
          type: 'number',
          editable: false,
          readOnly: true,
          mask: '$#,##',
        }
      ],
      onload: (instance, cell) => { jExcelLoadedFunctionWithoutPagination(instance, 3) },
      pagination: false,
      search: false,
      columnSorting: true,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      copyCompatibility: true,
      allowExport: false,
      position: 'top',
      filters: true,
      license: JEXCEL_PRO_KEY,
      height: 100,
      contextMenu: function (obj, x, y, e) {
        return false;
      }.bind(this),
    };
    var expiriesJexcel = jexcel(document.getElementById("expiriesJexcel"), options);
    this.el = expiriesJexcel;
    this.setState({
      expiriesJexcel
    }
    );
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
    const slides = this.state.users.map((item) => {
      return (
        <CarouselItem
          onExiting={this.onExiting}
          onExited={this.onExited}
          key={'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1607923e7e2%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1607923e7e2%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.9296875%22%20y%3D%22217.75625%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'}
        >
          <div className='carouselCont'>
            <div className='ImgCont'>
              <img width='100%' src={'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1607923e7e2%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1607923e7e2%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.9296875%22%20y%3D%22217.75625%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'} />
            </div>
            <div className='TextCont'>
              <CarouselCaption captionHeader={getLabelText(item.label, this.state.lang)} captionText={item.count} />
            </div>
          </div>
        </CarouselItem>
      );
    });

    const stockStatusData = {
      labels: ['Current Stock Status'],
      datasets: [
        {
          label: 'Stockout',
          data: this.state.dashboardBottomData ? [(this.state.dashboardBottomData.stockStatus.stockOutPerc * 100).toFixed(2)] : [],
          backgroundColor: '#BA0C2F', // Red
        },
        {
          label: 'Below Min',
          data: this.state.dashboardBottomData ? [(this.state.dashboardBottomData.stockStatus.underStockPerc * 100).toFixed(2)] : [],
          backgroundColor: '#f48521', // Yellow
        },
        {
          label: 'Stocked to Plan',
          data: this.state.dashboardBottomData ? [(this.state.dashboardBottomData.stockStatus.adequatePerc * 100).toFixed(2)] : [],
          backgroundColor: '#118b70', // Green
        },
        {
          label: 'Above Max',
          data: this.state.dashboardBottomData ? [(this.state.dashboardBottomData.stockStatus.overStockPerc * 100).toFixed(2)] : [],
          backgroundColor: '#edb944', // Dark Blue
        },
        {
          label: 'N/A',
          data: this.state.dashboardBottomData ? [(this.state.dashboardBottomData.stockStatus.naPerc * 100).toFixed(2)] : [],
          backgroundColor: '#cfcdc9', // Red
        }
      ]
    };

    const stockStatusOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          beginAtZero: true,  
          stacked: true,
          maxBarThickness: 100,
          ticks: {
            callback: (val) => {
              return val+"%";
            },
            beginAtZero: true,
            stepSize: 25,
            max: 100,
            min: 0,
            display: true
          },
          gridLines: {
            lineWidth: 1,
            color: gridLineColor,
            zeroLineColor: gridLineColor
          }
        }],
        yAxes: [{
          display: false,
          // beginAtZero: true,  
          stacked: true,
          maxBarThickness: 100,
          ticks: {
            beginAtZero: true,
            display: false // Hide the Y-axis values
          },
          gridLines: {
            lineWidth: 1,
            color: gridLineColor,
            zeroLineColor: gridLineColor
          }
        }]
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          pointStyle: 'rect',
          boxWidth: 12,
          fontColor: fontColor,
        }
      },
      tooltips: {
        enabled: true,
        callbacks: {
          label: function (tooltipItem, data) {
            const dataset = data.datasets[tooltipItem.datasetIndex];
            const currentValue = dataset.data[tooltipItem.index];
            const label = dataset.label;
            return label + ': ' + currentValue + '%';
          }
        }
      }
    };

    let shipmentDetailsList = [];
    let forecastConsumptionQplCorrectCount = 0;
    let forecastConsumptionQplPuCount = 0;
    let inventoryQplCorrectCount = 0;
    let inventoryQplPuCount = 0;
    let actualConsumptionQplCorrectCount = 0;
    let actualConsumptionQplPuCount = 0;
    let shipmentQplCorrectCount = 0;
    let shipmentQplPuCount = 0;
    let expiryTotal = 0;
    let shipmentTotal = 0;
    if (this.state.dashboardBottomData) {
      forecastConsumptionQplCorrectCount = this.state.dashboardBottomData.forecastConsumptionQpl.correctCount;
      forecastConsumptionQplPuCount = this.state.dashboardBottomData.forecastConsumptionQpl.puCount;
      inventoryQplCorrectCount = this.state.dashboardBottomData.inventoryQpl.correctCount;
      inventoryQplPuCount = this.state.dashboardBottomData.inventoryQpl.puCount;
      actualConsumptionQplCorrectCount = this.state.dashboardBottomData.actualConsumptionQpl.correctCount;
      actualConsumptionQplPuCount = this.state.dashboardBottomData.actualConsumptionQpl.puCount;
      shipmentQplCorrectCount = this.state.dashboardBottomData.shipmentQpl.correctCount;
      shipmentQplPuCount = this.state.dashboardBottomData.shipmentQpl.puCount;
      expiryTotal = this.state.dashboardBottomData.expiryTotal;
      shipmentTotal = this.state.dashboardBottomData.shipmentTotal;
      if (this.state.displayBy == 1 || this.state.displayBy == 2) {
        shipmentDetailsList = Object.values(
          this.state.dashboardBottomData.shipmentDetailsList.reduce((acc, curr) => {
            if (!acc[curr.reportBy.code]) {
              acc[curr.reportBy.code] = { code: curr.reportBy.code, cost: curr.cost, colorHtmlCode: curr.colorHtmlCode, colorHtmlDarkCode: curr.colorHtmlDarkCode };
            } else {
              acc[curr.reportBy.code].cost += curr.cost;
            }
            return acc;
          }, {})
        );
      } else {
        shipmentDetailsList = Object.values(
          this.state.dashboardBottomData.shipmentDetailsList.reduce((acc, curr) => {
            if (!acc[getLabelText(curr.reportBy.label, this.state.lang)]) {
              acc[getLabelText(curr.reportBy.label, this.state.lang)] = { code: getLabelText(curr.reportBy.label, this.state.lang), cost: curr.cost, colorHtmlCode: curr.colorHtmlCode, colorHtmlDarkCode: curr.colorHtmlDarkCode };
            } else {
              acc[getLabelText(curr.reportBy.label, this.state.lang)].cost += curr.cost;
            }
            return acc;
          }, {})
        );
      }
    }

    let darkModeColors = [];
    let lightModeColors = [];

    if(this.state.displayBy == 1) {
      darkModeColors = [
        "#d4bbff", "#BA0C2F", "#118B70", "#EDB944", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721",
        "#d4bbff", "#BA0C2F", "#118B70", "#EDB944", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721",
        "#d4bbff", "#BA0C2F", "#118B70", "#EDB944", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721",
        "#d4bbff", "#BA0C2F", "#118B70", "#EDB944", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721",
        "#d4bbff", "#BA0C2F", "#118B70", "#EDB944", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721"
      ];
  
      lightModeColors = [
        "#002F6C", "#BA0C2F", "#118B70", "#f0bc52", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721",
        "#002F6C", "#BA0C2F", "#118B70", "#f0bc52", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721",
        "#002F6C", "#BA0C2F", "#118B70", "#f0bc52", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721",
        "#002F6C", "#BA0C2F", "#118B70", "#f0bc52", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721",
        "#002F6C", "#BA0C2F", "#118B70", "#f0bc52", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721"
      ];
    } else if(this.state.displayBy == 2) {
      darkModeColors = shipmentDetailsList.map(x => x.colorHtmlDarkCode);
      lightModeColors = shipmentDetailsList.map(x => x.colorHtmlCode);
    } else if(this.state.displayBy == 3) {
      let lightStatus = [
        {
          status: "Received",
          color: "#002F6C"
        },
        {
          status: "Approved", 
          color: "#118b70"
        },
        {
          status: "Planned",
          color: "#A7C6ED"
        },
        {
          status: "Submitted",
          color: "#25A7FF"
        },
        {
          status: "Arrived",
          color: "#0067B9"
        },
        {
          status: "Shipped",
          color: "#49A4A1"
        },
        {
          status: "On-hold",
          color: "#6C6463"
        }
      ]
      let darkStatus = [
        {
          status: "Received",
          color:"#d4bbff"
        },
        {
          status: "Approved",
          color:"#118b70"
        },
        {
          status: "Planned",
          color:"#A7C6ED"
        },
        {
          status: "Submitted",
          color:"#25A7FF"
        },
        {
          status: "Arrived",
          color:"#0067B9"
        },
        {
          status: "Shipped",
          color:"#49A4A1"
        },
        {
          status: "On-hold",
          color:"#6C6463"
        }
      ]
      shipmentDetailsList.map(x => darkModeColors.push(darkStatus.filter(l => l.status == x.code).length > 0 ? darkStatus.filter(l => l.status == x.code)[0].color : ""));
      shipmentDetailsList.map(x => lightModeColors.push(lightStatus.filter(l => l.status == x.code).length > 0 ? lightStatus.filter(l => l.status == x.code)[0].color : ""));
    }
    

    const backgroundColor = isDarkMode ? darkModeColors : lightModeColors;
    // const fontColor = isDarkMode ? '#e4e5e6' : '#212721';
    const shipmentsPieData = {
      labels: shipmentDetailsList.map(x => x.code),
      datasets: [{
        label: 'My First Dataset',
        data: shipmentDetailsList.map(x => x.cost.toFixed(2)),
        backgroundColor: backgroundColor,
        fontColor: fontColor,
        hoverOffset: 4
      }]
    };
    const shipmentsPieOptions = {
      title: {
        display: true,
        text: "",
        padding: 30,
      },
      tooltips: {
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
            return "$ " + x1 + x2;
          }
        }
      },
      htmlLegend: {
        containerID: 'legend-container',
      },
      legend: {
        display: true,
        position: 'bottom',
        fontColor: fontColor,
        labels: {
            usePointStyle: true,
            fontColor:fontColor,
            fontSize: 0.01,
            padding: 12
        }
      },
      layout: {
        padding: {
          top: 10, // Add extra top padding to avoid label overlap
          // bottom: 10,
        },
      },
      elements: {
        arc: {
          borderWidth: 0
        }
      }
    }

    function getOrCreateLegendList(chart, containerId) {
      const legendContainer = document.getElementById(containerId);
      let listContainer = legendContainer.querySelector('ul');
    
      if (!listContainer) {
        listContainer = document.createElement('ul');
        listContainer.style.display = 'flex';
        listContainer.style.flexDirection = 'row';
        listContainer.style.flexWrap = 'wrap';
        listContainer.style.margin = 0;
        listContainer.style.padding = 0;
        legendContainer.appendChild(listContainer);
      }
    
      return listContainer;
    }

    const toggleDatasetVisibility = (chart, segmentIndex) => {
      const meta = chart.getDatasetMeta(0);
      const segment = meta.data[segmentIndex];
      segment.hidden = !segment.hidden;
      chart.update();
    };
   
    const htmlLegendPlugin = {
      id: 'htmlLegend',
      afterUpdate(chart, args, options) {    
        const ul = getOrCreateLegendList(chart, "legend-container");
        while (ul.firstChild) {
          ul.firstChild.remove();
        }    
        const items = chart.config.options.legend.labels.generateLabels(chart);
        items.forEach((item) => {
          const li = document.createElement('li');
          li.style.alignItems = 'center';
          li.style.cursor = 'pointer';
          li.style.display = 'flex';
          li.style.flexDirection = 'row';
          li.style.marginLeft = '5px';
          li.style.marginRight = '5px';
          li.style.marginBottom = '5px';
    
          li.onclick = () => {
            toggleDatasetVisibility(chart, item.index);
          };
    
          // Color box
          const boxSpan = document.createElement('span');
          boxSpan.style.background = item.fillStyle;
          boxSpan.style.borderColor = item.strokeStyle;
          boxSpan.style.borderWidth = item.lineWidth + 'px';
          boxSpan.style.display = 'inline-block';
          boxSpan.style.flexShrink = 0;
          boxSpan.style.height = '10px';
          boxSpan.style.marginRight = '5px';
          boxSpan.style.width = '10px';
          boxSpan.style.borderRadius = '50%';
    
          // Text for the label
          const textContainer = document.createElement('p');
          textContainer.style.color = localStorage.getItem("theme") == "dark" ? "#FFFFFF" : item.fontColor;
          textContainer.style.margin = 0;
          textContainer.style.padding = 5;
          textContainer.style.textDecoration = item.hidden ? 'line-through' : '';
    
          const text = document.createTextNode(item.text);
          textContainer.appendChild(text);
    
          li.appendChild(boxSpan);
          li.appendChild(textContainer);
          ul.appendChild(li);
        });
      },
    };

    const forecastConsumptionData = {
      datasets: [{
        label: 'My First Dataset',
        data: [forecastConsumptionQplCorrectCount, forecastConsumptionQplPuCount - forecastConsumptionQplCorrectCount],
        backgroundColor: [
          (forecastConsumptionQplCorrectCount / forecastConsumptionQplPuCount) >= 1 ? "#118b70" : (forecastConsumptionQplCorrectCount / forecastConsumptionQplPuCount) >= (2 / 3) ? "#f48521" : (forecastConsumptionQplCorrectCount / forecastConsumptionQplPuCount) >= (1 / 3) ? "#edba26" : "#BA0C2F",
          '#c8ced3'
        ],
        hoverOffset: 4
      }]
    };
    const forecastConsumptionOptions = {
      rotation: -Math.PI, // Start angle (half-circle)
      circumference: Math.PI,
      cutout: '50%', // Doughnut hole size
      responsive: true,
      legend: {
        display: false // Hide the legend
      },
      tooltips: {
        enabled: false
      },
      hover: {
        mode: null
      },
      title: {
        display: true,
        text: "",
        padding: 5
      },
      layout: {
        padding: {
          left: 20,
          right: 20,
        },
      },
    }

    const actualInventoryData = {
      labels: [
        'Red',
        'Blue',
        'Yellow'
      ],
      datasets: [{
        label: 'My First Dataset',
        data: [inventoryQplCorrectCount, inventoryQplPuCount - inventoryQplCorrectCount],
        backgroundColor: [
          (inventoryQplCorrectCount / inventoryQplPuCount) >= 1 ? "#118b70" : (inventoryQplCorrectCount / inventoryQplPuCount) >= (2 / 3) ? "#f48521" : (inventoryQplCorrectCount / inventoryQplPuCount) >= (1 / 3) ? "#edba26" : "#BA0C2F",
          '#c8ced3'
        ],
        hoverOffset: 4
      }]
    };
    const actualInventoryOptions = {
      rotation: -Math.PI, // Start angle (half-circle)
      circumference: Math.PI,
      cutout: '50%', // Doughnut hole size
      responsive: true,
      legend: {
        display: false // Hide the legend
      },
      tooltips: {
        enabled: false
      },
      hover: {
        mode: null
      },
      title: {
        display: true,
        text: "",
        padding: 5
      },
      layout: {
        padding: {
          left: 20,
          right: 20,
        },
      },
    }

    const actualConsumptionData = {
      labels: [
        'Red',
        'Blue',
        'Yellow'
      ],
      datasets: [{
        label: 'My First Dataset',
        data: [actualConsumptionQplCorrectCount, actualConsumptionQplPuCount - actualConsumptionQplCorrectCount],
        backgroundColor: [
          (actualConsumptionQplCorrectCount / actualConsumptionQplPuCount) >= 1 ? "#118b70" : (actualConsumptionQplCorrectCount / actualConsumptionQplPuCount) >= (2 / 3) ? "#f48521" : (actualConsumptionQplCorrectCount / actualConsumptionQplPuCount) >= (1 / 3) ? "#edba26" : "#BA0C2F",
          '#c8ced3'
        ],
        hoverOffset: 4
      }]
    };
    const actualConsumptionOptions = {
      rotation: -Math.PI, // Start angle (half-circle)
      circumference: Math.PI,
      cutout: '50%', // Doughnut hole size
      responsive: true,
      legend: {
        display: false // Hide the legend
      },
      tooltips: {
        enabled: false
      },
      hover: {
        mode: null
      },
      title: {
        display: true,
        text: "",
        padding: 5
      },
      layout: {
        padding: {
          left: 20,
          right: 20,
        },
      },
    }

    const shipmentsData = {
      labels: [
        'Red',
        'Blue',
        'Yellow'
      ],
      datasets: [{
        label: 'My First Dataset',
        data: [shipmentQplCorrectCount, shipmentQplPuCount - shipmentQplCorrectCount],
        backgroundColor: [
          (shipmentQplCorrectCount / shipmentQplPuCount) >= 1 ? "#118b70" : (shipmentQplCorrectCount / shipmentQplPuCount) >= (2 / 3) ? "#f48521" : (shipmentQplCorrectCount / shipmentQplPuCount) >= (1 / 3) ? "#edba26" : "#BA0C2F",
          '#c8ced3'
        ],
        hoverOffset: 4
      }]
    };
    const shipmentsOptions = {
      rotation: -Math.PI, // Start angle (half-circle)
      circumference: Math.PI,
      cutout: '50%', // Doughnut hole size
      responsive: true,
      legend: {
        display: false,// Hide the legend
        color: gridLineColor,
        drawBorder: true,
        lineWidth: 0,
        zeroLineColor: gridLineColor
      },
      tooltips: {
        enabled: false
      },
      hover: {
        mode: null
      },
      title: {
        display: true,
        text: "",
        padding: 5
      },
      layout: {
        padding: {
          left: 20,
          right: 20,
        },
      },
    }
    let topCountryList = []
    this.state.countryList.length > 0 &&
      this.state.countryList.map(c => {
        topCountryList.push({ label: c.label.label_en, value: c.id })
      })
    let topTechnicalAreaList = []
    this.state.programList.length > 0 &&
      this.state.programList.filter(c => this.state.onlyDownloadedTopProgram ? c.local : !c.local).map(c => {
        topTechnicalAreaList.push({ label: c.programCode, value: c.id })
      })
    let topProgramList = []
    this.state.programList.length > 0 &&
      this.state.programList.filter(c => this.state.onlyDownloadedTopProgram ? c.local : !c.local).map(c => {
        topProgramList.push({ label: c.programCode, value: c.id })
      })
    let bottomProgramList = [];
    this.state.programList.length > 0
      && this.state.programList.filter(c => this.state.onlyDownloadedBottomProgram ? c.local : !c.local).map((item, i) => {
        bottomProgramList.push({
          value: item.id,
          label: item.programCode
        })
      }, this);
    const pickerLang = {
      months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
      from: 'From', to: 'To',
    }
    const { rangeValue } = this.state
    const makeText = m => {
      if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
      return '?'
    }
    return (
      <div className="animated fadeIn">
        <QatProblemActionNew ref="problemListChild" updateState={this.updateState} fetchData={this.getPrograms} objectStore="programData" page="dashboard"></QatProblemActionNew>
        <AuthenticationServiceComponent history={this.props.history} message={(message) => {
          this.setState({ message: message })
        }} />
        <h5 className={this.props.match.params.color} id="div1" style={{ display: this.props.match.params.message == 'Success' ? 'none' : 'block' }}>{i18n.t(this.props.match.params.message)}</h5>
        <h5 className={this.state.color} id="div2">{i18n.t(this.state.message)}</h5>
        <Row className="mt-2">
          {activeTab1 == 1 && checkOnline === 'Online' && this.state.id == 1 &&
            <>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="p-0">
                    <div class="h1 text-muted text-left mb-0 m-3">
                      <i class="cui-user icon-color"></i>
                      <ButtonGroup className="float-right BtnZindex">
                        <Dropdown id='card1' isOpen={this.state.card1} toggle={() => { this.setState({ card1: !this.state.card1 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud("/user/listUser")}>{i18n.t('static.list.listUser')}</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/user/addUser")}>{i18n.t('static.add.addUser')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                      <Carousel className='trustedMechCarousel' defaultWait={1000} activeIndex={activeIndex} next={this.next} previous={this.previous} ride="carousel">
                        <CarouselIndicators items={this.state.users} activeIndex={activeIndex} onClickHandler={this.goToIndex} />
                        {slides}
                      </Carousel>
                      <div className="chart-wrapper " >
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div class="h1 text-muted text-left mb-2  ">
                      <i class="fa fa-table icon-color"></i>
                      <ButtonGroup className="float-right BtnZindex">
                        <Dropdown id='card2' isOpen={this.state.card2} toggle={() => { this.setState({ card2: !this.state.card2 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud("/realm/listRealm")}>{i18n.t('static.list.listRealm')}</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/realm/addrealm")}>{i18n.t('static.add.addRealm')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>
                    <div className="TextTittle ">{i18n.t('static.dashboard.totalRealm')} </div>
                    <div className="text-count">{this.state.dashboard.REALM_COUNT}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div class="h1 text-muted text-left mb-2  ">
                      <i class="fa fa-language icon-color"></i>
                      <ButtonGroup className="float-right">
                        <Dropdown id='card3' isOpen={this.state.card3} toggle={() => { this.setState({ card3: !this.state.card3 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud("/language/listLanguage")}>{i18n.t('static.list.listLanguage')}</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/language/addLanguage")}>{i18n.t('static.add.addLanguage')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>
                    <div className="TextTittle ">{i18n.t('static.dashboard.language')}</div>
                    <div className="text-count">{this.state.dashboard.LANGUAGE_COUNT}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </>
          }
          {activeTab1 == 1 && checkOnline === 'Online' && this.state.id == 2 &&
            <>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="p-0">
                    <div class="h1 text-muted text-left mb-0 m-3">
                      <i class="cui-user icon-color"></i>
                      <ButtonGroup className="float-right BtnZindex">
                        <Dropdown id='card1' isOpen={this.state.card1} toggle={() => { this.setState({ card1: !this.state.card1 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud("/user/listUser")}>{i18n.t('static.list.listUser')}</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/user/addUser")}>{i18n.t('static.add.addUser')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                      <Carousel className='trustedMechCarousel' defaultWait={1000} activeIndex={activeIndex} next={this.next} previous={this.previous} ride="carousel">
                        <CarouselIndicators items={this.state.users} activeIndex={activeIndex} onClickHandler={this.goToIndex} />
                        {slides}
                      </Carousel>
                      <div className="chart-wrapper " >
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div class="h1 text-muted text-left mb-2  ">
                      <i class="cui-globe icon-color"></i>
                      <ButtonGroup className="float-right BtnZindex">
                        <Dropdown id='card2' isOpen={this.state.card2} toggle={() => { this.setState({ card2: !this.state.card2 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud("/realmCountry/listRealmCountry")}>{i18n.t('static.list.listCountry')}</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/realm/listRealm")}>{i18n.t('static.add.addCountry')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>
                    <div className="TextTittle ">{i18n.t('static.program.realmcountrydashboard')}</div>
                    <div className="text-count">{this.state.dashboard.REALM_COUNTRY_COUNT}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div class="h1 text-muted text-left mb-2  ">
                      <i class="fa fa-medkit  icon-color"></i>
                      <ButtonGroup className="float-right BtnZindex">
                        <Dropdown id='card3' isOpen={this.state.card3} toggle={() => { this.setState({ card3: !this.state.card3 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud("/healthArea/listHealthArea")}>{i18n.t('static.list.listTechnicalArea')}</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/healthArea/addHealthArea")}>{i18n.t('static.add.addTechnicalArea')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>
                    <div className="TextTittle ">{i18n.t('static.program.healtharea')} </div>
                    <div className="text-count">{this.state.dashboard.TECHNICAL_AREA_COUNT}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div class="h1 text-muted text-left mb-2  ">
                      <i class="cui-location-pin icon-color"></i>
                      <ButtonGroup className="float-right BtnZindex">
                        <Dropdown id='card4' isOpen={this.state.card4} toggle={() => { this.setState({ card4: !this.state.card4 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud("/realmCountry/listRealmCountry")}>{i18n.t('static.list.listRegion')}</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/realmCountry/listRealmCountry")}>{i18n.t('static.add.addRegion')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>
                    <div className="TextTittle ">{i18n.t('static.region.region')} </div>
                    <div className="text-count">{this.state.dashboard.REGION_COUNT}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div class="h1 text-muted text-left mb-2  ">
                      <i class="fa fa-sitemap icon-color"></i>
                      <ButtonGroup className="float-right BtnZindex">
                        <Dropdown id='card5' isOpen={this.state.card5} toggle={() => { this.setState({ card5: !this.state.card5 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud("/organisation/listOrganisation")}>{i18n.t('static.list.listOrganisation')}</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/organisation/addOrganisation")}>{i18n.t('static.add.addOrganisation')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>
                    <div className="TextTittle ">{i18n.t('static.program.organisation')} </div>
                    <div className="text-count">{this.state.dashboard.ORGANIZATION_COUNT}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div class="h1 text-muted text-left mb-2  ">
                      <i class="fa fa-list-alt icon-color"></i>
                      <ButtonGroup className="float-right BtnZindex">
                        <Dropdown id='card8' isOpen={this.state.card8} toggle={() => { this.setState({ card8: !this.state.card8 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud(activeTab1 == 2 ? "/program/listProgram" : "/dataSet/listDataSet")}>{i18n.t('static.list.listProgram')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>
                    <div className="TextTittle ">{i18n.t('static.add.totalProgram')} </div>
                    <div className="text-count">{activeTab1 == 2 ? this.state.dashboard.PROGRAM_COUNT : this.state.dashboard.DATASET_COUNT}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div class="h1 text-muted text-left mb-2  ">
                      <i class="fa fa-file-text-o icon-color"></i>
                      <ButtonGroup className="float-right">
                        <Dropdown id='card6' isOpen={this.state.card6} toggle={() => { this.setState({ card6: !this.state.card6 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud(activeTab1 == 2 ? "/program/programOnboarding" : "/dataset/addDataSet")}>{i18n.t('static.dashboard.setupprogram')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>
                    <div className="TextTittle ">{i18n.t('static.dashboard.setupprogram')} </div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>
              {activeTab1 == 2 && <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div class="h1 text-muted text-left mb-2  ">
                      <i class="fa fa-calculator  icon-color"></i>
                      <ButtonGroup className="float-right">
                        <Dropdown id='card7' isOpen={this.state.card7} toggle={() => { this.setState({ card7: !this.state.card7 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud("/report/supplyPlanVersionAndReview/1")}>{i18n.t('static.dashboard.viewSupplyPlan')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>
                    <div className="TextTittle ">{i18n.t('static.dashboard.supplyPlanWaiting')} </div>
                    <div className="text-count">{this.state.dashboard.SUPPLY_PLAN_COUNT}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>}
            </>
          }
          {activeTab1 == 1 && checkOnline === 'Online' && this.state.id != 2 && this.state.roleArray.includes('ROLE_SUPPLY_PLAN_REVIEWER') &&
            <>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div class="h1 text-muted text-left mb-2  ">
                      <i class="fa fa-calculator  icon-color"></i>
                      <ButtonGroup className="float-right">
                        <Dropdown id='card7' isOpen={this.state.card7} toggle={() => { this.setState({ card7: !this.state.card7 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud("/report/supplyPlanVersionAndReview")}>{i18n.t('static.dashboard.viewSupplyPlan')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>
                    <div className="TextTittle ">{i18n.t('static.dashboard.supplyPlanWaiting')} </div>
                    <div className="text-count">{this.state.supplyPlanReviewCount.SUPPLY_PLAN_COUNT}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </>
          }
          {
            this.state.datasetList.length > 0 && activeTab1 == 1 &&
            this.state.datasetList.map((item) => (
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div style={{ display: item.loading ? "none" : "block" }}>
                      <div class="h1 text-muted text-left mb-2">
                        <i class="fa fa-list-alt icon-color"></i>
                        <ButtonGroup className="float-right BtnZindex">
                          <Dropdown id={item.id} isOpen={this.state[item.id]} toggle={() => { this.setState({ [item.id]: !this.state[item.id] }); }}>
                            <DropdownToggle caret className="p-0" color="transparent">
                            </DropdownToggle>
                            <DropdownMenu right>
                              <DropdownItem onClick={() => this.deleteProgram(item.programId, item.versionId)}>{i18n.t("static.common.delete")}</DropdownItem>
                              <DropdownItem onClick={() => this.redirectToCrudWithValue("/dataset/versionSettings", item.programId, item.versionId, 1)}>{i18n.t("static.versionSettings.versionSettings")}</DropdownItem>
                              <DropdownItem onClick={() => this.redirectToCrudWithValue("/dataset/listTree", item.programId, item.versionId, 2)}>{i18n.t("static.forecastMethod.tree")}</DropdownItem>
                              <DropdownItem onClick={() => this.redirectToCrudWithValue("/dataentry/consumptionDataEntryAndAdjustment", item.programId, item.versionId, 2)}>{i18n.t("static.supplyPlan.consumption")}</DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </ButtonGroup>
                      </div>
                      <div className="TextTittle ">{item.programCode + "~v" + item.versionId}</div>
                      <div className="TextTittle ">{item.forecastStartDate + " to " + item.forecastStopDate}</div>
                    </div>
                    <div style={{ display: item.loading ? "block" : "none" }}>
                      <div className="d-flex align-items-center justify-content-center" style={{ height: "70px" }} >
                        <div class="align-items-center">
                          <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                          <div class="spinner-border blue ml-4" role="status">
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))
          }
          {checkOnline === 'Online' && activeTab1 == 1 &&
            <Col xs="12" sm="6" lg="3">
              <Card className=" CardHeight">
                <CardBody className="box-p">
                  <a href={QAT_HELPDESK_CUSTOMER_PORTAL_URL} target="_blank" title={i18n.t('static.ticket.help')}>
                    <div class="h1 text-muted text-left mb-2  ">
                      <i><img src={imageHelp} className="" style={{ width: '40px', height: '40px', marginTop: '-15px' }} /></i>
                    </div>
                    <div className="TextTittle ">{i18n.t("static.ticket.openIssues")}: {this.state.openIssues}</div>
                    <div className="TextTittle">{i18n.t("static.ticket.addressedIssues")}: {this.state.addressedIssues}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </a>
                </CardBody>
              </Card>
            </Col>
          }
        </Row>
        {activeTab1 == 2 && <>
          <div className='row pb-lg-2'>
            {/* <div className='col-md-12 pl-lg-4 pr-lg-4'> */}
              {/* <div className='row'>
                <FormGroup className='col-md-3 pl-lg-1 FormGroupD'>
                  <Label htmlFor="topProgramId">Program<span class="red Reqasterisk">*</span></Label>
                  <MultiSelect
                    name="topProgramId"
                    id="topProgramId"
                    bsSize="sm"
                    value={this.state.topProgramId}
                    onChange={(e) => { this.handleTopProgramIdChange(e) }}
                    options={topProgramList && topProgramList.length > 0 ? topProgramList : []}
                    labelledBy={i18n.t('static.common.regiontext')}
                  />
                </FormGroup>
                <FormGroup className='col-md-3' style={{ marginTop: '29px' }}>
                  <div className="tab-ml-1 ml-lg-3">
                    <Input
                      className="form-check-input"
                      type="checkbox"
                      id="onlyDownloadedTopProgram"
                      name="onlyDownloadedTopProgram"
                      checked={this.state.onlyDownloadedTopProgram}
                      onClick={(e) => { this.changeOnlyDownloadedTopProgram(e); }}
                    />
                    <Label
                      className="form-check-label"
                      check htmlFor="inline-radio2" style={{ fontSize: '12px', marginTop: '3px' }}>
                      Only show local program
                    </Label>
                  </div>
                </FormGroup>

              </div> */}

              {/* <div class="col-xl-12 pl-lg-2 pr-lg-2"> */}
                <div class="card custom-card DashboardBg1 pb-lg-2">
                  <div class="card-body py-1">
                    {/* <div className='row'> */}
                    {/* <FormGroup className='col-md-3 FormGroupD'>
                        <Label htmlFor="topProgramId">Country<span class="red Reqasterisk">*</span></Label>
                        <MultiSelect
                          name="topCountryId"
                          id="topCountryId"
                          bsSize="sm"
                          value={this.state.topCountryId}
                          onChange={(e) => { this.handleTopCountryIdChange(e) }}
                          options={topCountryList && topCountryList.length > 0 ? topCountryList : []}
                          labelledBy={i18n.t('static.common.regiontext')}
                        />
                      </FormGroup>
                      <FormGroup className='col-md-3 FormGroupD'>
                        <Label htmlFor="topTechnicalAreaId">Technical Area<span class="red Reqasterisk">*</span></Label>
                        <MultiSelect
                          name="topTechnicalAreaId"
                          id="topTechnicalAreaId"
                          bsSize="sm"
                          value={this.state.topTechnicalAreaId}
                          onChange={(e) => { this.handleTopTechnicalAreaIdChange(e) }}
                          options={topTechnicalAreaList && topTechnicalAreaList.length > 0 ? topTechnicalAreaList : []}
                          labelledBy={i18n.t('static.common.regiontext')}
                        />
                      </FormGroup> */}
                    <div class="row pt-lg-2">
                      <div class="col-5" style={{display:'flex',gap:'40px'}}>
                        <FormGroup className='FormGroupD col-10 px-0'>
                          <Label htmlFor="topProgramId" style={{display:'flex',gap:'10px'}}>Program
                          <FormGroup className='MarginTopCheckBox'>
                          <div className="pl-lg-4">
                            <Input
                              className="form-check-input"
                              type="checkbox"
                              id="onlyDownloadedTopProgram"
                              name="onlyDownloadedTopProgram"
                              disabled={!(localStorage.getItem('sessionType') === 'Online')}
                              checked={this.state.onlyDownloadedTopProgram}
                              onClick={(e) => { this.changeOnlyDownloadedTopProgram(e); }}
                            />
                            <Label
                              className="form-check-label"
                              check htmlFor="inline-radio2" style={{ fontSize: '12px', marginTop: '3px' }}>
                              Show only downloaded programs <i class="fa fa-info-circle icons" title={i18n.t("static.dashboard.localTooltip")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                            </Label>
                          </div>
                        </FormGroup>
                          </Label>
                          <MultiSelect
                            className="MarginBtmformgroup"
                            name="topProgramId"
                            id="topProgramId"
                            bsSize="sm"
                            value={this.state.topProgramId ? localStorage.getItem('sessionType') === 'Online' ? this.state.topProgramId : localStorage.getItem("topLocalProgram") == "false" ? [] : this.state.topProgramId : []}
                            onChange={(e) => { this.handleTopProgramIdChange(e) }}
                            options={topProgramList && topProgramList.length > 0 ? topProgramList : []}
                            labelledBy={i18n.t('static.common.regiontext')}
                            filterOptions={filterOptions}
                          />
                        </FormGroup>
                        <FormGroup className='col-1' style={{ marginTop: '24px' }}>
                          <Button color="success" size="md" className="float-right mr-1" style={{ display: this.state.topSubmitLoader ? "none" : "block" }} type="button" onClick={() => this.onTopSubmit()}> Go</Button>
                        </FormGroup>
                      </div>
                      <div className='col-6 tickerbox'>
                        <FormGroup>
                          <div class="myMarquee">
                            <div class="scroller">
                              <div class="scroller-content">
                                <div><a href="#">Accessible Programs</a><p>{this.state.programList.length}</p></div>
                                <div><a href="#">Downloaded Programs</a><p>{this.state.programList.filter(c => c.local).length}</p></div>
                                <div><a href="#">Countries</a><p>{this.state.dashboard.REALM_COUNTRY_COUNT}</p></div>
                                <div><a href="#">Users</a><p>{this.state.dashboard.USER_COUNT}</p></div>
                                <div><a href="#">Programs</a><p>{this.state.dashboard.FULL_PROGRAM_COUNT}</p></div>
                                <div><a href="#">Linked ERP Shipments</a><p>{this.state.dashboard.LINKED_ERP_SHIPMENTS_COUNT}</p></div>
                              </div>
                              
                              <div class="scroller-content">
                                <div><a href="#">Accessible Programs</a><p>{this.state.programList.length}</p></div>
                                <div><a href="#">Downloaded Programs</a><p>{this.state.programList.filter(c => c.local).length}</p></div>
                                <div><a href="#">Countries</a><p>{this.state.dashboard.REALM_COUNTRY_COUNT}</p></div>
                                <div><a href="#">Users</a><p>{this.state.dashboard.USER_COUNT}</p></div>
                                <div><a href="#">Programs</a><p>{this.state.dashboard.FULL_PROGRAM_COUNT}</p></div>
                                <div><a href="#">Linked ERP Shipments</a><p>{this.state.dashboard.LINKED_ERP_SHIPMENTS_COUNT}</p></div>
                              </div>
                              <div class="scroller-content">
                                <div><a href="#">Accessible Programs</a><p>{this.state.programList.length}</p></div>
                                <div><a href="#">Downloaded Programs</a><p>{this.state.programList.filter(c => c.local).length}</p></div>
                                <div><a href="#">Countries</a><p>{this.state.dashboard.REALM_COUNTRY_COUNT}</p></div>
                                <div><a href="#">Users</a><p>{this.state.dashboard.USER_COUNT}</p></div>
                                <div><a href="#">Programs</a><p>{this.state.dashboard.FULL_PROGRAM_COUNT}</p></div>
                                <div><a href="#">Linked ERP Shipments</a><p>{this.state.dashboard.LINKED_ERP_SHIPMENTS_COUNT}</p></div>
                              </div>
                            </div>
                          </div>
                        </FormGroup>
                      </div>
                    </div>                 

                    {(this.state.dashboardTopList.length > 0 || this.state.topProgramId.length > 0) && <div class="table-responsive fixTableHeadTopDashboard tableFixHeadDash">
                      <Table className="table-striped table-bordered text-center">
                        <thead>
                          {localStorage.getItem("topLocalProgram") == "true" && <th scope="col">Delete <i class="fa fa-info-circle icons" title={i18n.t("static.dashboard.actionTooltip")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></th>}
                          <th scope="col">Program <i class="fa fa-info-circle icons" title={i18n.t("static.dashboard.programTooltip")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></th>
                          <th scope="col" width="125px">Active Planning Units</th>
                          <th scope="col">Planning Units With Stockouts <i class="fa fa-info-circle icons" title={i18n.t("static.dashboard.stockoutTooltip")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></th>
                          <th scope="col" width="125px">Total Cost of Expiries <i class="fa fa-info-circle icons" title={i18n.t("static.dashboard.expiryTooltip")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></th>
                          <th scope='col' width="125px">Open QAT Problems​ <i class="fa fa-info-circle icons" title={i18n.t("static.dashboard.qatProblemTooltip")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i> {localStorage.getItem("topLocalProgram") == "true" && <i class="fa fa-refresh" style={{ color: "info", cursor: "pointer" }} title="Re-calculate QPL" onClick={() => this.getProblemListAfterCalculationMultiple()}></i>}</th>
                          <th scope='col'>Uploaded Date <i class="fa fa-info-circle icons" title={i18n.t("static.dashboard.uploadedDateTooltip")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></th>
                          <th scope='col'>Review Status <i class="fa fa-info-circle icons" title={i18n.t("static.dashboard.reviewStatusTooltip")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></th>
                        </thead>
                        <tbody>
                          {this.state.dashboardTopList.map(d => {
                            return (
                              <tr>
                                {localStorage.getItem("topLocalProgram") == "true" && <td scope="row">
                                  <i class="fa fa-trash" style={{ color: "danger", cursor: "pointer" }} title="Delete" onClick={() => this.deleteSupplyPlanProgram(d.program.id.split("_")[0], d.program.id.split("_")[1].slice(1))}></i> &nbsp;
                                  {/* <i class="fa fa-refresh" style={{ color: "info", cursor: "pointer" }} title="Re-calculate QPL" onClick={() => this.getProblemListAfterCalculation(d.program.id)}></i> */}
                                </td>}
                                {localStorage.getItem("topLocalProgram") == "true" && <td scope="row">{d.program.code + " ~v" + d.program.version} {d.versionType.id == 2 && d.versionStatus.id == 2 ? "*" : ""}​</td>}
                                {localStorage.getItem("topLocalProgram") != "true" && <td scope="row">{d.program.code + " ~v" + d.versionId} {d.versionType.id == 2 && d.versionStatus.id == 2 ? "*" : ""}​</td>}
                                <td>
                                  {d.activePlanningUnits}
                                </td>
                                <td align="center" style={{ verticalAlign:"middle", color: d.countOfStockOutPU > 0 ? "red" : "" }}>
                                  <div id="example-1" class="examples">
                                    <div class="cssProgress">
                                      <div class="progress">
                                        <div class="progress-bar" role="progressbar" style={{ backgroundColor: "#BA0C2F", width: (d.countOfStockOutPU / d.activePlanningUnits) * 100 + '%' }}>
                                          {d.countOfStockOutPU}
                                        </div>
                                        <div class="progress-bar" role="progressbar" style={{ backgroundColor: "#0067B9", width: ((d.activePlanningUnits-d.countOfStockOutPU) / d.activePlanningUnits) * 100 + '%' }}>
                                          {d.activePlanningUnits-d.countOfStockOutPU}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ color: d.valueOfExpiredPU > 0 ? "red" : "" }}>{d.valueOfExpiredPU ? "$" : "-"}{addCommas(roundARU(d.valueOfExpiredPU, 1))}</td>
                                {localStorage.getItem("topLocalProgram") == "true" && <td title="QAT Problem List" onClick={() => this.redirectToCrudWindow(`/report/problemList/1/` + d.program.id + "/false")} style={{ color: d.countOfOpenProblem > 0 ? "red" : "", cursor: "pointer" }}>{d.countOfOpenProblem}</td>}
                                {localStorage.getItem("topLocalProgram") != "true" && <td style={{ color: d.countOfOpenProblem > 0 ? "red" : "" }}>{d.countOfOpenProblem}</td>}
                                <td>{moment(d.commitDate).format('DD-MMMM-YY')}</td>
                                <td><a style={{ color: "#002F6C", cursor: "pointer" }} onClick={() => this.redirectToCrudWindow("/report/supplyPlanVersionAndReview/1", true, d.program.id)}>{localStorage.getItem("topLocalProgram") == "true" ? (d.latestFinalVersion ? getLabelText(d.latestFinalVersion.versionStatus.label, this.state.lang) : "No Historical Final Uploads") : (d.latestFinalVersionStatus && d.latestFinalVersionStatus.id) ? getLabelText(d.latestFinalVersionStatus.label, this.state.lang) : "No Historical Final Uploads"} {localStorage.getItem("topLocalProgram") == "true" ? (d.latestFinalVersion ? "(" + moment(d.latestFinalVersion.lastModifiedDate).format('DD-MMMM-YY') + ") " : "") : (d.latestFinalVersionLastModifiedDate ? "(" + moment(d.latestFinalVersionLastModifiedDate).format('DD-MMMM-YY') + ") " : "")}</a>
                                  {localStorage.getItem('sessionType') === 'Online' && <i class="fa fa-book icons IconColorD" onClick={()=> this.getNotes(localStorage.getItem("topLocalProgram") == "true" ? d.program.id.split("_")[0] : d.program.id)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>}
                                </td>
                              </tr>)
                          })}
                        </tbody>
                      </Table>
                    </div>}
                   
                    <Modal isOpen={this.state.notesPopup}
                      className={'modal-lg modalWidth ' + this.props.className}>
                      <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan">
                          <strong>{i18n.t('static.problemContext.transDetails')}</strong>
                      </ModalHeader>
                      <ModalBody>
                          <div className="" style={{ display: this.state.loadingForNotes ? "none" : "block" }}>
                              <div id="notesTransTable" className="AddListbatchtrHeight"></div>
                          </div>
                          <div style={{ display: this.state.loadingForNotes ? "block" : "none" }}>
                              <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                  <div class="align-items-center">
                                      <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                      <div class="spinner-border blue ml-4" role="status">
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </ModalBody>
                      <ModalFooter>
                          <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                      </ModalFooter>
                    </Modal>
                  </div>
                </div>
              {/* </div> */}
            {/* </div> */}
          </div>
          {/* <div className='row'>
            <div className='col-md-6'>
              <div className='row'>
                <div className='col-md-6 pl-lg-0'>
                  <FormGroup className='col FormGroupD'>
                    <Label htmlFor="organisationTypeId">Program<span class="red Reqasterisk">*</span></Label>
                    <Input
                      type="select"
                      name="bottomProgramId"
                      id="bottomProgramId"
                      value={this.state.bottomProgramId}
                      onChange={(e) => { this.dataChange(e) }}
                      bsSize="sm"
                      required
                    >
                      <option selected>Open this select menu</option>
                      {bottomProgramList}
                    </Input>
                  </FormGroup>
                  <FormGroup className='col-md-12' style={{ marginTop: '0px' }}>
                    <div className="tab-ml-1 ml-lg-4">
                      <Input
                        className="form-check-input"
                        type="checkbox"
                        id="onlyDownloadedBottomProgram"
                        name="onlyDownloadedBottomProgram"
                        checked={this.state.onlyDownloadedBottomProgram}
                        onClick={(e) => { this.changeOnlyDownloadedBottomProgram(e); }}
                      />
                      <Label
                        className="form-check-label"
                        check htmlFor="inline-radio2" style={{ fontSize: '12px', marginTop: '3px' }}>
                        Only show local program
                      </Label>
                    </div>
                  </FormGroup>
                </div>
                <FormGroup className='col-md-6 pl-lg-0 FormGroupD'>
                  <Label htmlFor="organisationTypeId">Report Period<span class="red Reqasterisk">*</span><span className="stock-box-icon  fa fa-sort-desc ml-1" style={{marginTop:'0px',zIndex:'1'}}></span></Label>
                  <div className="controls edit">
                    <Picker
                      ref="reportPeriod"
                      years={{ min: this.state.minDate, max: this.state.maxDate }}
                      value={rangeValue}
                      lang={pickerLang}
                      key={JSON.stringify(this.state.minDate) + "-" + JSON.stringify(rangeValue)}
                      onDismiss={this.handleRangeDissmis}
                    >
                      <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this.state.bottomProgramId && this.state.bottomProgramId.split("_").length > 1 ? "" : this._handleClickRangeBox} />
                    </Picker>
                  </div>
                </FormGroup>
                
              </div>
            </div>
          </div> */}
          <div className='row pb-lg-2'>
            {/* <div class="col-xl-12 mb-lg-3 DashboardBg"> */}
            <div class="card custom-card DashboardBg1">
                  <div class="card-body py-1">
              <div className='row pt-lg-2'>
                {/* <div className='col-md-12'> */}
                  {/* <div className='row'> */}
                  <div class="col-4">
                    {/* <div className='col-md-4 pl-lg-0'> */}
                    <FormGroup className='FormGroupD'>
                      <Label htmlFor="organisationTypeId" style={{display:'flex',gap:'10px'}}>Program

                      <div style={{ gap: '20px', display: 'flex' }}>
                        <FormGroup className='MarginTopCheckBox'>
                          <div className="pl-lg-4">
                            <Input
                              className="form-check-input"
                              type="checkbox"
                              id="onlyDownloadedBottomProgram"
                              name="onlyDownloadedBottomProgram"
                              checked={this.state.onlyDownloadedBottomProgram}
                              disabled={!(localStorage.getItem('sessionType') === 'Online')}
                              onClick={(e) => { this.changeOnlyDownloadedBottomProgram(e); }}
                            />
                            <Label
                              className="form-check-label"
                              check htmlFor="inline-radio2" style={{ fontSize: '12px', marginTop: '3px' }}>
                              Show only downloaded programs <i class="fa fa-info-circle icons" title={i18n.t("static.dashboard.localTooltip")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                            </Label>
                          </div>
                        </FormGroup>
                      </div>
                      </Label>
                      <Select
                        type="select"
                        name="bottomProgramId"
                        id="bottomProgramId"
                        className="selectBlack MarginBtmformgroup"
                        value={this.state.bottomProgramId ? localStorage.getItem('sessionType') === 'Online' ? this.state.bottomProgramId : localStorage.getItem("bottomLocalProgram") == "false" ? "" : this.state.bottomProgramId : ""}
                        options={bottomProgramList}
                        onChange={(e) => { this.handleBottomProgramIdChange(e) }}
                        bsSize="sm"
                        required
                      />
                    </FormGroup>
                    </div>
                    <div class='col-2'>
                    <FormGroup className='FormGroupD'>
                      <Label htmlFor="organisationTypeId">Report Period <i class="fa fa-info-circle icons" title={i18n.t("static.dashboard.reportPeriodTooltip")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i><span className="stock-box-icon  fa fa-sort-desc ml-1" style={{ marginTop: '0px', zIndex: '1' }}></span></Label>
                      <div className="controls edit">
                        <Picker
                          ref="reportPeriod"
                          years={{ min: this.state.minDate, max: this.state.maxDate }}
                          value={rangeValue}
                          lang={pickerLang}
                          key={JSON.stringify(this.state.minDate) + "-" + JSON.stringify(rangeValue)}
                          onDismiss={this.handleRangeDissmis}
                        >
                          <MonthBox value={makeText(rangeValue.from) + ' - ' + makeText(rangeValue.to)} onClick={(this.state.onlyDownloadedBottomProgram && this.state.bottomProgramId && this.state.bottomProgramId.toString().split("_").length > 1) || this.state.bottomProgramId == "" ? "" : this._handleClickRangeBox} />
                        </Picker>
                      </div>
                    </FormGroup>
                    </div>
                   
                  {/* </div> */}
                {/* </div> */}
              </div>
              
              {this.state.dashboardBottomData && this.state.bottomProgramId && <div className='row'>
                {/* <div className='col-md-12'> */}
                  <div className='row'>
                    <div className={this.state.onlyDownloadedBottomProgram ? 'col-md-6' : 'col-md-3'}>
                      <div className="card custom-card CustomHeight" style={{overflow:'hidden'}}>
                        <div class="card-header justify-content-between">
                          <div class="card-title" onClick={() => this.redirectToCrudWindow('/report/stockStatusMatrix')} style={{ cursor: 'pointer' }}> Stock Status <i class="fa fa-info-circle icons" title={i18n.t("static.dashboard.stockStatusHeaderTooltip")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></div>
                        </div>
                        <div class="card-body pt-lg-2 scrollable-content">
                          <HorizontalBar data={stockStatusData} options={stockStatusOptions} height={150} />
                        </div>
                        <div class="label-text text-center text-mutedDashboard">
                          <h7><b>Stocked out Planning Units: {this.state.dashboardBottomData ? this.state.dashboardBottomData.stockStatus.puStockOutList.length : 0}</b></h7>
                        </div>
                        <div className='row px-3'>
                          <div id="stockedOutJexcel" className='DashboardreadonlyBg dashboardTable2E jtabs-animation jtabs jss_container' style={{ padding: '2px 8px' }}></div>
                        </div>
                      </div>
                    </div>
                    <div className='col-md-3' style={{ display: this.state.onlyDownloadedBottomProgram ? "none" : "block" }}>
                      {/* <div className="col-md-3" style={{ display: this.state.onlyDownloadedBottomProgram ? "none" : "block" }}> */}
                      <div className="card custom-card pb-lg-2 CustomHeight">
                        <div class="card-header  justify-content-between">
                          <div class="card-title" onClick={() => this.redirectToCrudWindow('/report/consumptionForecastErrorSupplyPlan')} style={{ cursor: 'pointer' }}> Forecast Error <i class="fa fa-info-circle icons" title={i18n.t("static.dashboard.forecastErrorHeaderTooltip")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></div>
                        </div>
                        <div class="card-body px-1 py-2 scrollable-content" style={{overflowY:'hidden'}}>
                          <div id="forecastErrorJexcel" className='DashboardreadonlyBg dashboardTable3'>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div className="card custom-card pb-lg-2 CustomHeight">
                        <div class="card-header justify-content-between">
                          <div class="card-title" onClick={() => this.redirectToCrudWindow('/report/shipmentSummery')} style={{ cursor: 'pointer' }}>Shipments <i class="fa fa-info-circle icons" title={i18n.t("static.dashboard.shipmentsHeaderTooltip")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></div>
                          <div className='col-md-7 pl-lg-0' style={{ textAlign: 'end' }}> <i class="mb-2 fs-10 text-mutedDashboard">Total value of Shipments: <b className='h3 DarkFontbold' style={{ fontSize: '14px' }}>{shipmentTotal ? "$" : ""}{addCommas(roundARU(shipmentTotal, 1))}</b></i></div>
                        </div>
                        <div class="card-body pt-lg-1 scrollable-content" style={{overflowY:'hidden'}}>
                          <div className='row'>
                            <div className='col-6'>
                              <div className='row'>
                                <FormGroup className='FormGroupD pl-lg-3' style={{zIndex:"1",display:'flex',gap:'8px'}}>
                                  <Label htmlFor="displayBy" style={{marginTop:'6px'}}>Display By</Label>
                                  <Input
                                  style={{width:'155px'}}
                                    type="select"
                                    name="displayBy"
                                    id="displayBy"
                                    bsSize="sm"
                                    onChange={(e) => { this.dataChange(e) }}
                                    value={this.state.displayBy}
                                    required
                                  >
                                    <option value="1">Funding Source</option>
                                    <option value="2">Procurement Agent</option>
                                    <option value="3">Status</option>
                                  </Input>
                                </FormGroup>
                              </div>
                              <div className='row'>
                              {/* <div className='row' style={{height:'209px',overflowY:'scroll'}}> */}
                                <div className='d-flex align-items-center justify-content-center chart-wrapper PieShipment'>
                                  <Col style={{marginTop:"-73px"}}>
                                    <Pie data={shipmentsPieData} options={shipmentsPieOptions} height={300} width={300} plugins={[htmlLegendPlugin]} />
                                  </Col>
                                </div>
                                <div id="legend-container" style={{marginTop:"0px"}}></div>
                              </div>
                            </div>
                            <div className='col-6 container1'>
                              <div class="label-text text-center text-mutedDashboard">
                                <h7><b># of Shipments with funding TBD: {this.state.dashboardBottomData.shipmentWithFundingSourceTbd.map(x => x.count).reduce((a,b) => a+b,0)}</b></h7>
                              </div>
                              <div className='row'>
                                <div id="shipmentsTBDJexcel" className='DashboardreadonlyBg dashboardTable2' style={{ padding: '2px 8px' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='row px-3 pt-lg-2'>
                    <div className='col-md-6'>
                      <div class="card custom-card CustomHeight boxHeightBottom">
                        <div class="card-header justify-content-between">
                          <div class="card-title" onClick={() => this.redirectToCrudWindow('/report/problemList/1/'+this.state.bottomProgramId+"/false")} style={{ cursor: 'pointer' }}> Data Quality <i class="fa fa-info-circle icons" title={i18n.t("static.dashboard.dataQualityHeaderTooltip")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></div>
                        </div>
                        <div class="card-body py-2 scrollable-content">
                          <div className='row pt-lg-2'>
                            <div class="col-3 container1">
                              <div class="label-text text-center text-mutedDashboard gaugeHeader"><h7><b>Forecasted Consumption <i class="fa fa-info-circle icons" title={i18n.t("static.dashboard.forecastedConsumptionTooltip")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></b></h7></div>
                              <div class="pie-wrapper">
                                <div class="arc text-blackD" data-value="24"></div>
                                <Doughnut data={forecastConsumptionData} options={forecastConsumptionOptions} height={180} />
                                <center><span className='text-blackD' style={{color:forecastConsumptionQplCorrectCount == 0 ? "red" : ""}}>{forecastConsumptionQplPuCount - forecastConsumptionQplCorrectCount}{forecastConsumptionQplPuCount - forecastConsumptionQplCorrectCount != 0 ? ("/"+forecastConsumptionQplPuCount) : ""} missing forecasts</span></center>
                              </div>
                            </div>
                            <div class="col-3 container1">
                              <div class="label-text text-center text-mutedDashboard gaugeHeader"><h7><b>Actual Inventory <i class="fa fa-info-circle icons" title={i18n.t("static.dashboard.actualInventoryTooltip")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></b></h7></div>
                              <div class="pie-wrapper">
                                <div class="arc text-blackD" data-value="24"></div>
                                <Doughnut data={actualInventoryData} options={actualInventoryOptions} height={180} />
                                <center><span className='text-blackD' style={{color:inventoryQplCorrectCount == 0 ? "red" : ""}}>{inventoryQplPuCount - inventoryQplCorrectCount}{inventoryQplPuCount - inventoryQplCorrectCount != 0 ? ("/"+inventoryQplPuCount) : ""} missing actuals</span></center>
                              </div>
                            </div>
                            <div class="col-3 container1">
                              <div class="label-text text-center text-mutedDashboard gaugeHeader"><h7><b>Actual Consumption <i class="fa fa-info-circle icons" title={i18n.t("static.dashboard.actualConsumptionTooltip")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></b></h7></div>
                              <div class="pie-wrapper">
                                <div class="arc text-blackD" data-value="24"></div>
                                <Doughnut data={actualConsumptionData} options={actualConsumptionOptions} height={180} />
                                <center><span className='text-blackD' style={{color:actualConsumptionQplCorrectCount == 0 ? "red" : ""}}>{actualConsumptionQplPuCount - actualConsumptionQplCorrectCount}{actualConsumptionQplPuCount - actualConsumptionQplCorrectCount != 0 ? ("/"+actualConsumptionQplPuCount) : ""} missing actuals</span></center>
                              </div>
                            </div>
                            <div class="col-3 container1">
                              <div class="label-text text-center text-mutedDashboard gaugeHeader"><h7><b>Shipments <i class="fa fa-info-circle icons" title={i18n.t("static.dashboard.shipmentsTooltip")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></b></h7></div>
                              <div class="pie-wrapper">
                                <div class="arc text-blackD" data-value="24"></div>
                                <Doughnut data={shipmentsData} options={shipmentsOptions} height={180} />
                                <center><span className='text-blackD' style={{color:shipmentQplCorrectCount == 0 ? "red" : ""}}>{shipmentQplPuCount - shipmentQplCorrectCount}{shipmentQplPuCount - shipmentQplCorrectCount != 0 ? ("/"+shipmentQplPuCount) : ""} flagged dates</span></center>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div className='row'>
                        <div class="col-md-12 pr-lg-0">
                          <div class="card custom-card pb-lg-2 CustomHeight boxHeightBottom">
                            <div className="card-header d-flex justify-content-between align-items-center">
                              <div className="card-title" onClick={() => this.redirectToCrudWindow('/report/expiredInventory')} style={{ cursor: 'pointer' }}>Expiries <i class="fa fa-info-circle icons" title={i18n.t("static.dashboard.expiriesHeaderTooltip")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></div>
                              <div className='col-md-7 pl-lg-0' style={{ textAlign: 'end' }}> <i class="mb-2 fs-10 text-mutedDashboard">Total value of Expiries: <b className='red h3 DarkFontbold'>{expiryTotal ? "$" : ""}{addCommas(roundARU(expiryTotal, 1))}</b></i></div>
                            </div>
                            <div class="card-body px-1 py-2 scrollable-content">
                              <div id="expiriesJexcel" className='DashboardreadonlyBg dashboardTable2E' style={{ padding: '0px 8px' }}>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                {/* </div> */}
              </div>}
              </div>
              </div>
            {/* </div> */}
          </div>
        </>}
      </div >
    );
  }
}
export default ApplicationDashboard;
