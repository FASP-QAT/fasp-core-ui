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
  labels: ['Program1', 'Program2', 'Program3', 'Program4'],
  datasets: [
    {
      label: 'Inventory At Threshold',
      backgroundColor: '#ffc107',
      borderColor: 'rgba(179,181,198,1)',
      pointBackgroundColor: 'rgba(179,181,198,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(179,181,198,1)',
      data: [65, 59, 90, 81, 56, 55, 40],
    },
    {
      label: 'Inventory Below Threshold',
      backgroundColor: '#f86c6b',
      borderColor: 'rgba(255,99,132,1)',
      pointBackgroundColor: 'rgba(255,99,132,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(255,99,132,1)',
      data: [28, 48, 40, 19, 96, 27, 100],
    },
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
        
        <Row>
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
                
        </Row>

        
       
    </div>
    );
  }
}

export default RealmDashboard;
