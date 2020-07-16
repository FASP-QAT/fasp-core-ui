import React, { Component } from 'react';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import {
  Col, Row, Card, CardBody, CardHeader, Form,
  FormGroup, Label, InputGroup, Input, InputGroupAddon, Button,
  Nav, NavItem, NavLink, TabContent, TabPane, CardFooter
} from 'reactstrap';
import CryptoJS from 'crypto-js';
import { SECRET_KEY, PENDING_APPROVAL_VERSION_STATUS, CANCELLED_SHIPMENT_STATUS } from '../../Constants.js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import getLabelText from '../../CommonComponent/getLabelText';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import ProgramService from '../../api/ProgramService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js'
import moment from "moment";

const entityname = i18n.t('static.dashboard.commitVersion')
export default class commitVersion extends Component {

  constructor(props) {
    super(props);
    this.state = {
      programList: [],
      activeTab: new Array(3).fill('1'),
      versionTypeList: [],
      lang: localStorage.getItem('lang'),
    }
    this.toggle = this.toggle.bind(this);
    this.getDataForCompare = this.getDataForCompare.bind(this);
  }

  toggle(tabPane, tab) {
    const newArray = this.state.activeTab.slice()
    newArray[tabPane] = tab
    this.setState({
      activeTab: newArray,
    });
  }

  componentDidMount() {
    var db1;
    getDatabase();
    var openRequest = indexedDB.open('fasp', 1);
    openRequest.onerror = function (event) {
      this.setState({
        commitVersionError: i18n.t('static.program.errortext')
      })
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['programData'], 'readwrite');
      var program = transaction.objectStore('programData');
      var getRequest = program.getAll();
      var proList = [];

      getRequest.onerror = function (event) {
        this.setState({
          commitVersionError: i18n.t('static.program.errortext')
        })
      }.bind(this);
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        for (var i = 0; i < myResult.length; i++) {
          if (myResult[i].userId == userId) {
            var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
            var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
            var programJson = {
              name: getLabelText(JSON.parse(programNameLabel), this.state.lang) + "~v" + myResult[i].version,
              id: myResult[i].id
            }
            proList[i] = programJson
          }
        }
        this.setState({
          programList: proList
        })

        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getVersionTypeList().then(response => {
          console.log('**' + JSON.stringify(response.data))
          this.setState({
            versionTypeList: response.data,
          })
        })
          .catch(
            error => {
              this.setState({
                statuses: [],
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
                    this.setState({ message: error.response.data.messageCode });
                    break;
                  default:
                    this.setState({ message: 'static.unkownError' });
                    break;
                }
              }
            }
          );


      }.bind(this);
    }.bind(this);
    document.getElementById("detailsDiv").style.display = "none";
  }

  getDataForCompare() {
    document.getElementById("detailsDiv").style.display = "block";
    
  }

  tabPane() {
    return (
      <>
        <TabPane tabId="1">
          <Row>
            <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
              <Col md="12 pl-0" id="realmDiv">
                <div className="table-responsive RemoveStriped">
                  <div id="mergedVersionConsumption" />
                </div>
              </Col>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="2">
          <Row>
            <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
              <Col md="12 pl-0" id="realmDiv">
                <div className="table-responsive RemoveStriped">
                  <div id="mergedVersionInventory" />
                </div>
              </Col>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="3">
          <Row>
            <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
              <Col md="12 pl-0" id="realmDiv">
                <div className="table-responsive RemoveStriped">
                  <div id="mergedVersionShipment" />
                </div>
              </Col>
            </Col>
          </Row>
        </TabPane>
      </>
    );
  }

  render = () => {
    const { programList } = this.state;
    let programs = programList.length > 0
      && programList.map((item, i) => {
        return (
          <option key={i} value={item.id}>{item.name}</option>
        )
      }, this);

    const { versionTypeList } = this.state;
    let versionTypes = versionTypeList.length > 0
      && versionTypeList.map((item, i) => {
        return (
          <option key={i} value={item.id}>{getLabelText(item.label, this.state.lang)}</option>
        )
      }, this);

    return (
      <div className="animated fadeIn">
        <AuthenticationServiceComponent history={this.props.history} message={(message) => {
          this.setState({ message: message })
        }} />
        <h5>{i18n.t(this.state.message, { entityname })}</h5>
        <Row>
          <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
            <Card>
              <CardHeader>
                <strong>{i18n.t('static.dashboard.commitVersion')}</strong>
              </CardHeader>
              <CardBody>
                <Form name='simpleForm'>
                  <Col md="12 pl-0">
                    <div className="d-md-flex">
                      <FormGroup className="col-md-2 comparebtntext">
                        <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                        <div className="controls SelectGo ">
                          <InputGroup>
                            <Input type="select"
                              bsSize="sm"
                              // value={this.state.programId}
                              name="programId" id="programId"
                              onChange={this.getDataForCompare}
                            >
                              <option value="0">{i18n.t('static.common.select')}</option>
                              {programs}
                            </Input>
                          </InputGroup>
                        </div>

                      </FormGroup>
                      <div className="col-md-10">
                        <ul class="legendcommitversion">
                          <li><span class="lightpinklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commit.differenceBetweenVersions')}</span></li>
                          <li><span class=" greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commit.newDataCurrentVersion')} </span></li>
                          <li><span class="notawesome legendcolor"></span > <span className="legendcommitversionText">{i18n.t('static.commit.newDataLatestVersion')} </span></li>
                          <li><span class="redlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commit.inactiveData')} </span></li>
                          <li><span class="orangelegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commit.erpDidNotMatch')} </span></li>
                          <li><span class="orangeredlegend legendcolor"></span><span className="legendcommitversionText"> {i18n.t('static.commit.duplicateErp')} </span></li>

                        </ul>
                      </div>
                    </div>
                  </Col>
                </Form>
                <div id="detailsDiv">
                  <div className="animated fadeIn">
                    <Row>
                      <FormGroup className="tab-ml-1">
                        <Label htmlFor="appendedInputButton">{i18n.t('static.report.versiontype')}</Label>
                        <div className="controls SelectGo">
                          <InputGroup>
                            <Input type="select"
                              bsSize="sm"
                              name="versionType" id="versionType"
                            >
                              {versionTypes}
                            </Input>
                          </InputGroup>
                        </div>
                      </FormGroup>
                      <FormGroup className="tab-ml-1">
                        <Label htmlFor="appendedInputButton">{i18n.t('static.program.notes')}</Label>
                        <div className="controls SelectGo">
                          <InputGroup>
                            <Input type="textarea"
                              bsSize="sm"
                              name="notes" id="notes"
                            >
                            </Input>
                          </InputGroup>
                        </div>
                      </FormGroup>
                    </Row>
                    <Row>
                      <Col xs="12" md="12" className="mb-4">
                        <Nav tabs>
                          <NavItem>
                            <NavLink
                              active={this.state.activeTab[0] === '1'}
                              onClick={() => { this.toggle(0, '1'); }}
                            >
                              {i18n.t('static.dashboard.consumption')}
                            </NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink
                              active={this.state.activeTab[0] === '2'}
                              onClick={() => { this.toggle(0, '2'); }}
                            >
                              {i18n.t('static.inventory.inventory')}
                            </NavLink>
                          </NavItem>

                          <NavItem>
                            <NavLink
                              active={this.state.activeTab[0] === '3'}
                              onClick={() => { this.toggle(0, '3'); }}
                            >
                              {i18n.t('static.shipment.shipment')}
                            </NavLink>
                          </NavItem>
                        </Nav>
                        <TabContent activeTab={this.state.activeTab[0]}>
                          {this.tabPane()}
                        </TabContent>
                      </Col>
                    </Row>
                  </div>
                </div>
              </CardBody>
              <CardFooter>
                <FormGroup>
                  <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                  {this.state.isErpMatching && this.state.isChanged && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={this.synchronize} ><i className="fa fa-check"></i>{i18n.t('static.common.submit')} </Button>}
                  &nbsp;
                                        </FormGroup>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  cancelClicked() {
    console.log("inside cancel")
    this.props.history.push(`/ApplicationDashboard/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
  }
}