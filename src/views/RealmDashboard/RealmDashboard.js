import React, { Component, lazy, Suspense } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

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
  CardGroup,
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
  Carousel,
  CarouselCaption,
  CarouselControl,
  CarouselIndicators,
  CarouselItem,
  CardColumns,
  Table,
} from 'reactstrap';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { getStyle, hexToRgba } from '@coreui/coreui-pro/dist/js/coreui-utilities'
const Widget04 = lazy(() => import('../../views/Widgets/Widget04'));
// const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));

const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')


/////
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
        labelString: 'Country'
      }
    }],
  },
  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  maintainAspectRatio: false
}




const bar = {
  labels: ['Malawi', 'Kenya', 'Zimbabwe', 'USA'],
  datasets: [
    {
      label: 'Active Programs',
      backgroundColor: '#118B70',
      borderColor: 'rgba(179,181,198,1)',
      pointBackgroundColor: 'rgba(179,181,198,1)',
      pointBorderColor: '#fff',
      barThickness: 120,
      barPercentage: 0.5,
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(179,181,198,1)',
      data: [55, 45, 80, 76, 56, 55, 40],
    },
    // {
    //   label: 'Inventory Below Threshold',
    //   backgroundColor: '#f86c6b',
    //   borderColor: 'rgba(255,99,132,1)',
    //   pointBackgroundColor: 'rgba(255,99,132,1)',
    //   pointBorderColor: '#fff',
    //   pointHoverBackgroundColor: '#fff',
    //   pointHoverBorderColor: 'rgba(255,99,132,1)',
    //   data: [28, 48, 40, 19, 96, 27, 100],
    // },
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

class RealmDashboard extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

    this.state = {
      dropdownOpen: false,
      radioSelected: 2,
    };
    this.state = {
      activeIndex: 0,
    };

    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.goToIndex = this.goToIndex.bind(this);
    this.onExiting = this.onExiting.bind(this);
    this.onExited = this.onExited.bind(this);
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
            <div className='RealmDashboardTextCont'>
              <CarouselCaption captionHeader={item.header} captionText={item.caption} />
            </div>
          </div>
        </CarouselItem>
      );
    });


    return (
      <div className="animated fadeIn">
        <Row className="mt-2">
          <Col xs="12" sm="6" lg="3">
            <Card className=" CardHeight">
              <CardBody className="p-0">
              <div class="h1 text-muted text-left mb-0 m-3">
                <i class="icon-people icon-color"></i>
                <ButtonGroup className="float-right">
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
              <Carousel className='trustedMechCarousel' activeIndex={activeIndex} next={this.next} previous={this.previous}>
          <CarouselIndicators items={items} activeIndex={activeIndex} onClickHandler={this.goToIndex} />
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
                  <ButtonGroup className="float-right">
                    <Dropdown id='card2' isOpen={this.state.card2} toggle={() => { this.setState({ card2: !this.state.card2 }); }}>
                      <DropdownToggle caret className="p-0" color="transparent">
                        {/* <i className="icon-settings"></i> */}
                      </DropdownToggle>
                      <DropdownMenu right>
                        <DropdownItem>View Country</DropdownItem>
                        <DropdownItem>Add Country</DropdownItem>

                      </DropdownMenu>
                    </Dropdown>
                  </ButtonGroup>
                </div>

                <div className="TextTittle ">Country </div>
                <div className="text-count">04</div>
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
                <ButtonGroup className="float-right">
                  <Dropdown id='card3' isOpen={this.state.card3} toggle={() => { this.setState({ card3: !this.state.card3 }); }}>
                  <DropdownToggle caret className="p-0" color="transparent">
                      {/* <i className="icon-settings"></i> */}
                    </DropdownToggle>
                    <DropdownMenu right>
                      <DropdownItem>View Technical Area</DropdownItem>
                      <DropdownItem>Add Technical Area</DropdownItem>
                     
                    </DropdownMenu>
                  </Dropdown>
                </ButtonGroup>
              </div>
               
                <div className="TextTittle ">Technical Area </div>
                <div className="text-count">20</div>
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
                <i class="icon-location-pin icon-color"></i>
                <ButtonGroup className="float-right">
                  <Dropdown id='card4' isOpen={this.state.card4} toggle={() => { this.setState({ card4: !this.state.card4 }); }}>
                  <DropdownToggle caret className="p-0" color="transparent">
                      {/* <i className="icon-settings"></i> */}
                    </DropdownToggle>
                    <DropdownMenu right>
                      <DropdownItem>View Region</DropdownItem>
                      <DropdownItem>Add Region</DropdownItem>
                     
                    </DropdownMenu>
                  </Dropdown>
                </ButtonGroup>
              </div>
               
                <div className="TextTittle ">Region </div>
                <div className="text-count">10</div>
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
                <ButtonGroup className="float-right">
                  <Dropdown id='card5' isOpen={this.state.card5} toggle={() => { this.setState({ card5: !this.state.card5 }); }}>
                  <DropdownToggle caret className="p-0" color="transparent">
                      {/* <i className="icon-settings"></i> */}
                    </DropdownToggle>
                    <DropdownMenu right>
                      <DropdownItem>View Organisation</DropdownItem>
                      <DropdownItem>Add Organisation</DropdownItem>
                     
                    </DropdownMenu>
                  </Dropdown>
                </ButtonGroup>
              </div>
               
                <div className="TextTittle ">Organisation </div>
                <div className="text-count">15</div>
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
                <i class="fa fa-list-alt icon-color"></i>
              
                <ButtonGroup className="float-right">
                  <Dropdown id='card8' isOpen={this.state.card8} toggle={() => { this.setState({ card8: !this.state.card8 }); }}>
                  <DropdownToggle caret className="p-0" color="transparent">
                      {/* <i className="icon-settings"></i> */}
                    </DropdownToggle>
                    <DropdownMenu right>
                      <DropdownItem>View Total Program</DropdownItem>
                      {/* <DropdownItem>Add Product Catlog</DropdownItem> */}
                     
                    </DropdownMenu>
                  </Dropdown>
                </ButtonGroup>
              </div>
               
                <div className="TextTittle ">Total Programs </div>
                <div className="text-count">07</div>
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
                <i class="fa fa-file-text-o icon-color"></i>
              
                <ButtonGroup className="float-right">
                  <Dropdown id='card6' isOpen={this.state.card6} toggle={() => { this.setState({ card6: !this.state.card6 }); }}>
                  <DropdownToggle caret className="p-0" color="transparent">
                      {/* <i className="icon-settings"></i> */}
                    </DropdownToggle>
                    <DropdownMenu right>
                      <DropdownItem>View Setup Program</DropdownItem>
                      {/* <DropdownItem>Add Product Catlog</DropdownItem> */}
                     
                    </DropdownMenu>
                  </Dropdown>
                </ButtonGroup>
              </div>
               
                <div className="TextTittle ">Setup Program </div>
                {/* <div className="text-count">01</div> */}
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
                <i class="icon-list  icon-color"></i>
              
                <ButtonGroup className="float-right">
                  <Dropdown id='card7' isOpen={this.state.card7} toggle={() => { this.setState({ card7: !this.state.card7 }); }}>
                  <DropdownToggle caret className="p-0" color="transparent">
                      {/* <i className="icon-settings"></i> */}
                    </DropdownToggle>
                    <DropdownMenu right>
                      <DropdownItem>View Pipeline Program Import</DropdownItem>
                      {/* <DropdownItem>Add Product Catlog</DropdownItem> */}
                     
                    </DropdownMenu>
                  </Dropdown>
                </ButtonGroup>
              </div>
               
                <div className="TextTittle ">Pipeline Program Import </div>
                {/* <div className="text-count">01</div> */}
                <div className="chart-wrapper mt-4 pb-2" >
                  {/* <Line data={cardChartData3} options={cardChartOpts3} height={70} /> */}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* <Row>
            <Col md="12">
            <Card>
              <CardHeader className="text-center">
                <b className="count-text"> <i className="cui-people icons fa-fw"></i> &nbsp;Total Realms Count : <span className="count-clr">4</span></b>
                <div className="card-header-actions">
                <a className="card-header-action">
                  
                  </a>
                </div>
              </CardHeader>
              <CardBody>
                <div className="chart-wrapper chart-graph">
                  <Bar data={bar} options={options} />
                </div>
              </CardBody>
            </Card>
            </Col> 
          </Row>  */}

      </div>
    );
  }
}

export default RealmDashboard;
