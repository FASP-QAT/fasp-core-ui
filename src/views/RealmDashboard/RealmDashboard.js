import React, { Component, lazy, Suspense } from 'react';
import { Bar, Line,Pie} from 'react-chartjs-2';
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



class RealmDashboard extends Component {
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

{/* <Row className="mt-2">
          
          <Col xs="12" sm="6" lg="3">
          <Widget01 color="warning" header="14%" mainText="Country">
               
              </Widget01>
            </Col>
            <Col xs="12" sm="6" lg="3">
            <Widget01 color="warning" header="16%" mainText="Technical Area">
               
              </Widget01>
            </Col>
            <Col xs="12" sm="6" lg="3">
              <Widget01 color="warning" header="200%" mainText="Region">
                
              </Widget01>
            </Col>
            <Col xs="12" sm="6" lg="3">
              <Widget01 color="danger" value="95" header="120%" mainText="Organisation">
                </Widget01>
            </Col>
          </Row> */}
            <Row className="mt-2">
            <Col sm="6" md="3">
              <Widget04 icon="cui-globe" color="info" header="04" value="25">Country</Widget04>
            </Col>
            <Col sm="6" md="3">
              <Widget04 icon="fa fa-medkit " color="success" header="20" value="25">Technical Area</Widget04>
            </Col>
            <Col sm="6" md="3">
              <Widget04 icon="cui-map " color="warning" header="10" value="10">Region</Widget04>
            </Col>
            <Col sm="6" md="3">
              <Widget04 icon="fa fa-building-o" color="primary" header="28" value="15">Organisation</Widget04>
            </Col>
            
          </Row>
  
          <Row>
            <Col md="12">
            <Card>
              {/* <CardHeader className="text-center">
                <b className="count-text"> <i className="cui-people icons fa-fw"></i> &nbsp;Total Realms Count : <span className="count-clr">4</span></b>
                <div className="card-header-actions">
                <a className="card-header-action">
                  
                  </a>
                </div>
              </CardHeader> */}
              <CardBody>
                <div className="chart-wrapper chart-graph">
                  <Bar data={bar} options={options} />
                </div>
              </CardBody>
            </Card>
            </Col> 
          </Row> 
    
        
        {/* <Row>
        <Col md="8">
            <Card>
              <CardHeader>
              Program Inventory Threshold
              </CardHeader>
              <CardBody>
                <Row>
                  <Col xs="12" sm="12" md="12">
                   <Table hover responsive className="table-outline mb-0 d-none d-sm-table">
                  <thead className="thead-light">
                  <tr>
                    <th>Programs</th>
                    <th>Inventory Status</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>
                 
                    <td>
                      <div>Program 1</div>
                     
                    </td>
                    
                    <td>
                      <div className="clearfix">
                        <div className="float-left">
                          <strong>50%</strong>
                        </div>
                        <div className="float-right">
                          <small className="text-muted">Inventory At Threshold</small>
                        </div>
                      </div>
                      <Progress className="progress-xs" color="warning" value="50" />
                    </td>
                   
                  </tr>
                  <tr>
                 
                 <td>
                   <div>Program 2</div>
                  
                 </td>
                 
                 <td>
                   <div className="clearfix">
                     <div className="float-left">
                       <strong>85%</strong>
                     </div>
                     <div className="float-right">
                       <small className="text-muted">Inventory Above Threshold</small>
                     </div>
                   </div>
                   <Progress className="progress-xs" color="success" value="85" />
                 </td>
                
               </tr>
               <tr>
                 
                 <td>
                   <div>Program 3</div>
                  
                 </td>
                 
                 <td>
                   <div className="clearfix">
                     <div className="float-left">
                       <strong>30%</strong>
                     </div>
                     <div className="float-right">
                       <small className="text-muted">Inventory Below Threshold</small>
                     </div>
                   </div>
                   <Progress className="progress-xs" color="danger" value="30" />
                 </td>
                
               </tr>
               <tr>
                 
                    <td>
                      <div>Program 1</div>
                     
                    </td>
                    
                    <td>
                      <div className="clearfix">
                        <div className="float-left">
                          <strong>50%</strong>
                        </div>
                        <div className="float-right">
                          <small className="text-muted">Inventory At Threshold</small>
                        </div>
                      </div>
                      <Progress className="progress-xs" color="warning" value="50" />
                    </td>
                   
                  </tr>
         
                  </tbody>
                </Table>
                </Col>
                </Row>
                </CardBody>
                </Card>
                </Col>
                
        </Row> */}

        
       
    </div>
    );
  }
}

export default RealmDashboard;
