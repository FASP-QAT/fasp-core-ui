import React, { Component, lazy, Suspense } from 'react';

// import { SECRET_KEY } from '../../Constants';
import CryptoJS from 'crypto-js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import AuthenticationService from '../../views/Common/AuthenticationService';

import { qatProblemActions } from '../../CommonComponent/QatProblemActions';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import getLabelText from '../../CommonComponent/getLabelText';
import { DATE_FORMAT_CAP, QAT_HELPDESK_CUSTOMER_PORTAL_URL, polling } from '../../Constants.js';
import moment from 'moment';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { Online, Offline } from "react-detect-offline";
import ProgramService from "../../api/ProgramService"
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
  Carousel,
  CarouselCaption,
  CarouselControl,
  CarouselIndicators,
  CarouselItem,
  Table,
} from 'reactstrap';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { getStyle, hexToRgba } from '@coreui/coreui-pro/dist/js/coreui-utilities'
import i18n from '../../i18n'
import DashboardService from "../../api/DashboardService";
import Widget01 from '../../views/Widgets/Widget01';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME } from '../../Constants.js';
import paginationFactory from 'react-bootstrap-table2-paginator';
import BootstrapTable from 'react-bootstrap-table-next';
import imageHelp from '../../assets/img/help-icon.png';
import QatProblemActionNew from '../../CommonComponent/QatProblemActionNew';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
const Widget04 = lazy(() => import('../../views/Widgets/Widget04'));

// const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));

const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')

const options = {
  scales: {
    yAxes: [{
      scaleLabel: {
        display: true,
        labelString: i18n.t('static.dashboard.programCount')
      }
    }],
    xAxes: [{
      scaleLabel: {
        display: true,
        labelString: i18n.t('static.supplier.realm')
      }
    }],
  },
  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  maintainAspectRatio: false
}


const pie = {
  labels: [
    'Realm Name 1',
    'Realm Name 2',
    'Realm Name 3',


  ],
  datasets: [
    {
      data: [60, 40, 100, 20, 10],
      backgroundColor: [
        '#4dbd74',
        '#c8ced3',
        '#000',
        '#ffc107',
        '#f86c6b',
      ],
      hoverBackgroundColor: [
        '#4dbd74',
        '#c8ced3',
        '#000',
        '#ffc107',
        '#f86c6b',
      ],
    }],
};

const bar = {

  labels: [i18n.t('static.realm.realmName'), i18n.t('static.realm.realmName1'), i18n.t('static.realm.realmName2')],
  datasets: [
    {
      label: i18n.t('static.graph.activeProgram'),
      backgroundColor: '#118B70',
      borderColor: 'rgba(179,181,198,1)',
      pointBackgroundColor: 'rgba(179,181,198,1)',
      pointBorderColor: '#fff',
      barThickness: 150,
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(179,181,198,1)',
      data: [65, 59, 89, 81, 56, 55, 40],
    },
    // {
    //   label: i18n.t('static.graph.inactiveProgram'),
    //   backgroundColor: '#cfcdc9',
    //   borderColor: 'rgba(255,99,132,1)',
    //   pointBackgroundColor: 'rgba(255,99,132,1)',
    //   pointBorderColor: '#fff',
    //   pointHoverBackgroundColor: '#fff',
    //   pointHoverBorderColor: 'rgba(255,99,132,1)',
    //   data: [28, 48, 40, 19, 96, 27, 100],
    // },
  ],

};



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

const mainChart = {
  labels: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  datasets: [
    {
      label: 'My First dataset',
      backgroundColor: hexToRgba(brandInfo, 10),
      borderColor: brandInfo,
      pointHoverBackgroundColor: '#fff',
      borderWidth: 2,
      data: data1,
    },
    {
      label: 'My Second dataset',
      backgroundColor: 'transparent',
      borderColor: brandSuccess,
      pointHoverBackgroundColor: '#fff',
      borderWidth: 2,
      data: data2,
    },
    {
      label: 'My Third dataset',
      backgroundColor: 'transparent',
      borderColor: brandDanger,
      pointHoverBackgroundColor: '#fff',
      borderWidth: 1,
      borderDash: [8, 5],
      data: data3,
    },
  ],
};




// let problemActionlist = [];
class ApplicationDashboard extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);
    this.hideFirstComponent = this.hideFirstComponent.bind(this);



    this.state = {
      id: this.props.match.params.id,
      dropdownOpen: false,
      radioSelected: 2,
      activeIndex: 0,
      activeIndexProgram: 0,
      problemActionList: [],
      programList: [],

      message: '',
      dashboard: '',
      users: [],
      lang: localStorage.getItem('lang'),
      openIssues: '',
      addressedIssues: ''
    };
    // this.state = {

    // };

    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.goToIndex = this.goToIndex.bind(this);
    this.goToIndexProgram = this.goToIndexProgram.bind(this);
    this.onExiting = this.onExiting.bind(this);
    this.onExited = this.onExited.bind(this);
    this.problemAction = this.problemAction.bind(this);
    this.rowClassNameFormat = this.rowClassNameFormat.bind(this);
    this.buttonFormatter = this.buttonFormatter.bind(this);
    this.addMapping = this.addMapping.bind(this);
    this.editProblem = this.editProblem.bind(this);
    this.nextProgramSlide = this.nextProgramSlide.bind(this);
    this.previousProgramSlide = this.previousProgramSlide.bind(this);
    this.getPrograms = this.getPrograms.bind(this);
    this.checkNewerVersions = this.checkNewerVersions.bind(this);
    this.updateState = this.updateState.bind(this);
  }

  rowClassNameFormat(row, rowIdx) {
    // row is whole row object
    // rowIdx is index of row
    // console.log('in rowClassNameFormat')
    // console.log(new Date(row.stopDate).getTime() < new Date().getTime())
    if (row.realmProblem.criticality.id == 3) {
      return row.realmProblem.criticality.id == 3 && row.problemStatus.id == 1 ? 'background-red' : '';
    } else if (row.realmProblem.criticality.id == 2) {
      return row.realmProblem.criticality.id == 2 && row.problemStatus.id == 1 ? 'background-orange' : '';
    } else {
      return row.realmProblem.criticality.id == 1 && row.problemStatus.id == 1 ? 'background-yellow' : '';
    }
  }

  problemAction(problemAction) {
    // console.log("actionUrl============>", problemAction.realmProblem.problem.actionUrl);
    this.props.history.push({
      pathname: `${problemAction.realmProblem.problem.actionUrl}`,
      // state: { budget }
    });
    // this.redirectToCrud = this.redirectToCrud.bind(this);
  }

  redirectToCrud = (url) => {
    this.props.history.push(url);
  }

  hideFirstComponent() {
    this.timeout = setTimeout(function () {
      document.getElementById('div1').style.display = 'none';
    }, 8000);
  }
  componentWillUnmount() {
    clearTimeout(this.timeout);
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
  checkNewerVersions(programs) {
    console.log("T***going to call check newer versions dashboard---", programs)
    if (isSiteOnline()) {
      // AuthenticationService.setupAxiosInterceptors()
      ProgramService.checkNewerVersions(programs)
        .then(response => {
          console.log("T***dashboard program response.data---", response.data);
          localStorage.removeItem("sesLatestProgram");
          localStorage.setItem("sesLatestProgram", response.data);
        })
    }
  }

  getPrograms() {
    // console.log("T***get programs called");
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
      this.setState({
        message: i18n.t('static.program.errortext'),
        color: 'red'
      })
      // if (this.props.updateState != undefined) {
      //     this.props.updateState(false);
      // }
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
          color: 'red',
          loading: false
        })
        // if (this.props.updateState != undefined) {
        //     this.props.updateState(false);
        // }
      }.bind(this);
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        var filteredGetRequestList = myResult.filter(c => c.userId == userId);
        for (var i = 0; i < filteredGetRequestList.length; i++) {

          // var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
          // var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
          // var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
          // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
          // var programJson1 = JSON.parse(programData);
          // console.log("programData---", programData);
          programList.push({
            openCount: filteredGetRequestList[i].openCount,
            addressedCount: filteredGetRequestList[i].addressedCount,
            programCode: filteredGetRequestList[i].programCode,
            programVersion: filteredGetRequestList[i].version,
            programId: filteredGetRequestList[i].programId,
            versionId: filteredGetRequestList[i].version,
            id: filteredGetRequestList[i].id,
            loading: false
          });
          // }
        }
        this.setState({
          programList: programList
        })
        // this.setState({
        //     programs: proList
        // })
        this.checkNewerVersions(programList);
        // if (this.props.updateState != undefined) {
        //     this.props.updateState(false);
        //     this.props.fetchData();
        // }
      }.bind(this);
    }.bind(this)

  }

  componentDidMount() {
    if (isSiteOnline()) {
      if (this.state.id == 1) {
        DashboardService.applicationLevelDashboard()
          .then(response => {
            console.log("dashboard response===", response);
            this.setState({
              dashboard: response.data
            })
          })
        DashboardService.applicationLevelDashboardUserList()
          .then(response => {
            console.log("users response===", response);
            this.setState({
              users: response.data
            })
          })
      }
      if (this.state.id == 2) {
        DashboardService.realmLevelDashboard(this.state.realmId)
          .then(response => {
            console.log("dashboard response===", response);
            this.setState({
              dashboard: response.data
            })
          })
        DashboardService.realmLevelDashboardUserList(this.state.realmId)
          .then(response => {
            console.log("users response===", response);
            this.setState({
              users: response.data
            })
          })
      }
    }
    this.getPrograms();
    DashboardService.openIssues()
      .then(response => {
        console.log("Customer Open Issues===", response);
        this.setState({
          openIssues: response.data.openIssues,
          addressedIssues: response.data.addressedIssues
        })
      })
    this.hideFirstComponent();
    console.log("====== in application dasboard =======");

    // var db1;
    // var storeOS;
    // console.log("time bfor getDataBase+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
    // getDatabase();
    // console.log("time after getDataBase+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
    // var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    // openRequest.onsuccess = function (e) {
    //   console.log("time for openRequestSuccess+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
    //   var programList = [];
    //   db1 = e.target.result;
    //   var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
    //   var program = transaction.objectStore('programQPLDetails');
    //   var getRequest = program.getAll();
    //   console.log("time for getAllprogram+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
    //   getRequest.onerror = function (event) {
    //     this.setState({
    //       // supplyPlanError: i18n.t('static.program.errortext')
    //     });

    //   };
    //   getRequest.onsuccess = function (event) {
    //     console.log("time taken for getRequestSuccess+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
    //     var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
    //     var userId = userBytes.toString(CryptoJS.enc.Utf8);
    //     console.log("time takem for userDecrypt+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
    //     // let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
    //     // let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
    //     // let username = decryptedUser.username;

    //     var filteredGetRequestList = getRequest.result.filter(c => c.userId == userId)
    //     for (var i = 0; i < filteredGetRequestList.length; i++) {
    //       // console.log("QPA 2=====>  in for =======>",getRequest.result[i].userId,"=====>",userId);
    //       // if (getRequest.result[i].userId == userId) {
    //       // var programDataBytes = CryptoJS.AES.decrypt(getRequest.result[i].programData, SECRET_KEY);
    //       // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
    //       // var programJson = JSON.parse(programData);
    //       // console.log("QPA 2====>", programJson);
    //       programList.push({
    //         openCount: filteredGetRequestList[i].openCount,
    //         addressedCount: filteredGetRequestList[i].addressedCount,
    //         programCode: filteredGetRequestList[i].programCode,
    //         programVersion: filteredGetRequestList[i].version
    //       });
    //       // programRequestList.push(getRequest.result[i]);
    //       // versionIDs.push(getRequest.result[i].version);
    //       // }

    //     }
    //     console.log("time taken to create program list+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
    //     console.log("program list in application dashboard+++", programList);
    //     this.setState({ programList: programList });
    //   }.bind(this)
    // }.bind(this)

    // var problemActionList = [];
    // var db1;
    // var storeOS;
    // getDatabase();
    // var openRequest = indexedDB.open(INDEXED_DB_NAME,INDEXED_DB_VERSION );
    // openRequest.onsuccess = function (e) {
    //   var realmId = AuthenticationService.getRealmId();
    //   var programList = [];
    //   db1 = e.target.result;
    //   var transaction = db1.transaction(['programData'], 'readwrite');
    //   var program = transaction.objectStore('programData');
    //   var getRequest = program.getAll();
    //   getRequest.onerror = function (event) {
    //     this.setState({
    //       supplyPlanError: i18n.t('static.program.errortext')
    //     })
    //   };
    //   getRequest.onsuccess = function (event) {
    //     qatProblemActions();
    //     var latestVersionProgramList = [];
    //     for (var i = 0; i < getRequest.result.length; i++) {
    //       var programDataBytes = CryptoJS.AES.decrypt(getRequest.result[i].programData, SECRET_KEY);
    //       var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
    //       var programJson = JSON.parse(programData);
    //       programList.push(programJson);

    //     }
    //     for (var d = 0; d < programList.length; d++) {
    //       var index = latestVersionProgramList.findIndex(c => c.programId == programList[d].programId);
    //       if (index == -1) {
    //         latestVersionProgramList.push(programList[d]);
    //       } else {
    //         var versionId = latestVersionProgramList[index].currentVersion.versionId;
    //         if (versionId < programList[d].currentVersion.versionId) {
    //           latestVersionProgramList[index] = programList[d];
    //         }
    //       }

    //     }
    //     programList = latestVersionProgramList;
    //     for (var pp = 0; pp < programList.length; pp++) {
    //       problemActionList = problemActionList.concat(programList[pp].problemReportList);
    //       // array1.concat(array2)
    //     }
    //     var filteredProblemActionList = problemActionList.filter(c => c.problemStatus.id == 1);
    //     this.setState({ problemActionList: filteredProblemActionList });
    //   }.bind(this);
    // }.bind(this);

  }


  onExiting() {
    this.animating = true;
  }

  onExited() {
    this.animating = false;
  }
  buttonFormatter(cell, row) {
    // console.log("-----------", cell);
    // <Button type="button" size="sm" color="success" onClick={(event) => this.addMapping(event, cell)} ><i className="fa fa-check"></i> Add</Button>
    return <Button type="button" size="sm" onClick={(event) => this.addMapping(event, cell)} color="info"><i className="fa fa-pencil"></i></Button>;
  }

  addMapping(event, cell) {
    console.log("-----cell------>>", cell);
    event.stopPropagation();
    this.props.history.push({
      // pathname: `/programProduct/addProgramProduct/${cell}`,
      // pathname: `/report/addProblem`,
      pathname: `${cell}`,
    });

  }

  editProblem(problem, index) {
    // let problemStatusId = document.getElementById('problemStatusId').value;
    // let problemTypeId = document.getElementById('problemTypeId').value;
    // this.props.history.push({
    //   pathname: `/report/editProblem/${problem.problemReportId}/ ${this.state.programId}/${problem.problemActionIndex}/${problemStatusId}/${problemTypeId}`,
    //   // state: { language }
    // });
    console.log("problem====>", problem);
    // 3_v2_uId_1
    var programId = problem.program.id + "_v" + problem.versionId + "_uId_1";
    console.log("programId=====>", programId);

    this.props.history.push({
      pathname: `/report/editProblem/${problem.problemReportId}/ ${programId}/${problem.problemActionIndex}/${problem.problemStatus.id}/${problem.problemType.id}`,
      // state: { language }
    });

  }

  next() {
    if (this.animating) return;
    const nextIndex = this.state.activeIndex === this.state.users.length - 1 ? 0 :
      this.state.activeIndex + 1;
    this.setState({ activeIndex: nextIndex });
  }

  previous() {
    if (this.animating) return;
    const nextIndex = this.state.activeIndex === 0 ? this.state.users.length - 1 :
      this.state.activeIndex - 1;
    this.setState({ activeIndex: nextIndex });
  }

  nextProgramSlide() {
    if (this.animating) return;
    const nextIndexProgram = this.state.activeIndexProgram === this.state.programList.length - 1 ? 0 :
      this.state.activeIndexProgram + 1;
    this.setState({ activeIndexProgram: nextIndexProgram });
  }

  previousProgramSlide() {
    if (this.animating) return;
    const nextIndexProgram = this.state.activeIndexProgram === 0 ? this.state.programList.length - 1 :
      this.state.activeIndexProgram - 1;
    this.setState({ activeIndexProgram: nextIndexProgram });
  }

  goToIndexProgram(newIndexProgram) {
    if (this.animating) return;
    this.setState({ activeIndexProgram: newIndexProgram });
  }

  goToIndex(newIndex) {
    if (this.animating) return;
    this.setState({ activeIndex: newIndex });
  }

  updateState(key, value) {
    console.log("key+++", key, "value+++", value);
    var programList = this.state.programList;
    var index = programList.findIndex(c => c.id == key);
    programList[index].loading = value;
    this.setState({
      'programList': programList
    })
  }

  getProblemListAfterCalculation(id) {

    this.updateState(id, true);
    // alert("hello");
    // let programId = id;
    if (id != 0) {
      this.refs.problemListChild.qatProblemActions(id, id, false);
    } else {
      this.updateState(id, false);
      // this.setState({
      //   message: i18n.t('static.common.selectProgram'), data: [],
      //   // loadingQPLArray: false
      // });
    }

  }

  loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>

  render() {
    const checkOnline = localStorage.getItem('sessionType');
    const { activeIndex } = this.state;
    const { activeIndexProgram } = this.state;
    // const { problemActionlist } = this.state;

    const { SearchBar, ClearSearchButton } = Search;
    const customTotal = (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        {i18n.t('static.common.result', { from, to, size })}
      </span>
    );


    const columns = [
      {
        dataField: 'program.programCode',
        text: i18n.t('static.program.program'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        // formatter: (cell, row) => {
        //   if (cell != null && cell != "") {
        //     return getLabelText(cell, this.state.lang);
        //   }
        // }
        // formatter: (cellContent, row) => {
        //   return (
        //     (row.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
        //   );
        // }
      },
      {
        dataField: 'versionId',
        text: i18n.t('static.program.versionId'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        // style: { width: '170px' },
      },
      {
        dataField: 'region.label',
        text: i18n.t('static.region.region'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: (cell, row) => {
          if (cell != null && cell != "") {
            return getLabelText(cell, this.state.lang);
          }
        }
      },
      {
        dataField: 'planningUnit.label',
        text: i18n.t('static.planningunit.planningunit'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: (cell, row) => {
          if (cell != null && cell != "") {
            return getLabelText(cell, this.state.lang);
          }
        }
      },
      {
        dataField: 'dt',
        text: i18n.t('static.report.month'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: (cell, row) => {
          if (cell != null && cell != "") {
            var modifiedDate = moment(cell).format('MMM-YY');
            return modifiedDate;
          }
        }
      },
      {
        dataField: 'realmProblem.problem.label',
        text: i18n.t('static.report.problemDescription'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: (cell, row) => {
          if (cell != null && cell != "") {
            return getLabelText(cell, this.state.lang);
          }
        }

      },

      // {
      //   dataField: 'isFound',
      //   text: 'Is Found',
      //   sort: true,
      //   align: 'center',
      //   headerAlign: 'center',
      //   // formatter: this.formatLabel
      // },
      {
        dataField: 'realmProblem.problem.actionLabel',
        text: i18n.t('static.report.suggession'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: (cell, row) => {
          if (cell != null && cell != "") {
            return getLabelText(cell, this.state.lang);
          }
        }
      },
      // {
      //   dataField: 'realmProblem.criticality.label',
      //   text: 'Criticality',
      //   sort: true,
      //   align: 'center',
      //   headerAlign: 'center',
      //   formatter: (cell, row) => {
      //     if (cell != null && cell != "") {
      //       return getLabelText(cell, this.state.lang);
      //     }
      //   }
      // },
      {
        dataField: 'problemStatus.label',
        text: i18n.t('static.report.problemStatus'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: (cell, row) => {
          if (cell != null && cell != "") {
            return getLabelText(cell, this.state.lang);
          }
        }
      },
      // {
      //   dataField: 'problem',
      //   text: 'Action',
      //   sort: true,
      //   align: 'center',
      //   headerAlign: 'center',
      //   formatter: this.buttonFormatter
      //   // formatter: (cell, row) => {
      //   //   if (cell != null && cell != "") {
      //   //     return getLabelText(cell, this.state.lang);
      //   //   }
      //   // }
      // },
      // {
      //   dataField: 'note',
      //   text: 'Note',
      //   sort: true,
      //   align: 'center',
      //   headerAlign: 'center'
      // }
      {
        dataField: 'realmProblem.problem.actionUrl',
        text: i18n.t('static.common.action'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.buttonFormatter
      }
    ];
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

    // const slides = items.map((item) => {

    // const items = [
    //   // {
    //   //   src: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1607923e7e2%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1607923e7e2%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.9296875%22%20y%3D%22217.75625%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
    //   //   //  altText: 'Image alt Text',
    //   //   header: 'TOTAL USERS',
    //   //   caption: '06'
    //   // },

    //   this.state.users.map(item1 => (
    //     {
    //       src: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1607923e7e2%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1607923e7e2%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.9296875%22%20y%3D%22217.75625%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
    //       //  altText: 'Image alt Text',
    //       header: item1.LABEL_EN,
    //       caption: item1.COUNT
    //     }
    //   ))

    // ];
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
              {/* <CarouselCaption captionHeader={item.LABEL_EN} captionText={item.COUNT} /> */}
              <CarouselCaption captionHeader={getLabelText(item.label, this.state.lang)} captionText={item.count} />
            </div>
          </div>
        </CarouselItem>
      );
    });

    // const programSlides = this.state.programList.map((item) => {
    //   // var numberOfProblemsOpen = item.problemReportList.filter(c => c.planningUnitActive != false && c.problemStatus.id == 1);
    //   // var numberOfProblemsAddressed = item.problemReportList.filter(c => c.planningUnitActive != false && c.problemStatus.id == 3);
    //   var numberOfProblemsOpen = item.openCount;
    //   var numberOfProblemsAddressed = item.addressedCount;
    //   return (
    //     <CarouselItem
    //       onExiting={this.onExiting}
    //       onExited={this.onExited}
    //       key={'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1607923e7e2%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1607923e7e2%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.9296875%22%20y%3D%22217.75625%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'}
    //     >

    //       <div className='carouselCont'>
    //         <div className='ImgCont'>
    //           <img width='100%' src={'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1607923e7e2%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1607923e7e2%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.9296875%22%20y%3D%22217.75625%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'} />
    //         </div>
    //         {/* <div className='TextCont'>
    //           <CarouselCaption captionHeader={item.programCode + "~v" + item.currentVersion.versionId} captionText={numberOfProblems.length} />
    //         </div> */}
    //         <div className='TextCont'>
    //           <CarouselCaption captionHeader={item.programCode + "~v" + item.programVersion} className='mb-5 pb-2 mt-2' />
    //           <CarouselCaption captionText={<p><div className="TextTittle ">{i18n.t("static.problemReport.open")}: {numberOfProblemsOpen}</div><div className="TextTittle pb-0">{i18n.t("static.problemReport.addressed")}: {numberOfProblemsAddressed}</div></p>} />
    //         </div>
    //       </div>
    //     </CarouselItem>
    //   );
    // });


    return (
      <div className="animated fadeIn">
        <QatProblemActionNew ref="problemListChild" updateState={this.updateState} fetchData={this.getPrograms} objectStore="programData" page="dashboard"></QatProblemActionNew>
        <AuthenticationServiceComponent history={this.props.history} message={(message) => {
          this.setState({ message: message })
        }} />
        <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message)}</h5>
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
                            {/* <i className="icon-settings"></i> */}
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
                        {/* <CarouselControl direction="prev" directionText="Previous" onClickHandler={this.previous} /> 
           <CarouselControl direction="next" directionText="Next" onClickHandler={this.next} />  */}
                      </Carousel>
                      <div className="chart-wrapper " >
                        {/* <Line data={cardChartData3} options={cardChartOpts3} height={70} /> */}
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
                            {/* <i className="icon-settings"></i> */}
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
                      {/* <Line data={cardChartData3} options={cardChartOpts3} height={70} /> */}
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
              {/* <Col xs="12" sm="6" lg="3">
              <Card className=" CardHeight">
                <CardBody className="box-p">
                  <div class="h1 text-muted text-left mb-2  ">
                    <i class="fa fa-calculator  icon-color"></i>

                    <ButtonGroup className="float-right">
                      <Dropdown id='card4' isOpen={this.state.card4} toggle={() => { this.setState({ card4: !this.state.card4 }); }}>
                        <DropdownToggle caret className="p-0" color="transparent">
                        </DropdownToggle>
                        <DropdownMenu right>
                          <DropdownItem onClick={() => this.redirectToCrud("/report/supplyPlanVersionAndReview")}>{i18n.t('static.dashboard.viewSupplyPlan')}</DropdownItem>

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
            </Col> */}
            </>
            // </Row>
          }
          {checkOnline === 'Online' && this.state.id == 2 &&
            // <Row className="mt-2">
            <>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="p-0">
                    <div class="h1 text-muted text-left mb-0 m-3">
                      <i class="cui-user icon-color"></i>
                      <ButtonGroup className="float-right BtnZindex">
                        <Dropdown id='card1' isOpen={this.state.card1} toggle={() => { this.setState({ card1: !this.state.card1 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                            {/* <i className="icon-settings"></i> */}
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
                        {/* <CarouselControl direction="prev" directionText="Previous" onClickHandler={this.previous} /> */}
                        {/* <CarouselControl direction="next" directionText="Next" onClickHandler={this.next} /> */}
                      </Carousel>
                      <div className="chart-wrapper " >
                        {/* <Line data={cardChartData3} options={cardChartOpts3} height={70} /> */}
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
                            {/* <i className="icon-settings"></i> */}
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
                      {/* <Line data={cardChartData3} options={cardChartOpts3} height={70} /> */}
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
                            {/* <i className="icon-settings"></i> */}
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
                      {/* <Line data={cardChartData3} options={cardChartOpts3} height={70} /> */}
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
                            {/* <i className="icon-settings"></i> */}
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
                      {/* <Line data={cardChartData3} options={cardChartOpts3} height={70} /> */}
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
                            <DropdownItem onClick={() => this.redirectToCrud("/program/listProgram")}>{i18n.t('static.list.listProgram')}</DropdownItem>


                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>

                    <div className="TextTittle ">{i18n.t('static.add.totalProgram')} </div>
                    <div className="text-count">{this.state.dashboard.PROGRAM_COUNT}</div>
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
                            <DropdownItem onClick={() => this.redirectToCrud("/program/programOnboarding")}>{i18n.t('static.dashboard.setupprogram')}</DropdownItem>
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
                    <div className="text-count">{this.state.dashboard.SUPPLY_PLAN_COUNT}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>





              {/* <Col xs="12" sm="6" lg="3">
          <Card className=" CardHeight">
            <CardBody className="box-p">
            <div class="h1 text-muted text-left mb-2  ">
              <i class="fa fa-language  icon-color"></i>
             <ButtonGroup className="float-right">
                <Dropdown id='card8' isOpen={this.state.card8} toggle={() => { this.setState({ card8: !this.state.card8 }); }}>
                <DropdownToggle caret className="p-0" color="transparent">
                  </DropdownToggle>
                  <DropdownMenu right>
                  <DropdownItem>Add Language</DropdownItem>
                    <DropdownItem>View Language</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </ButtonGroup>
            </div>
             
              <div className="TextTittle ">Language </div>
              <div className="text-count">04</div>
              <div className="chart-wrapper mt-4 pb-2" >
              </div>
            </CardBody>
          </Card>
        </Col>  */}

            </>
            // </Row>
          }
          {/* <Row className="mt-2"> */}
          {
            this.state.programList.length > 0 &&
            this.state.programList.map((item) => (
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    {/* <a href="javascript:void();" onClick={() => this.redirectToCrud("/report/problemList")} title={i18n.t('static.dashboard.qatProblemList')}>
                      </a> */}
                    <div style={{ display: item.loading ? "none" : "block" }}>
                      <div class="h1 text-muted text-left mb-2">
                        <i class="fa fa-list-alt icon-color"></i>
                        <ButtonGroup className="float-right BtnZindex">
                          <Dropdown id={item.id} isOpen={this.state[item.id]} toggle={() => { this.setState({ [item.id]: !this.state[item.id] }); }}>
                            <DropdownToggle caret className="p-0" color="transparent">
                            </DropdownToggle>
                            <DropdownMenu right>
                              <DropdownItem onClick={() => this.getProblemListAfterCalculation(item.id)}>{i18n.t('static.qpl.calculate')}</DropdownItem>
                              <DropdownItem onClick={() => this.redirectToCrud(`/report/problemList/1/` + item.id + "/false")}>{i18n.t('static.dashboard.qatProblemList')}</DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </ButtonGroup>
                        {/* <i class="fa fa-list-alt icon-color"></i> &nbsp;
                        <a href="javascript:void();" title="Recalculate" onClick={() => this.getProblemListAfterCalculation(item.id)}><i className="fa fa-refresh"></i></a> */}
                      </div>
                      <div className="TextTittle ">{item.programCode + "~v" + item.programVersion}</div>
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
                      {/* <i class="fa fa-question-circle icon-color"></i> */}
                      <i><img src={imageHelp} className="" style={{ width: '40px', height: '40px', marginTop: '-15px' }} /></i>
                      {/* <ButtonGroup className="float-right">
                      <Dropdown id='card7' isOpen={this.state.card7} toggle={() => { this.setState({ card7: !this.state.card7 }); }}>
                        <DropdownToggle caret className="p-0" color="transparent">
                        </DropdownToggle>
                        <DropdownMenu right>
                          <DropdownItem onClick={() => this.redirectToCrud("/report/supplyPlanVersionAndReview")}>{i18n.t('static.dashboard.viewSupplyPlan')}</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </ButtonGroup> */}
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
        {/* <Row className="mt-2">
          <Col md="12">
            <Card>
              <CardHeader className="text-center">QAT Problems</CardHeader>
              <CardBody>
                <ToolkitProvider
                  keyField="programId"
                  data={this.state.problemActionList}
                  columns={columns}
                  search={{ searchFormatted: true }}
                  hover
                  filter={filterFactory()}
                >
                  {
                    props => (
                      <div className="TableCust">
                        <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                          <SearchBar {...props.searchProps} />
                          <ClearSearchButton {...props.searchProps} />
                        </div>
                        <BootstrapTable hover rowClasses={this.rowClassNameFormat} striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                          pagination={paginationFactory(options)}
                          rowEvents={{
                            onClick: (e, row, rowIndex) => {
                              this.editProblem(row);
                            }
                          }}
                          {...props.baseProps}
                        />
                      </div>
                    )
                  }
                </ToolkitProvider>
              </CardBody>
            </Card>
          </Col>
        </Row> */}
        {/* <Row className="mt-2">
          <Col md="12">
            <Card> */}
        {/* <CardHeader className="text-center">
                <b className="count-text"> <i className="cui-people icons fa-fw"></i> &nbsp;Total Realms Count : <span className="count-clr">4</span></b>
                <div className="card-header-actions">
                <a className="card-header-action">
                  
                  </a>
                </div>
              </CardHeader> */}
        {/* <CardBody>
                <div className="chart-wrapper chart-graph">
                  <Bar data={bar} options={options} />
                </div>
              </CardBody> */}
        {/* </Card>
          </Col>
        </Row> */}
        {/* <Row>
        <Col md="8">
            <Card>
              <CardHeader>
              <b className="count-text"> <i className="cui-people icons fa-fw"></i> &nbsp;Total Realms Count : <span className="count-clr">98</span></b>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col xs="12" sm="12" md="12">
                   <Table hover responsive className="table-outline mb-0  d-sm-table">
                  <thead className="thead-light">
                  <tr>
                  <th>Total Realms</th>
                    <th>Program</th>
                    <th>Status</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>

                  <td>
                      <div>Realm Name 1</div>
                     
                    </td>
                 
                    <td>
                      <div>Program 1</div>
                     
                    </td>
                    
                    <td>
                      <div className="clearfix">
                        <div className="float-left">
                          <strong>50%</strong>
                        </div>
                        <div className="float-right">
                          <small className="text-muted">Active Program</small>
                        </div>
                      </div>
                      <Progress className="progress-xs" color="success" value="50" />
                    </td>
                   
                  </tr>
                  <tr>
                  <td>
                      <div>Realm Name 2</div>
                     
                    </td>
                 <td>
                   <div>Program 2</div>
                  
                 </td>
                 
                 <td>
                   <div className="clearfix">
                     <div className="float-left">
                       <strong>30%</strong>
                     </div>
                     <div className="float-right">
                       <small className="text-muted">Inactive Program</small>
                     </div>
                   </div>
                   <Progress className="progress-xs" color="secondary" value="30" />
                 </td>
                
               </tr>
               <tr>
               <td>
                      <div>Realm Name 3</div>
                     
                    </td>
                 <td>
                   <div>Program 3</div>
                  
                 </td>
                 
                 <td>
                   <div className="clearfix">
                     <div className="float-left">
                       <strong>30%</strong>
                     </div>
                     <div className="float-right">
                       <small className="text-muted">Active Program</small>
                     </div>
                   </div>
                   <Progress className="progress-xs" color="success" value="30" />
                 </td>
                
               </tr>
               <tr>
               <td>
                      <div>Realm Name 4</div>
                     
                    </td>
                    <td>
                      <div>Program 4</div>
                     
                    </td>
                    
                    <td>
                      <div className="clearfix">
                        <div className="float-left">
                          <strong>50%</strong>
                        </div>
                        <div className="float-right">
                          <small className="text-muted">Inactive Program</small>
                        </div>
                      </div>
                      <Progress className="progress-xs" color="secondary" value="50" />
                    </td>
                   
                  </tr>
         
                  </tbody>
                </Table>
                </Col>
                </Row>
                </CardBody>
                </Card>
                </Col>
                
        </Row> 
 */}

      </div>
    );
  }
}

export default ApplicationDashboard;
