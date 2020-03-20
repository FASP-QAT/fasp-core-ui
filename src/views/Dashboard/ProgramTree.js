import React, { Component, lazy, Suspense } from 'react';
import { Bar, Line } from 'react-chartjs-2';

import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  ButtonDropdown,
  CardHeader,
  Col,
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Fade,
  Form,
  FormGroup,
  FormText,
  FormFeedback,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButtonDropdown,
  InputGroupText,
  Label,
  Row,
} from 'reactstrap';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { getStyle, hexToRgba } from '@coreui/coreui-pro/dist/js/coreui-utilities'

const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));

const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')

// Card Chart 1
const cardChartData1 = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'My First dataset',
      backgroundColor: brandPrimary,
      borderColor: 'rgba(255,255,255,.55)',
      data: [65, 59, 84, 84, 51, 55, 40],
    },
  ],
};

const cardChartOpts1 = {
  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        gridLines: {
          color: 'transparent',
          zeroLineColor: 'transparent',
        },
        ticks: {
          fontSize: 2,
          fontColor: 'transparent',
        },

      }],
    yAxes: [
      {
        display: false,
        ticks: {
          display: false,
          min: Math.min.apply(Math, cardChartData1.datasets[0].data) - 5,
          max: Math.max.apply(Math, cardChartData1.datasets[0].data) + 5,
        },
      }],
  },
  elements: {
    line: {
      borderWidth: 1,
    },
    point: {
      radius: 4,
      hitRadius: 10,
      hoverRadius: 4,
    },
  }
}


// Card Chart 2
const cardChartData2 = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'My First dataset',
      backgroundColor: brandInfo,
      borderColor: 'rgba(255,255,255,.55)',
      data: [1, 18, 9, 17, 34, 22, 11],
    },
  ],
};

const cardChartOpts2 = {
  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        gridLines: {
          color: 'transparent',
          zeroLineColor: 'transparent',
        },
        ticks: {
          fontSize: 2,
          fontColor: 'transparent',
        },

      }],
    yAxes: [
      {
        display: false,
        ticks: {
          display: false,
          min: Math.min.apply(Math, cardChartData2.datasets[0].data) - 5,
          max: Math.max.apply(Math, cardChartData2.datasets[0].data) + 5,
        },
      }],
  },
  elements: {
    line: {
      tension: 0.00001,
      borderWidth: 1,
    },
    point: {
      radius: 4,
      hitRadius: 10,
      hoverRadius: 4,
    },
  },
};

// Card Chart 3
const cardChartData3 = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'My First dataset',
      backgroundColor: 'rgba(255,255,255,.2)',
      borderColor: 'rgba(255,255,255,.55)',
      data: [78, 81, 80, 45, 34, 12, 40],
    },
  ],
};

const cardChartOpts3 = {
  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        display: false,
      }],
    yAxes: [
      {
        display: false,
      }],
  },
  elements: {
    line: {
      borderWidth: 2,
    },
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 4,
    },
  },
};

// Card Chart 4
const cardChartData4 = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April'],
  datasets: [
    {
      label: 'My First dataset',
      backgroundColor: 'rgba(255,255,255,.3)',
      borderColor: 'transparent',
      data: [78, 81, 80, 45, 34, 12, 40, 75, 34, 89, 32, 68, 54, 72, 18, 98],
    },
  ],
};

const cardChartOpts4 = {
  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        display: false,
        barPercentage: 0.6,
      }],
    yAxes: [
      {
        display: false,
      }],
  },
};

// Social Box Chart
const socialBoxData = [
  { data: [65, 59, 84, 84, 51, 55, 40], label: 'facebook' },
  { data: [1, 13, 9, 17, 34, 41, 38], label: 'twitter' },
  { data: [78, 81, 80, 45, 34, 12, 40], label: 'linkedin' },
  { data: [35, 23, 56, 22, 97, 23, 64], label: 'google' },
];

const makeSocialBoxData = (dataSetNo) => {
  const dataset = socialBoxData[dataSetNo];
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        backgroundColor: 'rgba(255,255,255,.1)',
        borderColor: 'rgba(255,255,255,.55)',
        pointHoverBackgroundColor: '#fff',
        borderWidth: 2,
        data: dataset.data,
        label: dataset.label,
      },
    ],
  };
  return () => data;
};

const socialChartOpts = {
  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  responsive: true,
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        display: false,
      }],
    yAxes: [
      {
        display: false,
      }],
  },
  elements: {
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 4,
      hoverBorderWidth: 3,
    },
  },
};

// sparkline charts
const sparkLineChartData = [
  {
    data: [35, 23, 56, 22, 97, 23, 64],
    label: 'New Clients',
  },
  {
    data: [65, 59, 84, 84, 51, 55, 40],
    label: 'Recurring Clients',
  },
  {
    data: [35, 23, 56, 22, 97, 23, 64],
    label: 'Pageviews',
  },
  {
    data: [65, 59, 84, 84, 51, 55, 40],
    label: 'Organic',
  },
  {
    data: [78, 81, 80, 45, 34, 12, 40],
    label: 'CTR',
  },
  {
    data: [1, 13, 9, 17, 34, 41, 38],
    label: 'Bounce Rate',
  },
];

const makeSparkLineData = (dataSetNo, variant) => {
  const dataset = sparkLineChartData[dataSetNo];
  const data = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        backgroundColor: 'transparent',
        borderColor: variant ? variant : '#c2cfd6',
        data: dataset.data,
        label: dataset.label,
      },
    ],
  };
  return () => data;
};

const sparklineChartOpts = {
  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    xAxes: [
      {
        display: false,
      }],
    yAxes: [
      {
        display: false,
      }],
  },
  elements: {
    line: {
      borderWidth: 2,
    },
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 4,
      hoverBorderWidth: 3,
    },
  },
  legend: {
    display: false,
  },
};

// Main Chart

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

const mainChartOpts = {
  tooltips: {
    enabled: false,
    custom: CustomTooltips,
    intersect: true,
    mode: 'index',
    position: 'nearest',
    callbacks: {
      labelColor: function (tooltipItem, chart) {
        return { backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].borderColor }
      }
    }
  },
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        gridLines: {
          drawOnChartArea: false,
        },
      }],
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
          maxTicksLimit: 5,
          stepSize: Math.ceil(250 / 5),
          max: 250,
        },
      }],
  },
  elements: {
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 4,
      hoverBorderWidth: 3,
    },
  },
};

class Program extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

    this.state = {
      dropdownOpen: false,
      radioSelected: 2,
    };
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

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  render() {

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12" sm="12">
            <Card>
              <CardHeader>
                <strong>Program</strong>
              </CardHeader>
              <CardBody>
                <div className="table-responsive">
                  <ul className="tree">
                    <li>
                      <input type="checkbox" id="c1" />
                      <label className="tree_label" htmlFor="c1">Program</label>
                      <ul>
                        <li>
                          <input type="checkbox" defaultChecked id="c1-1" />
                          <label htmlFor="c1-1" className="tree_label">Kenya</label>
                          <ul>
                            <li>
                              <input type="checkbox" defaultChecked id="c1-11" />
                              <label htmlFor="c1-11" className="tree_label">Family Planning</label>
                              <ul>
                                <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_1.0" defaultChecked />
                                      <label htmlFor="checkbox_1.0">Kenya-FamilyPlanning-MOH<i className="ml-1 fa fa-eye"></i></label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="fpm" defaultChecked />
                                <label className="arrow_label" htmlFor="fpm"></label>

                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="kf-v1" />
                                          <label htmlFor="kf-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="kf-v2" />
                                        <label htmlFor="kf-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="kf-v3" />
                                        <label htmlFor="kf-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_2.0"  />
                                      <label htmlFor="checkbox_2.0">Kenya-FamilyPlanning-SoialMedia-A</label>

                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="ksa" defaultChecked />
                                <label className="arrow_label" htmlFor="ksa"></label>
                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="kfsa-v1" />
                                          <label htmlFor="kfsa-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="kfsa-v2" />
                                        <label htmlFor="kfsa-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="kfsa-v3" />
                                        <label htmlFor="kfsa-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_3.0"  />
                                      <label htmlFor="checkbox_3.0">Kenya-FamilyPlanning-SoialMedia-B</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="ksb" defaultChecked />
                                <label className="arrow_label" htmlFor="ksb"></label>

                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="kfsbsa-v1" />
                                          <label htmlFor="kfsbsa-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="kfsbsa-v2" />
                                        <label htmlFor="kfsbsa-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="kfsbsa-v3" />
                                        <label htmlFor="kfsbsa-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              
                              
                              </ul>
                            </li>

                            <li>
                              <input type="checkbox" defaultChecked id="c1-12" />
                              <label htmlFor="c1-12" className="tree_label">Malaria</label>
                              <ul>
                                <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_4.0"  />
                                      <label htmlFor="checkbox_4.0">Kenya-Malaria-MOH</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="kmm" defaultChecked />
                                <label className="arrow_label" htmlFor="kmm"></label>
                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="km-v1" />
                                          <label htmlFor="km-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="km-v2" />
                                        <label htmlFor="km-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="km-v3" />
                                        <label htmlFor="km-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_5.0"  />
                                      <label htmlFor="checkbox_5.0">Kenya-Malaria-SoialMedia-A</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="kmsa" defaultChecked />
                                <label className="arrow_label" htmlFor="kmsa"></label>
                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="kmsa-v1" />
                                          <label htmlFor="kmsa-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="kmsa-v2" />
                                        <label htmlFor="kmsa-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="kmsa-v3" />
                                        <label htmlFor="kmsa-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_6.0"  />
                                      <label htmlFor="checkbox_6.0">Kenya-Malaria-SoialMedia-B</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="kmsb" defaultChecked />
                                <label className="arrow_label" htmlFor="kmsb"></label>

                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="kmsb-v1" />
                                          <label htmlFor="kmsb-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="kmsb-v2" />
                                        <label htmlFor="kmsb-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="kmsb-v3" />
                                        <label htmlFor="kmsb-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              
                              
                              </ul>
                            </li>

                            <li>
                              <input type="checkbox" defaultChecked id="c1-13" />
                              <label htmlFor="c1-13" className="tree_label">TB</label>
                              <ul>
                                <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_7.0"  />
                                      <label htmlFor="checkbox_7.0">Kenya-TB-MOH</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="ktm" defaultChecked />
                                <label className="arrow_label" htmlFor="ktm"></label>
                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="kt-v1" />
                                          <label htmlFor="kt-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="kt-v2" />
                                        <label htmlFor="kt-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="kt-v3" />
                                        <label htmlFor="kt-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_8.0"  />
                                      <label htmlFor="checkbox_8.0">Kenya-TB-Social-Media-A</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="kta" defaultChecked />
                                <label className="arrow_label" htmlFor="kta"></label>
                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="ktsa-v1" />
                                          <label htmlFor="ktsa-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="ktsa-v2" />
                                        <label htmlFor="ktsa-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="ktsa-v3" />
                                        <label htmlFor="ktsa-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_9.0"  />
                                      <label htmlFor="checkbox_9.0">Kenya-TB-Social-Media-B</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="ktb" defaultChecked />
                                <label className="arrow_label" htmlFor="ktb"></label>
                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="ktsb-v1" />
                                          <label htmlFor="ktsb-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="ktsb-v2" />
                                        <label htmlFor="ktsb-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="ktsb-v3" />
                                        <label htmlFor="ktsb-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              
                              
                              </ul>
                            </li>


                          </ul>
                        </li>
                        <li>
                          <input type="checkbox" defaultChecked id="c1-2" />
                          <label htmlFor="c1-2" className="tree_label">Rwanda</label>
                          <ul>
                            <li>
                              <input type="checkbox" defaultChecked id="c1-14" />
                              <label htmlFor="c1-14" className="tree_label">Family Planning</label>
                              <ul>
                                <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_10.0"  />
                                      <label htmlFor="checkbox_10.0">Rwanda-FamilyPlanning-MOH</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="rpm" defaultChecked />
                                <label className="arrow_label" htmlFor="rpm"></label>

                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="rf-v1" />
                                          <label htmlFor="rf-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="rf-v2" />
                                        <label htmlFor="rf-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="rf-v3" />
                                        <label htmlFor="rf-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_11.0"  />
                                      <label htmlFor="checkbox_11.0">Rwanda-FamilyPlanning-SoialMedia-A</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="rfsa" defaultChecked />
                                <label className="arrow_label" htmlFor="rfsa"></label>

                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="rfsa-v1" />
                                          <label htmlFor="rfsa-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="rfsa-v2" />
                                        <label htmlFor="rfsa-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="rfsa-v3" />
                                        <label htmlFor="rfsa-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_12.0"  />
                                      <label htmlFor="checkbox_12.0">Rwanda-FamilyPlanning-SoialMedia-B</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="rfsb" defaultChecked />
                                <label className="arrow_label" htmlFor="rfsb"></label>
                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="rfsb-v1" />
                                          <label htmlFor="rfsb-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="rfsb-v2" />
                                        <label htmlFor="rfsb-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="rfsb-v3" />
                                        <label htmlFor="rfsb-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              
                              
                              </ul>
                            </li>

                            <li>
                              <input type="checkbox" defaultChecked id="c1-15" />
                              <label htmlFor="c1-15" className="tree_label">Malaria</label>
                              <ul>
                                <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_13.0"  />
                                      <label htmlFor="checkbox_4.0">Rwanda-Malaria-MOH</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="rmm" defaultChecked />
                                <label className="arrow_label" htmlFor="rmm"></label>

                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="rm-v1" />
                                          <label htmlFor="rm-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="rm-v2" />
                                        <label htmlFor="rm-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="rm-v3" />
                                        <label htmlFor="rm-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_14.0"  />
                                      <label htmlFor="checkbox_14.0">Rwanda-Malaria-SoialMedia-A</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="rsa" defaultChecked />
                                <label className="arrow_label" htmlFor="rsa"></label>
                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="rmsa-v1" />
                                          <label htmlFor="rmsa-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="rmsa-v2" />
                                        <label htmlFor="rmsa-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="rmsa-v3" />
                                        <label htmlFor="rmsa-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_15.0"  />
                                      <label htmlFor="checkbox_15.0">Rwanda-Malaria-SoialMedia-B</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="rsb" defaultChecked />
                                <label className="arrow_label" htmlFor="rsb"></label>
                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="rmsb-v1" />
                                          <label htmlFor="rmsb-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="rmsb-v2" />
                                        <label htmlFor="rmsb-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="rmsb-v3" />
                                        <label htmlFor="rmsb-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              
                              
                              </ul>
                            </li>

                            <li>
                              <input type="checkbox" defaultChecked id="c1-16" />
                              <label htmlFor="c1-16" className="tree_label">TB</label>
                              <ul>
                                <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_16.0"  />
                                      <label htmlFor="checkbox_16.0">Rwanda-TB-MOH</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="rtm" defaultChecked />
                                <label className="arrow_label" htmlFor="rtm"></label>
                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="rt-v1" />
                                          <label htmlFor="rt-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="rt-v2" />
                                        <label htmlFor="rt-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="rt-v3" />
                                        <label htmlFor="rt-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_17.0"  />
                                      <label htmlFor="checkbox_17.0">Rwanda-TB-Social Mdia-A</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="rta" defaultChecked />
                                <label className="arrow_label" htmlFor="rta"></label>
                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="rtsa-v1" />
                                          <label htmlFor="rtsa-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="rtsa-v2" />
                                        <label htmlFor="rtsa-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="rtsa-v3" />
                                        <label htmlFor="rtsa-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_18.0"  />
                                      <label htmlFor="checkbox_18.0">Rwanda-TB-Social Mdia-B</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="rtb" defaultChecked />
                                <label className="arrow_label" htmlFor="rtb"></label>

                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="rtsb-v1" />
                                          <label htmlFor="rtsb-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="rtsb-v2" />
                                        <label htmlFor="rtsb-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="rtsb-v3" />
                                        <label htmlFor="rtsb-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              
                              
                              </ul>
                            </li>


                          </ul>
                        </li>


                        <li>
                          <input type="checkbox" defaultChecked id="c1-3" />
                          <label htmlFor="c1-3" className="tree_label">Malavi</label>
                          <ul>
                            <li>
                              <input type="checkbox" defaultChecked id="c1-17" />
                              <label htmlFor="c1-17" className="tree_label">Family Planning</label>
                              <ul>
                                <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_19.0"  />
                                      <label htmlFor="checkbox_19.0">Malavi-FamilyPlanning-MOH</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="mpm" defaultChecked />
                                <label className="arrow_label" htmlFor="mpm"></label>

                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="mf-v1" />
                                          <label htmlFor="mf-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="mf-v2" />
                                        <label htmlFor="mf-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="mf-v3" />
                                        <label htmlFor="mf-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_20.0"  />
                                      <label htmlFor="checkbox_20.0">Malavi-FamilyPlanning-SoialMedia-A</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="msa" defaultChecked />
                                <label className="arrow_label" htmlFor="msa"></label>

                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="mfsa-v1" />
                                          <label htmlFor="mfsa-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="mfsa-v2" />
                                        <label htmlFor="mfsa-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="mfsa-v3" />
                                        <label htmlFor="mfsa-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_21.0"  />
                                      <label htmlFor="checkbox_21.0">Malavi-FamilyPlanning-SoialMedia-B</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="msb" defaultChecked />
                                <label className="arrow_label" htmlFor="msb"></label>
                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="mfsb-v1" />
                                          <label htmlFor="mfsb-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="mfsb-v2" />
                                        <label htmlFor="mfsb-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="mfsb-v3" />
                                        <label htmlFor="mfsb-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              
                              
                              </ul>
                            </li>

                            <li>
                              <input type="checkbox" defaultChecked id="c1-18" />
                              <label htmlFor="c1-18" className="tree_label">Malaria</label>
                              <ul>
                                <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_22.0"  />
                                      <label htmlFor="checkbox_22.0">Malavi-Malaria-MOH</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="mmm" defaultChecked />
                                <label className="arrow_label" htmlFor="mmm"></label>
                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="mm-v1" />
                                          <label htmlFor="mm-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="mm-v2" />
                                        <label htmlFor="mm-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="mm-v3" />
                                        <label htmlFor="mm-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_23.0"  />
                                      <label htmlFor="checkbox_23.0">Malavi-Malaria-Social-Media-A</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="mma" defaultChecked />
                                <label className="arrow_label" htmlFor="mma"></label>

                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="mmsa-v1" />
                                          <label htmlFor="mmsa-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="mmsa-v2" />
                                        <label htmlFor="mmsa-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="mmsa-v3" />
                                        <label htmlFor="mmsa-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_24.0"  />
                                      <label htmlFor="checkbox_24.0">Malavi-Malaria-Social-Media-B</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="mmb" defaultChecked />
                                <label className="arrow_label" htmlFor="mmb"></label>

                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="mmsb-v1" />
                                          <label htmlFor="mmsb-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="mmsb-v2" />
                                        <label htmlFor="mmsb-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="mmsb-v3" />
                                        <label htmlFor="mmsb-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>

                                
                              </li>
                              
                              
                              </ul>
                            </li>

                            <li>
                              <input type="checkbox" defaultChecked id="c1-19" />
                              <label htmlFor="c1-19" className="tree_label">TB</label>
                              <ul>
                                <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_25.0"  />
                                      <label htmlFor="checkbox_25.0">Malavi-TB-MOH</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="mtm" defaultChecked />
                                <label className="arrow_label" htmlFor="mtm"></label>
                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="mt-v1" />
                                          <label htmlFor="mt-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="mt-v2" />
                                        <label htmlFor="mt-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="mt-v3" />
                                        <label htmlFor="mt-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_26.0"  />
                                      <label htmlFor="checkbox_26.0">Malavi-TB-A</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="mta" defaultChecked />
                                <label className="arrow_label" htmlFor="mta"></label>
                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="mtsa-v1" />
                                          <label htmlFor="mtsa-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="mtsa-v2" />
                                        <label htmlFor="mtsa-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="mtsa-v3" />
                                        <label htmlFor="mtsa-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              <li>
                                <span className="tree_label">
                                  <span className="">
                                    <div className="checkbox m-0">
                                      <input type="checkbox" id="checkbox_27.0"  />
                                      <label htmlFor="checkbox_27.0">Malavi-TB-B</label>
                                    </div>
                                  </span>
                                </span>

                                <input type="checkbox" id="mtb" defaultChecked />
                                <label className="arrow_label" htmlFor="mtb"></label>

                                <ul>

                                    <li><span className="tree_label">

                                      <span className="">
                                        <div className="checkbox m-0">
                                          <input type="checkbox" id="mtsb-v1" />
                                          <label htmlFor="mtsb-v1">version 1.01</label>
                                        </div>

                                      </span>

                                    </span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="mtsb-v2" />
                                        <label htmlFor="mtsb-v2">version 1.02</label>
                                      </div></span></span>
                                    </li>

                                    <li><span className="tree_label"><span className="">
                                      <div className="checkbox m-0">
                                        <input type="checkbox" id="mtsb-v3" />
                                        <label htmlFor="mtsb-v3">version 1.03</label>
                                      </div></span></span>
                                    </li>

                                  </ul>
                              </li>
                              
                              
                              </ul>
                            </li>


                          </ul>
                        </li>
                      </ul>

                    </li>



                  </ul>
                </div>



              </CardBody>
              <CardFooter>
                <Button type="submit" size="sm" color="primary"><i className="fa fa-dot-circle-o"></i> Import</Button>
                <Button className="ml-1" type="reset" size="sm" color="danger"><i className="fa fa-dot-circle-o"></i> Export</Button>
                <button className="btn btn-outline-secondary float-right" type="file"><i className="fa fa-lightbulb-o"></i>&nbsp;Download</button>
              </CardFooter>
            </Card>
          </Col>
        </Row>


      </div>
    );
  }
}

export default Program;