import React, { Component } from 'react';
import { Badge, Button, Dropdown, DropdownItem, DropdownMenu, FormGroup, DropdownToggle, Input, Label, ListGroup, ListGroupItem, Modal, ModalBody, ModalFooter, ModalHeader, Row, Col, Progress } from 'reactstrap';
import imageHelp from '../../assets/img/help-icon.png';
import PlanningUnitTicketComponent from './PlanningUnitTicketComponent';
import BugReportTicketComponent from './BugReportTicketComponent';
import ForecastingUnitTicketComponent from './ForecastingUnitTicketComponent';
import UserTicketComponent from './UserTicketComponent';
import CountryTicketComponent from './CountryTicketComponent';
import CurrencyTicketComponent from './CurrencyTicketComponent';
import UnitsTicketComponent from './UnitsTicketComponent';
import RealmTicketComponent from './RealmTicketComponent';
import DataSourceTicketComponent from './DataSourceTicketComponent';
import FundingSourceTicketComponent from './FundingSourceTicketComponent';
import ProcurementAgentTicketComponent from './ProcurementAgentTicketComponent';
import SuppliersTicketComponent from './SuppliersTicketComponent';
import TechnicalAreaTicketComponent from './TechnicalAreaTicketComponent';
import OrganisationTicketComponent from './OrganisationTicketComponent';
import TracerCategoryTicketComponent from './TracerCategoryTicketComponent';
import ProductCategoryTicketComponent from './ProductCategoryTicketComponent';
import BudgetTicketComponent from './BudgetTicketComponent';
import ProcurementUnitTicketComponent from './ProcurementUnitTicketComponent';
import ProgramTicketComponent from './ProgramTicketComponent';
import RealmCountryTicketComponent from './RealmCountryTicketComponent';
import RealmCountryRegionTicketComponent from './RealmCountryRegionTicketComponent';
import i18n from '../../i18n';
import { Online } from 'react-detect-offline';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

export default class InitialTicketPageComponent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      message: '',
      modal: false,
      large: false,
      small: false,
      bugreport: false,
      changeadditional: false,
      changemaster: false,
      togglehelp: false,
      initialPage: 1,
      showOnlyMaster: 0,
      showOnlyProgramMaster: 0,
      showOnlyRealmMaster: 0,
      showOnlyApplicationMaster: 0,
      showBugReport: 0,
      showPlanningUnitData: 0,
      showForecastingUnitData: 0,
      showUserData: 0,
      showCountryData: 0,
      showCurrencyData: 0,
      showUnitData: 0,
      showRealmData: 0,
      showDataSourceData: 0,
      showFundingSourceData: 0,
      showProcurementAgentData: 0,
      showSupplierData: 0,
      showTechnicalAreaData: 0,
      showOrganizationData: 0,
      showTracerCategoryData: 0,
      showProductCategoryData: 0,
      showBudgetData: 0,
      showProcurementUnitData: 0,
      showProgramData: 0,
      showRealmCountryData: 0,
      showRealmCountryRegionData: 0
    };

    this.togglehelp = this.togglehelp.bind(this);
    this.toggleLarge = this.toggleLarge.bind(this);
    this.toggleSmall = this.toggleSmall.bind(this);
    this.togglebugreport = this.togglebugreport.bind(this);
    this.toggleApplicationChangeAdditional = this.toggleApplicationChangeAdditional.bind(this);
    this.toggleRealmChangeAdditional = this.toggleRealmChangeAdditional.bind(this);
    this.toggleProgramChangeAdditional = this.toggleProgramChangeAdditional.bind(this);
    this.togglechangemaster = this.togglechangemaster.bind(this);
    this.toggleMain = this.toggleMain.bind(this);
    this.toggleMain1 = this.toggleMain1.bind(this);
    this.toggleApplicationMasterForm = this.toggleApplicationMasterForm.bind(this);
    this.toggleRealmMasterForm = this.toggleRealmMasterForm.bind(this);
    this.toggleProgramMasterForm = this.toggleProgramMasterForm.bind(this);
    this.toggleMasterInitial = this.toggleMasterInitial.bind(this);
    this.toggleSubMaster = this.toggleSubMaster.bind(this);
  }

  componentDidMount() {

  }

  togglehelp() {
    if (navigator.onLine) {
      this.setState({
        help: !this.state.help,
        initialPage: 1,
        showOnlyMaster: 0,
        showOnlyProgramMaster: 0,
        showOnlyRealmMaster: 0,
        showOnlyApplicationMaster: 0,
        showBugReport: 0,
        showPlanningUnitData: 0,
        showForecastingUnitData: 0,
        showUserData: 0,
        showCountryData: 0,
        showCurrencyData: 0,
        showUnitData: 0,
        showRealmData: 0,
        showDataSourceData: 0,
        showFundingSourceData: 0,
        showProcurementAgentData: 0,
        showSupplierData: 0,
        showTechnicalAreaData: 0,
        showOrganizationData: 0,
        showTracerCategoryData: 0,
        showProductCategoryData: 0,
        showBudgetData: 0,
        showProcurementUnitData: 0,
        showProgramData: 0,
        showRealmCountryData: 0,
        showRealmCountryRegionData: 0
      });
    } else {
      confirmAlert({
        message: i18n.t('static.helpTicket.offline'),
        buttons: [
          {
            label: i18n.t('static.common.close')
          }
        ]
      });
    }
  }

  toggleLarge() {
    this.setState({
      large: !this.state.large,
    });
  }

  toggleSmall(msg) {
    this.setState({
      message: msg,
      small: !this.state.small
    });
  }

  // Show Bug Report
  togglebugreport() {
    this.setState({
      initialPage: 0,
      showBugReport: 1
    });
  }

  //Show Initial Master page
  togglechangemaster() {
    this.setState({
      changemaster: !this.state.changemaster,
      showOnlyMaster: 1,
      initialPage: 0,
      showBugReport: 0
    });
  }

  //Show main page back from bug report
  toggleMain() {
    this.setState({
      initialPage: 1,
      showBugReport: 0
    });
  }

  //Show main page back from initial master page
  toggleMain1() {
    this.setState({
      initialPage: 1,
      showOnlyMaster: 0
    });
  }

  // Show initial master page back form sub master page
  toggleMasterInitial(masterNo) {
    if (masterNo == 1) {
      this.setState({
        showOnlyMaster: 1,
        showOnlyApplicationMaster: 0
      });
    } else if (masterNo == 2) {
      this.setState({
        showOnlyMaster: 1,
        showOnlyRealmMaster: 0
      });
    } else if (masterNo == 3) {
      this.setState({
        showOnlyMaster: 1,
        showOnlyProgramMaster: 0
      });
    }
  }

  //Show sub master page from inital master page
  toggleSubMaster(masterNo) {
    if (masterNo == 1) {
      this.setState({
        showOnlyMaster: 0,
        showOnlyApplicationMaster: 1
      });
    } else if (masterNo == 2) {
      this.setState({
        showOnlyMaster: 0,
        showOnlyRealmMaster: 1
      });
    } else if (masterNo == 3) {
      this.setState({
        showOnlyMaster: 0,
        showOnlyProgramMaster: 1
      });
    }
  }

  //Show application sub masters data
  toggleApplicationChangeAdditional(formNo) {
    if (formNo == 1) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyApplicationMaster: 0,
        showUserData: 1
      });
    } else if (formNo == 2) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyApplicationMaster: 0,
        showCountryData: 1
      });
    } else if (formNo == 3) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyApplicationMaster: 0,
        showCurrencyData: 1
      });
    } else if (formNo == 4) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyApplicationMaster: 0,
        showUnitData: 1
      });
    }
  }

  //Show realm sub masters data
  toggleRealmChangeAdditional(formNo) {
    if (formNo == 1) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyRealmMaster: 0,
        showRealmData: 1
      });
    } else if (formNo == 2) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyRealmMaster: 0,
        showRealmCountryData: 1
      });
    } else if (formNo == 3) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyRealmMaster: 0,
        showDataSourceData: 1
      });
    } else if (formNo == 4) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyRealmMaster: 0,
        showFundingSourceData: 1
      });
    } else if (formNo == 5) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyRealmMaster: 0,
        showProcurementAgentData: 1
      });
    } else if (formNo == 6) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyRealmMaster: 0,
        showSupplierData: 1
      });
    } else if (formNo == 7) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyRealmMaster: 0,
        showTechnicalAreaData: 1
      });
    } else if (formNo == 8) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyRealmMaster: 0,
        showOrganizationData: 1
      });
    } else if (formNo == 9) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyRealmMaster: 0,
        showRealmCountryRegionData: 1
      });
    }
  }

  //Show program sub masters data
  toggleProgramChangeAdditional(formNo) {
    if (formNo == 1) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showProgramData: 1
      });
    } else if (formNo == 2) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showBudgetData: 1
      });
    } else if (formNo == 3) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showTracerCategoryData: 1
      });
    } else if (formNo == 4) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showProductCategoryData: 1
      });
    } else if (formNo == 5) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showForecastingUnitData: 1
      });
    } else if (formNo == 6) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showPlanningUnitData: 1
      });
    } else if (formNo == 7) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showProcurementUnitData: 1
      });
    }
  }

  //Show application sub master page back from application sub master forms
  toggleApplicationMasterForm(masterFormNo) {
    if (masterFormNo == 1) {
      this.setState({
        showUserData: 0,
        showOnlyApplicationMaster: 1
      });
    } else if (masterFormNo == 2) {
      this.setState({
        showCountryData: 0,
        showOnlyApplicationMaster: 1
      });
    } else if (masterFormNo == 3) {
      this.setState({
        showCurrencyData: 0,
        showOnlyApplicationMaster: 1
      });
    } else if (masterFormNo == 4) {
      this.setState({
        showUnitData: 0,
        showOnlyApplicationMaster: 1
      });
    }
  }

  //Show realm sub master page back from realm sub master forms
  toggleRealmMasterForm(masterFormNo) {
    if (masterFormNo == 1) {
      this.setState({
        showRealmData: 0,
        showOnlyRealmMaster: 1
      });
    } else if (masterFormNo == 2) {
      this.setState({
        showRealmCountryData: 0,
        showOnlyRealmMaster: 1
      });
    } else if (masterFormNo == 3) {
      this.setState({
        showDataSourceData: 0,
        showOnlyRealmMaster: 1
      });
    } else if (masterFormNo == 4) {
      this.setState({
        showFundingSourceData: 0,
        showOnlyRealmMaster: 1
      });
    } else if (masterFormNo == 5) {
      this.setState({
        showProcurementAgentData: 0,
        showOnlyRealmMaster: 1
      });
    } else if (masterFormNo == 6) {
      this.setState({
        showSupplierData: 0,
        showOnlyRealmMaster: 1
      });
    } else if (masterFormNo == 7) {
      this.setState({
        showTechnicalAreaData: 0,
        showOnlyRealmMaster: 1
      });
    } else if (masterFormNo == 8) {
      this.setState({
        showOrganizationData: 0,
        showOnlyRealmMaster: 1
      });
    } else if (masterFormNo == 9) {
      this.setState({
        showRealmCountryRegionData: 0,
        showOnlyRealmMaster: 1
      });
    }
  }

  //Show program sub master page back from program sub master forms
  toggleProgramMasterForm(masterFormNo) {
    if (masterFormNo == 1) {
      this.setState({
        showProgramData: 0,
        showOnlyProgramMaster: 1
      });
    } else if (masterFormNo == 2) {
      this.setState({
        showBudgetData: 0,
        showOnlyProgramMaster: 1
      });
    } else if (masterFormNo == 3) {
      this.setState({
        showTracerCategoryData: 0,
        showOnlyProgramMaster: 1
      });
    } else if (masterFormNo == 4) {
      this.setState({
        showProductCategoryData: 0,
        showOnlyProgramMaster: 1
      });
    } else if (masterFormNo == 5) {
      this.setState({
        showForecastingUnitData: 0,
        showOnlyProgramMaster: 1
      });
    } else if (masterFormNo == 6) {
      this.setState({
        showPlanningUnitData: 0,
        showOnlyProgramMaster: 1
      });
    } else if (masterFormNo == 7) {
      this.setState({
        showProcurementUnitData: 0,
        showOnlyProgramMaster: 1
      });
    }
  }



  render() {

    return (
      <Dropdown nav  >

        <img src={imageHelp} className="HelpIcon" title="Help" onClick={this.togglehelp} />

        <Modal isOpen={this.state.small} toggle={this.toggleSmall}
          className={'modal-sm modal-dialog-center'} aria-labelledby="contained-modal-title-vcenter"
          centered>
          <ModalHeader toggle={this.toggleSmall} className="ModalHead modal-info-Headher"><b>Message!</b></ModalHeader>
          <ModalBody>
            {i18n.t('static.ticket.ticketcreated')}
            <br></br><br></br>
            {i18n.t('static.ticket.ticketcode')}: {this.state.message}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={() => { this.toggleSmall('') }}>OK</Button>{' '}
          </ModalFooter>
        </Modal>

        <Modal isOpen={this.state.help} toggle={this.togglehelp} className={this.props.className}>
          {/* className={'modal-info ' + this.props.className}> */}
          <ModalHeader toggle={this.togglehelp} className="ModalHead modal-info-Headher"><strong>Help</strong></ModalHeader>
          <ModalBody className="pb-0">
            {this.state.initialPage == 1 && <div className="col-md-12">
              <div><h4>What do yo want to do?</h4>Please click here to raise a query</div>
              <div className="mt-2 mb-2">

                <ListGroup>
                  <ListGroupItem className="list-group-item-help" tag="a" onClick={this.togglebugreport} action>  <i className="icon-list icons helpclickicon mr-2"></i>{i18n.t('static.common.bugreport')}</ListGroupItem>
                  <ListGroupItem className="list-group-item-help" tag="a" onClick={this.togglechangemaster} action><i className="icon-list  icons helpclickicon mr-2"></i> {i18n.t('static.ticket.addUpdateMasterData')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>

                </ListGroup>
              </div>

            </div>}

            {/* Bug Report modal */}
            {this.state.initialPage == 0 && this.state.showBugReport == 1 && <div isOpen={this.state.bugreport} toggle={this.togglebugreport}>
              {/* <ModalHeader toggle={this.togglebugreport} className="ModalHead modal-info-Headher"><strong>Bug Report</strong></ModalHeader> */}
              <BugReportTicketComponent toggleMain={this.toggleMain} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />
            </div>}


            {/* Change Additional Master modal */}

            <div isOpen={this.state.changemaster} toggle={this.togglechangemaster} className={this.props.className}>
              {/* className={'modal-info ' + this.props.className}> */}
              {/* <ModalHeader toggle={this.togglechangemaster} className="ModalHead modal-info-Headher"><strong>Help</strong></ModalHeader> */}
              <ModalBody>
                {this.state.showOnlyMaster == 1 && <div className="mt-2 mb-2">
                  <ListGroup>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleSubMaster(1) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.dashboard.applicationmaster')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleSubMaster(2) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.dashboard.realmlevelmaster')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleSubMaster(3) }} action><i className="icon-note  icons helpclickicon mr-2"></i> {i18n.t('static.dashboard.programmaster')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>

                  </ListGroup>
                  <ModalFooter className="pb-0 pr-0">
                    <Button color="info" onClick={this.toggleMain1}><i className="fa fa-angle-double-left "></i>  Back</Button>
                    {/* <Button color="success" onClick={this.togglebugreport}>Submit</Button> */}
                  </ModalFooter>
                </div>}

                {this.state.showOnlyApplicationMaster == 1 && <div className="mt-2 mb-2">
                  <ListGroup>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleApplicationChangeAdditional(1) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.user.user')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleApplicationChangeAdditional(2) }} action><i className="icon-note  icons helpclickicon mr-2"></i> {i18n.t('static.country.countryMaster')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleApplicationChangeAdditional(3) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.currency.currencyMaster')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleApplicationChangeAdditional(4) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.unit.unit')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                  </ListGroup>
                  <ModalFooter className="pb-0 pr-0">
                    <Button color="info" onClick={() => { this.toggleMasterInitial(1) }}><i className="fa fa-angle-double-left "></i>  Back</Button>
                    {/* <Button color="success" onClick={this.togglebugreport}>Submit</Button> */}
                  </ModalFooter>
                </div>}

                {this.state.showOnlyRealmMaster == 1 && <div className="mt-2 mb-2">
                  <ListGroup>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleRealmChangeAdditional(1) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.realm.realm')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleRealmChangeAdditional(2) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.dashboard.realmcountry')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleRealmChangeAdditional(3) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.datasource.datasource')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleRealmChangeAdditional(4) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.fundingsource.fundingsource')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleRealmChangeAdditional(5) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.procurementagent.procurementagent')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleRealmChangeAdditional(6) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.supplier.supplier')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleRealmChangeAdditional(7) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.healtharea.healtharea')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleRealmChangeAdditional(8) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.organisation.organisation')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleRealmChangeAdditional(9) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.dashboad.regioncountry')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                  </ListGroup>
                  <ModalFooter className="pb-0 pr-0">
                    <Button color="info" onClick={() => { this.toggleMasterInitial(2) }}><i className="fa fa-angle-double-left "></i>  Back</Button>
                    {/* <Button color="success" onClick={this.togglebugreport}>Submit</Button> */}
                  </ModalFooter>
                </div>}

                {this.state.showOnlyProgramMaster == 1 && <div className="mt-2 mb-2">
                  <ListGroup>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleProgramChangeAdditional(1) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.program.programMaster')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleProgramChangeAdditional(2) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.dashboard.budget')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleProgramChangeAdditional(3) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.tracercategory.tracercategory')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleProgramChangeAdditional(4) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.product.productcategory')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleProgramChangeAdditional(5) }} action><i className="icon-note  icons helpclickicon mr-2"></i> {i18n.t('static.forecastingunit.forecastingunit')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleProgramChangeAdditional(6) }} action><i className="icon-note  icons helpclickicon mr-2"></i> {i18n.t('static.planningunit.planningunit')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.toggleProgramChangeAdditional(7) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.procurementUnit.procurementUnit')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                  </ListGroup>
                  <ModalFooter className="pb-0 pr-0">
                    <Button color="info" onClick={() => { this.toggleMasterInitial(3) }}><i className="fa fa-angle-double-left "></i>  Back</Button>
                    {/* <Button color="success" onClick={this.togglebugreport}>Submit</Button> */}
                  </ModalFooter>
                </div>}

                {/* Application Master */}
                {this.state.showUserData == 1 && <UserTicketComponent toggleMaster={() => this.toggleApplicationMasterForm(1)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showCountryData == 1 && <CountryTicketComponent toggleMaster={() => this.toggleApplicationMasterForm(2)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showCurrencyData == 1 && <CurrencyTicketComponent toggleMaster={() => this.toggleApplicationMasterForm(3)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showUnitData == 1 && <UnitsTicketComponent toggleMaster={() => this.toggleApplicationMasterForm(4)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}

                {/* Realm Master */}
                {this.state.showRealmData == 1 && <RealmTicketComponent toggleMaster={() => this.toggleRealmMasterForm(1)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showRealmCountryData == 1 && <RealmCountryTicketComponent toggleMaster={() => this.toggleRealmMasterForm(2)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showDataSourceData == 1 && <DataSourceTicketComponent toggleMaster={() => this.toggleRealmMasterForm(3)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showFundingSourceData == 1 && <FundingSourceTicketComponent toggleMaster={() => this.toggleRealmMasterForm(4)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showProcurementAgentData == 1 && <ProcurementAgentTicketComponent toggleMaster={() => this.toggleRealmMasterForm(5)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showSupplierData == 1 && <SuppliersTicketComponent toggleMaster={() => this.toggleRealmMasterForm(6)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showTechnicalAreaData == 1 && <TechnicalAreaTicketComponent toggleMaster={() => this.toggleRealmMasterForm(7)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showOrganizationData == 1 && <OrganisationTicketComponent toggleMaster={() => this.toggleRealmMasterForm(8)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showRealmCountryRegionData == 1 && <RealmCountryRegionTicketComponent toggleMaster={() => this.toggleRealmMasterForm(9)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}

                {/* Program Master */}
                {this.state.showProgramData == 1 && <ProgramTicketComponent toggleMaster={() => this.toggleProgramMasterForm(1)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showBudgetData == 1 && <BudgetTicketComponent toggleMaster={() => this.toggleProgramMasterForm(2)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showTracerCategoryData == 1 && <TracerCategoryTicketComponent toggleMaster={() => this.toggleProgramMasterForm(3)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showProductCategoryData == 1 && <ProductCategoryTicketComponent toggleMaster={() => this.toggleProgramMasterForm(4)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showForecastingUnitData == 1 && <ForecastingUnitTicketComponent toggleMaster={() => this.toggleProgramMasterForm(5)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showPlanningUnitData == 1 && <PlanningUnitTicketComponent toggleMaster={() => this.toggleProgramMasterForm(6)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showProcurementUnitData == 1 && <ProcurementUnitTicketComponent toggleMaster={() => this.toggleProgramMasterForm(7)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
              </ModalBody>

            </div>


          </ModalBody>



        </Modal>
        {/*Change Additaion master */}
        {/* <Modal isOpen={this.state.changeadditional} toggle={this.togglechangeadditional}>
                  <ModalHeader toggle={this.togglechangeadditional} className="ModalHead modal-info-Headher"><strong>Add/Update Planning Unit</strong></ModalHeader>
                  <ModalBody>
                   <div>
                   <FormGroup>
                  <Label >Forecasting Unit</Label>
                  <Input type="text" />
                </FormGroup>
                <FormGroup>
                  <Label >Unit</Label>
                  <Input type="text"  />
                </FormGroup>
                <FormGroup>
                  <Label >Planning Unit</Label>
                  <Input type="text"  />
                </FormGroup>
                <FormGroup>
                  <Label >Multiplier</Label>
                  <Input type="text"  />
                </FormGroup>
                   </div>
                  </ModalBody>
                  <ModalFooter>
                   
                    <Button color="success" onClick={this.togglechangeadditional}>Submit</Button>
                  </ModalFooter>
                </Modal> */}

        {/* <DropdownMenu right className="dropdown-menu-lg">
          <DropdownItem header tag="div"><strong>You have {itemsCount} messages</strong></DropdownItem>
          <DropdownItem href="#">
            <div className="message">
              <div className="pt-3 mr-3 float-left">
                <div className="avatar">
                  <img src={image7} className="img-avatar" alt="admin@bootstrapmaster.com" />
                  <span className="avatar-status badge-success"></span>
                </div>
              </div>
              <div>
                <small className="text-muted">John Doe</small>
                <small className="text-muted float-right mt-1">Just now</small>
              </div>
              <div className="text-truncate font-weight-bold"><span className="fa fa-exclamation text-danger"></span> Important message</div>
              <div className="small text-muted text-truncate">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt...
              </div>
            </div>
          </DropdownItem>
          <DropdownItem href="#">
            <div className="message">
              <div className="pt-3 mr-3 float-left">
                <div className="avatar">
                  <img src={image6} className="img-avatar" alt="admin@bootstrapmaster.com" />
                  <span className="avatar-status badge-warning"></span>
                </div>
              </div>
              <div>
                <small className="text-muted">Jane Doe</small>
                <small className="text-muted float-right mt-1">5 minutes ago</small>
              </div>
              <div className="text-truncate font-weight-bold">Lorem ipsum dolor sit amet</div>
              <div className="small text-muted text-truncate">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt...
              </div>
            </div>
          </DropdownItem>
          <DropdownItem href="#">
            <div className="message">
              <div className="pt-3 mr-3 float-left">
                <div className="avatar">
                  <img src={image5} className="img-avatar" alt="admin@bootstrapmaster.com" />
                  <span className="avatar-status badge-danger"></span>
                </div>
              </div>
              <div>
                <small className="text-muted">Janet Doe</small>
                <small className="text-muted float-right mt-1">1:52 PM</small>
              </div>
              <div className="text-truncate font-weight-bold">Lorem ipsum dolor sit amet</div>
              <div className="small text-muted text-truncate">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt...
              </div>
            </div>
          </DropdownItem>
          <DropdownItem href="#">
            <div className="message">
              <div className="pt-3 mr-3 float-left">
                <div className="avatar">
                  <img src={image4} className="img-avatar" alt="admin@bootstrapmaster.com" />
                  <span className="avatar-status badge-info"></span>
                </div>
              </div>
              <div>
                <small className="text-muted">Joe Doe</small>
                <small className="text-muted float-right mt-1">4:03 AM</small>
              </div>
              <div className="text-truncate font-weight-bold">Lorem ipsum dolor sit amet</div>
              <div className="small text-muted text-truncate">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt...
              </div>
            </div>
          </DropdownItem>
          <DropdownItem href="#" className="text-center"><strong>View all messages</strong></DropdownItem>
        </DropdownMenu> */}
      </Dropdown>
    )

  }
}