import React, { Component, lazy, Suspense, DatePicker } from 'react';
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
  Table, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { getStyle, hexToRgba } from '@coreui/coreui-pro/dist/js/coreui-utilities'
import i18n from '../../i18n'
import Pdf from "react-to-pdf"

import AuthenticationService from '../Common/AuthenticationService.js';
import RealmService from '../../api/RealmService';
import getLabelText from '../../CommonComponent/getLabelText';
import PlanningUnitService from '../../api/PlanningUnitService';
import ProductService from '../../api/ProductService';
const Widget04 = lazy(() => import('../../views/Widgets/Widget04'));
// const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));

const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')
const ref = React.createRef();
const options = {
  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  maintainAspectRatio: false
}



class Consumption extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

    this.state = {
      dropdownOpen: false,
      radioSelected: 2,
      realms: [],
      productCategories: [],
      planningUnits: [],
      consumptions: []

    };
    this.getProductCategories = this.getProductCategories.bind(this);
    this.filterData = this.filterData.bind(this)

  }
  filterData() {
    let realmId = document.getElementById("realmId").value;
    let productCategoryId = document.getElementById("productCategoryId").value;
    let planningUnitId = document.getElementById("planningUnitId").value;
    AuthenticationService.setupAxiosInterceptors();
    ProductService.getConsumptionData(realmId, productCategoryId, planningUnitId)
      .then(response => {
        this.setState({
          consumptions: response.data
        })
      }).catch(
        error => {
          this.setState({
            consumptions: []
          })

          if (error.message === "Network Error") {
            this.setState({ message: error.message });
          } else {
            switch (error.response ? error.response.status : "") {
              case 500:
              case 401:
              case 404:
              case 406:
              case 412:
                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }) });
                break;
              default:
                this.setState({ message: 'static.unkownError' });
                break;
            }
          }
        }
      );

  }

  getProductCategories() {
    AuthenticationService.setupAxiosInterceptors();
    let realmId = document.getElementById("realmId").value;
    ProductService.getProductCategoryList(realmId)
      .then(response => {
        console.log(JSON.stringify(response.data))
        this.setState({
          productCategories: response.data
        })
      }).catch(
        error => {
          this.setState({
            productCategories: []
          })
          if (error.message === "Network Error") {
            this.setState({ message: error.message });
          } else {
            switch (error.response ? error.response.status : "") {
              case 500:
              case 401:
              case 404:
              case 406:
              case 412:
                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }) });
                break;
              default:
                this.setState({ message: 'static.unkownError' });
                break;
            }
          }
        }
      );
    PlanningUnitService.getPlanningUnitByRealmId(realmId).then(response => {
      console.log(response.data)
      this.setState({
        planningUnits: response.data,
      })
    })
      .catch(
        error => {
          if (error.message === "Network Error") {
            this.setState({ message: error.message });
          } else {
            switch (error.response ? error.response.status : "") {
              case 500:
              case 401:
              case 404:
              case 406:
              case 412:
                this.setState({ message: error.response.data.messageCode });
                break;
              default:
                this.setState({ message: 'static.unkownError' });
                break;
            }
          }
        }
      );

    this.filterData();


  }


  componentDidMount() {
    AuthenticationService.setupAxiosInterceptors();
    RealmService.getRealmListAll()
      .then(response => {
        if (response.status == 200) {
          this.setState({
            realms: response.data,
            realmId: response.data[0].realmId
          })
          this.getProductCategories();

        } else {
          this.setState({ message: response.data.messageCode })
        }
      }).catch(
        error => {
          if (error.message === "Network Error") {
            this.setState({ message: error.message });
          } else {
            switch (error.response ? error.response.status : "") {
              case 500:
              case 401:
              case 404:
              case 406:
              case 412:
                this.setState({ message: error.response.data.messageCode });
                break;
              default:
                this.setState({ message: 'static.unkownError' });
                break;
            }
          }
        }
      );

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
    const { realms } = this.state;
    let realmList = realms.length > 0
      && realms.map((item, i) => {
        return (
          <option key={i} value={item.realmId}>
            {getLabelText(item.label, this.state.lang)}
          </option>
        )
      }, this);
    const { planningUnits } = this.state;
    let planningUnitList = planningUnits.length > 0
      && planningUnits.map((item, i) => {
        return (
          <option key={i} value={item.planningUnitId}>
            {getLabelText(item.label, this.state.lang)}
          </option>
        )
      }, this);
    const { productCategories } = this.state;
    let productCategoryList = productCategories.length > 0
      && productCategories.map((item, i) => {
        return (
          <option key={i} value={item.payload.productCategoryId}>
            {getLabelText(item.payload.label, this.state.lang)}
          </option>
        )
      }, this);
    const bar = {
      labels: this.state.consumptions.map((item, index) => (item.consumption_date)),
      datasets: [
        {
          label: 'Actual Consumption',
          backgroundColor: '#86CD99',
          borderColor: 'rgba(179,181,198,1)',
          pointBackgroundColor: 'rgba(179,181,198,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(179,181,198,1)',
          data: this.state.consumptions.map((item, index) => (item.Actual)),
        }, {
          type: "bar",
          label: "Forecast Consumption",
          backgroundColor: '#006400',
          borderColor: 'rgba(179,181,158,1)',
          borderStyle: 'dotted',
          ticks: {
            fontSize: 2,
            fontColor: 'transparent',
          },
          showInLegend: true,
          yValueFormatString: "$#,##0",
          data: this.state.consumptions.map((item, index) => (item.forcast))
        }
      ],

    };


    return (
      <div className="animated fadeIn">
        <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
        <Row>
          <Col md="9">
            <Card>
              <CardHeader className="text-center">
                <b className="count-text">Consumption Report</b>
                <div className="card-header-actions">
                  <a className="card-header-action">
                    <Pdf targetRef={ref} filename="consumption.pdf">
                      {({ toPdf }) =>
                        <img style={{ height: '40px', width: '40px' }} src={require('../../assets/img/pdf.png')} title="Export PDF" onClick={() => toPdf()} />

                      }
                    </Pdf>
                    {/* <small className="text-muted">98</small> */}
                  </a>
                </div>
              </CardHeader>
              <CardBody>   <div className="col-md-9 pr-0">
                <Form >
                  <Col md="12 pl-0">
                    <div className="d-md-flex">
                      <FormGroup>
                        <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
                        <div className="controls SelectGo">
                          <InputGroup>
                            <Input
                              type="select"
                              name="realmId"
                              id="realmId"
                              bsSize="sm"
                              onChange={(e) => { this.getProductCategories(e) }}
                            >
                              {realmList}
                            </Input>

                          </InputGroup>
                        </div>
                      </FormGroup>
                      &nbsp;
                                    <FormGroup className="tab-ml-1">
                        <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                        <div className="controls SelectGo">
                          <InputGroup>
                            <Input
                              type="select"
                              name="productCategoryId"
                              id="productCategoryId"
                              bsSize="sm"
                            >
                              <option value="0">{i18n.t('static.common.all')}</option>
                              {productCategoryList}
                            </Input>

                          </InputGroup>
                        </div>
                      </FormGroup>
                      <FormGroup className="tab-ml-1">
                        <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                        <div className="controls SelectGo">
                          <InputGroup>
                            <Input
                              type="select"
                              name="planningUnitId"
                              id="planningUnitId"
                              bsSize="sm"
                            >
                              <option value="0">{i18n.t('static.common.all')}</option>
                              {planningUnitList}
                            </Input>
                            <InputGroupAddon addonType="append">
                              <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                            </InputGroupAddon>
                          </InputGroup>
                        </div>
                      </FormGroup>
                    </div>
                  </Col>
                </Form></div>
                <div className="TableCust"  ref={ref}>
                  <div className="col-md-9 pr-0">

                    <div className="chart-wrapper chart-graph">
                      <Bar data={bar} options={options} />
                    </div> <br /><br />
                    <div>
                      <Table responsive className="table-striped table-hover table-bordered text-center mt-2">

                        <thead>
                          <tr>
                            <th className="text-center"> Consumption Date </th>
                            <th className="text-center"> Forecast </th>
                            <th className="text-center">Actual</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            this.state.consumptions.length > 0
                            &&
                            this.state.consumptions.map((item, idx) =>

                              <tr id="addr0" key={idx} >
                                <td>
                                  {this.state.consumptions[idx].consumption_date}
                                </td>
                                <td>

                                  {this.state.consumptions[idx].forcast}
                                </td>
                                <td>
                                  {this.state.consumptions[idx].Actual}
                                </td></tr>)

                          }
                        </tbody>

                      </Table>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>


      </div>
    );
  }
}

export default Consumption;
