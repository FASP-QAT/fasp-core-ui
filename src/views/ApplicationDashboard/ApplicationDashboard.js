import React, { Component, lazy, Suspense } from 'react';
import { qatProblemActions } from '../../CommonComponent/QatProblemActions';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import getLabelText from '../../CommonComponent/getLabelText';
import { DATE_FORMAT_CAP } from '../../Constants.js';
import moment from 'moment';
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

const items = [
  {
    src: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1607923e7e2%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1607923e7e2%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.9296875%22%20y%3D%22217.75625%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
    //  altText: 'Image alt Text',
    header: 'TOTAL USERS',
    caption: '06'
  },
  {
    src: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1607923e7e2%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1607923e7e2%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.9296875%22%20y%3D%22217.75625%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
    //  altText: 'Image alt Text',
    header: 'APPLICATION LEVEL ADMIN',
    caption: '02'
  },
  {
    src: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1607923e7e2%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1607923e7e2%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.9296875%22%20y%3D%22217.75625%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
    //  altText: 'Image alt Text',
    header: 'REALM LEVEL ADMIN',
    caption: '04'
  },

  {
    src: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1607923e7e2%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1607923e7e2%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.9296875%22%20y%3D%22217.75625%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
    //  altText: 'Image alt Text',
    header: 'PROGRAM LEVEL ADMIN',
    caption: '03'
  },

  {
    src: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1607923e7e2%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1607923e7e2%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.9296875%22%20y%3D%22217.75625%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
    //  altText: 'Image alt Text',
    header: 'PROGRAM USER',
    caption: '05'
  },
  {
    src: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1607923e7e2%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1607923e7e2%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.9296875%22%20y%3D%22217.75625%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
    //  altText: 'Image alt Text',
    header: 'SUPPLY PLAN REVIEWER',
    caption: '02'
  },

  {
    src: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1607923e7e2%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1607923e7e2%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.9296875%22%20y%3D%22217.75625%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
    //  altText: 'Image alt Text',
    header: 'GUEST USER',
    caption: '05'
  },
];


let problemActionlist = [];
class ApplicationDashboard extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);
    this.hideFirstComponent = this.hideFirstComponent.bind(this);

    this.state = {
      dropdownOpen: false,
      radioSelected: 2,

    };
    this.state = {
      activeIndex: 0,
      // problemActionlist: []
    };

    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.goToIndex = this.goToIndex.bind(this);
    this.onExiting = this.onExiting.bind(this);
    this.onExited = this.onExited.bind(this);
    this.problemAction = this.problemAction.bind(this);
    this.rowClassNameFormat = this.rowClassNameFormat.bind(this);
  }

  rowClassNameFormat(row, rowIdx) {
    // row is whole row object
    // rowIdx is index of row
    // console.log('in rowClassNameFormat')
    // console.log(new Date(row.stopDate).getTime() < new Date().getTime())
    if (row.criticality.id == 3) {
      return row.criticality.id == 3 && row.isFound == 1 ? 'background-red' : '';
    } else if (row.criticality.id == 2) {
      return row.criticality.id == 2 && row.isFound == 1 ? 'background-orange' : '';
    } else {
      return row.criticality.id == 1 && row.isFound == 1 ? 'background-yellow' : '';
    }
  }

  problemAction(problemAction) {
    console.log("actionUrl============>", problemAction.actionUrl);
    this.props.history.push({
      pathname: `${problemAction.actionUrl}`,
      // state: { budget }
    });
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

    this.hideFirstComponent();
    console.log("====== in application dasboard =======");

    problemActionlist = qatProblemActions();
    console.log("problemActionlist ==========", problemActionlist);

  }


  onExiting() {
    this.animating = true;
  }

  onExited() {
    this.animating = false;
  }

  next() {
    if (this.animating) return;
    const nextIndex = this.state.activeIndex === items.length - 1 ? 0 :
      this.state.activeIndex + 1;
    this.setState({ activeIndex: nextIndex });
  }

  previous() {
    if (this.animating) return;
    const nextIndex = this.state.activeIndex === 0 ? items.length - 1 :
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
        dataField: 'program.label',
        text: 'Program',
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: (cell, row) => {
          if (cell != null && cell != "") {
            return getLabelText(cell, this.state.lang);
          }
        }
        // formatter: (cellContent, row) => {
        //   return (
        //     (row.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
        //   );
        // }
      },
      {
        dataField: 'region.label',
        text: 'Region',
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
        text: 'Planning Unit ',
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
        dataField: 'problemId',
        text: 'Problem Id',
        sort: true,
        align: 'center',
        headerAlign: 'center'
      },
      {
        dataField: 'month',
        text: 'Month',
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: (cell, row) => {
          if (cell != null && cell != "") {
            var modifiedDate = moment(cell).format(`${DATE_FORMAT_CAP}`);
            return modifiedDate;
          }
        }
      },
      {
        dataField: 'isFound',
        text: 'Is Found',
        sort: true,
        align: 'center',
        headerAlign: 'center',
        // formatter: this.formatLabel
      },
      {
        dataField: 'actionName.label',
        text: 'Action',
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
        dataField: 'criticality.label',
        text: 'Criticality',
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
        dataField: 'problemStatus.label',
        text: 'HQ Review Status',
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
        dataField: 'note',
        text: 'HQ Note',
        sort: true,
        align: 'center',
        headerAlign: 'center'
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
        text: 'All', value: problemActionlist.length
      }]
    }

    const slides = items.map((item) => {

      return (
        <CarouselItem
          onExiting={this.onExiting}
          onExited={this.onExited}
          key={item.src}
        >

          <div className='carouselCont'>
            <div className='ImgCont'>
              <img width='100%' src={item.src} />
            </div>
            <div className='TextCont'>
              <CarouselCaption captionHeader={item.header} captionText={item.caption} />
            </div>
          </div>
        </CarouselItem>
      );
    });


    return (
      <div className="animated fadeIn">
        <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message)}</h5>
        <Row className="mt-2">
          <Col xs="12" sm="6" lg="3">
            <Card className=" CardHeight">
              <CardBody className="p-0">
                <div class="h1 text-muted text-left mb-0 m-3">
                  <i class="icon-people icon-color"></i>
                  <ButtonGroup className="float-right BtnZindex">
                    <Dropdown id='card1' isOpen={this.state.card1} toggle={() => { this.setState({ card1: !this.state.card1 }); }}>
                      <DropdownToggle caret className="p-0" color="transparent">
                        {/* <i className="icon-settings"></i> */}
                      </DropdownToggle>
                      <DropdownMenu right>
                        <DropdownItem>View User</DropdownItem>
                        <DropdownItem>Add User</DropdownItem>

                      </DropdownMenu>
                    </Dropdown>
                  </ButtonGroup>
                  <Carousel className='trustedMechCarousel' defaultWait={1000} activeIndex={activeIndex} next={this.next} previous={this.previous} ride="carousel">
                    <CarouselIndicators items={items} activeIndex={activeIndex} onClickHandler={this.goToIndex} />
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
                  <i class="icon-grid icon-color"></i>

                  <ButtonGroup className="float-right BtnZindex">
                    <Dropdown id='card2' isOpen={this.state.card2} toggle={() => { this.setState({ card2: !this.state.card2 }); }}>
                      <DropdownToggle caret className="p-0" color="transparent">
                        {/* <i className="icon-settings"></i> */}
                      </DropdownToggle>
                      <DropdownMenu right>
                        <DropdownItem>Realm List</DropdownItem>
                        <DropdownItem>Add Realm</DropdownItem>

                      </DropdownMenu>
                    </Dropdown>
                  </ButtonGroup>
                </div>

                <div className="TextTittle ">TOTAL REALMS </div>
                <div className="text-count">03</div>
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
                        <DropdownItem>Add Language</DropdownItem>
                        <DropdownItem>View Language</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </ButtonGroup>
                </div>

                <div className="TextTittle ">Languages </div>
                <div className="text-count">04</div>
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
                        <DropdownItem>View Supply Plans Waiting for Approval</DropdownItem>

                      </DropdownMenu>
                    </Dropdown>
                  </ButtonGroup>
                </div>

                <div className="TextTittle ">Supply Plans Waiting for Approval </div>
                <div className="text-count">05</div>
                <div className="chart-wrapper mt-4 pb-2" >
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col md="12">
            <Card>
              <CardHeader className="text-center">QAT Program Problems And Actions</CardHeader>
              <CardBody>
                <ToolkitProvider
                  keyField="programId"
                  data={problemActionlist}
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
                              this.problemAction(row);
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
        </Row>
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
