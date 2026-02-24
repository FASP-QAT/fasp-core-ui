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
      programList: [],
      datasetList: [],
      countryList: [],
      countrys: [],
      countryValues: [],
      countryLabels: [],
      technicalAreas: [],
      technicalAreaList: [],
      shipmentStatusList: [],
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
      onlyDownloadedTopProgram: AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_DOWNLOAD_PROGARM') ? localStorage.getItem('sessionType') === 'Online' ? localStorage.getItem("topLocalProgram") == "false" ? false : true : true : false,
      onlyDownloadedBottomProgram: AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_DOWNLOAD_PROGARM') ? localStorage.getItem('sessionType') === 'Online' ? localStorage.getItem("bottomLocalProgram") == "false" ? false : true : true : false,
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
  }
  /**
   * Reterives dashboard data from server on component mount
   */
  componentDidMount() {

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
      this.filterTechnicalArea();
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
    } else {
      const lan = 'en';
      var db1;
      getDatabase();
      var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
      openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var transaction = db1.transaction(['CountryData'], 'readwrite');
        var Country = transaction.objectStore('CountryData');
        var getRequest = Country.getAll();
        var proList = []
        getRequest.onerror = function (event) {
        };
        getRequest.onsuccess = function (event) {
          var myResult = [];
          myResult = getRequest.result;
          var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
          var userId = userBytes.toString(CryptoJS.enc.Utf8);
          for (var i = 0; i < myResult.length; i++) {
            if (myResult[i].userId == userId) {
              var bytes = CryptoJS.AES.decrypt(myResult[i].CountryName, SECRET_KEY);
              var CountryNameLabel = bytes.toString(CryptoJS.enc.Utf8);
              var CountryJson = {
                name: getLabelText(JSON.parse(CountryNameLabel), lan) + "~v" + myResult[i].version,
                id: myResult[i].id
              }
              proList[i] = CountryJson
            }
          }
          proList.sort((a, b) => {
            var itemLabelA = a.name.toUpperCase();
            var itemLabelB = b.name.toUpperCase();
            return itemLabelA > itemLabelB ? 1 : -1;
          });
          this.setState({
            countrys: proList,
            loading: false
          })
        }.bind(this);
      }
    }
    this.getHealthAreaList();
    // this.filterData(this.state.rangeValue);
  }
  
  getHealthAreaList() {
    this.setState({ loading: true })
    if (localStorage.getItem("sessionType") === 'Online') {
      let realmId = AuthenticationService.getRealmId();
      DropdownService.getHealthAreaDropdownList(realmId)
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
            }, () => { })
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
    } else {
      const lan = 'en';
      var db1;
      getDatabase();
      var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
      openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var transaction = db1.transaction(['CountryData'], 'readwrite');
        var Country = transaction.objectStore('CountryData');
        var getRequest = Country.getAll();
        var proList = []
        getRequest.onerror = function (event) {
        };
        getRequest.onsuccess = function (event) {
          var myResult = [];
          myResult = getRequest.result;
          var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
          var userId = userBytes.toString(CryptoJS.enc.Utf8);
          for (var i = 0; i < myResult.length; i++) {
            if (myResult[i].userId == userId) {
              var bytes = CryptoJS.AES.decrypt(myResult[i].CountryName, SECRET_KEY);
              var CountryNameLabel = bytes.toString(CryptoJS.enc.Utf8);
              var CountryJson = {
                name: getLabelText(JSON.parse(CountryNameLabel), lan) + "~v" + myResult[i].version,
                id: myResult[i].id
              }
              proList[i] = CountryJson
            }
          }
          proList.sort((a, b) => {
            var itemLabelA = a.name.toUpperCase();
            var itemLabelB = b.name.toUpperCase();
            return itemLabelA > itemLabelB ? 1 : -1;
          });
          this.setState({
            technicalAreas: proList,
            loading: false
          })
        }.bind(this);
      }
    }
    this.filterData(this.state.rangeValue);
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
    let technicalAreaList = technicalAreaList.length > 0 && technicalAreaList.map((item, i) => {
      return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
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
            <div class="card custom-card DashboardBg1 pb-lg-2">
                <div class="card-body py-1">
                    <div className='row'>
                        <FormGroup className="col-md-3">
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
                        </FormGroup>
                          <FormGroup className='col-md-3 FormGroupD'>
                          <Label htmlFor="topTechnicalAreaId">Technical Area<span class="red Reqasterisk">*</span></Label>
                          <MultiSelect
                              name="topTechnicalAreaId"
                              id="topTechnicalAreaId"
                              bsSize="sm"
                              value={this.state.technicalAreaList}
                              onChange={(e) => { this.handleTechnicalAreaIdChange(e) }}
                              options={technicalAreaList && technicalAreaList.length > 0 ? technicalAreaList : []}
                              labelledBy={i18n.t('static.common.regiontext')}
                          />
                        </FormGroup>
                    </div>
                </div>
                    <div class="row pt-lg-2">
                        <div class="col-5 Topsectiondashboard">
                        {/* <FormGroup className='FormGroupD col-10 px-0'>
                            <h4 style={{ fontWeight: 900 }}>{i18n.t("static.dashboard.overview")}</h4>
                            <Label htmlFor="topProgramId" style={{ display: 'flex', gap: '10px' }}>{i18n.t("static.dashboard.programheader")}
                            <FormGroup className='MarginTopCheckBox'>
                                <div className="pl-lg-4">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_DOWNLOAD_PROGARM') && <Input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="onlyDownloadedTopProgram"
                                    name="onlyDownloadedTopProgram"
                                    disabled={!(localStorage.getItem('sessionType') === 'Online')}
                                    checked={this.state.onlyDownloadedTopProgram}
                                    onClick={(e) => { this.changeOnlyDownloadedTopProgram(e); }}
                                />}
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_DOWNLOAD_PROGARM') && <Label
                                    className="form-check-label"
                                    check htmlFor="onlyDownloadedTopProgram" style={{ fontSize: '12px', marginTop: '2px' }}>
                                    {i18n.t("static.common.onlyDownloadedProgram")} <i class="fa fa-info-circle icons" title={i18n.t("static.dashboard.localTooltip")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                </Label>}
                                {!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_DOWNLOAD_PROGARM') && <Label
                                    className="form-check-label"
                                    check htmlFor="onlyDownloadedTopProgram" style={{ fontSize: '12px', marginTop: '2px' }}>
                                    {""}
                                </Label>}
                                </div>
                            </FormGroup>
                            </Label>
                            <MultiSelect
                            className="MarginBtmformgroup"
                            name="topProgramId"
                            id="topProgramId"
                            bsSize="sm"
                            value={topProgramIdAvailable}
                            onChange={(e) => { this.handleTopProgramIdChange(e) }}
                            options={topProgramList && topProgramList.length > 0 ? topProgramList : []}
                            labelledBy={i18n.t('static.common.regiontext')}
                            filterOptions={filterOptions}
                            />
                        </FormGroup> */}
                        <FormGroup className='col-1' style={{ marginTop: '58px', display: this.state.topProgramIdChange ? "block" : "none" }}>
                            <Button color="success" size="md" className="float-right mr-1" style={{ display: this.state.topSubmitLoader ? "none" : "block" }} type="button" onClick={() => this.onTopSubmit()}> Go</Button>
                        </FormGroup>
                        </div>
                    </div>
                </div>    
            </div>
        </div>
    );
  }
}
export default SupplyPlanScoreCard;