import React, { Component, lazy, Suspense } from 'react';

import { SECRET_KEY } from '../../Constants';
import CryptoJS from 'crypto-js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import AuthenticationService from '../../views/Common/AuthenticationService';

import { qatProblemActions } from '../../CommonComponent/QatProblemActions';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import getLabelText from '../../CommonComponent/getLabelText';
import { DATE_FORMAT_CAP } from '../../Constants.js';
import moment from 'moment';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { Online, Offline } from "react-detect-offline";
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
import paginationFactory from 'react-bootstrap-table2-paginator';
import BootstrapTable from 'react-bootstrap-table-next';
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
        labelString: 'Program Count'
      }
    }],
    xAxes: [{
      scaleLabel: {
        display: true,
        labelString: 'Realm'
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
      problemActionList: [],

      message: '',
      dashboard: '',
      users: []
    };
    // this.state = {

    // };

    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.goToIndex = this.goToIndex.bind(this);
    this.onExiting = this.onExiting.bind(this);
    this.onExited = this.onExited.bind(this);
    this.problemAction = this.problemAction.bind(this);
    this.rowClassNameFormat = this.rowClassNameFormat.bind(this);
    this.buttonFormatter = this.buttonFormatter.bind(this);
    this.addMapping = this.addMapping.bind(this);
    this.editProblem = this.editProblem.bind(this);
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
    setTimeout(function () {
      document.getElementById('div1').style.display = 'none';
    }, 8000);
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
  componentDidMount() {
    if (navigator.onLine) {
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
    this.hideFirstComponent();
    console.log("====== in application dasboard =======");

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

  goToIndex(newIndex) {
    if (this.animating) return;
    this.setState({ activeIndex: newIndex });
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  render() {
    const { activeIndex } = this.state;
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
        text: 'Suggestion',
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
              <CarouselCaption captionHeader={item.LABEL_EN} captionText={item.COUNT} />
            </div>
          </div>
        </CarouselItem>
      );
    });


    return (
      <div className="animated fadeIn">
        <AuthenticationServiceComponent history={this.props.history} message={(message) => {
          this.setState({ message: message })
        }} />
        <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message)}</h5>
        <Online>
          {this.state.id == 1 &&
            <Row className="mt-2">

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
                            <DropdownItem onClick={() => this.redirectToCrud("/user/listUser")}>List Users</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/user/addUser")}>Add User</DropdownItem>

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
                            <DropdownItem onClick={() => this.redirectToCrud("/realm/listRealm")}>List Realms</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/realm/addrealm")}>Add Realm</DropdownItem>

                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>

                    <div className="TextTittle ">TOTAL REALMS </div>
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
                            <DropdownItem onClick={() => this.redirectToCrud("/language/listLanguage")}>List Languages</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/language/addLanguage")}>Add Language</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>

                    <div className="TextTittle ">Languages </div>
                    <div className="text-count">{this.state.dashboard.LANGUAGE_COUNT}</div>
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
                        <Dropdown id='card4' isOpen={this.state.card4} toggle={() => { this.setState({ card4: !this.state.card4 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud("/report/supplyPlanVersionAndReview")}>View Supply Plans Waiting for Approval</DropdownItem>

                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>

                    <div className="TextTittle ">Supply Plans Waiting for Approval </div>
                    <div className="text-count">{this.state.dashboard.SUPPLY_PLAN_COUNT}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>

            </Row>
          }
          {this.state.id == 2 &&
            <Row className="mt-2">
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
                            <DropdownItem onClick={() => this.redirectToCrud("/user/listUser")}>List Users</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/user/addUser")}>Add User</DropdownItem>

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
                            <DropdownItem onClick={() => this.redirectToCrud("/country/listCountry")}>List Countries</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/country/addCountry")}>Add Country</DropdownItem>

                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>

                    <div className="TextTittle ">Country </div>
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
                            <DropdownItem onClick={() => this.redirectToCrud("/healthArea/listHealthArea")}>List Technical Areas</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/healthArea/addHealthArea")}>Add Technical Area</DropdownItem>

                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>

                    <div className="TextTittle ">Technical Area </div>
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
                            <DropdownItem onClick={() => this.redirectToCrud("/realmCountry/listRealmCountry")}>List Regions</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/realmCountry/listRealmCountry")}>Add Region</DropdownItem>

                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>

                    <div className="TextTittle ">Region </div>
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
                            <DropdownItem onClick={() => this.redirectToCrud("/organisation/listOrganisation")}>List Organisations</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/organisation/addOrganisation")}>Add Organisation</DropdownItem>

                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>

                    <div className="TextTittle ">Organisation </div>
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
                            <DropdownItem onClick={() => this.redirectToCrud("/program/listProgram")}>List Programs</DropdownItem>


                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>

                    <div className="TextTittle ">Total Programs </div>
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
                            <DropdownItem onClick={() => this.redirectToCrud("/program/programOnboarding")}>Setup Program</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>

                    <div className="TextTittle ">Setup Program </div>
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
                            <DropdownItem onClick={() => this.redirectToCrud("/report/supplyPlanVersionAndReview")}>View Supply Plans Waiting for Approval</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>

                    <div className="TextTittle ">Supply Plans waiting for Approval </div>
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


            </Row>
          }
        </Online>
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
