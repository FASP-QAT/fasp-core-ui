import React, { Component } from 'react';
import { Button, Dropdown, ListGroup, ListGroupItem, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import imageHelp from '../../assets/img/help-icon.png';
import BranchTemplateTicketComponent from './BranchTemplateTicketComponent';
import BudgetTicketComponent from './BudgetTicketComponent';
import BugReportTicketComponent from './BugReportTicketComponent';
import DataSourceTicketComponent from './DataSourceTicketComponent';
import ForecastMethodTicketComponent from './ForecastMethodTicketComponent';
import ForecastingUnitTicketComponent from './ForecastingUnitTicketComponent';
import FundingSourceTicketComponent from './FundingSourceTicketComponent';
import ModelingTypeTicketComponent from './ModelingTypeTicketComponent';
import OrganisationTicketComponent from './OrganisationTicketComponent';
import OrganisationTypeTicketComponent from './OrganisationTypeTicketComponent';
import PlanningUnitTicketComponent from './PlanningUnitTicketComponent';
import ProcurementAgentTicketComponent from './ProcurementAgentTicketComponent';
import ProcurementAgentTypeTicketComponent from './ProcurementAgentTypeTicketComponent';
import ProductCategoryTicketComponent from './ProductCategoryTicketComponent';
import ProgramTicketComponent from './ProgramTicketComponent';
import RealmCountryRegionTicketComponent from './RealmCountryRegionTicketComponent';
import RealmCountryTicketComponent from './RealmCountryTicketComponent';
import RealmTicketComponent from './RealmTicketComponent';
import TechnicalAreaTicketComponent from './TechnicalAreaTicketComponent';
import TracerCategoryTicketComponent from './TracerCategoryTicketComponent';
import TreeTemplateTicketComponent from './TreeTemplateTicketComponent';
import UsagePeriodTicketComponent from './UsagePeriodTicketComponent';
import UserTicketComponent from './UserTicketComponent';
import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css'; 
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import ChangeRequestTicketComponent from './ChangeRequestTicketComponent';
import EditBudgetTicketComponent from './EditBudgetTicketComponent';
import EditDataSourceTicketComponent from './EditDataSourceTicketComponent';
import EditForecastMethodTicketComponent from './EditForecastMethodTicketComponent';
import EditForecastingUnitTicketComponent from './EditForecastingUnitTicketComponent';
import EditFundingSourceTicketComponent from './EditFundingSourceTicketComponent';
import EditModelingTypeTicketComponent from './EditModelingTypeTicketComponent';
import EditOrganisationTicketComponent from './EditOrganisationTicketComponent';
import EditOrganisationTypeTicketComponent from './EditOrganisationTypeTicketComponent';
import EditPlanningUnitTicketComponent from './EditPlanningUnitTicketComponent';
import EditProcurementAgentTicketComponent from './EditProcurementAgentTicketComponent';
import EditProcurementAgentTypeTicketComponent from './EditProcurementAgentTypeTicketComponent';
import EditProductCategoryTicketComponent from './EditProductCategoryTicketComponent';
import EditProgramTicketComponent from './EditProgramTicketComponent';
import EditRealmCountryRegionTicketComponent from './EditRealmCountryRegionTicketComponent';
import EditRealmCountryTicketComponent from './EditRealmCountryTicketComponent';
import EditRealmTicketComponent from './EditRealmTicketComponent';
import EditTechnicalAreaTicketComponent from './EditTechnicalAreaTicketComponent';
import EditTracerCategoryTicketComponent from './EditTracerCategoryTicketComponent';
import EditUsagePeriodTicketComponent from './EditUsagePeriodTicketComponent';
import EditBranchTemplateTicketComponent from './EditBranchTemplateTicketComponent';
import EditTreeTemplateTicketComponent from './EditTreeTemplateTicketComponent';
/**
 * This component is used to show multiple options for creating the tickets in JIRA
 */
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
      showBranchTemplateData: 0,
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
      showProcurementAgentTypeData: 0,
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
      showUsagePeriodData: 0,
      showForecastMethodData: 0,
      showModelingTypeData: 0,
      showEquivalencyUnitData: 0,
      showEquivalencyUnitMappingData: 0,
      showUsageTemplateData: 0,
      showTreeTemplateData: 0,
      showEditBudgetData: 0,
      showEditDataSourceData: 0,
      showEditFundingSourceData: 0,
      showEditForecastingUnitData: 0,
      showEditOrganizationData: 0,
      showEditPlanningUnitData: 0,
      showEditProductCategoryData: 0,
      showEditProcurementAgentData: 0,
      showEditProcurementAgentTypeData: 0,
      showEditProgramData: 0,
      showEditRealmData: 0,
      showEditRealmCountryData: 0,
      showEditRealmCountryRegionData: 0,
      showEditBranchTemplateData: 0,
      showEditTreeTemplateData: 0,
      showEditTechnicalAreaData: 0,
      showEditTracerCategoryData: 0,
      showEditOrganisationTypeData: 0,
      showEditUsagePeriodData: 0,
      showEditForecastMethodData: 0,
      showEditModelingTypeData: 0,
      showChangeRequest: 0
    };
    this.togglehelp = this.togglehelp.bind(this);
    this.toggleSmall = this.toggleSmall.bind(this);
    this.togglebugreport = this.togglebugreport.bind(this);
    this.togglechangemaster = this.togglechangemaster.bind(this);
    this.toggleMain = this.toggleMain.bind(this);
    this.toggleMain1 = this.toggleMain1.bind(this);
    this.toggleMain2 = this.toggleMain2.bind(this);
    this.toggleMain3 = this.toggleMain3.bind(this);
    this.toggleUserMaster = this.toggleUserMaster.bind(this);
    this.toggleMasterList = this.toggleMasterList.bind(this);
    this.toggleEditMaster = this.toggleEditMaster.bind(this);
    this.showOnlyAddMasterForms = this.showOnlyAddMasterForms.bind(this);
    this.backFromAddMasterForms = this.backFromAddMasterForms.bind(this);
    this.showOnlyEditMasterForms = this.showOnlyEditMasterForms.bind(this);
    this.backFromEditMasterForms = this.backFromEditMasterForms.bind(this);
    this.toggleChangeRequest = this.toggleChangeRequest.bind(this);
  }
  /**
   * This function is used to toggle the ticketing module
   */
  togglehelp() {
    if (localStorage.getItem("sessionType") === 'Online') {
      this.setState({
        help: !this.state.help,
        initialPage: 1,
        showOnlyMaster: 0,
        showOnlyProgramMaster: 0,
        showOnlyRealmMaster: 0,
        showOnlyApplicationMaster: 0,
        showBranchTemplateData: 0,
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
        showProcurementAgentTypeData: 0,
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
        showUsagePeriodData: 0,
        showForecastMethodData: 0,
        showModelingTypeData: 0,
        showEquivalencyUnitData: 0,
        showEquivalencyUnitMappingData: 0,
        showUsageTemplateData: 0,
        showTreeTemplateData: 0,
        showEditBudgetData: 0,
        showEditDataSourceData: 0,
        showEditFundingSourceData: 0,
        showEditForecastingUnitData: 0,
        showEditOrganizationData: 0,
        showEditPlanningUnitData: 0,
        showEditProductCategoryData: 0,
        showEditProcurementAgentData: 0,
        showEditProcurementAgentTypeData: 0,
        showEditProgramData: 0,
        showEditRealmData: 0,
        showEditRealmCountryData: 0,
        showEditRealmCountryRegionData: 0,
        showEditBranchTemplateData: 0,
        showEditTreeTemplateData: 0,
        showEditTechnicalAreaData: 0,
        showEditTracerCategoryData: 0,
        showEditOrganisationTypeData: 0,
        showEditUsagePeriodData: 0,
        showEditForecastMethodData: 0,
        showEditModelingTypeData: 0,
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
  /**
   * This function is used to toggle the ticket created message module
   * @param {*} msg This is message that should be showed
   */
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
  /**
   * This function is used to toggle the bug report details
   */
  togglebugreport() {
    this.setState({
      initialPage: 0,
      showBugReport: 1
    });
  }
  /**
   * This function is used to toggle the change report details
   */
  toggleChangeRequest() {
    this.setState({
      initialPage: 0,
      showChangeRequest: 1
    });
  }
  /**
   * This function is used to toggle the change master details
   */
  togglechangemaster() {
    this.setState({
      changemaster: !this.state.changemaster,
      showAddEditMaster: 1,
      initialPage: 0,
      showBugReport: 0
    });
  }
  /**
   * This function is used to toggle the add master details
   */
  toggleMasterList() {
    this.setState({
      showAddEditMaster: 0,
      showOnlyMaster: 1
    });
  }
  /**
   * This function is used to toggle the edit master details
   */
  toggleEditMaster() {
    this.setState({
      showAddEditMaster: 0,
      showEditMaster: 1
    });
  }
  /**
   * This function is used to toggle the user master details
   */
  toggleUserMaster() {
    this.setState({
      initialPage: 0,
      showUserData: 1
    });
  }
  /**
   * This function is used to toggle the main model details on back button clicked
   */
  toggleMain() {
    this.setState({
      initialPage: 1,
      showBugReport: 0,
      showUserData: 0,
      showChangeRequest: 0
    });
  }
  /**
   * This function is used to toggle add/edit master model details on back button clicked
   */
  toggleMain1() {
    this.setState({
      initialPage: 1,
      showAddEditMaster: 0
    });
  }
  /**
   * This function is used to toggle add master model details on back button clicked
   */
  toggleMain2() {
    this.setState({
      showAddEditMaster: 1,
      showOnlyMaster: 0
    });
  }
  /**
   * This function is used to toggle edit master model details on back button clicked
   */
  toggleMain3() {
    this.setState({
      showAddEditMaster: 1,
      showEditMaster: 0
    });
  }
  /**
   * This function is used to display a particular master screen when user clicks on the option
   * @param {*} formNo This is the form no for the master that is clicked
   */
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
    } else if (formNo == 24) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showProcurementAgentTypeData: 1
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
    } else if (formNo == 16) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showUsagePeriodData: 1
      });
    } else if (formNo == 17) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showForecastMethodData: 1
      });
    } else if (formNo == 18) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showModelingTypeData: 1
      });
    } else if (formNo == 19) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEquivalencyUnitData: 1
      });
    } else if (formNo == 20) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEquivalencyUnitMappingData: 1
      });
    } else if (formNo == 21) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showUsageTemplateData: 1
      });
    } else if (formNo == 22) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showTreeTemplateData: 1
      });
    } else if (formNo == 23) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showOnlyMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showBranchTemplateData: 1
      });
    }
  }
  /**
   * This function is used to toggle add master model details on back button clicked
   * @param {*} masterFormNo This is the form no for the master that is clicked
   */
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
    } else if (masterFormNo == 24) {
      this.setState({
        showProcurementAgentTypeData: 0,
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
    } else if (masterFormNo == 16) {
      this.setState({
        showUsagePeriodData: 0,
        showOnlyMaster: 1
      });
    } else if (masterFormNo == 17) {
      this.setState({
        showForecastMethodData: 0,
        showOnlyMaster: 1
      });
    } else if (masterFormNo == 18) {
      this.setState({
        showModelingTypeData: 0,
        showOnlyMaster: 1
      });
    } else if (masterFormNo == 19) {
      this.setState({
        showEquivalencyUnitData: 0,
        showOnlyMaster: 1
      });
    } else if (masterFormNo == 20) {
      this.setState({
        showEquivalencyUnitMappingData: 0,
        showOnlyMaster: 1
      });
    } else if (masterFormNo == 21) {
      this.setState({
        showUsageTemplateData: 0,
        showOnlyMaster: 1
      });
    } else if (masterFormNo == 22) {
      this.setState({
        showTreeTemplateData: 0,
        showOnlyMaster: 1
      });
    } else if (masterFormNo == 23) {
      this.setState({
        showBranchTemplateData: 0,
        showOnlyMaster: 1
      });
    }
  }
  /**
   * This function is used to display a particular master screen when user clicks on the option
   * @param {*} formNo This is the form no for the master that is clicked
   */
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
    } else if (formNo == 24) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showEditMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEditProcurementAgentTypeData: 1
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
    } else if (formNo == 16) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showEditMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEditUsagePeriodData: 1
      });
    } else if (formNo == 17) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showEditMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEditForecastMethodData: 1
      });
    } else if (formNo == 18) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showEditMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEditModelingTypeData: 1
      });
    } else if (formNo == 22) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showEditMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEditTreeTemplateData: 1
      });
    } else if (formNo == 23) {
      this.setState({
        changeadditional: !this.state.changeadditional,
        showEditMaster: 0,
        showBugReport: 0,
        showOnlyProgramMaster: 0,
        showEditBranchTemplateData: 1
      });
    }
  }
  /**
   * This function is used to toggle edit master model details on back button clicked
   * @param {*} masterFormNo This is the form no for the master that is clicked
   */
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
    } else if (masterFormNo == 24) {
      this.setState({
        showEditProcurementAgentTypeData: 0,
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
    } else if (masterFormNo == 16) {
      this.setState({
        showEditUsagePeriodData: 0,
        showEditMaster: 1
      });
    } else if (masterFormNo == 17) {
      this.setState({
        showEditForecastMethodData: 0,
        showEditMaster: 1
      });
    } else if (masterFormNo == 18) {
      this.setState({
        showEditModelingTypeData: 0,
        showEditMaster: 1
      });
    } else if (masterFormNo == 22) {
      this.setState({
        showEditTreeTemplateData: 0,
        showEditMaster: 1
      });
    } else if (masterFormNo == 23) {
      this.setState({
        showEditBranchTemplateData: 0,
        showEditMaster: 1
      });
    }
  }
  /**
   * This is used to display the content
   * @returns This returns the popup for creating tickets
   */
  render() {
    const checkOnline = localStorage.getItem('sessionType');
    return (
      <Dropdown nav  >
        {checkOnline==='Online' && <img src={imageHelp} className="HelpIcon" title={i18n.t('static.ticket.help')} onClick={this.togglehelp} style={{ width: '31px', height: '31px' }} />}
        <Modal isOpen={this.state.help} toggle={this.togglehelp} className={this.props.className} size='lg' backdrop="static">
          <AuthenticationServiceComponent history={this.props.history} />
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
                        {this.state.initialPage == 0 && this.state.showBugReport == 1 && <div isOpen={this.state.bugreport} toggle={this.togglebugreport}>
                            <BugReportTicketComponent toggleMain={this.toggleMain} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />
            </div>}
            <div isOpen={this.state.changemaster} toggle={this.togglechangemaster} className={this.props.className}>
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
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(23) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.dataset.BranchTreeTemplate')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    {/* <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(1) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.dashboard.budget')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem> */}
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(2) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.datasource.datasource')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(4) }} action><i className="icon-note  icons helpclickicon mr-2"></i> {i18n.t('static.forecastingunit.forecastingunit')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(17) }} action><i className="icon-note icons helpclickicon mr-2"></i> {'Forecast Method'} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(3) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.fundingsource.fundingsource')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(18) }} action><i className="icon-note icons helpclickicon mr-2"></i> {'Modeling Type'} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(5) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.organisation.organisation')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(15) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.organisationType.organisationType')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(6) }} action><i className="icon-note  icons helpclickicon mr-2"></i> {i18n.t('static.planningunit.planningunit')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(7) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.product.productcategory')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(8) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.procurementagent.procurementagent')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(24) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.dashboard.procurementagenttype')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(9) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.program.programMaster')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(10) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.realm.realm')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(11) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.ticket.realmcountry')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(12) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.dashboad.regioncountry')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(13) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.healtharea.healtharea')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(14) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.tracercategory.tracercategory')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(22) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.common.TreeTemplate')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyAddMasterForms(16) }} action><i className="icon-note icons helpclickicon mr-2"></i> {'Usage Period'} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                  </ListGroup>
                  <ModalFooter className="pb-0 pr-0">
                    <Button color="info" onClick={this.toggleMain2}><i className="fa fa-angle-double-left "></i>  Back</Button>
                                      </ModalFooter>
                </div>}
                {this.state.showEditMaster == 1 && <div className="mt-2 mb-2">
                  <div><h4>{i18n.t('static.ticket.requestUpdateTo')}</h4></div><br></br>
                  <ListGroup>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(23) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.dataset.BranchTreeTemplate')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    {/* <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(1) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.dashboard.budget')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem> */}
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(2) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.datasource.datasource')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(4) }} action><i className="icon-note  icons helpclickicon mr-2"></i> {i18n.t('static.forecastingunit.forecastingunit')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(17) }} action><i className="icon-note icons helpclickicon mr-2"></i> {'Forecast Method'} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(3) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.fundingsource.fundingsource')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(18) }} action><i className="icon-note icons helpclickicon mr-2"></i> {'Modeling Type'} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(5) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.organisation.organisation')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(15) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.organisationType.organisationType')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(6) }} action><i className="icon-note  icons helpclickicon mr-2"></i> {i18n.t('static.planningunit.planningunit')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(7) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.product.productcategory')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(8) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.procurementagent.procurementagent')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(24) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.dashboard.procurementagenttype')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(9) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.program.programMaster')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(10) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.realm.realm')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(11) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.ticket.realmcountry')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(12) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.dashboad.regioncountry')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(13) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.healtharea.healtharea')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(14) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.tracercategory.tracercategory')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(22) }} action><i className="icon-note icons helpclickicon mr-2"></i> {i18n.t('static.common.TreeTemplate')} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                    <ListGroupItem className="list-group-item-help" tag="a" onClick={() => { this.showOnlyEditMasterForms(16) }} action><i className="icon-note icons helpclickicon mr-2"></i> {'Usage Period'} <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
                  </ListGroup>
                  <ModalFooter className="pb-0 pr-0">
                    <Button color="info" onClick={this.toggleMain3}><i className="fa fa-angle-double-left "></i>  Back</Button>
                                      </ModalFooter>
                </div>}
                {this.state.showUserData == 1 && <UserTicketComponent toggleMain={() => this.toggleMain()} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showChangeRequest == 1 && <ChangeRequestTicketComponent toggleMain={() => this.toggleMain()} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showBranchTemplateData == 1 && <BranchTemplateTicketComponent toggleMaster={() => this.backFromAddMasterForms(23)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showBudgetData == 1 && <BudgetTicketComponent toggleMaster={() => this.backFromAddMasterForms(1)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showDataSourceData == 1 && <DataSourceTicketComponent toggleMaster={() => this.backFromAddMasterForms(2)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showFundingSourceData == 1 && <FundingSourceTicketComponent toggleMaster={() => this.backFromAddMasterForms(3)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showForecastingUnitData == 1 && <ForecastingUnitTicketComponent toggleMaster={() => this.backFromAddMasterForms(4)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showOrganizationData == 1 && <OrganisationTicketComponent toggleMaster={() => this.backFromAddMasterForms(5)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showPlanningUnitData == 1 && <PlanningUnitTicketComponent toggleMaster={() => this.backFromAddMasterForms(6)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showProductCategoryData == 1 && <ProductCategoryTicketComponent toggleMaster={() => this.backFromAddMasterForms(7)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showProcurementAgentData == 1 && <ProcurementAgentTicketComponent toggleMaster={() => this.backFromAddMasterForms(8)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showProcurementAgentTypeData == 1 && <ProcurementAgentTypeTicketComponent toggleMaster={() => this.backFromAddMasterForms(24)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showProgramData == 1 && <ProgramTicketComponent toggleMaster={() => this.backFromAddMasterForms(9)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showRealmData == 1 && <RealmTicketComponent toggleMaster={() => this.backFromAddMasterForms(10)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showRealmCountryData == 1 && <RealmCountryTicketComponent toggleMaster={() => this.backFromAddMasterForms(11)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showRealmCountryRegionData == 1 && <RealmCountryRegionTicketComponent toggleMaster={() => this.backFromAddMasterForms(12)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showTechnicalAreaData == 1 && <TechnicalAreaTicketComponent toggleMaster={() => this.backFromAddMasterForms(13)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showTracerCategoryData == 1 && <TracerCategoryTicketComponent toggleMaster={() => this.backFromAddMasterForms(14)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showTreeTemplateData == 1 && <TreeTemplateTicketComponent toggleMaster={() => this.backFromAddMasterForms(22)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showOrganisationTypeData == 1 && <OrganisationTypeTicketComponent toggleMaster={() => this.backFromAddMasterForms(15)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showUsagePeriodData == 1 && <UsagePeriodTicketComponent toggleMaster={() => this.backFromAddMasterForms(16)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showForecastMethodData == 1 && <ForecastMethodTicketComponent toggleMaster={() => this.backFromAddMasterForms(17)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showModelingTypeData == 1 && <ModelingTypeTicketComponent toggleMaster={() => this.backFromAddMasterForms(18)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showEditBudgetData == 1 && <EditBudgetTicketComponent toggleMaster={() => this.backFromEditMasterForms(1)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditDataSourceData == 1 && <EditDataSourceTicketComponent toggleMaster={() => this.backFromEditMasterForms(2)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditFundingSourceData == 1 && <EditFundingSourceTicketComponent toggleMaster={() => this.backFromEditMasterForms(3)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditForecastingUnitData == 1 && <EditForecastingUnitTicketComponent toggleMaster={() => this.backFromEditMasterForms(4)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showEditOrganizationData == 1 && <EditOrganisationTicketComponent toggleMaster={() => this.backFromEditMasterForms(5)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditPlanningUnitData == 1 && <EditPlanningUnitTicketComponent toggleMaster={() => this.backFromEditMasterForms(6)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showEditProductCategoryData == 1 && <EditProductCategoryTicketComponent toggleMaster={() => this.backFromEditMasterForms(7)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} items={this.state} />}
                {this.state.showEditProcurementAgentData == 1 && <EditProcurementAgentTicketComponent toggleMaster={() => this.backFromEditMasterForms(8)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditProcurementAgentTypeData == 1 && <EditProcurementAgentTypeTicketComponent toggleMaster={() => this.backFromEditMasterForms(24)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditProgramData == 1 && <EditProgramTicketComponent toggleMaster={() => this.backFromEditMasterForms(9)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditRealmData == 1 && <EditRealmTicketComponent toggleMaster={() => this.backFromEditMasterForms(10)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditRealmCountryData == 1 && <EditRealmCountryTicketComponent toggleMaster={() => this.backFromEditMasterForms(11)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditRealmCountryRegionData == 1 && <EditRealmCountryRegionTicketComponent toggleMaster={() => this.backFromEditMasterForms(12)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditTechnicalAreaData == 1 && <EditTechnicalAreaTicketComponent toggleMaster={() => this.backFromEditMasterForms(13)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditTracerCategoryData == 1 && <EditTracerCategoryTicketComponent toggleMaster={() => this.backFromEditMasterForms(14)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditOrganisationTypeData == 1 && <EditOrganisationTypeTicketComponent toggleMaster={() => this.backFromEditMasterForms(15)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditUsagePeriodData == 1 && <EditUsagePeriodTicketComponent toggleMaster={() => this.backFromEditMasterForms(16)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditForecastMethodData == 1 && <EditForecastMethodTicketComponent toggleMaster={() => this.backFromEditMasterForms(17)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditModelingTypeData == 1 && <EditModelingTypeTicketComponent toggleMaster={() => this.backFromEditMasterForms(18)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditBranchTemplateData == 1 && <EditBranchTemplateTicketComponent toggleMaster={() => this.backFromEditMasterForms(23)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
                {this.state.showEditTreeTemplateData == 1 && <EditTreeTemplateTicketComponent toggleMaster={() => this.backFromEditMasterForms(22)} togglehelp={this.togglehelp} toggleSmall={this.toggleSmall} />}
              </ModalBody>
            </div>
          </ModalBody>
        </Modal>
      </Dropdown>
    )
  }
}