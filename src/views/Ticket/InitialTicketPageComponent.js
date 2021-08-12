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
import OrganisationTypeTicketComponent from './OrganisationTypeTicketComponent';
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
import EditBudgetTicketComponent from './EditBudgetTicketComponent';
import EditDataSourceTicketComponent from './EditDataSourceTicketComponent';
import EditFundingSourceTicketComponent from './EditFundingSourceTicketComponent';
import EditForecastingUnitTicketComponent from './EditForecastingUnitTicketComponent';
import EditOrganisationTicketComponent from './EditOrganisationTicketComponent';
import EditPlanningUnitTicketComponent from './EditPlanningUnitTicketComponent';
import EditProductCategoryTicketComponent from './EditProductCategoryTicketComponent';
import EditProcurementAgentTicketComponent from './EditProcurementAgentTicketComponent';
import EditProgramTicketComponent from './EditProgramTicketComponent';
import EditRealmTicketComponent from './EditRealmTicketComponent';
import EditRealmCountryTicketComponent from './EditRealmCountryTicketComponent';
import EditRealmCountryRegionTicketComponent from './EditRealmCountryRegionTicketComponent';
import EditTracerCategoryTicketComponent from './EditTracerCategoryTicketComponent';
import EditOrganisationTypeTicketComponent from './EditOrganisationTypeTicketComponent';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import AuthenticationService from '../Common/AuthenticationService';
import EditTechnicalAreaTicketComponent from './EditTechnicalAreaTicketComponent';
import ChangeRequestTicketComponent from './ChangeRequestTicketComponent';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';

export default class InitialTicketPageComponent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userRealmId: (AuthenticationService.getRealmId() > 0) ? AuthenticationService.getRealmId() : "",
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
      showOrganisationTypeData: 0,
      showProductCategoryData: 0,
      showBudgetData: 0,
      showProcurementUnitData: 0,
      showProgramData: 0,
      showRealmCountryData: 0,
      showRealmCountryRegionData: 0,
      showAddEditMaster: 0,
      showEditMaster: 0,

      showEditBudgetData: 0,
      showEditDataSourceData: 0,
      showEditFundingSourceData: 0,
      showEditForecastingUnitData: 0,
      showEditOrganizationData: 0,
      showEditPlanningUnitData: 0,
      showEditProductCategoryData: 0,
      showEditProcurementAgentData: 0,
      showEditProgramData: 0,
      showEditRealmData: 0,
      showEditRealmCountryData: 0,
      showEditRealmCountryRegionData: 0,
      showEditTechnicalAreaData: 0,
      showEditTracerCategoryData: 0,
      showEditOrganisationTypeData: 0,

      showChangeRequest: 0
    };

    this.togglehelp = this.togglehelp.bind(this);
    this.toggleLarge = this.toggleLarge.bind(this);
    this.toggleSmall = this.toggleSmall.bind(this);
    this.togglebugreport = this.togglebugreport.bind(this);
    this.togglechangemaster = this.togglechangemaster.bind(this);
    this.toggleMain = this.toggleMain.bind(this);
    this.toggleMain1 = this.toggleMain1.bind(this);
    this.toggleMain2 = this.toggleMain2.bind(this);
    this.toggleMain3 = this.toggleMain3.bind(this);
    this.toggleMasterInitial = this.toggleMasterInitial.bind(this);
    this.toggleSubMaster = this.toggleSubMaster.bind(this);
    this.toggleUserMaster = this.toggleUserMaster.bind(this);
    this.toggleMasterList = this.toggleMasterList.bind(this);
    this.toggleEditMaster = this.toggleEditMaster.bind(this);
    this.showOnlyAddMasterForms = this.showOnlyAddMasterForms.bind(this);
    this.backFromAddMasterForms = this.backFromAddMasterForms.bind(this);
    this.showOnlyEditMasterForms = this.showOnlyEditMasterForms.bind(this);
    this.backFromEditMasterForms = this.backFromEditMasterForms.bind(this);

    this.toggleChangeRequest = this.toggleChangeRequest.bind(this);
  }

  componentDidMount() {

  }

  togglehelp() {
    if (isSiteOnline()) {
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
        showOrganisationTypeData: 0,
        showProductCategoryData: 0,
        showBudgetData: 0,
        showProcurementUnitData: 0,
        showProgramData: 0,
        showRealmCountryData: 0,
        showRealmCountryRegionData: 0,
        showAddEditMaster: 0,
        showEditMaster: 0,

        showEditBudgetData: 0,
        showEditDataSourceData: 0,
        showEditFundingSourceData: 0,
        showEditForecastingUnitData: 0,
        showEditOrganizationData: 0,
        showEditPlanningUnitData: 0,
        showEditProductCategoryData: 0,
        showEditProcurementAgentData: 0,
        showEditProgramData: 0,
        showEditRealmData: 0,
        showEditRealmCountryData: 0,
        showEditRealmCountryRegionData: 0,
        showEditTechnicalAreaData: 0,
        showEditTracerCategoryData: 0,
        showEditOrganisationTypeData: 0,

        showChangeRequest: 0
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
    confirmAlert({
      message: i18n.t('static.ticket.ticketcreated') + " " + i18n.t('static.ticket.ticketcode') + ": " + msg,
      buttons: [
        {
          label: i18n.t('static.common.close')
        }
      ]
    });
  }

  // Show Bug Report
  togglebugreport() {
    this.setState({
      initialPage: 0,
      showBugReport: 1
    });
  }

  // Show Bug Report
  toggleChangeRequest() {
    this.setState({
      initialPage: 0,
      showChangeRequest: 1
    });
  }

  //Show Initial Master page
  togglechangemaster() {
    this.setState({
      changemaster: !this.state.changemaster,
      showAddEditMaster: 1,
      initialPage: 0,
      showBugReport: 0
    });
  }

  toggleMasterList() {
    this.setState({
      showAddEditMaster: 0,
      showOnlyMaster: 1
    });
  }

  toggleEditMaster() {
    this.setState({
      showAddEditMaster: 0,
      showEditMaster: 1
    });
  }

  //Show User Master Page
  toggleUserMaster() {
    this.setState({
      initialPage: 0,
      showUserData: 1
    });
  }

  //Show main page back from bug report
  toggleMain() {
    this.setState({
      initialPage: 1,
      showBugReport: 0,
      showUserData: 0,
      showChangeRequest: 0
    });
  }

  //Show main page back from initial master page
  toggleMain1() {
    this.setState({
      initialPage: 1,
      showAddEditMaster: 0
    });
  }

  toggleMain2() {
    this.setState({
      showAddEditMaster: 1,
      showOnlyMaster: 0
    });
  }

  toggleMain3() {
    this.setState({
      showAddEditMaster: 1,
      showEditMaster: 0
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

  showOnlyAddMasterForms(formNo) {
    if (formNo == 1) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showBudgetData: 1
      });
    } else if (formNo == 2) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showDataSourceData: 1
      });
    } else if (formNo == 3) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showFundingSourceData: 1
      });
    } else if (formNo == 4) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showForecastingUnitData: 1
      });
    } else if (formNo == 5) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showOrganizationData: 1
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
        showProductCategoryData: 1
      });
    } else if (formNo == 8) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showProcurementAgentData: 1
      });
    } else if (formNo == 9) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showProgramData: 1
      });
    } else if (formNo == 10) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showRealmData: 1
      });
    } else if (formNo == 11) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showRealmCountryData: 1
      });
    } else if (formNo == 12) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showRealmCountryRegionData: 1
      });
    } else if (formNo == 13) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showTechnicalAreaData: 1
      });
    } else if (formNo == 14) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showTracerCategoryData: 1
      });
    } else if (formNo == 15) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showOrganisationTypeData: 1
      });
    }

  }

  backFromAddMasterForms(masterFormNo) {
    if (masterFormNo == 1) {
      this.setState({
        showBudgetData: 0,
        showOnlyMaster: 1
      });
    } else if (masterFormNo == 2) {
      this.setState({
        showDataSourceData: 0,
        showOnlyMaster: 1
      });
    } else if (masterFormNo == 3) {
      this.setState({
        showFundingSourceData: 0,
        showOnlyMaster: 1
      });
    } else if (masterFormNo == 4) {
      this.setState({
        showForecastingUnitData: 0,
        showOnlyMaster: 1
      });
    } else if (masterFormNo == 5) {
      this.setState({
        showOrganizationData: 0,
        showOnlyMaster: 1
      });
    } else if (masterFormNo == 6) {
      this.setState({
        showPlanningUnitData: 0,
        showOnlyMaster: 1
      });
    } else if (masterFormNo == 7) {
      this.setState({
        showProductCategoryData: 0,
        showOnlyMaster: 1
      });
    } else if (masterFormNo == 8) {
      this.setState({
        showProcurementAgentData: 0,
        showOnlyMaster: 1
      });
    } else if (masterFormNo == 9) {
      this.setState({
        showProgramData: 0,
        showOnlyMaster: 1
      });
    } else if (masterFormNo == 10) {
      this.setState({
        showRealmData: 0,
        showOnlyMaster: 1
      });
    } else if (masterFormNo == 11) {
      this.setState({
        showRealmCountryData: 0,
        showOnlyMaster: 1
      });
    } else if (masterFormNo == 12) {
      this.setState({
        showRealmCountryRegionData: 0,
        showOnlyMaster: 1
      });
    } else if (masterFormNo == 13) {
      this.setState({
        showTechnicalAreaData: 0,
        showOnlyMaster: 1
      });
    } else if (masterFormNo == 14) {
      this.setState({
        showTracerCategoryData: 0,
        showOnlyMaster: 1
      });
    } else if (masterFormNo == 15) {
      this.setState({
        showOrganisationTypeData: 0,
        showOnlyMaster: 1
      });
    }
  }

  showOnlyEditMasterForms(formNo) {
    if (formNo == 1) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showEditMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEditBudgetData: 1
      });
    } else if (formNo == 2) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showEditMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEditDataSourceData: 1
      });
    } else if (formNo == 3) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showEditMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEditFundingSourceData: 1
      });
    } else if (formNo == 4) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showEditMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEditForecastingUnitData: 1
      });
    } else if (formNo == 5) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showEditMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEditOrganizationData: 1
      });
    } else if (formNo == 6) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showEditMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEditPlanningUnitData: 1
      });
    } else if (formNo == 7) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showEditMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEditProductCategoryData: 1
      });
    } else if (formNo == 8) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showEditMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEditProcurementAgentData: 1
      });
    } else if (formNo == 9) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showEditMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEditProgramData: 1
      });
    } else if (formNo == 10) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showEditMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEditRealmData: 1
      });
    } else if (formNo == 11) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showEditMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEditRealmCountryData: 1
      });
    } else if (formNo == 12) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showEditMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEditRealmCountryRegionData: 1
      });
    } else if (formNo == 13) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showEditMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEditTechnicalAreaData: 1
      });
    } else if (formNo == 14) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showEditMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEditTracerCategoryData: 1
      });
    } else if (formNo == 15) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showEditMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEditOrganisationTypeData: 1
      });
    }

  }

  backFromEditMasterForms(masterFormNo) {
    if (masterFormNo == 1) {
      this.setState({
        showEditBudgetData: 0,
        showEditMaster: 1
      });
    } else if (masterFormNo == 2) {
      this.setState({
        showEditDataSourceData: 0,
        showEditMaster: 1
      });
    } else if (masterFormNo == 3) {
      this.setState({
        showEditFundingSourceData: 0,
        showEditMaster: 1
      });
    } else if (masterFormNo == 4) {
      this.setState({
        showEditForecastingUnitData: 0,
        showEditMaster: 1
      });
    } else if (masterFormNo == 5) {
      this.setState({
        showEditOrganizationData: 0,
        showEditMaster: 1
      });
    } else if (masterFormNo == 6) {
      this.setState({
        showEditPlanningUnitData: 0,
        showEditMaster: 1
      });
    } else if (masterFormNo == 7) {
      this.setState({
        showEditProductCategoryData: 0,
        showEditMaster: 1
      });
    } else if (masterFormNo == 8) {
      this.setState({
        showEditProcurementAgentData: 0,
        showEditMaster: 1
      });
    } else if (masterFormNo == 9) {
      this.setState({
        showEditProgramData: 0,
        showEditMaster: 1
      });
    } else if (masterFormNo == 10) {
      this.setState({
        showEditRealmData: 0,
        showEditMaster: 1
      });
    } else if (masterFormNo == 11) {
      this.setState({
        showEditRealmCountryData: 0,
        showEditMaster: 1
      });
    } else if (masterFormNo == 12) {
      this.setState({
        showEditRealmCountryRegionData: 0,
        showEditMaster: 1
      });
    } else if (masterFormNo == 13) {
      this.setState({
        showEditTechnicalAreaData: 0,
        showEditMaster: 1
      });
    } else if (masterFormNo == 14) {
      this.setState({
        showEditTracerCategoryData: 0,
        showEditMaster: 1
      });
    } else if (masterFormNo == 15) {
      this.setState({
        showEditOrganisationTypeData: 0,
        showEditMaster: 1
      });
    }
  }



  render() {

    return (
      <Dropdown nav  >

        <img src={imageHelp} className="HelpIcon" title={i18n.t('static.ticket.help')} onClick={this.togglehelp} style={{ width: '31px', height: '31px' }} />



        <Modal isOpen={this.state.help} toggle={this.togglehelp} className={this.props.className} backdrop="static">
          <AuthenticationServiceComponent history={this.props.history} />
          {/* className={'modal-info ' + this.props.className}> */}
          <ModalHeader toggle={this.togglehelp} className="ModalHead modal-info-Headher"><strong>{i18n.t('static.ticket.help')}</strong></ModalHeader>
          <ModalBody className="pb-0">
            {this.state.initialPage == 1 && <div className="col-md-12">
              <div><h4><b>{i18n.t('static.ticket.header')}</b></h4>{i18n.t('static.ticket.subheader')}</div><br></br>
              <div className="mt-2 mb-2">

                <ListGroup>
                  <ListGroupItem className="list-group-item-help" tag="a" onClick={this.toggleUserMaster} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.ticket.addUpdateUser')}</ListGroupItem>
                  <ListGroupItem className="list-group-item-help" tag="a" onClick={this.togglechangemaster} action><i className="icon-list  icons helpclickicon mr-2"></i> {i18n.t('static.ticket.addUpdateMasterData')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                  <ListGroupItem className="list-group-item-help" tag="a" onClick={this.toggleChangeRequest} action>  <i className="icon-list icons helpclickicon mr-2"></i>{i18n.t('static.ticket.changeRequest')}</ListGroupItem>
                  <ListGroupItem className="list-group-item-help" tag="a" onClick={this.togglebugreport} action>  <i className="icon-list icons helpclickicon mr-2"></i>{i18n.t('static.common.bugreport')}</ListGroupItem>
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

                {this.state.showAddEditMaster == 1 && <div className="mt-2 mb-2">

                  <ListGroup>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={this.toggleMasterList} action><i className="icon-note  icons helpclickicon mr-2"></i> {i18n.t('static.ticket.addMasters')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={this.toggleEditMaster} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.ticket.editMasters')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                  </ListGroup>
                  <ModalFooter className="pb-0 pr-0">
                    <Button color="info" onClick={this.toggleMain1}><i className="fa fa-angle-double-left "></i>  Back</Button>
                  </ModalFooter>
                </div>}

                {this.state.showOnlyMaster == 1 && <div className="mt-2 mb-2">
                  <div><h4>{i18n.t('static.ticket.requestNewTo')}</h4></div><br></br>
                  <ListGroup>

                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(1) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.dashboard.budget')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(2) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.datasource.datasource')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(4) }} action><i className="icon-note  icons helpclickicon mr-2"></i> {i18n.t('static.forecastingunit.forecastingunit')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(3) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.fundingsource.fundingsource')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(5) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.organisation.organisation')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(15) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.organisationType.organisationType')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(6) }} action><i className="icon-note  icons helpclickicon mr-2"></i> {i18n.t('static.planningunit.planningunit')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(7) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.product.productcategory')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(8) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.procurementagent.procurementagent')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(9) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.program.programMaster')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(10) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.realm.realm')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(11) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.ticket.realmcountry')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(12) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.dashboad.regioncountry')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(13) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.healtharea.healtharea')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(14) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.tracercategory.tracercategory')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>

                  </ListGroup>
                  <ModalFooter className="pb-0 pr-0">
                    <Button color="info" onClick={this.toggleMain2}><i className="fa fa-angle-double-left "></i>  Back</Button>
                    {/* <Button color="success" onClick={this.togglebugreport}>Submit</Button> */}
                  </ModalFooter>
                </div>}

                {this.state.showEditMaster == 1 && <div className="mt-2 mb-2">
                  <div><h4>{i18n.t('static.ticket.requestUpdateTo')}</h4></div><br></br>
                  <ListGroup>

                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(1) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.dashboard.budget')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(2) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.datasource.datasource')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(4) }} action><i className="icon-note  icons helpclickicon mr-2"></i> {i18n.t('static.forecastingunit.forecastingunit')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(3) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.fundingsource.fundingsource')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(5) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.organisation.organisation')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(15) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.organisationType.organisationType')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(6) }} action><i className="icon-note  icons helpclickicon mr-2"></i> {i18n.t('static.planningunit.planningunit')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(7) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.product.productcategory')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(8) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.procurementagent.procurementagent')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(9) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.program.programMaster')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(10) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.realm.realm')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(11) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.ticket.realmcountry')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(12) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.dashboad.regioncountry')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(13) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.healtharea.healtharea')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(14) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.tracercategory.tracercategory')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>


                  </ListGroup>
                  <ModalFooter className="pb-0 pr-0">
                    <Button color="info" onClick={this.toggleMain3}><i className="fa fa-angle-double-left "></i>  Back</Button>
                    {/* <Button color="success" onClick={this.togglebugreport}>Submit</Button> */}
                  </ModalFooter>
                </div>}

                {this.state.showUserData == 1 && <UserTicketComponent toggleMain={() => this.toggleMain()} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showChangeRequest == 1 && <ChangeRequestTicketComponent toggleMain={() => this.toggleMain()} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}

                {this.state.showBudgetData == 1 && <BudgetTicketComponent toggleMaster={() => this.backFromAddMasterForms(1)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showDataSourceData == 1 && <DataSourceTicketComponent toggleMaster={() => this.backFromAddMasterForms(2)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showFundingSourceData == 1 && <FundingSourceTicketComponent toggleMaster={() => this.backFromAddMasterForms(3)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showForecastingUnitData == 1 && <ForecastingUnitTicketComponent toggleMaster={() => this.backFromAddMasterForms(4)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showOrganizationData == 1 && <OrganisationTicketComponent toggleMaster={() => this.backFromAddMasterForms(5)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showPlanningUnitData == 1 && <PlanningUnitTicketComponent toggleMaster={() => this.backFromAddMasterForms(6)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showProductCategoryData == 1 && <ProductCategoryTicketComponent toggleMaster={() => this.backFromAddMasterForms(7)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showProcurementAgentData == 1 && <ProcurementAgentTicketComponent toggleMaster={() => this.backFromAddMasterForms(8)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showProgramData == 1 && <ProgramTicketComponent toggleMaster={() => this.backFromAddMasterForms(9)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showRealmData == 1 && <RealmTicketComponent toggleMaster={() => this.backFromAddMasterForms(10)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showRealmCountryData == 1 && <RealmCountryTicketComponent toggleMaster={() => this.backFromAddMasterForms(11)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showRealmCountryRegionData == 1 && <RealmCountryRegionTicketComponent toggleMaster={() => this.backFromAddMasterForms(12)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showTechnicalAreaData == 1 && <TechnicalAreaTicketComponent toggleMaster={() => this.backFromAddMasterForms(13)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showTracerCategoryData == 1 && <TracerCategoryTicketComponent toggleMaster={() => this.backFromAddMasterForms(14)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showOrganisationTypeData == 1 && <OrganisationTypeTicketComponent toggleMaster={() => this.backFromAddMasterForms(15)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}


                {this.state.showEditBudgetData == 1 && <EditBudgetTicketComponent toggleMaster={() => this.backFromEditMasterForms(1)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditDataSourceData == 1 && <EditDataSourceTicketComponent toggleMaster={() => this.backFromEditMasterForms(2)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditFundingSourceData == 1 && <EditFundingSourceTicketComponent toggleMaster={() => this.backFromEditMasterForms(3)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditForecastingUnitData == 1 && <EditForecastingUnitTicketComponent toggleMaster={() => this.backFromEditMasterForms(4)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showEditOrganizationData == 1 && <EditOrganisationTicketComponent toggleMaster={() => this.backFromEditMasterForms(5)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditPlanningUnitData == 1 && <EditPlanningUnitTicketComponent toggleMaster={() => this.backFromEditMasterForms(6)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showEditProductCategoryData == 1 && <EditProductCategoryTicketComponent toggleMaster={() => this.backFromEditMasterForms(7)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showEditProcurementAgentData == 1 && <EditProcurementAgentTicketComponent toggleMaster={() => this.backFromEditMasterForms(8)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditProgramData == 1 && <EditProgramTicketComponent toggleMaster={() => this.backFromEditMasterForms(9)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditRealmData == 1 && <EditRealmTicketComponent toggleMaster={() => this.backFromEditMasterForms(10)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditRealmCountryData == 1 && <EditRealmCountryTicketComponent toggleMaster={() => this.backFromEditMasterForms(11)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditRealmCountryRegionData == 1 && <EditRealmCountryRegionTicketComponent toggleMaster={() => this.backFromEditMasterForms(12)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditTechnicalAreaData == 1 && <EditTechnicalAreaTicketComponent toggleMaster={() => this.backFromEditMasterForms(13)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditTracerCategoryData == 1 && <EditTracerCategoryTicketComponent toggleMaster={() => this.backFromEditMasterForms(14)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditOrganisationTypeData == 1 && <EditOrganisationTypeTicketComponent toggleMaster={() => this.backFromEditMasterForms(15)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}


              </ModalBody>

            </div>


          </ModalBody>



        </Modal>

      </Dropdown>
    )

  }
}