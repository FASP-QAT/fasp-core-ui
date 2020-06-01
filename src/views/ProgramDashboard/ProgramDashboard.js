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

const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')

const options = {
  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  maintainAspectRatio: false
}


const chartColors = {
  color1: "#ed5626",
  color2: '#f48521',
  color3: '#118b70'
};

const bar = {
  labels: ['Program 1', 'Program 2', 'Program 3', 'Program 4'],
  datasets:[
    {
      label:"Inventory",
      data: [90, 60, 35, 25],
      borderColor: 'rgba(179,181,198,1)',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(179,181,198,1)',
      backgroundColor: [
        chartColors.color1,
        chartColors.color1,
        chartColors.color1,
        chartColors.color1
      ]
      
    }]
};

var dataset = bar.datasets[0];
console.log('dataset'+dataset.backgroundColor);
for (var i = 0; i < dataset.data.length; i++) {
  if (dataset.data[i] < 30) {
    dataset.backgroundColor[i] = chartColors.color1;
  }
  else if ((dataset.data[i] > 31) && (dataset.data[i] <= 60)){
    dataset.backgroundColor[i] = chartColors.color2;
  }
  else{
   dataset.backgroundColor[i] = chartColors.color3;
  }
 
}
console.log('dataset'+bar.datasets[0].backgroundColor);
bar.datasets[0]=dataset;




class ProgramDashboard extends Component {
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
          <Col md="6" style={{padding:'0px 33px 0px 2px' }}>
          <Card>
            <CardHeader className="text-center">
           
            <b className="count-text"> <i className=""></i> &nbsp; Program Inventory Levels <span className="count-clr"></span></b>
              <div className="card-header-actions">
               
              </div>
            </CardHeader>
            <CardBody>
              <div className="chart-wrapper chart-graph">
                <Bar data={bar} options={options}/>
       
              </div>
            </CardBody>
          </Card>
          </Col> 
       
        <Col md="6" style={{padding:' 0px 4px 0px 10px' }}>
            <Card>
              <CardHeader className="text-center">
              <b className="count-text"> <i className=""></i> &nbsp; Program Inventory Levels  <span className="count-clr"></span></b>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col xs="12" sm="12" md="12">
                   <Table hover responsive className="table-outline mb-0  d-sm-table chart-graph">
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
                          <strong>90%</strong>
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
                       <strong>60%</strong>
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
                   <div>Program 3</div>
                  
                 </td>
                 
                 <td>
                   <div className="clearfix">
                     <div className="float-left">
                       <strong>25%</strong>
                     </div>
                     <div className="float-right">
                       <small className="text-muted">Inventory Above Threshold</small>
                     </div>
                   </div>
                   <Progress className="progress-xs" color="success" value="80" />
                 </td>
                
               </tr>
               <tr>
                 
                    <td>
                      <div>Program 4</div>
                     
                    </td>
                    
                    <td>
                      <div className="clearfix">
                        <div className="float-left">
                          <strong>35%</strong>
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

export default ProgramDashboard;