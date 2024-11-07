import CryptoJS from 'crypto-js';
import moment from 'moment';
import React, { Component } from 'react';
import { Search } from 'react-bootstrap-table2-toolkit';
import { confirmAlert } from 'react-confirm-alert';
import {
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
  Row
} from 'reactstrap';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import QatProblemActionNew from '../../CommonComponent/QatProblemActionNew';
import getLabelText from '../../CommonComponent/getLabelText';
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, QAT_HELPDESK_CUSTOMER_PORTAL_URL, SECRET_KEY } from '../../Constants.js';
import DashboardService from "../../api/DashboardService";
import ProgramService from "../../api/ProgramService";
import imageHelp from '../../assets/img/help-icon.png';
import i18n from '../../i18n';
import AuthenticationService from '../../views/Common/AuthenticationService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideFirstComponent, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
/**
 * Component for showing the dashboard.
 */
class ApplicationDashboard extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      id: this.props.match.params.id,
      dropdownOpen: false,
      radioSelected: 2,
      activeIndex: 0,
      activeIndexProgram: 0,
      problemActionList: [],
      programList: [],
      datasetList: [],
      message: '',
      dashboard: '',
      users: [],
      lang: localStorage.getItem('lang'),
      openIssues: '',
      addressedIssues: '',
      supplyPlanReviewCount: '',
      roleArray: []
    };
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.goToIndex = this.goToIndex.bind(this);
    this.onExiting = this.onExiting.bind(this);
    this.onExited = this.onExited.bind(this);
    this.getPrograms = this.getPrograms.bind(this);
    this.checkNewerVersions = this.checkNewerVersions.bind(this);
    this.checkNewerVersionsDataset = this.checkNewerVersionsDataset.bind(this);
    this.updateState = this.updateState.bind(this);
    this.getDataSetList = this.getDataSetList.bind(this);
    this.deleteProgram = this.deleteProgram.bind(this);
    this.deleteSupplyPlanProgram = this.deleteSupplyPlanProgram.bind(this);
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
   * Clears the timeout when the component is unmounted.
   */
  componentWillUnmount() {
    clearTimeout(this.timeout);
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
   * Retrieves supply plan programs from indexedDB and updates the state with the fetched program list.
   */
  getPrograms() {
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
      var programList = [];
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
          programList.push({
            openCount: filteredGetRequestList[i].openCount,
            addressedCount: filteredGetRequestList[i].addressedCount,
            programCode: filteredGetRequestList[i].programCode,
            programVersion: filteredGetRequestList[i].version,
            programId: filteredGetRequestList[i].programId,
            versionId: filteredGetRequestList[i].version,
            id: filteredGetRequestList[i].id,
            loading: false,
            cutOffDate: filteredGetRequestList[i].cutOffDate != undefined && filteredGetRequestList[i].cutOffDate != null && filteredGetRequestList[i].cutOffDate != "" ? filteredGetRequestList[i].cutOffDate : ""
          });
        }
        this.setState({
          programList: programList
        })
        this.checkNewerVersions(programList);
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
   * Reterives dashboard data from server on component mount
   */
  componentDidMount() {
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
        DashboardService.realmLevelDashboardUserList(this.state.realmId)
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
    this.getDataSetList();
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
    return (
      <div className="animated fadeIn">
        <QatProblemActionNew ref="problemListChild" updateState={this.updateState} fetchData={this.getPrograms} objectStore="programData" page="dashboard"></QatProblemActionNew>
        <AuthenticationServiceComponent history={this.props.history} message={(message) => {
          this.setState({ message: message })
        }} />
        <h5 className={this.props.match.params.color} id="div1" style={{ display: this.props.match.params.message == 'Success' ? 'none' : 'block' }}>{i18n.t(this.props.match.params.message)}</h5>
        <h5 className={this.state.color} id="div2">{i18n.t(this.state.message)}</h5>
        <Row className="mt-2">
          {checkOnline === 'Online' && this.state.id == 1 &&
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
          {checkOnline === 'Online' && this.state.id == 2 &&
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
          {activeTab1 == 2 && checkOnline === 'Online' && this.state.id != 2 && this.state.roleArray.includes('ROLE_SUPPLY_PLAN_REVIEWER') &&
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
          {
            this.state.programList.length > 0 && activeTab1 == 2 &&
            this.state.programList.map((item) => (
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
                              <DropdownItem onClick={() => this.deleteSupplyPlanProgram(item.programId, item.versionId)}>{i18n.t("static.common.delete")}</DropdownItem>
                              <DropdownItem onClick={() => this.getProblemListAfterCalculation(item.id)}>{i18n.t('static.qpl.calculate')}</DropdownItem>
                              <DropdownItem onClick={() => this.redirectToCrud(`/report/problemList/1/` + item.id + "/false")}>{i18n.t('static.dashboard.qatProblemList')}</DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </ButtonGroup>
                      </div>
                      <div className="TextTittle ">{item.programCode + "~v" + item.programVersion + (item.cutOffDate != "" ? " (" + i18n.t("static.supplyPlan.start") + " " + moment(item.cutOffDate).format('MMM YYYY') + ")" : "")}</div>
                      <div className="TextTittle ">{i18n.t("static.problemReport.open")}:{item.openCount}</div>
                      <div className="TextTittle">{i18n.t("static.problemReport.addressed")}: {item.addressedCount}</div>
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
          {checkOnline === 'Online' &&
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
      </div >
    );
  }
}
export default ApplicationDashboard;
