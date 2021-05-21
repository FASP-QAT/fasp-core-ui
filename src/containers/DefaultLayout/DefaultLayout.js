import { AppAside, AppFooter, AppHeader, AppSidebar, AppSidebarFooter, AppSidebarForm, AppSidebarHeader, AppSidebarMinimizer, AppSidebarNav } from '@coreui/react';
import React, { Component, Suspense } from 'react';
import i18n from '../../i18n';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { Offline, Online } from "react-detect-offline";
import { Redirect, Route, Switch } from 'react-router-dom';
import { Container } from 'reactstrap';
import IdleTimer from 'react-idle-timer';
// import ChangeInLocalProgramVersion from '../../CommonComponent/ChangeInLocalProgramVersion'
import moment from 'moment';
import CryptoJS from 'crypto-js';
import {
  SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, polling

} from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";


// routes config
//import routes from '../../routes';
import AuthenticationService from '../../views/Common/AuthenticationService.js';
import ManualTaggingService from '../../api/ManualTaggingService.js';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';

const ChangeInLocalProgramVersion = React.lazy(() => import('../../CommonComponent/ChangeInLocalProgramVersion'));
const DefaultAside = React.lazy(() => import('./DefaultAside'));
const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));

const AddInventory = React.lazy(() => import('../../views/Inventory/AddInventory'));
const AddDimension = React.lazy(() => import('../../views/Dimension/AddDimensionComponent'));
const DimensionList = React.lazy(() => import('../../views/Dimension/DimensionListComponent'));
const EditDimension = React.lazy(() => import('../../views/Dimension/EditDimensionComponent'));

const ProductCategoryTree = React.lazy(() => import('../../views/ProductCategory/ProductCategoryTree'));

const AddHealthArea = React.lazy(() => import('../../views/HealthArea/AddHealthArea'));
const HealthAreaList = React.lazy(() => import('../../views/HealthArea/HealthAreaList'));
const EditHealthArea = React.lazy(() => import('../../views/HealthArea/EditHealthArea'));

const AddOrganisation = React.lazy(() => import('../../views/Organisation/AddOrganisation'));
const OrganisationList = React.lazy(() => import('../../views/Organisation/OrganisationList'));
const EditOrganisation = React.lazy(() => import('../../views/Organisation/EditOrganisation'));

const AddSubFundingSource = React.lazy(() => import('../../views/SubFundingSource/AddSubFundingSourceComponent'));
const ListSubFundingSource = React.lazy(() => import('../../views/SubFundingSource/ListSubFundingSourceComponent'));
const EditSubFundingSource = React.lazy(() => import('../../views/SubFundingSource/EditSubFundingSourceComponent'));
const ApplicationDashboard = React.lazy(() => import('../../views/ApplicationDashboard'));
const ShipmentLinkingNotifications = React.lazy(() => import('../../views/ManualTagging/ShipmentLinkingNotifications'));
const RealmDashboard = React.lazy(() => import('../../views/RealmDashboard'));
const ProgramDashboard = React.lazy(() => import('../../views/ProgramDashboard'));
const AddFundingSource = React.lazy(() => import('../../views/FundingSource/AddFundingSourceComponent'));
const ListFundingSource = React.lazy(() => import('../../views/FundingSource/ListFundingSourceComponent'));
const EditFundingSource = React.lazy(() => import('../../views/FundingSource/EditFundingSourceComponent'));
const AddProcurementAgent = React.lazy(() => import('../../views/ProcurementAgent/AddProcurementAgentComponent'));
const ListProcurementAgent = React.lazy(() => import('../../views/ProcurementAgent/ListProcurementAgentComponent'));
const EditProcurementAgent = React.lazy(() => import('../../views/ProcurementAgent/EditProcurementAgentComponent'));
const AddTracerCategory = React.lazy(() => import('../../views/TracerCategory/AddTracerCategoryComponent'));
const ListTracerCategory = React.lazy(() => import('../../views/TracerCategory/ListTracerCategoryComponent'));
const EditTracerCategory = React.lazy(() => import('../../views/TracerCategory/EditTracerCategoryComponent'));
const AddSupplier = React.lazy(() => import('../../views/Supplier/AddSupplierComponent'));
const ListSupplier = React.lazy(() => import('../../views/Supplier/ListSupplierComponent'));
const EditSupplier = React.lazy(() => import('../../views/Supplier/EditSupplierComponent'));
const AddRegion = React.lazy(() => import('../../views/Region/AddRegionComponent'));
const ListRegion = React.lazy(() => import('../../views/Region/ListRegionComponent'));
const EditRegion = React.lazy(() => import('../../views/Region/EditRegionComponent'));
const ListRealmCountry = React.lazy(() => import('../../views/RealmCountry/ListRealmCountryComponent'));
const AddRealmCountry = React.lazy(() => import('../../views/RealmCountry/AddRealmCountryComponent'));
const RealmCountry = React.lazy(() => import('../../views/RealmCountry/RealmCountry'));
const AddProgramIntegration = React.lazy(() => import('../../views/Integration/AddProgramIntegration'));
const AddCountrySpecificPrice = React.lazy(() => import('../../views/ProgramProduct/AddCountrySpecificPrice'));
const ChangePassword = React.lazy(() => import('../../views/Pages/Login/ChangePasswordComponent'));
const Logout = React.lazy(() => import('../../views/Pages/Login/LogoutComponent'));
const AddRole = React.lazy(() => import('../../views/Role/AddRoleComponent'));
const ListRole = React.lazy(() => import('../../views/Role/ListRoleComponent'));
const EditRole = React.lazy(() => import('../../views/Role/EditRoleComponent'));
const AddUser = React.lazy(() => import('../../views/User/AddUserComponent'));
const ListUser = React.lazy(() => import('../../views/User/ListUserComponent'));
const EditUser = React.lazy(() => import('../../views/User/EditUserComponent'));
const AccessControl = React.lazy(() => import('../../views/User/AccessControlComponent'));
const AccessDenied = React.lazy(() => import('../../views/Common/AccessDeniedComponent'));


const CodeEditors = React.lazy(() => import('../../views/Editors/CodeEditors'));
const TextEditors = React.lazy(() => import('../../views/Editors/TextEditors'));

const Compose = React.lazy(() => import('../../views/Apps/Email/Compose'));
const Inbox = React.lazy(() => import('../../views/Apps/Email/Inbox'));
const Message = React.lazy(() => import('../../views/Apps/Email/Message'));
const Invoice = React.lazy(() => import('../../views/Apps/Invoicing/Invoice'));

const AdvancedForms = React.lazy(() => import('../../views/Forms/AdvancedForms'));
const BasicForms = React.lazy(() => import('../../views/Forms/BasicForms'));
const ValidationForms = React.lazy(() => import('../../views/Forms/ValidationForms'));
const GoogleMaps = React.lazy(() => import('../../views/GoogleMaps'));
const Toastr = React.lazy(() => import('../../views/Notifications/Toastr'));
const Calendar = React.lazy(() => import('../../views/Plugins/Calendar'));
const Draggable = React.lazy(() => import('../../views/Plugins/Draggable'));
const Spinners = React.lazy(() => import('../../views/Plugins/Spinners'));
const DataTable = React.lazy(() => import('../../views/Tables/DataTable'));
const Tables = React.lazy(() => import('../../views/Tables/Tables'));
const LoadingButtons = React.lazy(() => import('../../views/Buttons/LoadingButtons'));

const Breadcrumbs = React.lazy(() => import('../../views/Base/Breadcrumbs'));
const Cards = React.lazy(() => import('../../views/Base/Cards'));
const Collapses = React.lazy(() => import('../../views/Base/Collapses'));
const Carousels = React.lazy(() => import('../../views/Base/Carousels'));
const Dropdowns = React.lazy(() => import('../../views/Base/Dropdowns'));

const Jumbotrons = React.lazy(() => import('../../views/Base/Jumbotrons'));
const ListGroups = React.lazy(() => import('../../views/Base/ListGroups'));
const Navbars = React.lazy(() => import('../../views/Base/Navbars'));
const Navs = React.lazy(() => import('../../views/Base/Navs'));
const Paginations = React.lazy(() => import('../../views/Base/Paginations'));
const Popovers = React.lazy(() => import('../../views/Base/Popovers'));
const ProgressBar = React.lazy(() => import('../../views/Base/ProgressBar'));
const SpinnersB4 = React.lazy(() => import('../../views/Base/Spinners'));
const Switches = React.lazy(() => import('../../views/Base/Switches'));

const Tabs = React.lazy(() => import('../../views/Base/Tabs'));
const Tooltips = React.lazy(() => import('../../views/Base/Tooltips'));
const BrandButtons = React.lazy(() => import('../../views/Buttons/BrandButtons'));
const ButtonDropdowns = React.lazy(() => import('../../views/Buttons/ButtonDropdowns'));
const ButtonGroups = React.lazy(() => import('../../views/Buttons/ButtonGroups'));
const Buttons = React.lazy(() => import('../../views/Buttons/Buttons'));
const Charts = React.lazy(() => import('../../views/Charts'));

const Dashboard = React.lazy(() => import('../../views/Dashboard'));
const CoreUIIcons = React.lazy(() => import('../../views/Icons/CoreUIIcons'));
const Flags = React.lazy(() => import('../../views/Icons/Flags'));
const FontAwesome = React.lazy(() => import('../../views/Icons/FontAwesome'));
const SimpleLineIcons = React.lazy(() => import('../../views/Icons/SimpleLineIcons'));
const Alerts = React.lazy(() => import('../../views/Notifications/Alerts'));
const Badges = React.lazy(() => import('../../views/Notifications/Badges'));
const Modals = React.lazy(() => import('../../views/Notifications/Modals'));
const Colors = React.lazy(() => import('../../views/Theme/Colors'));
const Typography = React.lazy(() => import('../../views/Theme/Typography'));
const Widgets = React.lazy(() => import('../../views/Widgets/Widgets'));
const Users = React.lazy(() => import('../../views/Users/Users'));
const User = React.lazy(() => import('../../views/Users/User'));

const AddBudgetComponent = React.lazy(() => import('../../views/Budget/AddBudgetComponent'));
const ListBudgetComponent = React.lazy(() => import('../../views/Budget/ListBudgetComponent'));
const EditBudgetComponent = React.lazy(() => import('../../views/Budget/EditBudgetComponent'));
const AddProgramProduct = React.lazy(() => import('../../views/ProgramProduct/AddProgramProduct'));
const AddProductCategory = React.lazy(() => import('../../views/ProductCategory/AddProductCategory'));
const AddProgram = React.lazy(() => import('../../views/Program/AddProgram'));
const Programs = React.lazy(() => import('../../views/Program/ProgramList'));
const EditProgram = React.lazy(() => import('../../views/Program/EditProgram'));
const SubFundingSourceList = React.lazy(() => import('../../views/SubFundingSource/ListSubFundingSourceComponent'));
const AddProduct = React.lazy(() => import('../../views/Product/AddProduct'));
const ListProdct = React.lazy(() => import('../../views/Product/ProductList'));
const EditProdct = React.lazy(() => import('../../views/Product/EditProduct'));
const ProgramTree = React.lazy(() => import('../../views/Program/ProgramTree'));
const DeleteLocalPrograms = React.lazy(() => import('../../views/Program/DeleteLocalProgramComponent'));
const ExportProgram = React.lazy(() => import('../../views/Program/ExportProgram'));
const ImportProgram = React.lazy(() => import('../../views/Program/ImportProgram'));
// const MasterDataSync = React.lazy(() => import('../../views/SyncMasterData/SyncMasterData'));
const ConsumptionDetails = React.lazy(() => import('../../views/Consumption/ConsumptionDetails'));

const AddLanguage = React.lazy(() => import('../../views/Language/AddLanguageComponent'));
const ListLanguage = React.lazy(() => import('../../views/Language/LanguageListComponent'));
const EditLanguage = React.lazy(() => import('../../views/Language/EditLanguageComponent'));
const EditProblem = React.lazy(() => import('../../views/Report/EditProblem'));
const AddProblem = React.lazy(() => import('../../views/Report/AddProblem'));

const AddUnit = React.lazy(() => import('../../views/Unit/AddUnitComponent'));
const ListUnit = React.lazy(() => import('../../views/Unit/UnitListComponent'));
const EditUnit = React.lazy(() => import('../../views/Unit/EditUnitComponent'));

const AddCountry = React.lazy(() => import('../../views/Country/AddCountryComponent'));
const ListCountry = React.lazy(() => import('../../views/Country/ListCountryComponent'));
const EditCountry = React.lazy(() => import('../../views/Country/EditCountryComponent'));

const AddDataSource = React.lazy(() => import('../../views/DataSource/AddDataSource'));
const ListDataSource = React.lazy(() => import('../../views/DataSource/DataSourceListComponent'));
const EditDataSource = React.lazy(() => import('../../views/DataSource/UpdateDataSourceComponent'));

const AddDataSourceType = React.lazy(() => import('../../views/DataSourceType/AddDataSourceTypeComponent'));
const ListDataSourceType = React.lazy(() => import('../../views/DataSourceType/DataSourceTypeListComponent'));
const EditDataSourceType = React.lazy(() => import('../../views/DataSourceType/UpdateDataSourceTypeComponent'));

const AddCurrency = React.lazy(() => import('../../views/Currency/AddCurrencyComponent'));
const ListCurrency = React.lazy(() => import('../../views/Currency/ListCurrencyComponent'));
const EditCurrency = React.lazy(() => import('../../views/Currency/EditCurrencyComponent'));
const DatabaseTranslation = React.lazy(() => import('../../views/Translations/DatabaseTranslations'));
const LabelTranslation = React.lazy(() => import('../../views/Translations/LabelTranslations'))
// const ProgramTree = React.lazy(() => import('../../views/Dashboard/ProgramTree'));


const AddRealm = React.lazy(() => import('../../views/Realm/AddRealmComponent'));
const RealmList = React.lazy(() => import('../../views/Realm/ListRealmComponent'));
const EditRealm = React.lazy(() => import('../../views/Realm/EditRealmComponent'));
const SupplyPlan = React.lazy(() => import('../../views/SupplyPlan/SupplyPlanComponent'));
const WhatIfReport = React.lazy(() => import('../../views/WhatIfReport/whatIfReport'));
const ManualTagging = React.lazy(() => import('../../views/ManualTagging/ManualTagging'));
const ShipmentDelinking = React.lazy(() => import('../../views/ManualTagging/ShipmentDelinking'));


const AddForecastingUnit = React.lazy(() => import('../../views/ForecastingUnit/AddForecastingUnitComponent'));
const ForecastingUnitList = React.lazy(() => import('../../views/ForecastingUnit/ForecastingUnitListComponent'));
const EditForecastingUnit = React.lazy(() => import('../../views/ForecastingUnit/EditForecastingUnitComponent'));

const AddPlanningUnit = React.lazy(() => import('../../views/PlanningUnit/AddPlanningUnit'));
const PlanningUnitList = React.lazy(() => import('../../views/PlanningUnit/PlanningUnitListComponent'));
const EditPlanningUnit = React.lazy(() => import('../../views/PlanningUnit/EditPlanningUnitComponent'));

const ListProcurementUnit = React.lazy(() => import('../../views/ProcurementUnit/ListProcurementUnit'))
const AddProcurementUnit = React.lazy(() => import('../../views/ProcurementUnit/AddProcurementUnit'))
const EditProcurementUnit = React.lazy(() => import('../../views/ProcurementUnit/EditProcurementUnit'))
const AddProcurementAgentPlanningUnit = React.lazy(() => import('../../views/ProcurementAgentPlanningUnit/AddProcurementAgentPlanningUnit'));
const AddProcurementAgentProcurementUnit = React.lazy(() => import('../../views/ProcurementAgentProcurementUnit/AddProcurementAgentProcurementUnit'));
const PlanningUnitCapacity = React.lazy(() => import('../../views/PlanningUnitCapacity/PlanningUnitCapacity'));
const PlanningUnitCountry = React.lazy(() => import('../../views/RealmCountry/RealmCountryPlanningUnit'));
const PlanningUnitCountryList = React.lazy(() => import('../../views/RealmCountry/RealmCountryPlanningUnitList'));
const PlanningUnitCapacityList = React.lazy(() => import('../../views/PlanningUnitCapacity/PlanningUnitCapacityList'));
const RealmCountryRegion = React.lazy(() => import('../../views/RealmCountry/RealmCountryRegion'));
const syncPage = React.lazy(() => import('../../views/Synchronisation/syncPage'));

const ProductCatalog = React.lazy(() => import('../../views/Report/ProductCatalog'));
const ConsumptionReport = React.lazy(() => import('../../views/Report/Consumption'));
const StockStatusMatrixReport = React.lazy(() => import('../../views/Report/StockStatusMatrix'));
const StockStatusReport = React.lazy(() => import('../../views/Report/StockStatus'));
const GlobalConsumptionReport = React.lazy(() => import('../../views/Report/GlobalConsumption'));
const ProgramOnboarding = React.lazy(() => import('../../views/Program/ProgramOnboarding'));
const ShipmentList = React.lazy(() => import('../../views/Shipment/ShipmentDetails'));
const ForecastMetricsOverTime = React.lazy(() => import('../../views/Report/ForecastMetricsOverTime'));
const pipeline = React.lazy(() => import('../../views/Pipeline/PipelineProgramImport'));
const pipelineProgramSetup = React.lazy(() => import('../../views/Pipeline/PipelineProgramSetup'));
const StockStatusOverTime = React.lazy(() => import('../../views/Report/StockStatusOverTime'));
const SupplyPlanFormulas = React.lazy(() => import('../../views/SupplyPlan/SupplyPlanFormulas'));
const ForecastMetrics = React.lazy(() => import('../../views/Report/ForecastMetrics'));

const QatProblemPlusActionReport = React.lazy(() => import('../../views/Report/QatProblemPlusActionReport'));
const ProblemList = React.lazy(() => import('../../views/Report/ProblemList'));
const FunderExport = React.lazy(() => import('../../views/Report/FunderExport'));
const ProcurementAgentExport = React.lazy(() => import('../../views/Report/ProcurementAgentExport'));
const SupplierLeadTimes = React.lazy(() => import('../../views/Report/SupplierLeadTimes'));
const ShipmentGlobalDemandView = React.lazy(() => import('../../views/Report/ShipmentGlobalDemandView'));
const AggregateShipmentByProduct = React.lazy(() => import('../../views/Report/AggregateShipmentByProduct'));
const ShipmentGlobalView = React.lazy(() => import('../../views/Report/ShipmentGlobalView'));

const AnnualShipmentCost = React.lazy(() => import('../../views/Report/AnnualShipmentCost'));
const SupplyPlanVersionAndReview = React.lazy(() => import('../../views/Report/SupplyPlanVersionAndReview'));
const EditSupplyPlanStatus = React.lazy(() => import('../../views/Report/EditSupplyPlanStatus'));


const PipelineProgramList = React.lazy(() => import('../../views/Pipeline/PipelineProgramList'));

const PlanningUnitListNegativeInventory = React.lazy(() => import('../../views/Pipeline/PlanningUnitListNegativeInventory'));
const CostOfInventoryReport = React.lazy(() => import('../../views/Report/CostOfInventory'));
const InventoryTurnsReport = React.lazy(() => import('../../views/Report/InventoryTurns'));
const ShipmentSummery = React.lazy(() => import('../../views/Report/ShipmentSummery'));

const WarehouseCapacity = React.lazy(() => import('../../views/Report/WarehouseCapacity'));
const StockStatusAccrossPlanningUnitGlobalView = React.lazy(() => import('../../views/Report/StockStatusAccrossPlanningUnitGlobalView'));
const StockAdjustment = React.lazy(() => import('../../views/Report/StockAdjustment'));
const StockStatusReportAcrossPlanningUnits = React.lazy(() => import('../../views/Report/StockStatusAcrossPlanningUnits'));
const ExpiredInventory = React.lazy(() => import('../../views/Report/ExpiredInventory'));
const Budgets = React.lazy(() => import('../../views/Report/Budgets'));
const QuantimedImport = React.lazy(() => import('../../views/Quantimed/QuantimedImportOnboarding'));
const UploadUserManual = React.lazy(() => import('../../views/UserManual/UploadUserManual'));
// const EditProblem = React.lazy(() => import('../../views/Problem/EditProblem'));

const AddIntegration = React.lazy(() => import('../../views/Integration/AddIntegrationComponent'));
const IntegrationList = React.lazy(() => import('../../views/Integration/IntegrationListComponent'));
const EditIntegration = React.lazy(() => import('../../views/Integration/EditIntegrationComponent'));

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [

  { path: '/consumptionDetails/:programId/:versionId/:planningUnitId', name: 'static.consumptionDetailHead.consumptionDetail', component: ConsumptionDetails },
  { path: '/shipment/shipmentDetails/:programId/:versionId/:planningUnitId', name: 'static.shipmentDetailHead.shipmentDetail', component: ShipmentList },
  { path: '/report/addProblem/:color/:message', name: 'static.breadcrum.add', entityname: 'static.report.problem', component: AddProblem },
  { path: '/report/problemList/:color/:message', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.qatProblem', component: ProblemList },
  { path: '/report/problemList/:programId/:calculate/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.qatProblem', component: ProblemList },
  { path: '/report/problemList/1/:programId/:calculate', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.qatProblem', component: ProblemList },
  // { path: '/report/problemList', name: 'Qat Problem List', component: ProblemList },

  { path: '/problem/editProblem', name: ' Edit Problem', component: EditProblem },
  { path: '/report/inventoryTurns', name: 'static.dashboard.inventoryTurns', component: InventoryTurnsReport },
  { path: '/report/costOfInventory', name: 'static.dashboard.costOfInventory', component: CostOfInventoryReport },
  { path: '/pipeline/planningUnitListFinalInventory/:pipelineId', name: 'static.breadcrum.list', entityname: 'static.dashboard.planningunit', component: PlanningUnitListNegativeInventory },
  { path: '/pipeline/pieplineProgramList/:color/:message', name: 'static.dashboard.pipelineprogramlist', component: PipelineProgramList },
  { path: '/pipeline/pieplineProgramList', exact: true, name: 'static.dashboard.pipelineprogramlist', component: PipelineProgramList },
  { path: '/pipeline/pieplineProgramSetup/:pipelineId', name: 'static.dashboard.programimport', component: pipelineProgramSetup },
  { path: '/pipeline/pipelineProgramImport', name: 'static.dashboard.programimport', component: pipeline },
  { path: '/program/programOnboarding', name: 'static.dashboard.setupprogram', component: ProgramOnboarding },

  { path: '/inventory/addInventory/:programId/:versionId/:planningUnitId', name: 'static.inventoryDetailHead.inventoryDetail', component: AddInventory },
  { path: '/inventory/addInventory', name: 'static.inventoryDetailHead.inventoryDetail', component: AddInventory, exact: true },

  { path: '/productCategory/productCategoryTree', name: 'static.dashboard.productcategory', component: ProductCategoryTree },
  { path: '/productCategory/productCategoryTree/:color/:message', name: 'static.dashboard.productcategory', component: ProductCategoryTree },

  { path: '/', exact: true, name: 'static.home' },
  { path: '/programTree', name: 'static.dashboard.program', component: ProgramTree },
  { path: '/program/deleteLocalProgram', name: 'static.program.deleteLocalProgram', component: DeleteLocalPrograms },
  { path: '/diamension/AddDiamension', name: 'static.breadcrum.add', entityname: 'static.dashboard.dimensionheader', component: AddDimension },
  { path: '/dimension/listDimension', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.dimension', component: DimensionList },
  // { path: '/dimension/listDimension/:message', component: DimensionList },
  { path: '/dimension/listDimension/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.dimension', component: DimensionList },
  { path: '/dimension/listDimension/:message', component: DimensionList },
  { path: '/diamension/editDiamension/:dimensionId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.dimensionheader', component: EditDimension },

  { path: '/realm/addrealm', name: 'static.breadcrum.add', entityname: 'static.dashboard.realmheader', component: AddRealm },
  { path: '/realm/listRealm', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.realmheader', component: RealmList },
  { path: '/realm/updateRealm/:realmId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.realmheader', component: EditRealm },
  { path: '/realm/listRealm/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.realmheader', component: RealmList },

  { path: '/product/editProduct/:productId', name: 'static.breadcrum.edit', entityname: 'static.product.product', component: EditProdct },
  { path: '/product/listProduct', exact: true, name: 'static.breadcrum.list', entityname: 'static.product.product', component: ListProdct },
  { path: '/product/listProduct/:message', name: 'static.breadcrum.list', entityname: 'static.product.product', component: ListProdct },
  { path: '/product/addProduct', name: 'static.breadcrum.add', entityname: 'static.product.product', component: AddProduct },

  { path: '/program/addProgram', name: 'static.breadcrum.add', entityname: 'static.programHead.program', component: AddProgram },
  { path: '/program/listProgram', exact: true, name: 'static.breadcrum.list', entityname: 'static.programHead.program', component: Programs },
  // { path: '/program/listProgram/:message', component: Programs },
  { path: '/program/listProgram/:color/:message', name: 'static.breadcrum.list', entityname: 'static.programHead.program', component: Programs },
  { path: '/program/editProgram/:programId', name: 'static.programHead.program', entityname: 'static.programHead.program', component: EditProgram },

  { path: '/productCategory/addProductCategory', name: 'Add Product Category', component: AddProductCategory },
  // { path: '/programProduct/addProgramProduct', name: 'static.breadcrum.add', entityname: 'static.dashboard.programPlanningUnit', component: AddProgramProduct },
  { path: '/programProduct/addProgramProduct', exact: true, name: 'static.Update.PlanningUnits', component: AddProgramProduct },
  { path: '/programProduct/addProgramProduct/:programId/:color/:message', name: 'static.Update.PlanningUnits', component: AddProgramProduct },


  { path: '/procurementAgent/addProcurementAgentPlanningUnit/:procurementAgentId', name: 'static.breadcrum.add', entityname: 'static.dashboard.procurementAgentPlanningUnit', component: AddProcurementAgentPlanningUnit },
  { path: '/procurementAgent/addProcurementAgentProcurementUnit/:procurementAgentId', name: 'static.breadcrum.add', entityname: 'static.dashboard.procurementAgentProcurementUnit', component: AddProcurementAgentProcurementUnit },

  { path: '/budget/addBudget', name: 'static.breadcrum.add', entityname: 'static.dashboard.budget', component: AddBudgetComponent },
  { path: '/budget/listBudget', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.budget', component: ListBudgetComponent },
  // { path: '/budget/listBudget/:message', component: ListBudgetComponent },
  { path: '/budget/listBudget/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.budget', component: ListBudgetComponent },
  { path: '/budget/editBudget/:budgetId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.budget', component: EditBudgetComponent },


  { path: '/healthArea/addHealthArea', name: 'static.breadcrum.add', entityname: 'static.dashboard.healthareaheader', component: AddHealthArea },
  // { path: '/healthArea/listHealthArea/:message', component: HealthAreaList },
  { path: '/healthArea/listHealthArea/:color/:message', name: 'static.breadcrum.list', entityname: 'static.healtharea.healtharea', component: HealthAreaList },
  { path: '/healthArea/listHealthArea', exact: true, name: 'static.breadcrum.list', entityname: 'static.healtharea.healtharea', component: HealthAreaList },
  { path: '/healthArea/editHealthArea/:healthAreaId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.healthareaheader', component: EditHealthArea },

  { path: '/organisation/addOrganisation', name: 'static.breadcrum.add', entityname: 'static.organisationHead.organisation', component: AddOrganisation },
  // { path: '/organisation/listOrganisation/:message', component: OrganisationList },
  { path: '/organisation/listOrganisation/:color/:message', name: 'static.breadcrum.list', entityname: 'static.organisationHead.organisation', component: OrganisationList },
  { path: '/organisation/listOrganisation', exact: true, name: 'static.breadcrum.list', entityname: 'static.organisationHead.organisation', component: OrganisationList },
  { path: '/organisation/editOrganisation/:organisationId', name: 'static.breadcrum.edit', entityname: 'static.organisationHead.organisation', component: EditOrganisation },

  { path: '/fundingSource/addFundingSource', name: 'static.breadcrum.add', entityname: 'static.fundingSourceHead.fundingSource', component: AddFundingSource },
  { path: '/fundingSource/listFundingSource', exact: true, name: 'static.breadcrum.list', entityname: 'static.fundingSourceHead.fundingSource', component: ListFundingSource },
  { path: '/fundingSource/editFundingSource/:fundingSourceId', name: 'static.breadcrum.edit', entityname: 'static.fundingSourceHead.fundingSource', component: EditFundingSource },
  // { path: '/fundingSource/listFundingSource/:message', component: ListFundingSource },
  { path: '/fundingSource/listFundingSource/:color/:message', name: 'static.breadcrum.list', entityname: 'static.fundingSourceHead.fundingSource', component: ListFundingSource },

  { path: '/subFundingSource/addSubFundingSource', name: 'static.breadcrum.add', entityname: 'static.dashboard.subfundingsource', component: AddSubFundingSource },
  { path: '/subFundingSource/listSubFundingSource', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.subfundingsource', component: ListSubFundingSource },
  { path: '/subFundingSource/editSubFundingSource/:subFundingSourceId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.subfundingsource', component: EditSubFundingSource },
  { path: '/subFundingSource/subFundingSourceList/:message', component: SubFundingSourceList },
  { path: '/ApplicationDashboard/:id', exact: true, name: 'static.dashboard.applicationdashboard', component: ApplicationDashboard },
  { path: '/ApplicationDashboard/:id/:color/:message', exact: true, name: 'static.dashboard.applicationdashboard', component: ApplicationDashboard },
  { path: '/ApplicationDashboard', exact: true, name: 'static.dashboard.applicationdashboard', component: ApplicationDashboard },
  // { path: '/ApplicationDashboard/:message', component: ApplicationDashboard },
  { path: '/ApplicationDashboard/:color/:message', exact: true, name: 'static.dashboard.applicationdashboard', component: ApplicationDashboard },
  { path: '/shipmentLinkingNotification', exact: true, name: 'static.mt.shipmentLinkingNotification', component: ShipmentLinkingNotifications },

  { path: '/RealmDashboard', name: 'static.dashboard.realmdashboard', component: RealmDashboard },
  { path: '/ProgramDashboard', name: 'static.dashboard.programdashboard', component: ProgramDashboard },
  { path: '/dashboard', exact: true, name: 'static.common.dashboard', component: Dashboard },

  { path: '/subFundingSource/subFundingSourceList/:message', component: SubFundingSourceList },
  { path: '/subFundingSource/listSubFundingSource/:message', component: ListSubFundingSource },

  { path: '/procurementAgent/addProcurementAgent', name: 'static.breadcrum.add', entityname: 'static.dashboard.procurementagentheader', component: AddProcurementAgent },
  { path: '/procurementAgent/listProcurementAgent', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.procurementagent', component: ListProcurementAgent },
  // { path: '/procurementAgent/listProcurementAgent/:message', component: ListProcurementAgent },
  { path: '/procurementAgent/listProcurementAgent/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.procurementagent', component: ListProcurementAgent },
  { path: '/procurementAgent/editProcurementAgent/:procurementAgentId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.procurementagentheader', component: EditProcurementAgent },

  { path: '/tracerCategory/addTracerCategory', name: 'static.breadcrum.add', entityname: 'static.tracerCategoryHead.tracerCategory', component: AddTracerCategory },
  { path: '/tracerCategory/listTracerCategory', exact: true, name: 'static.breadcrum.list', entityname: 'static.tracerCategoryHead.tracerCategory', component: ListTracerCategory },
  // { path: '/tracerCategory/listTracerCategory/:message', component: ListTracerCategory },
  { path: '/tracerCategory/listTracerCategory/:color/:message', name: 'static.breadcrum.list', entityname: 'static.tracerCategoryHead.tracerCategory', component: ListTracerCategory },
  { path: '/tracerCategory/editTracerCategory/:tracerCategoryId', name: 'static.breadcrum.edit', entityname: 'static.tracerCategoryHead.tracerCategory', component: EditTracerCategory },

  { path: '/supplier/addSupplier', name: 'static.breadcrum.add', entityname: 'static.dashboard.supplierheader', component: AddSupplier },
  { path: '/supplier/listSupplier', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.supplier', component: ListSupplier },
  { path: '/supplier/editSupplier/:supplierId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.supplierheader', component: EditSupplier },
  // { path: '/supplier/listSupplier/:message', component: ListSupplier },
  { path: '/supplier/listSupplier/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.supplier', component: ListSupplier },



  { path: '/region/addRegion', name: 'static.breadcrum.add', entityname: 'static.regionHead.region', component: AddRegion },
  // { path: '/region/listRegion', exact: true, name:'static.breadcrum.list',  entityname:'static.dashboard.region' ,component: ListRegion },
  { path: '/region/listRegion', exact: true, name: 'static.regionHead.region', component: ListRegion },
  { path: '/region/editRegion/:regionId', name: 'static.regionHead.region', entityname: 'static.dashboard.region', component: EditRegion },
  { path: '/region/listRegion/:message', component: ListRegion },



  // { path: '/realmCountry/listRealmCountry/:message', component: ListRealmCountry },
  { path: '/realmCountry/listRealmCountry/:color/:message', name: 'static.dashboard.realmcountry', component: ListRealmCountry },
  { path: '/realmCountry/listRealmCountry', exact: true, name: 'static.dashboard.realmcountry', component: ListRealmCountry },
  { path: '/realmCountry/addRealmCountry', exact: true, name: 'static.breadcrum.add', entityname: 'static.dashboard.realmcountry', component: AddRealmCountry },
  { path: '/realmCountry/realmCountry/:realmId', exact: true, name: 'static.dashboard.realmcountry', component: RealmCountry },
  { path: '/program/addIntegration/:programId', exact: true, name: 'static.integration.programIntegration', component: AddProgramIntegration },
  { path: '/programProduct/addCountrySpecificPrice/:programPlanningUnitId/:programId', exact: true, name: 'static.countrySpecificPrices.countrySpecificPrices', component: AddCountrySpecificPrice },

  { path: '/changePassword', exact: true, name: 'static.dashboard.changepassword', component: ChangePassword },
  { path: '/logout', exact: true, component: Logout },
  { path: '/logout/:message', exact: true, component: Logout },
  { path: '/role/listRole/:color/:message', name: 'static.breadcrum.list', entityname: 'static.roleHead.role', component: ListRole },
  { path: '/role/listRole', exact: true, name: 'static.breadcrum.list', entityname: 'static.roleHead.role', component: ListRole },
  { path: '/role/addRole', exact: true, name: 'static.breadcrum.add', entityname: 'static.roleHead.role', component: AddRole },
  { path: '/role/editRole/:roleId', exact: true, name: 'static.breadcrum.edit', entityname: 'static.roleHead.role', component: EditRole },

  // { path: '/user/listUser/:message', component: ListUser },
  { path: '/user/listUser/:color/:message', name: 'static.breadcrum.list', entityname: 'static.userHead.user', component: ListUser },
  { path: '/user/listUser', exact: true, name: 'static.breadcrum.list', entityname: 'static.userHead.user', component: ListUser },
  { path: '/user/addUser', exact: true, name: 'static.breadcrum.add', entityname: 'static.userHead.user', component: AddUser },
  { path: '/user/editUser/:userId', exact: true, name: 'static.breadcrum.edit', entityname: 'static.userHead.user', component: EditUser },
  { path: '/user/accessControl/:userId', exact: true, name: 'static.dashboard.useraccessctrl', component: AccessControl },
  { path: '/accessDenied', exact: true, component: AccessDenied },

  // { path: '/dashboard/:message', component: Dashboard },
  { path: '/dashboard/:color/:message', component: Dashboard },
  { path: '/program/downloadProgram', name: 'static.dashboard.downloadprogram', component: ProgramTree },
  { path: '/program/syncPage', name: "static.dashboard.commitVersion", component: syncPage },
  { path: '/program/downloadProgram/:message', component: ProgramTree },
  { path: '/program/exportProgram', name: 'static.dashboard.exportprogram', component: ExportProgram },
  { path: '/program/importProgram', name: 'static.dashboard.importprogram', component: ImportProgram },

  // { path: '/masterDataSync', name:'static.dashboard.masterdatasync' ,component: MasterDataSync },
  // { path: '/masterDataSync/:message',  component: MasterDataSync },

  { path: '/consumptionDetails', exact: true, name: 'static.consumptionDetailHead.consumptionDetail', component: ConsumptionDetails },

  { path: '/language/addLanguage', name: 'static.breadcrum.add', entityname: 'static.dashboard.languageheader', component: AddLanguage },
  { path: '/language/listLanguage', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.language', component: ListLanguage },
  { path: '/language/listLanguage/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.language', component: ListLanguage },
  { path: '/language/editLanguage/:languageId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.languageheader', component: EditLanguage },
  { path: '/report/editProblem/:problemReportId/:programId/:index/:problemStatusId/:problemTypeId', name: 'static.breadcrum.edit', entityname: 'static.report.problem', component: EditProblem },
  { path: '/report/addProblem', name: 'static.dashboard.add.problem', component: AddProblem },

  { path: '/unit/addUnit', name: 'static.breadcrum.add', entityname: 'static.dashboard.unit', component: AddUnit },
  { path: '/unit/listUnit', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.unit', component: ListUnit },
  // { path: '/unit/listUnit/:message', component: ListUnit },
  { path: '/unit/listUnit/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.unit', component: ListUnit },
  { path: '/unit/editUnit/:unitId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.unit', component: EditUnit },

  { path: '/country/addCountry', name: 'static.breadcrum.add', entityname: 'static.dashboard.country', component: AddCountry },
  { path: '/country/listCountry', exact: true, name: 'static.dashboard.country', component: ListCountry },
  // { path: '/country/listCountry/:message', component: ListCountry },
  { path: '/country/listCountry/:color/:message', name: 'static.dashboard.country', component: ListCountry },
  { path: '/country/editCountry/:countryId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.country', component: EditCountry },

  { path: '/dataSourceType/addDataSourceType', name: 'static.breadcrum.add', entityname: 'static.dataSourceTypeHead.dataSourceType', component: AddDataSourceType },
  { path: '/dataSourceType/listDataSourceType', exact: true, name: 'static.breadcrum.list', entityname: 'static.dataSourceTypeHead.dataSourceType', component: ListDataSourceType },
  // { path: '/dataSourceType/listDataSourceType/:message', component: ListDataSourceType },
  { path: '/dataSourceType/listDataSourceType/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dataSourceTypeHead.dataSourceType', component: ListDataSourceType },
  { path: '/dataSourceType/editDataSourceType/:dataSourceTypeId', name: 'static.breadcrum.edit', entityname: 'static.dataSourceTypeHead.dataSourceType', component: EditDataSourceType },

  { path: '/dataSource/addDataSource', name: 'static.breadcrum.add', entityname: 'static.dashboard.datasourcehaeder', component: AddDataSource },
  { path: '/dataSource/listDataSource', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.datasource', component: ListDataSource },
  // { path: '/dataSource/listDataSource/:message', component: ListDataSource },
  { path: '/dataSource/listDataSource/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.datasource', component: ListDataSource },
  { path: '/dataSource/editDataSource/:dataSourceId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.datasourcehaeder', component: EditDataSource },

  { path: '/currency/addCurrency', name: 'static.breadcrum.add', entityname: 'static.dashboard.currency', component: AddCurrency },
  { path: '/currency/listCurrency', exact: true, name: 'static.dashboard.currency', component: ListCurrency },
  { path: '/currency/listCurrency/:color/:message', name: 'static.dashboard.currency', component: ListCurrency },
  // { path: '/currency/listCurrency/:message', component: ListCurrency },
  { path: '/currency/editCurrency/:currencyId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.currency', component: EditCurrency },

  { path: '/translations/databaseTranslations', name: 'static.label.databaseTranslations', component: DatabaseTranslation },
  { path: '/translations/labelTranslations', name: 'static.label.labelTranslations', component: LabelTranslation },

  { path: '/supplyPlan', exact: true, name: 'static.dashboard.supplyPlan', component: SupplyPlan },
  { path: '/supplyPlan/:programId/:versionId/:planningUnitId', exact: true, name: 'static.dashboard.supplyPlan', component: SupplyPlan },
  { path: '/supplyPlan/:programId/:planningUnitId/:batchNo/:expiryDate', exact: true, name: 'static.dashboard.supplyPlan', component: SupplyPlan },

  { path: '/report/whatIf', name: 'static.dashboard.whatIf', component: WhatIfReport },
  { path: '/shipment/manualTagging', name: 'static.dashboard.manualTagging', component: ManualTagging },
  { path: '/shipment/delinking', name: 'static.dashboard.delinking', component: ShipmentDelinking },
  { path: '/supplyPlanFormulas', name: 'static.supplyplan.supplyplanformula', component: SupplyPlanFormulas },


  { path: '/forecastingUnit/addForecastingUnit', name: 'static.breadcrum.add', entityname: 'static.dashboard.forecastingunit', component: AddForecastingUnit },
  { path: '/forecastingUnit/listForecastingUnit', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.forecastingunit', component: ForecastingUnitList },
  // { path: '/forecastingUnit/listForecastingUnit/:message', component: ForecastingUnitList },
  { path: '/forecastingUnit/listForecastingUnit/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.forecastingunit', component: ForecastingUnitList },
  { path: '/forecastingUnit/editForecastingUnit/:forecastingUnitId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.forecastingunit', component: EditForecastingUnit },

  { path: '/planningUnit/addPlanningUnit', name: 'static.breadcrum.add', entityname: 'static.dashboard.planningunitheader', component: AddPlanningUnit },
  { path: '/planningUnit/listPlanningUnit', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.planningunit', component: PlanningUnitList },
  // { path: '/planningUnit/listPlanningUnit/:message', component: PlanningUnitList },
  { path: '/planningUnit/listPlanningUnit/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.planningunit', component: PlanningUnitList },
  { path: '/planningUnitCapacity/planningUnitCapacity/:planningUnitId', name: 'static.dashboad.planningunitcapacityheader', component: PlanningUnitCapacity },


  { path: '/procurementUnit/addProcurementUnit', name: 'static.breadcrum.add', entityname: 'static.dashboard.procurementUnitheader', component: AddProcurementUnit },
  { path: '/procurementUnit/listProcurementUnit', exact: true, name: 'static.breadcrum.list', entityname: 'static.procurementUnit.procurementUnit', component: ListProcurementUnit },
  // { path: '/procurementUnit/listProcurementUnit/:message', component: ListProcurementUnit },
  { path: '/procurementUnit/listProcurementUnit/:color/:message', name: 'static.breadcrum.list', entityname: 'static.procurementUnit.procurementUnit', component: ListProcurementUnit },
  { path: '/procurementUnit/editProcurementUnit', exact: true, name: 'static.breadcrum.edit', entityname: 'static.dashboard.procurementUnitheader', component: EditProcurementUnit },
  { path: '/procurementUnit/editProcurementUnit/:procurementUnitId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.procurementUnitheader', component: EditProcurementUnit },
  { path: '/planningUnit/editPlanningUnit/:planningUnitId', exact: true, name: 'static.breadcrum.edit', entityname: 'static.dashboard.planningunitheader', component: EditPlanningUnit },
  { path: '/realmCountry/listRealmCountryPlanningUnit', exact: true, name: 'static.dashboad.planningunitcountry', component: PlanningUnitCountryList },
  { path: '/realmCountry/listRealmCountryPlanningUnit/:color/:message', name: 'static.dashboad.planningunitcountry', component: PlanningUnitCountryList },
  { path: '/planningUnitCapacity/planningUnitCapacity/:planningUnitId', name: 'static.dashboad.planningunitcapacity', component: PlanningUnitCapacity },
  { path: '/realmCountry/realmCountryPlanningUnit/:realmCountryId', name: 'static.dashboad.planningunitcountry', component: PlanningUnitCountry },
  { path: '/planningUnitCapacity/listPlanningUnitCapacity', name: 'static.planningUnitVolumeHead.planningUnitVolume', component: PlanningUnitCapacityList },
  { path: '/realmCountry/realmCountryRegion/:realmCountryId', name: 'static.dashboad.regioncountry', component: RealmCountryRegion },
  { path: '/report/productCatalog', name: 'static.dashboard.productcatalog', component: ProductCatalog },
  { path: '/report/consumption', name: 'static.dashboard.consumption', component: ConsumptionReport },
  { path: '/report/stockStatusMatrix', name: 'static.dashboard.stockstatusmatrix', component: StockStatusMatrixReport },
  { path: '/report/stockStatus', name: 'static.dashboard.stockstatus', component: StockStatusReport },
  { path: '/report/globalConsumption', name: 'static.dashboard.globalconsumption', component: GlobalConsumptionReport },
  { path: '/report/forecastOverTheTime', name: 'static.report.forecasterrorovertime', component: ForecastMetricsOverTime },
  { path: '/report/stockStatusOverTime', name: 'static.dashboard.stockstatusovertime', component: StockStatusOverTime },
  { path: '/report/forecastMetrics', name: 'static.dashboard.forecastmetrics', component: ForecastMetrics },

  { path: '/report/qatProblemPlusActionReport', name: 'static.report.qatProblemActionReport', component: QatProblemPlusActionReport },
  { path: '/report/problemList', name: 'static.dashboard.qatProblemList', component: ProblemList },

  { path: '/report/funderExport', name: 'static.dashboard.funderExport', component: FunderExport },
  { path: '/report/procurementAgentExport', name: 'static.report.shipmentCostReport', component: ProcurementAgentExport },
  { path: '/report/supplierLeadTimes', name: 'static.dashboard.supplierLeadTimes', component: SupplierLeadTimes },
  { path: '/report/shipmentGlobalDemandView', name: 'static.dashboard.shipmentGlobalDemandViewheader', component: ShipmentGlobalDemandView },
  { path: '/report/aggregateShipmentByProduct', name: 'static.dashboard.aggregateShipmentByProduct', component: AggregateShipmentByProduct },
  { path: '/report/shipmentGlobalView', name: 'static.dashboard.shipmentGlobalViewheader', component: ShipmentGlobalView },


  { path: '/report/annualShipmentCost', name: 'static.report.annualshipmentcost', component: AnnualShipmentCost },

  { path: '/report/supplyPlanVersionAndReview', exact: true, name: 'static.report.supplyplanversionandreviewReport', component: SupplyPlanVersionAndReview },
  { path: '/report/editStatus/:programId/:versionId', name: 'static.supplyPlan.updateProgramStatus', component: EditSupplyPlanStatus },
  { path: '/report/supplyPlanVersionAndReview/:color/:message', name: 'static.report.supplyplanversionandreviewReport', component: SupplyPlanVersionAndReview },

  { path: '/report/shipmentSummery', exact: true, name: 'static.report.shipmentDetailReport', component: ShipmentSummery },
  { path: '/report/shipmentSummery/:message',exact:true,name: 'static.report.shipmentSummeryReport', component: ShipmentSummery },
  { path: '/report/shipmentSummery/:budgetId/:budgetCode', name: 'static.report.shipmentSummeryReport', component: ShipmentSummery },
  { path: '/report/stockStatusAcrossPlanningUnits', name: 'static.dashboard.stockstatusacrossplanningunit', component: StockStatusReportAcrossPlanningUnits },
  { path: '/report/budgets', name: 'static.budgetHead.budget', component: Budgets },
  { path: '/userManual/uploadUserManual', exact: true, entityname: 'static.dashboard.uploadUserManual', name: 'static.dashboard.uploadUserManual', component: UploadUserManual },



  { path: '/theme', name: 'Theme', component: Colors, exact: true },
  { path: '/theme/colors', name: 'Colors', component: Colors },
  { path: '/theme/typography', name: 'Typography', component: Typography },
  { path: '/base', name: 'Base', component: Cards, exact: true },
  { path: '/base/breadcrumbs', name: 'Breadcrumbs', component: Breadcrumbs },
  { path: '/base/cards', name: 'Cards', component: Cards },
  { path: '/base/carousels', name: 'Carousel', component: Carousels },
  { path: '/base/collapses', name: 'Collapse', component: Collapses },
  { path: '/base/dropdowns', name: 'Dropdowns', component: Dropdowns },
  { path: '/base/jumbotrons', name: 'Jumbotrons', component: Jumbotrons },
  { path: '/base/list-groups', name: 'List Groups', component: ListGroups },
  { path: '/base/navbars', name: 'Navbars', component: Navbars },
  { path: '/base/navs', name: 'Navs', component: Navs },
  { path: '/base/paginations', name: 'Paginations', component: Paginations },
  { path: '/base/popovers', name: 'Popovers', component: Popovers },
  { path: '/base/progress-bar', name: 'Progress Bar', component: ProgressBar },
  { path: '/base/spinners', name: 'Spinners', component: SpinnersB4 },
  { path: '/base/switches', name: 'Switches', component: Switches },
  { path: '/base/tabs', name: 'Tabs', component: Tabs },
  { path: '/base/tooltips', name: 'Tooltips', component: Tooltips },
  { path: '/buttons', name: 'Buttons', component: Buttons, exact: true },
  { path: '/buttons/buttons', name: 'Buttons', component: Buttons },
  { path: '/buttons/button-dropdowns', name: 'Dropdowns', component: ButtonDropdowns },
  { path: '/buttons/button-groups', name: 'Button Groups', component: ButtonGroups },
  { path: '/buttons/brand-buttons', name: 'Brand Buttons', component: BrandButtons },
  { path: '/buttons/loading-buttons', name: 'Loading Buttons', component: LoadingButtons },
  { path: '/charts', name: 'Charts', component: Charts },
  { path: '/editors', name: 'Editors', component: CodeEditors, exact: true },
  { path: '/editors/code-editors', name: 'Code Editors', component: CodeEditors },
  { path: '/editors/text-editors', name: 'Text Editors', component: TextEditors },
  { path: '/forms', name: 'Forms', component: BasicForms, exact: true },
  { path: '/forms/advanced-forms', name: 'Advanced Forms', component: AdvancedForms },
  { path: '/forms/basic-forms', name: 'Basic Forms', component: BasicForms },
  { path: '/forms/validation-forms', name: 'Form Validation', component: ValidationForms },
  { path: '/google-maps', name: 'Google Maps', component: GoogleMaps },
  { path: '/icons', exact: true, name: 'Icons', component: CoreUIIcons },
  { path: '/icons/coreui-icons', name: 'CoreUI Icons', component: CoreUIIcons },
  { path: '/icons/flags', name: 'Flags', component: Flags },
  { path: '/icons/font-awesome', name: 'Font Awesome', component: FontAwesome },
  { path: '/icons/simple-line-icons', name: 'Simple Line Icons', component: SimpleLineIcons },
  { path: '/notifications', name: 'Notifications', component: Alerts, exact: true },
  { path: '/notifications/alerts', name: 'Alerts', component: Alerts },
  { path: '/notifications/badges', name: 'Badges', component: Badges },
  { path: '/notifications/modals', name: 'Modals', component: Modals },
  { path: '/notifications/toastr', name: 'Toastr', component: Toastr },
  { path: '/plugins', name: 'Plugins', component: Calendar, exact: true },
  { path: '/plugins/calendar', name: 'Calendar', component: Calendar },
  { path: '/plugins/draggable', name: 'Draggable Cards', component: Draggable },
  { path: '/plugins/spinners', name: 'Spinners', component: Spinners },
  { path: '/tables', name: 'Tables', component: Tables, exact: true },
  { path: '/tables/data-table', name: 'Data Table', component: DataTable },
  { path: '/tables/tables', name: 'Tables', component: Tables },
  { path: '/widgets', name: 'Widgets', component: Widgets },
  { path: '/apps', name: 'Apps', component: Compose, exact: true },
  { path: '/apps/email', name: 'Email', component: Compose, exact: true },
  { path: '/apps/email/compose', name: 'Compose', component: Compose },
  { path: '/apps/email/inbox', name: 'Inbox', component: Inbox },
  { path: '/apps/email/message', name: 'Message', component: Message },
  { path: '/apps/invoicing', name: 'Invoice', component: Invoice, exact: true },
  { path: '/apps/invoicing/invoice', name: 'Invoice', component: Invoice },
  { path: '/users', exact: true, name: 'Users', component: Users },
  { path: '/users/:id', exact: true, name: 'User Details', component: User },
  { path: '/shipment/shipmentDetails', name: 'static.shipmentDetailHead.shipmentDetail', component: ShipmentList, exact: true },
  { path: '/report/warehouseCapacity', name: 'static.report.warehouseCapacity', component: WarehouseCapacity },
  { path: '/report/stockStatusAccrossPlanningUnitGlobalView', name: 'static.report.stockStatusAccrossPlanningUnitGlobalView', component: StockStatusAccrossPlanningUnitGlobalView },
  { path: '/report/stockAdjustment', name: 'static.report.stockAdjustment', component: StockAdjustment },
  // { path: '/report/expiredInventory', name:static.report.expiredInventory' ,component: ExpiredInventory },
  { path: '/report/expiredInventory', name: 'static.report.expiredInventory', component: ExpiredInventory },
  { path: '/quantimed/quantimedImport', name: 'static.quantimed.quantimedImport', component: QuantimedImport },

  { path: '/integration/AddIntegration', name: 'static.breadcrum.add', entityname: 'static.integration.integration', component: AddIntegration },
  { path: '/integration/listIntegration', exact: true, name: 'static.breadcrum.list', entityname: 'static.integration.integration', component: IntegrationList },
  // { path: '/integration/listIntegration/:message', component: IntegrationList },
  { path: '/integration/listIntegration/:color/:message', name: 'static.breadcrum.list', entityname: 'static.integration.integration', component: IntegrationList },
  { path: '/integration/listIntegration/:message', component: IntegrationList },
  { path: '/integration/editIntegration/:integrationId', name: 'static.breadcrum.edit', entityname: 'static.integration.integration', component: EditIntegration }
];

class DefaultLayout extends Component {

  constructor(props) {
    super(props);
    this.state = {
      businessFunctions: [],
      name: "",
      notificationCount: 0,
      //Timer
      // 15 min
      // timeout: 1000 * 450 * 1,
      // 5 min
      // timeout: 1000 * 150 * 1,
      // 1 hr
      timeout: 1000 * 1800 * 1,
      showModal: false,
      userLoggedIn: false,
      isTimedOut: false,
      changeIcon: false,
      programDataLastModifiedDate: '',
      downloadedProgramDataLastModifiedDate: ''
    }
    this.idleTimer = null
    this.onAction = this._onAction.bind(this)
    this.onActive = this._onActive.bind(this)
    this.onIdle = this._onIdle.bind(this)
    this.getProgramData = this.getProgramData.bind(this);
    this.getNotificationCount = this.getNotificationCount.bind(this);

    // this.getDownloadedPrograms = this.getDownloadedPrograms.bind(this);
    // this.checkIfLocalProgramVersionChanged = this.checkIfLocalProgramVersionChanged.bind(this);
  }
  checkEvent = (e) => {
    // console.log("checkEvent called---", e);
    if (e.type != "mousemove") {
      this._onAction(e);
    }
  }
  _onAction(e) {
    // console.log('user did something', e)
    // console.log('user event type', e.type)
    this.setState({ isTimedOut: false })
  }

  _onActive(e) {
    // console.log('user is active', e)
    this.setState({ isTimedOut: false })
  }

  _onIdle(e) {
    // console.log('user is idle', e)
    const isTimedOut = this.state.isTimedOut
    if (isTimedOut) {
      console.log("user timed out")
      localStorage.setItem("sessionTimedOut", 1);
      this.props.history.push('/logout/static.message.sessionExpired')
    } else {
      this.setState({ showModal: true })
      this.idleTimer.reset();
      this.setState({ isTimedOut: true })
    }

  }

  displayHeaderTitle = (name) => {
    if (this.state.name !== name) {
      console.log("P*** Call indexed db methods0---------------------------")
      this.getProgramData();
      this.getNotificationCount();
      // this.getDownloadedPrograms();
      // this.checkIfLocalProgramVersionChanged();
      this.setState({
        name
      });
    }
  }
  componentDidMount() {
    console.log("timeout default layout component did mount---------------")
    // this.refs.programChangeChild.checkIfLocalProgramVersionChanged()
    var curUserBusinessFunctions = AuthenticationService.getLoggedInUserRoleBusinessFunction();
    var bfunction = [];
    if (curUserBusinessFunctions != null && curUserBusinessFunctions != "") {
      for (let i = 0; i < curUserBusinessFunctions.length; i++) {
        bfunction.push(curUserBusinessFunctions[i]);
      }
      this.setState({ businessFunctions: bfunction });
    }
    // console.log("has business function---", this.state.businessFunctions.includes('ROLE_BF_DELETE_LOCAL_PROGARM'));

  }

  loading = () => <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>;
  changePassword(e) {
    e.preventDefault();
    // AuthenticationService.setupAxiosInterceptors();
    this.props.history.push(`/changePassword`);
  }
  signOut(e) {
    e.preventDefault();
    confirmAlert({
      message: i18n.t('static.logout.confirmLogout'),
      buttons: [
        {
          label: i18n.t('static.program.yes'),
          onClick: () => {
            this.props.history.push(`/logout/static.logoutSuccess`)
          }
        },
        {
          label: i18n.t('static.program.no')
        }
      ]
    });

  }
  goToLoadProgram(e) {
    e.preventDefault();
    this.props.history.push(`/program/downloadProgram/`)
  }
  goToCommitProgram(e) {
    e.preventDefault();
    if (isSiteOnline()) {
      this.props.history.push(`/program/syncPage/`)
    } else {
      confirmAlert({
        message: i18n.t('static.commit.offline'),
        buttons: [
          {
            label: i18n.t('static.common.close')
          }
        ]
      });
    }

  }
  showShipmentLinkingAlerts(e) {
    e.preventDefault();
    this.props.history.push(`/shipmentLinkingNotification`)
  }
  showDashboard(e) {
    // console.log("e------------------", e);
    e.preventDefault();
    var id = AuthenticationService.displayDashboardBasedOnRole();
    this.props.history.push(`/ApplicationDashboard/` + `${id}`)
  }

  getNotificationCount() {
    if (isSiteOnline()) {
      AuthenticationService.setupAxiosInterceptors();
      ManualTaggingService.getNotificationCount()
        .then(response => {
          console.log("notification response===", response.data);
          this.setState({
            notificationCount: response.data
          })
        }).catch(
          error => {
            this.setState({
              notificationCount: 0
            })
          }
        );
    }
  }
  getProgramData() {
    console.log("P***get programs called");
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
      this.setState({
        message: i18n.t('static.program.errortext'),
        color: 'red'
      })
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
      var program = transaction.objectStore('programQPLDetails');
      var getRequest = program.getAll();
      getRequest.onerror = function (event) {
        this.setState({
          message: i18n.t('static.program.errortext'),
          color: 'red',
          loading: false
        })
      }.bind(this);
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        var programModified = 0;
        for (var i = 0; i < myResult.length; i++) {
          if (myResult[i].userId == userId) {
            if (myResult[i].programModified == 1) {
              programModified = 1;
              break;
            }
          }
        }
        this.setState({
          programModified: programModified
        })
        console.log("Program modified@@@", programModified);
        if (programModified == 1) {
          console.log("P***d---hurrey local version changed-------------------------------------------------------------");
          localStorage.setItem("sesLocalVersionChange", true);
          this.setState({ changeIcon: true });
          console.log("P***d--------in if---------------")
        } else {
          localStorage.setItem("sesLocalVersionChange", false);
          this.setState({ changeIcon: false });
          console.log("P***d--------in else---------------")
        }
        // let finalmax = moment.max(proList.map(d => moment(d.lastModifiedDate)))
        // this.setState({
        //   programDataLastModifiedDate: moment.max(proList.map(d => moment(d.lastModifiedDate)))
        // }, () => {
        //   // this.props.func(this, this.state.programDataLastModifiedDate, this.state.downloadedProgramDataLastModifiedDate)
        // })
        // this.getDownloadedPrograms();
      }.bind(this);
    }.bind(this)

  }
  // getDownloadedPrograms() {
  //   console.log("P***get programs called 1");
  //   var db1;
  //   getDatabase();
  //   var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
  //   openRequest.onerror = function (event) {
  //     this.setState({
  //       message: i18n.t('static.program.errortext'),
  //       color: 'red'
  //     })
  //   }.bind(this);
  //   openRequest.onsuccess = function (e) {
  //     db1 = e.target.result;
  //     var transaction = db1.transaction(['downloadedProgramData'], 'readwrite');
  //     var program = transaction.objectStore('downloadedProgramData');
  //     var getRequest = program.getAll();
  //     var proList = []
  //     getRequest.onerror = function (event) {
  //       this.setState({
  //         message: i18n.t('static.program.errortext'),
  //         color: 'red',
  //         loading: false
  //       })
  //     }.bind(this);
  //     getRequest.onsuccess = function (event) {
  //       var myResult = [];
  //       myResult = getRequest.result;
  //       var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
  //       var userId = userBytes.toString(CryptoJS.enc.Utf8);
  //       for (var i = 0; i < myResult.length; i++) {
  //         if (myResult[i].userId == userId) {
  //           var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
  //           var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
  //           var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
  //           var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
  //           var programJson1 = JSON.parse(programData);
  //           console.log("1---programJson program id 1---", programJson1.programId);
  //           console.log("1---programData 1---", programData);
  //           console.log("1---programJson.consumptionList 1---", programJson1.consumptionList);
  //           console.log("1---programJson.inventoryList 1---", programJson1.inventoryList);
  //           console.log("1---programJson.shipmentList 1---", programJson1.shipmentList);
  //           let cmax = moment.max(programJson1.consumptionList.map(d => moment(d.lastModifiedDate)))
  //           console.log("1---cmax1---", moment.max(programJson1.consumptionList.map(d => moment(d.lastModifiedDate))));
  //           let imax = moment.max(programJson1.inventoryList.map(d => moment(d.lastModifiedDate)))
  //           console.log("1---imax1---", moment.max(programJson1.inventoryList.map(d => moment(d.lastModifiedDate))));
  //           let smax = moment.max(programJson1.shipmentList.map(d => moment(d.lastModifiedDate)))
  //           console.log("1---smax1---", moment.max(programJson1.shipmentList.map(d => moment(d.lastModifiedDate))));
  //           let pmax = moment.max(moment.max(programJson1.consumptionList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.inventoryList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.shipmentList.map(d => moment(d.lastModifiedDate))))
  //           console.log("1---pmax1---", moment.max(moment.max(programJson1.consumptionList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.inventoryList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.shipmentList.map(d => moment(d.lastModifiedDate)))));
  //           var programJson = {
  //             lastModifiedDate: moment.max(moment.max(programJson1.consumptionList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.inventoryList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.shipmentList.map(d => moment(d.lastModifiedDate))))
  //           }
  //           proList.push(programJson)
  //         }
  //       }
  //       // let finalmax = moment.max(proList.map(d => moment(d.lastModifiedDate)))
  //       // console.log("finalmax1---", moment.max(proList.map(d => moment(d.lastModifiedDate))))
  //       console.log("P***proList downloaded program data---",proList)
  //       this.setState({
  //         downloadedProgramDataLastModifiedDate: moment.max(proList.map(d => moment(d.lastModifiedDate)))
  //       }, () => {
  //         // this.props.func(this, this.state.programDataLastModifiedDate, this.state.downloadedProgramDataLastModifiedDate)
  //       })
  //       this.checkIfLocalProgramVersionChanged();
  //     }.bind(this);
  //   }.bind(this)

  // }
  // checkIfLocalProgramVersionChanged() {
  //   // checkClick = (e, programDataLastModifiedDate, downloadedProgramDataLastModifiedDate) => {
  //   // e.preventDefault();
  //   console.log("P***d---this.state.programDataLastModifiedDate---", this.state.programDataLastModifiedDate);
  //   console.log("P***d---downloadedProgramDataLastModifiedDate  ", this.state.downloadedProgramDataLastModifiedDate);
  //   console.log("P***d---result local version---", moment(this.state.programDataLastModifiedDate).format("YYYY-MM-DD HH:mm:ss") > moment(this.state.downloadedProgramDataLastModifiedDate).format("YYYY-MM-DD HH:mm:ss"))
  //   localStorage.removeItem("sesLocalVersionChange");
  //   if (moment(this.state.programDataLastModifiedDate).format("YYYY-MM-DD HH:mm:ss") > moment(this.state.downloadedProgramDataLastModifiedDate).format("YYYY-MM-DD HH:mm:ss")) {
  //     console.log("P***d---hurrey local version changed-------------------------------------------------------------");
  //     localStorage.setItem("sesLocalVersionChange", true);
  //     this.setState({ changeIcon: true });
  //     console.log("P***d--------in if---------------")
  //   } else {
  //     localStorage.setItem("sesLocalVersionChange", false);
  //     this.setState({ changeIcon: false });
  //     console.log("P***d--------in else---------------")
  //   }
  //   //   }
  // }
  // componentDidUpdate() {
  //   console.log("Parent component did update called---",this.refs)
  // }
  // checkClick = (e, programDataLastModifiedDate, downloadedProgramDataLastModifiedDate) => {
  //   // e.preventDefault();
  //   console.log("d---this.state.programDataLastModifiedDate---", programDataLastModifiedDate);
  //   console.log("d---downloadedProgramDataLastModifiedDate  ", downloadedProgramDataLastModifiedDate);
  //   console.log("d---result local version---", moment(programDataLastModifiedDate).format("YYYY-MM-DD HH:mm:ss") > moment(downloadedProgramDataLastModifiedDate).format("YYYY-MM-DD HH:mm:ss"))
  //   localStorage.removeItem("sesLocalVersionChange");
  //   if (moment(programDataLastModifiedDate).format("YYYY-MM-DD HH:mm:ss") > moment(downloadedProgramDataLastModifiedDate).format("YYYY-MM-DD HH:mm:ss")) {
  //     console.log("d---hurrey local version changed-------------------------------------------------------------");
  //     localStorage.setItem("sesLocalVersionChange", true);
  //     console.log("d--------in if---------------")
  //   } else {
  //     localStorage.setItem("sesLocalVersionChange", false);
  //     console.log("d--------in else---------------")
  //   }
  // }
  render() {
    // console.log('in I18n defaultlayout')
    let events = ["keydown", "mousedown"];
    const checkOnline = localStorage.getItem('sessionType');
    return (
      <div className="app">
        {/* {<ChangeInLocalProgramVersion ref="programChangeChild" func={this.checkClick} updateState={true}></ChangeInLocalProgramVersion>} */}

        <IdleTimer
          ref={ref => { this.idleTimer = ref }}
          element={document}
          onActive={this.onActive}
          onIdle={this.onIdle}
          onAction={this.checkEvent}
          debounce={250}
          timeout={this.state.timeout}
          events={events}
        />

        <AppHeader fixed>
          <Suspense fallback={this.loading()}>
            <DefaultHeader onLogout={e => this.signOut(e)} onChangePassword={e => this.changePassword(e)} onChangeDashboard={e => this.showDashboard(e)} shipmentLinkingAlerts={e => this.showShipmentLinkingAlerts(e)} latestProgram={e => this.goToLoadProgram(e)} title={this.state.name} notificationCount={this.state.notificationCount} changeIcon={this.state.changeIcon} commitProgram={e => this.goToCommitProgram(e)} />
          </Suspense>
        </AppHeader>
        <div className="app-body">
          <AppSidebar fixed display="lg">
            <AppSidebarHeader />
            <AppSidebarForm />
            <Suspense>
              {checkOnline === 'Online' &&

                <AppSidebarNav navConfig={{
                  items:
                    [
                      // !this.state.businessFunctions.includes('ROLE_BF_VIEW_GUEST_SCREENS') &&
                      // {
                      //   name: i18n.t('static.dashboard.applicationdashboard'),
                      //   url: '/ApplicationDashboard',
                      //   icon: 'cui-dashboard icons',
                      //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_APPLICATION_DASHBOARD') ? false : true) }
                      // },
                      // {
                      //   name: i18n.t('static.dashboard.realmdashboard'),
                      //   url: '/RealmDashboard',
                      //   icon: 'cui-dashboard icons',
                      //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROGRAM_DASHBOARD') ? false : true) }
                      // },
                      //!this.state.businessFunctions.includes('ROLE_BF_VIEW_GUEST_SCREENS') &&
                      // {
                      //   name: i18n.t('static.dashboard.programdashboard'),
                      //   url: '/ProgramDashboard',
                      //   icon: 'cui-dashboard icons',
                      //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROGRAM_DASHBOARD') ? false : true) }
                      // },
                      // !this.state.businessFunctions.includes('ROLE_BF_VIEW_GUEST_SCREENS') &&
                      {
                        name: i18n.t('static.dashboard.datasync'),
                        icon: 'fa fa-refresh',
                        url: '/masterDataSync',
                      },
                      {
                        name: i18n.t('static.translations.translations'),
                        icon: 'fa fa-list',
                        // attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_VIEW_TRANSLATIONS') ? false : true) },
                        attributes: { hidden: ((this.state.businessFunctions.includes('ROLE_BF_LABEL_TRANSLATIONS')) || (this.state.businessFunctions.includes('ROLE_BF_DATABASE_TRANSLATION')) ? false : true) },
                        children: [
                          {
                            name: i18n.t('static.label.labelTranslations'),
                            url: '/translations/labelTranslations',
                            icon: 'fa fa-exchange',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LABEL_TRANSLATIONS') ? false : true) }
                          },
                          {
                            name: i18n.t('static.label.databaseTranslations'),
                            url: '/translations/databaseTranslations',
                            icon: 'fa fa-exchange',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_DATABASE_TRANSLATION') ? false : true) }
                          }
                        ]
                      },
                      // !this.state.businessFunctions.includes('ROLE_BF_VIEW_GUEST_SCREENS') &&
                      {
                        name: i18n.t('static.dashboard.applicationmaster'),
                        icon: 'fa fa-list',
                        // attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_VIEW_APPL_MASTERS') ? false : true) },
                        attributes: {
                          hidden: ((this.state.businessFunctions.includes('ROLE_BF_LIST_COUNTRY')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_CURRENCY')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_DIMENSION'))
                            || (this.state.businessFunctions.includes('ROLE_BF_LIST_LANGUAGE')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_ROLE')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_REALM'))
                            || (this.state.businessFunctions.includes('ROLE_BF_LIST_USER')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_UNIT'))
                            ? false : true)
                        },
                        children: [
                          {
                            name: i18n.t('static.dashboard.uploadUserManual'),
                            url: '/userManual/uploadUserManual',
                            icon: 'fa fa-upload',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_UPLOAD_USER_MANUAL') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.country'),
                            url: '/country/listCountry',
                            icon: 'fa fa-globe',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_COUNTRY') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.currency'),
                            url: '/currency/listCurrency',
                            icon: 'fa fa-money',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_CURRENCY') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.dimension'),
                            url: '/dimension/listDimension',
                            icon: 'fa fa-map',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_DIMENSION') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.language'),
                            url: '/language/listLanguage',
                            icon: 'fa fa-language',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_LANGUAGE') ? false : true) }
                          },
                          {
                            name: i18n.t('static.roleHead.role'),
                            url: '/role/listRole',
                            icon: 'fa fa-dot-circle-o',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_ROLE') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.realmheader'),
                            url: '/realm/listRealm',
                            icon: 'fa fa-th-large',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_REALM') ? false : true) }
                          },
                          // (this.state.businessFunctions.includes('ROLE_BF_CREATE_USERL')?
                          {
                            name: i18n.t('static.userHead.user'),
                            url: '/user/listUser',
                            icon: 'fa fa-users',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_USER') ? false : true) }
                          },
                          , {
                            name: i18n.t('static.dashboard.unit'),
                            url: '/unit/listUnit',
                            icon: 'fa fa-th',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_UNIT') ? false : true) }
                          }
                          ,

                          // {
                          //   name: i18n.t('static.dashboard.realmheader'),
                          //   icon: 'fa fa-list',
                          //   // attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_REALM') ? false : true) },
                          //   children: [{
                          //     name: i18n.t('static.dashboard.realmheader'),
                          //     url: '/realm/listRealm',
                          //     icon: 'fa fa-th-large',
                          //     // attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_REALM') ? false : true) }
                          //   }, {
                          //     name: i18n.t('static.dashboard.realmcountry'),
                          //     url: '/realmCountry/listRealmCountry',
                          //     icon: 'fa fa-globe',
                          //     attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_MANAGE_REALM_COUNTRY') ? false : true) }
                          //   }, {
                          //     name: i18n.t('static.dashboad.planningunitcountry'),
                          //     url: '/realmCountry/listRealmCountryPlanningUnit',
                          //     icon: 'fa fa-globe',
                          //     attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_MANAGE_REALM_COUNTRY_PLANNING_UNIT') ? false : true) }
                          //   }]
                          // },



                        ]
                      },
                      // !this.state.businessFunctions.includes('ROLE_BF_VIEW_GUEST_SCREENS') &&
                      {
                        name: i18n.t('static.dashboard.realmlevelmaster'),
                        icon: 'fa fa-list',
                        // attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_VIEW_REALM_LEVEL_MASTERS') ? false : true) },
                        attributes: {
                          hidden: ((this.state.businessFunctions.includes('ROLE_BF_LIST_REALM_COUNTRY')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_DATA_SOURCE')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_DATA_SOURCE_TYPE'))
                            || (this.state.businessFunctions.includes('ROLE_BF_LIST_FUNDING_SOURCE')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_SUPPLIER')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_ORGANIZATION'))
                            || (this.state.businessFunctions.includes('ROLE_BF_LIST_PROCUREMENT_AGENT')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_ALTERNATE_REPORTING_UNIT')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_FORECASTING_UNIT'))
                            || (this.state.businessFunctions.includes('ROLE_BF_LIST_PLANNING_UNIT')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_PRODUCT_CATEGORY')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_PLANNING_UNIT_CAPACITY'))
                            || (this.state.businessFunctions.includes('ROLE_BF_LIST_PROCUREMENT_UNIT')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_TRACER_CATEGORY')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_HEALTH_AREA'))
                            ? false : true)
                        },
                        children: [
                          {
                            name: i18n.t('static.dashboard.realmcountry'),
                            url: '/realmCountry/listRealmCountry',
                            icon: 'fa fa-globe',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_REALM_COUNTRY') ? false : true) }
                          },

                          {
                            name: i18n.t('static.dashboard.datasource'),
                            url: '/dataSource/listDataSource',
                            icon: 'fa fa-database',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_DATA_SOURCE') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dataSourceTypeHead.dataSourceType'),
                            url: '/dataSourceType/listDataSourceType',
                            icon: 'fa fa-table',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_DATA_SOURCE_TYPE') ? false : true) }
                          },

                          {
                            name: i18n.t('static.fundingSourceHead.fundingSource'),
                            icon: 'fa fa-bank',
                            url: '/fundingSource/listFundingSource',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_FUNDING_SOURCE') ? false : true) }
                          },
                          // {
                          //   name: i18n.t('static.dashboard.subfundingsource'),
                          //   url: '/subFundingSource/listSubFundingSource',
                          //   icon: 'fa fa-building-o'
                          // },
                          {
                            name: i18n.t('static.dashboard.supplier'),
                            url: '/supplier/listSupplier',
                            icon: 'fa fa-user-circle-o',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_SUPPLIER') ? false : true) }
                          },
                          {
                            name: i18n.t('static.organisationHead.organisation'),
                            url: '/organisation/listOrganisation',
                            icon: 'fa fa-building',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_ORGANIZATION') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.procurementagent'),
                            url: '/procurementAgent/listProcurementAgent',
                            icon: 'fa fa-link',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_PROCUREMENT_AGENT') ? false : true) }
                          },

                          ////Product
                          {
                            name: i18n.t('static.dashboard.Productmenu'),
                            icon: 'fa fa-cubes',
                            // attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_VIEW_REALM_LEVEL_MASTERS') ? false : true) },
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_LIST_FORECASTING_UNIT')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_PLANNING_UNIT')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_PRODUCT_CATEGORY'))
                                || (this.state.businessFunctions.includes('ROLE_BF_LIST_PLANNING_UNIT_CAPACITY')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_PROCUREMENT_UNIT')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_TRACER_CATEGORY')) ? false : true)
                            },
                            children: [

                              {
                                name: i18n.t('static.dashboard.forecastingunit'),
                                url: '/forecastingUnit/listforecastingUnit',
                                icon: 'fa fa-line-chart',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_FORECASTING_UNIT') ? false : true) }
                              }, {
                                name: i18n.t('static.dashboard.planningunit'),
                                url: '/planningUnit/listPlanningUnit',
                                icon: 'fa fa-list-alt',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_PLANNING_UNIT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.product.productcategory'),
                                url: '/productCategory/productCategoryTree',
                                icon: 'fa fa-cubes',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_PRODUCT_CATEGORY') ? false : true) }
                              },
                              {
                                name: i18n.t('static.planningUnitVolumeHead.planningUnitVolume'),
                                url: '/planningUnitCapacity/listPlanningUnitcapacity',
                                icon: 'fa fa-tasks',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_PLANNING_UNIT_CAPACITY') ? false : true) }
                              },

                              {
                                name: i18n.t('static.procurementUnit.procurementUnit'),
                                url: '/procurementUnit/listProcurementUnit',
                                icon: 'fa fa-building',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_PROCUREMENT_UNIT') ? false : true) }
                              },

                              {
                                name: i18n.t('static.tracerCategoryHead.tracerCategory'),
                                url: '/tracerCategory/listTracerCategory',
                                icon: 'fa fa-th-large',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_TRACER_CATEGORY') ? false : true) }
                              },
                            ]
                          },


                          {
                            name: i18n.t('static.healtharea.healtharea'),
                            url: '/healthArea/listHealthArea',
                            icon: 'fa fa-medkit',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_HEALTH_AREA') ? false : true) }
                          },

                          {
                            name: i18n.t('static.integration.integration'),
                            url: '/integration/listIntegration',
                            icon: 'fa fa-map',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_INTEGRATION') ? false : true) }
                          },
                          // {

                          //   name: 'Product Category',
                          //   url: '/ProductCategory/AddProductCategory',
                          //   icon: 'icon-graph'
                          // },


                        ]
                      },
                      // !this.state.businessFunctions.includes('ROLE_BF_VIEW_GUEST_SCREENS') &&
                      {
                        name: i18n.t('static.dashboard.programmaster'),
                        // url: '/program',
                        icon: 'fa fa-list',
                        // attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_VIEW_PROGRAM_MASTERS') ? false : true) },
                        attributes: {
                          hidden: ((this.state.businessFunctions.includes('ROLE_BF_LIST_ALTERNATE_REPORTING_UNIT')) || (this.state.businessFunctions.includes('ROLE_BF_SET_UP_PROGRAM')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_PROGRAM')) || (this.state.businessFunctions.includes('ROLE_BF_EDIT_PROGRAM'))
                            || (this.state.businessFunctions.includes('ROLE_BF_LIST_BUDGET')) || (this.state.businessFunctions.includes('ROLE_BF_IMPORT_PROGARM')) || (this.state.businessFunctions.includes('ROLE_BF_EXPORT_PROGARM'))
                            || (this.state.businessFunctions.includes('ROLE_BF_DOWNLOAD_PROGARM')) || (this.state.businessFunctions.includes('ROLE_BF_DELETE_LOCAL_PROGRAM')) || (this.state.businessFunctions.includes('ROLE_BF_PIPELINE_PROGRAM_IMPORT')) || (this.state.businessFunctions.includes('ROLE_BF_COMMIT_VERSION')) || (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_VERSION_AND_REVIEW')) ? false : true)
                        },
                        children: [
                          {
                            name: i18n.t('static.dashboad.planningunitcountry'),
                            url: '/realmCountry/listRealmCountryPlanningUnit',
                            icon: 'fa fa-globe',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_ALTERNATE_REPORTING_UNIT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.setupprogram'),
                            url: '/program/programOnboarding',
                            icon: 'fa fa-list-ol',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SET_UP_PROGRAM') ? false : true) }
                          },
                          {
                            name: i18n.t('static.programHead.program'),
                            url: '/program/listProgram',
                            icon: 'fa fa-file-text-o',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_PROGRAM') ? false : true) }
                            //     children: [
                            //       // {
                            //       //   name: i18n.t('static.dashboard.addprogram'),
                            //       //   url: '/program/addProgram',
                            //       //   icon: 'icon-pencil',
                            //       // },
                            //       {
                            //         name: i18n.t('static.dashboard.listprogram'),
                            //         url: '/program/listProgram',
                            //         icon: 'fa fa-object-group',
                            //       }
                            //     ]
                          },
                          // {
                          //   name: i18n.t('static.program.deleteLocalProgram'),
                          //   url: '/program/deleteLocalProgram',
                          //   icon: 'fa fa-trash',
                          //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_DELETE_LOCAL_PROGARM') ? false : true) }
                          //   // attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_DOWNLOAD_PROGARM') ? false : true) }
                          // },
                          {
                            name: i18n.t('static.Update.PlanningUnits'),
                            // url: '/program/listProgram',
                            url: '/programProduct/addProgramProduct',
                            icon: 'fa fa-list-alt',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_EDIT_PROGRAM') ? false : true) }
                          },

                          {
                            name: i18n.t('static.dashboard.budget'),
                            url: '/budget/listBudget',
                            icon: 'fa fa-dollar',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_BUDGET') ? false : true) }
                          },

                          {
                            name: i18n.t('static.dashboard.importprogram'),
                            url: '/program/importProgram',
                            icon: 'fa fa-cloud-download',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_IMPORT_PROGARM') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.exportprogram'),
                            url: '/program/exportProgram',
                            icon: 'fa fa-sign-in',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_EXPORT_PROGARM') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.downloadprogram'),
                            url: '/program/downloadProgram',
                            icon: 'fa fa-download',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_DOWNLOAD_PROGARM') ? false : true) }
                          },
                          {
                            name: i18n.t('static.program.deleteLocalProgram'),
                            url: '/program/deleteLocalProgram',
                            icon: 'fa fa-trash',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_DELETE_LOCAL_PROGRAM') ? false : true) }
                            // attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_DOWNLOAD_PROGARM') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.programimport'),
                            // url: '/pipeline/pipelineProgramImport',
                            url: '/pipeline/pieplineProgramList',
                            icon: 'fa fa-sitemap',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PIPELINE_PROGRAM_IMPORT') ? false : true) }
                          },


                          // {
                          //   name: i18n.t('static.dashboard.product'),
                          //   url: '/product/listProduct',
                          //   icon: 'icon-graph',
                          // children: [
                          //   // {
                          //   //   name: i18n.t('static.dashboard.addproduct'),
                          //   //   url: '/product/addProduct',
                          //   //   icon: 'icon-pencil',
                          //   // },
                          //   {
                          //     name: i18n.t('static.dashboard.listproduct'),
                          //     url: '/product/listProduct',
                          //     icon: 'fa fa-th-large',
                          //   }
                          // ]
                          // },


                          {
                            name: i18n.t('static.dashboard.commitVersion'),
                            url: '/program/syncPage',
                            icon: 'fa fa-upload',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_COMMIT_VERSION') ? false : true) }
                          },
                          {
                            name: i18n.t('static.report.supplyplanversionandreviewReport'),
                            url: '/report/supplyPlanVersionAndReview',
                            icon: 'fa fa-exchange',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_VERSION_AND_REVIEW') ? false : true) }
                          }
                        ]
                      },
                      // {
                      //   name: i18n.t('static.pipeline.programData'),
                      //   icon: 'fa fa-list',
                      //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_VIEW_PROGRAM_DATA') ? false : true) },
                      //   // attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_DOWNLOAD_PROGRAM') ? false : true) },
                      //   children: [
                      //     // {
                      //     //   name: i18n.t('static.dashboard.datasync'),
                      //     //   url: '/masterDataSync',
                      //     //   icon: 'fa fa-list',
                      //     // },
                      //     {
                      //       name: i18n.t('static.dashboard.programs'),
                      //       icon: 'fa fa-list',
                      //       // attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_DOWNLOAD_PROGRAM') ? false : true) },
                      //       children: [
                      //         // {
                      //         //   name: i18n.t('static.dashboard.datasync'),
                      //         //   url: '/masterDataSync',
                      //         //   icon: 'fa fa-list',
                      //         // },
                      //         {
                      //           name: i18n.t('static.dashboard.downloadprogram'),
                      //           url: '/program/downloadProgram',
                      //           icon: 'fa fa-download',
                      //           attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_DOWNLOAD_PROGARM') ? false : true) }
                      //         },
                      //         {
                      //           name: i18n.t('static.program.deleteLocalProgram'),
                      //           url: '/program/deleteLocalProgram',
                      //           icon: 'fa fa-trash',
                      //           attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_DELETE_LOCAL_PROGRAM') ? false : true) }
                      //           // attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_DOWNLOAD_PROGARM') ? false : true) }
                      //         },
                      //         {
                      //           name: i18n.t('static.dashboard.importprogram'),
                      //           url: '/program/importProgram',
                      //           icon: 'fa fa-cloud-download',
                      //           attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_IMPORT_EXPORT_PROGARM') ? false : true) }
                      //         },
                      //         {
                      //           name: i18n.t('static.dashboard.exportprogram'),
                      //           url: '/program/exportProgram',
                      //           icon: 'fa fa-sign-in',
                      //           attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_IMPORT_EXPORT_PROGARM') ? false : true) }
                      //         }

                      //       ]
                      //     },
                      //     {
                      //       name: i18n.t('static.consumptionDetailHead.consumptionDetail'),
                      //       url: '/consumptionDetails',
                      //       icon: 'fa fa-bar-chart',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.dashboard.commitVersion'),
                      //       url: '/program/syncPage',
                      //       icon: 'fa fa-code-fork',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_COMMIT_VERSION') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.report.supplyplanversionandreviewReport'),
                      //       url: '/report/supplyPlanVersionAndReview',
                      //       icon: 'fa fa-exchange',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_VERSION_AND_REVIEW') ? false : true) }
                      //     }
                      //   ]
                      // },
                      // {
                      //   name: i18n.t('static.pipeline.programData'),
                      //   icon: 'fa fa-list',
                      //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_VIEW_PROGRAM_DATA') ? false : true) },
                      //   // attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_DOWNLOAD_PROGRAM') ? false : true) },
                      //   children: [
                      //     // {
                      //     //   name: i18n.t('static.dashboard.datasync'),
                      //     //   url: '/masterDataSync',
                      //     //   icon: 'fa fa-list',
                      //     // },
                      //     {
                      //       name: i18n.t('static.dashboard.programs'),
                      //       icon: 'fa fa-list',
                      //       // attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_DOWNLOAD_PROGRAM') ? false : true) },
                      //       children: [
                      //         // {
                      //         //   name: i18n.t('static.dashboard.datasync'),
                      //         //   url: '/masterDataSync',
                      //         //   icon: 'fa fa-list',
                      //         // },
                      //         // {
                      //         //   name: i18n.t('static.dashboard.downloadprogram'),
                      //         //   url: '/program/downloadProgram',
                      //         //   icon: 'fa fa-download',
                      //         //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_DOWNLOAD_PROGARM') ? false : true) }
                      //         // },
                      //         // {
                      //         //   name: i18n.t('static.program.deleteLocalProgram'),
                      //         //   url: '/program/deleteLocalProgram',
                      //         //   icon: 'fa fa-trash',
                      //         //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_DELETE_LOCAL_PROGARM') ? false : true) }
                      //         //   // attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_DOWNLOAD_PROGARM') ? false : true) }
                      //         // },
                      //         // {
                      //         //   name: i18n.t('static.dashboard.importprogram'),
                      //         //   url: '/program/importProgram',
                      //         //   icon: 'fa fa-cloud-download',
                      //         //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_IMPORT_EXPORT_PROGARM') ? false : true) }
                      //         // },
                      //         // {
                      //         //   name: i18n.t('static.dashboard.exportprogram'),
                      //         //   url: '/program/exportProgram',
                      //         //   icon: 'fa fa-sign-in',
                      //         //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_IMPORT_EXPORT_PROGARM') ? false : true) }
                      //         // }

                      //       ]
                      //     },

                      //   ]
                      // },
                      // !this.state.businessFunctions.includes('ROLE_BF_VIEW_GUEST_SCREENS') &&

                      //5) Supply Plan Data
                      {
                        name: i18n.t('static.dashboard.supplyPlandata'),
                        icon: 'fa fa-list',
                        attributes: {
                          hidden: ((this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_DATA')) || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_DATA')) || (this.state.businessFunctions.includes('ROLE_BF_INVENTORY_DATA')) || (this.state.businessFunctions.includes('ROLE_BF_MANUAL_TAGGING')) || (this.state.businessFunctions.includes('ROLE_BF_QUANTIMED_IMPORT')) ? false : true)
                        },
                        children: [
                          {
                            name: i18n.t('static.consumptionDetailHead.consumptionDetail'),
                            url: '/consumptionDetails',
                            icon: 'fa fa-bar-chart',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_DATA') ? false : true) }
                          },
                          {
                            name: i18n.t('static.shipmentDetailHead.shipmentDetail'),
                            url: '/shipment/shipmentDetails',
                            icon: 'fa fa-truck',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_DATA') ? false : true) }
                          },
                          {
                            name: i18n.t('static.inventoryDetailHead.inventoryDetail'),
                            url: '/inventory/addInventory',
                            icon: 'fa fa-cube',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_INVENTORY_DATA') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.manualTagging'),
                            url: '/shipment/manualTagging',
                            icon: 'fa fa-truck',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_MANUAL_TAGGING') ? false : true) }
                          },

                          {
                            name: i18n.t('static.mt.shipmentLinkingNotification'),
                            url: '/shipmentLinkingNotification',
                            icon: 'fa fa-truck',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_MANUAL_TAGGING') ? false : true) }
                          },
                          {
                            name: i18n.t('static.quantimed.quantimedImport'),
                            url: '/quantimed/quantimedImport',
                            icon: 'fa fa-file-text-o',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_QUANTIMED_IMPORT') ? false : true) }
                          }

                        ]
                      },

                      //5) Supply Plan
                      {
                        name: i18n.t('static.dashboard.supplyPlan'),
                        icon: 'fa fa-list',
                        attributes: { hidden: ((this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN')) || (this.state.businessFunctions.includes('ROLE_BF_SCENARIO_PLANNING')) || (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT')) ? false : true) },
                        children: [
                          {
                            name: i18n.t('static.dashboard.supplyPlan'),
                            url: '/supplyPlan',
                            icon: 'fa fa-calculator',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.whatIf'),
                            url: '/report/whatIf',
                            icon: 'fa fa-calculator',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SCENARIO_PLANNING') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.stockstatus'),
                            url: '/report/stockStatus',
                            icon: 'fa fa-exchange',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT') ? false : true) }

                          },
                          // {
                          //   name: i18n.t('static.dashboard.commitVersion'),
                          //   url: '/program/syncPage',
                          //   icon: 'fa fa-code-fork',
                          //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_COMMIT_VERSION') ? false : true) }
                          // },
                          // {
                          //   name: i18n.t('static.report.supplyplanversionandreviewReport'),
                          //   url: '/report/supplyPlanVersionAndReview',
                          //   icon: 'fa fa-exchange',
                          //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_VERSION_AND_REVIEW') ? false : true) }
                          // },

                        ]
                      },



                      // {
                      //   name: i18n.t('static.dashboard.report'),
                      //   icon: 'fa fa-list',
                      //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_REPORT') ? false : true) },
                      //   children: [
                      //     {
                      //       name: i18n.t('static.dashboard.supplyPlan'),
                      //       url: '/supplyPlan',
                      //       icon: 'fa fa-calculator',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.dashboard.whatIf'),
                      //       url: '/report/whatIf',
                      //       icon: 'fa fa-calculator',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.regionHead.region'),
                      //       url: '/region/listRegion',
                      //       icon: 'fa fa-globe',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_REGION') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.dashboard.productcatalog'),
                      //       url: '/report/productCatalog',
                      //       icon: 'fa fa-th',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PRODUCT_CATALOG_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.dashboard.consumption'),
                      //       url: '/report/consumption',
                      //       icon: 'fa fa-bar-chart',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_REPORT') ? false : true) }
                      //     }, {
                      //       name: i18n.t('static.dashboard.globalconsumption'),
                      //       url: '/report/globalConsumption',
                      //       icon: 'fa fa-globe',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_GLOBAL_VIEW_REPORT') ? false : true) }
                      //     }, {
                      //       name: i18n.t('static.report.forecasterrorovertime'),
                      //       url: '/report/forecastOverTheTime',
                      //       icon: 'fa fa-line-chart',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_FORECAST_ERROR_OVER_TIME_REPORT') ? false : true) }
                      //     }, {
                      //       name: i18n.t('static.dashboard.forecastmetrics'),
                      //       url: '/report/forecastMetrics',
                      //       icon: 'fa fa-bar-chart',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_FORECAST_MATRIX_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.dashboard.stockstatusovertime'),
                      //       url: '/report/stockStatusOverTime',
                      //       icon: 'fa fa-line-chart',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_OVER_TIME_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.dashboard.stockstatusmatrix'),
                      //       url: '/report/stockStatusMatrix',
                      //       icon: 'fa fa-line-chart',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_MATRIX_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.dashboard.stockstatus'),
                      //       url: '/report/stockStatus',
                      //       icon: 'fa fa-line-chart',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }
                      //     }, ,
                      //     {
                      //       name: i18n.t('static.dashboard.stockstatusacrossplanningunit'),
                      //       url: '/report/stockStatusAcrossPlanningUnits',
                      //       icon: 'fa fa-exchange',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }

                      //     },
                      //     {
                      //       name: i18n.t('static.report.warehouseCapacity'),
                      //       url: '/report/warehouseCapacity',
                      //       icon: 'fa fa-line-chart',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.report.stockStatusAccrossPlanningUnitGlobalView'),
                      //       url: '/report/stockStatusAccrossPlanningUnitGlobalView',
                      //       icon: 'fa fa-line-chart',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_GLOBAL_VIEW_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.report.stockAdjustment'),
                      //       url: '/report/stockAdjustment',
                      //       icon: 'fa fa-line-chart',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.dashboard.costOfInventory'),
                      //       url: '/report/costOfInventory',
                      //       icon: 'fa fa-exchange',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.dashboard.inventoryTurns'),
                      //       url: '/report/inventoryTurns',
                      //       // icon: 'fa fa-exchange'
                      //       icon: 'fa fa-line-chart',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.dashboard.qatProblemList'),
                      //       url: '/report/problemList',
                      //       icon: 'fa fa-file-text-o',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT') ? false : true) }
                      //     },
                      //     // {
                      //     //   name: 'QAT PROBLEM+ACTION REPORT',
                      //     //   url: '/report/qatProblemPlusActionReport',
                      //     //   icon: 'fa fa-file-text-o',
                      //     //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT') ? false : true) }
                      //     // },
                      //     // {
                      //     //   name: i18n.t('static.dashboard.funderExport'),
                      //     //   url: '/report/funderExport',
                      //     //   icon: 'fa fa-list-alt',
                      //     //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_FUNDER_REPORT') ? false : true) }
                      //     // },
                      //     {
                      //       name: i18n.t('static.report.shipmentCostReport'),
                      //       url: '/report/procurementAgentExport',
                      //       icon: 'fa fa-wpforms',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                      //     }
                      //     ,
                      //     {
                      //       name: i18n.t('static.dashboard.supplierLeadTimes'),
                      //       url: '/report/supplierLeadTimes',
                      //       icon: 'fa fa-wpforms',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                      //     }
                      //     ,
                      //     // {
                      //     //   name: i18n.t('static.dashboard.aggregateShipmentByProduct'),
                      //     //   url: '/report/aggregateShipmentByProduct',
                      //     //   icon: 'fa fa-wpforms',
                      //     //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                      //     // }
                      //     ,

                      //     {
                      //       name: i18n.t('static.report.annualshipmentcost'),
                      //       url: '/report/annualShipmentCost',
                      //       icon: 'fa fa-file-text',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_ANNUAL_SHIPMENT_COST_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.report.supplyplanversionandreviewReport'),
                      //       url: '/report/supplyPlanVersionAndReview',
                      //       icon: 'fa fa-exchange',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_VERSION_AND_REVIEW') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.report.shipmentDetailReport'),
                      //       url: '/report/shipmentSummery',
                      //       icon: 'fa fa-exchange',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.dashboard.shipmentGlobalDemandViewheader'),
                      //       url: '/report/shipmentGlobalDemandView',
                      //       icon: 'fa fa-wpforms',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.dashboard.shipmentGlobalViewheader'),
                      //       url: '/report/shipmentGlobalView',
                      //       icon: 'fa fa-wpforms',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_GLOBAL_DEMAND_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.report.expiredInventory'),
                      //       url: '/report/expiredInventory',
                      //       icon: 'fa fa-exchange',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.budgetHead.budget'),
                      //       url: '/report/budgets',
                      //       icon: 'fa fa-exchange',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT') ? false : true) }
                      //     }
                      //     // {
                      //     //   name: i18n.t('static.report.supplyplanversionandreviewReport'),
                      //     //   url: '/report/supplyPlanVersionAndReview',
                      //     //   icon: 'fa fa-exchange'
                      //     // }
                      //   ]
                      // }


                      {
                        name: i18n.t('static.dashboard.report'),
                        icon: 'fa fa-list',
                        // attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_REPORT') ? false : true) },
                        attributes: {
                          hidden: ((this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_PRODUCT_CATALOG_REPORT'))
                            || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_OVER_TIME_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_MATRIX_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_GLOBAL_VIEW_REPORT'))
                            || (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_GLOBAL_VIEW_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_FORECAST_ERROR_OVER_TIME_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_FORECAST_MATRIX_REPORT'))
                            || (this.state.businessFunctions.includes('ROLE_BF_GLOBAL_DEMAND_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_OVERVIEW_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_DETAILS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_COST_DETAILS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_ANNUAL_SHIPMENT_COST_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_BUDGET_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT'))
                            || (this.state.businessFunctions.includes('ROLE_BF_EXPIRIES_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_COST_OF_INVENTORY_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_INVENTORY_TURNS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_ADJUSTMENT_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_WAREHOUSE_CAPACITY_REPORT'))
                            || (this.state.businessFunctions.includes('ROLE_BF_REGION')) ? false : true)
                        },
                        children: [
                          {
                            name: i18n.t('static.dashboard.qatProblemList'),
                            url: '/report/problemList',
                            icon: 'fa fa-file-text-o',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.productcatalog'),
                            url: '/report/productCatalog',
                            icon: 'fa fa-th',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PRODUCT_CATALOG_REPORT') ? false : true) }
                          },


                          //4) Stock Status
                          {
                            name: i18n.t('static.dashboard.stockstatusmain'),
                            icon: 'fa fa-list',
                            attributes: { hidden: ((this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_OVER_TIME_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_MATRIX_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_GLOBAL_VIEW_REPORT')) ? false : true) },
                            children: [
                              // {
                              //   name: i18n.t('static.dashboard.stockstatus'),
                              //   url: '/report/stockStatus',
                              //   icon: 'fa fa-line-chart',
                              //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }
                              // },
                              {
                                name: i18n.t('static.dashboard.stockstatusovertime'),
                                url: '/report/stockStatusOverTime',
                                icon: 'fa fa-line-chart',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_OVER_TIME_REPORT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.dashboard.stockstatusmatrix'),
                                url: '/report/stockStatusMatrix',
                                icon: 'fa fa-line-chart',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_MATRIX_REPORT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.dashboard.stockstatusacrossplanningunit'),
                                url: '/report/stockStatusAcrossPlanningUnits',
                                icon: 'fa fa-exchange',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }

                              },
                              {
                                name: i18n.t('static.report.stockStatusAccrossPlanningUnitGlobalView'),
                                url: '/report/stockStatusAccrossPlanningUnitGlobalView',
                                icon: 'fa fa-line-chart',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_GLOBAL_VIEW_REPORT') ? false : true) }
                              },

                            ]
                          },

                          //1) Consumption Reports
                          {
                            name: i18n.t('static.report.consumptionReports'),
                            icon: 'fa fa-list',
                            attributes: { hidden: ((this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_GLOBAL_VIEW_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_FORECAST_ERROR_OVER_TIME_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_FORECAST_MATRIX_REPORT')) ? false : true) },
                            children: [
                              {
                                name: i18n.t('static.dashboard.consumption'),
                                url: '/report/consumption',
                                icon: 'fa fa-bar-chart',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_REPORT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.dashboard.globalconsumption'),
                                url: '/report/globalConsumption',
                                icon: 'fa fa-globe',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_GLOBAL_VIEW_REPORT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.report.forecasterrorovertime'),
                                url: '/report/forecastOverTheTime',
                                icon: 'fa fa-line-chart',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_FORECAST_ERROR_OVER_TIME_REPORT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.dashboard.forecastmetrics'),
                                url: '/report/forecastMetrics',
                                icon: 'fa fa-bar-chart',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_FORECAST_MATRIX_REPORT') ? false : true) }
                              },


                            ]
                          },

                          //3) Shipment Reports
                          {
                            name: i18n.t('static.report.shipmentReports'),
                            icon: 'fa fa-list',
                            attributes: { hidden: ((this.state.businessFunctions.includes('ROLE_BF_GLOBAL_DEMAND_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_OVERVIEW_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_DETAILS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_COST_DETAILS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_ANNUAL_SHIPMENT_COST_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_BUDGET_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT')) ? false : true) },
                            children: [
                              {
                                name: i18n.t('static.dashboard.shipmentGlobalViewheader'),
                                url: '/report/shipmentGlobalView',
                                icon: 'fa fa-wpforms',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_GLOBAL_DEMAND_REPORT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.dashboard.shipmentGlobalDemandViewheader'),
                                url: '/report/shipmentGlobalDemandView',
                                icon: 'fa fa-wpforms',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_OVERVIEW_REPORT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.report.shipmentDetailReport'),
                                url: '/report/shipmentSummery',
                                icon: 'fa fa-exchange',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_DETAILS_REPORT') ? false : true) }
                              },

                              {
                                name: i18n.t('static.report.shipmentCostReport'),
                                url: '/report/procurementAgentExport',
                                icon: 'fa fa-wpforms',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_COST_DETAILS_REPORT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.report.annualshipmentcost'),
                                url: '/report/annualShipmentCost',
                                icon: 'fa fa-file-text',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_ANNUAL_SHIPMENT_COST_REPORT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.budgetHead.budget'),
                                url: '/report/budgets',
                                icon: 'fa fa-exchange',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_BUDGET_REPORT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.dashboard.supplierLeadTimes'),
                                url: '/report/supplierLeadTimes',
                                icon: 'fa fa-wpforms',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                              }

                            ]
                          },


                          //2) Inventory Reports
                          {
                            name: i18n.t('static.report.inventoryReports'),
                            icon: 'fa fa-list',
                            attributes: { hidden: ((this.state.businessFunctions.includes('ROLE_BF_EXPIRIES_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_COST_OF_INVENTORY_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_INVENTORY_TURNS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_ADJUSTMENT_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_WAREHOUSE_CAPACITY_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_REGION')) ? false : true) },
                            children: [
                              {
                                name: i18n.t('static.report.expiredInventory'),
                                url: '/report/expiredInventory',
                                icon: 'fa fa-exchange',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_EXPIRIES_REPORT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.dashboard.costOfInventory'),
                                url: '/report/costOfInventory',
                                icon: 'fa fa-exchange',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_COST_OF_INVENTORY_REPORT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.dashboard.inventoryTurns'),
                                url: '/report/inventoryTurns',
                                // icon: 'fa fa-exchange'
                                icon: 'fa fa-line-chart',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_INVENTORY_TURNS_REPORT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.report.stockAdjustment'),
                                url: '/report/stockAdjustment',
                                icon: 'fa fa-line-chart',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_ADJUSTMENT_REPORT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.report.warehouseCapacity'),
                                url: '/report/warehouseCapacity',
                                icon: 'fa fa-line-chart',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_WAREHOUSE_CAPACITY_REPORT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.regionHead.region'),
                                url: '/region/listRegion',
                                icon: 'fa fa-globe',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_REGION') ? false : true) }
                              },

                            ]
                          },


                          // //3) Shipment Reports
                          // {
                          //   name: i18n.t('static.report.shipmentReports'),
                          //   icon: 'fa fa-list',
                          //   attributes: { hidden: ((this.state.businessFunctions.includes('ROLE_BF_GLOBAL_DEMAND_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_ANNUAL_SHIPMENT_COST_REPORT')) ? false : true) },
                          //   children: [
                          //     {
                          //       name: i18n.t('static.dashboard.shipmentGlobalViewheader'),
                          //       url: '/report/shipmentGlobalView',
                          //       icon: 'fa fa-wpforms',
                          //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_GLOBAL_DEMAND_REPORT') ? false : true) }
                          //     },
                          //     {
                          //       name: i18n.t('static.dashboard.shipmentGlobalDemandViewheader'),
                          //       url: '/report/shipmentGlobalDemandView',
                          //       icon: 'fa fa-wpforms',
                          //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_GLOBAL_VIEW_REPORT') ? false : true) }
                          //     },
                          //     {
                          //       name: i18n.t('static.report.shipmentDetailReport'),
                          //       url: '/report/shipmentSummery',
                          //       icon: 'fa fa-exchange',
                          //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT') ? false : true) }
                          //     },

                          //     {
                          //       name: i18n.t('static.report.shipmentCostReport'),
                          //       url: '/report/procurementAgentExport',
                          //       icon: 'fa fa-wpforms',
                          //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                          //     },
                          //     {
                          //       name: i18n.t('static.report.annualshipmentcost'),
                          //       url: '/report/annualShipmentCost',
                          //       icon: 'fa fa-file-text',
                          //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_ANNUAL_SHIPMENT_COST_REPORT') ? false : true) }
                          //     },
                          //     {
                          //       name: i18n.t('static.budgetHead.budget'),
                          //       url: '/report/budgets',
                          //       icon: 'fa fa-exchange',
                          //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT') ? false : true) }
                          //     },
                          //     {
                          //       name: i18n.t('static.dashboard.supplierLeadTimes'),
                          //       url: '/report/supplierLeadTimes',
                          //       icon: 'fa fa-wpforms',
                          //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                          //     }

                          //   ]
                          // },


                          // //4) Stock Status
                          // {
                          //   name: i18n.t('static.dashboard.stockstatus'),
                          //   icon: 'fa fa-list',
                          //   attributes: { hidden: ((this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_OVER_TIME_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_MATRIX_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_GLOBAL_VIEW_REPORT')) ? false : true) },
                          //   children: [
                          //     {
                          //       name: i18n.t('static.dashboard.stockstatus'),
                          //       url: '/report/stockStatus',
                          //       icon: 'fa fa-line-chart',
                          //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }
                          //     },
                          //     {
                          //       name: i18n.t('static.dashboard.stockstatusovertime'),
                          //       url: '/report/stockStatusOverTime',
                          //       icon: 'fa fa-line-chart',
                          //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_OVER_TIME_REPORT') ? false : true) }
                          //     },
                          //     {
                          //       name: i18n.t('static.dashboard.stockstatusmatrix'),
                          //       url: '/report/stockStatusMatrix',
                          //       icon: 'fa fa-line-chart',
                          //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_MATRIX_REPORT') ? false : true) }
                          //     },
                          //     {
                          //       name: i18n.t('static.dashboard.stockstatusacrossplanningunit'),
                          //       url: '/report/stockStatusAcrossPlanningUnits',
                          //       icon: 'fa fa-exchange',
                          //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }

                          //     },
                          //     {
                          //       name: i18n.t('static.report.stockStatusAccrossPlanningUnitGlobalView'),
                          //       url: '/report/stockStatusAccrossPlanningUnitGlobalView',
                          //       icon: 'fa fa-line-chart',
                          //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_GLOBAL_VIEW_REPORT') ? false : true) }
                          //     },

                          //   ]
                          // },

                          // {
                          //   name: i18n.t('static.dashboard.qatProblemList'),
                          //   url: '/report/problemList',
                          //   icon: 'fa fa-file-text-o',
                          //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT') ? false : true) }
                          // },


                        ]
                      }





                      // {
                      //   name: "Supply plan",
                      //   icon: 'fa fa-list',  
                      //   children: [
                      //     {
                      //       name: "Supply Plan",
                      //       url: '/supplyPlan',
                      //       icon: 'fa fa-list-alt'
                      //     }
                      //   ]
                      // },
                      ,
                      // !this.state.businessFunctions.includes('ROLE_BF_VIEW_GUEST_SCREENS') &&

                      // !this.state.businessFunctions.includes('ROLE_BF_VIEW_GUEST_SCREENS') &&
                      // {
                      //   name: i18n.t('static.dashboard.programimport'),
                      //   // url: '/pipeline/pipelineProgramImport',
                      //   url: '/pipeline/pieplineProgramList',
                      //   icon: 'fa fa-sitemap',
                      //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PIPELINE_PROGRAM_IMPORT') ? false : true) }
                      // },

                      // {
                      //   name: i18n.t('static.quantimed.quantimedImport'),                        
                      //   url: '/quantimed/quantimedImport',
                      //   icon: 'fa fa-file-text-o',
                      //   attributes: { hidden: false }
                      // }

                    ]

                }} {...this.props} />
              }
              {checkOnline === 'Offline' &&
                <AppSidebarNav navConfig={{
                  items:
                    [
                      {
                        name: i18n.t('static.dashboard.programmaster'),
                        icon: 'fa fa-list',
                        attributes: { hidden: ((this.state.businessFunctions.includes('ROLE_BF_IMPORT_PROGARM')) || (this.state.businessFunctions.includes('ROLE_BF_EXPORT_PROGARM')) || (this.state.businessFunctions.includes('ROLE_BF_DELETE_LOCAL_PROGRAM')) ? false : true) },
                        children: [
                          // {
                          //   name: i18n.t('static.dashboard.programs'),
                          //   icon: 'fa fa-list',
                          //   // attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_DOWNLOAD_PROGRAM') ? false : true) },
                          //   children: [
                          //     {
                          //       name: i18n.t('static.program.deleteLocalProgram'),
                          //       url: '/program/deleteLocalProgram',
                          //       icon: 'fa fa-trash',
                          //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_DELETE_LOCAL_PROGARM') ? false : true) }
                          //     },
                          //     {
                          //       name: i18n.t('static.dashboard.importprogram'),
                          //       url: '/program/importProgram',
                          //       icon: 'fa fa-cloud-download',
                          //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_IMPORT_EXPORT_PROGARM') ? false : true) }
                          //     },
                          //     {
                          //       name: i18n.t('static.dashboard.exportprogram'),
                          //       url: '/program/exportProgram',
                          //       icon: 'fa fa-sign-in',
                          //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_IMPORT_EXPORT_PROGARM') ? false : true) }
                          //     },

                          //   ]
                          // },



                          {
                            name: i18n.t('static.dashboard.importprogram'),
                            url: '/program/importProgram',
                            icon: 'fa fa-cloud-download',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_IMPORT_PROGARM') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.exportprogram'),
                            url: '/program/exportProgram',
                            icon: 'fa fa-sign-in',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_EXPORT_PROGARM') ? false : true) }
                          },
                          {
                            name: i18n.t('static.program.deleteLocalProgram'),
                            url: '/program/deleteLocalProgram',
                            icon: 'fa fa-trash',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_DELETE_LOCAL_PROGRAM') ? false : true) }
                          },
                          // {
                          //   name: i18n.t('static.consumptionDetailHead.consumptionDetail'),
                          //   url: '/consumptionDetails',
                          //   icon: 'fa fa-list',
                          //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') ? false : true) }
                          // },
                          // {
                          //   name: i18n.t('static.inventoryDetailHead.inventoryDetail'),
                          //   url: '/inventory/addInventory',
                          //   icon: 'fa fa-list',
                          //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') ? false : true) }
                          // },
                          // {
                          //   name: i18n.t('static.shipmentDetailHead.shipmentDetail'),
                          //   url: '/shipment/shipmentDetails',
                          //   icon: 'fa fa-list',
                          //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') ? false : true) }
                          // }
                        ]
                      },

                      //5) Supply Plan Data
                      {
                        name: i18n.t('static.dashboard.supplyPlandata'),
                        icon: 'fa fa-list',
                        // attributes: { hidden: ((this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN')) || (this.state.businessFunctions.includes('ROLE_BF_COMMIT_VERSION')) || (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_VERSION_AND_REVIEW')) ? false : true) },
                        attributes: { hidden: ((this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_DATA')) || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_DATA')) || (this.state.businessFunctions.includes('ROLE_BF_INVENTORY_DATA')) ? false : true) },
                        children: [
                          {
                            name: i18n.t('static.consumptionDetailHead.consumptionDetail'),
                            url: '/consumptionDetails',
                            icon: 'fa fa-bar-chart',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_DATA') ? false : true) }
                          },
                          {
                            name: i18n.t('static.shipmentDetailHead.shipmentDetail'),
                            url: '/shipment/shipmentDetails',
                            icon: 'fa fa-truck',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_DATA') ? false : true) }
                          },
                          {
                            name: i18n.t('static.inventoryDetailHead.inventoryDetail'),
                            url: '/inventory/addInventory',
                            icon: 'fa fa-cube',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_INVENTORY_DATA') ? false : true) }
                          },


                        ]
                      },

                      //5) Supply Plan
                      {
                        name: i18n.t('static.dashboard.supplyPlan'),
                        icon: 'fa fa-list',
                        // attributes: { hidden: ((this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN')) ? false : true) },
                        attributes: { hidden: ((this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN')) || (this.state.businessFunctions.includes('ROLE_BF_SCENARIO_PLANNING')) || (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT')) ? false : true) },
                        children: [
                          {
                            name: i18n.t('static.dashboard.supplyPlan'),
                            url: '/supplyPlan',
                            icon: 'fa fa-calculator',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.whatIf'),
                            url: '/report/whatIf',
                            icon: 'fa fa-calculator',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SCENARIO_PLANNING') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.stockstatus'),
                            url: '/report/stockStatus',
                            icon: 'fa fa-exchange',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT') ? false : true) }

                          },

                        ]
                      },

                      // {
                      //   name: i18n.t('static.dashboard.report'),
                      //   icon: 'fa fa-list',
                      //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_REPORT') ? false : true) },
                      //   children: [
                      //     {
                      //       name: i18n.t('static.dashboard.supplyPlan'),
                      //       url: '/supplyPlan',
                      //       icon: 'fa fa-calculator',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.dashboard.whatIf'),
                      //       url: '/report/whatIf',
                      //       icon: 'fa fa-calculator',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.dashboard.consumption'),
                      //       url: '/report/consumption',
                      //       icon: 'fa fa-exchange',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.dashboard.stockstatusmatrix'),
                      //       url: '/report/stockStatusMatrix',
                      //       icon: 'fa fa-exchange',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_MATRIX_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.report.stockAdjustment'),
                      //       url: '/report/stockAdjustment',
                      //       icon: 'fa fa-line-chart',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.report.warehouseCapacity'),
                      //       url: '/report/warehouseCapacity',
                      //       icon: 'fa fa-line-chart',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.report.shipmentCostReport'),
                      //       url: '/report/procurementAgentExport',
                      //       icon: 'fa fa-wpforms',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.report.annualshipmentcost'),
                      //       url: '/report/annualShipmentCost',
                      //       icon: 'fa fa-file-text',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_ANNUAL_SHIPMENT_COST_REPORT') ? false : true) }
                      //     },
                      //     // {
                      //     //   name: i18n.t('static.dashboard.aggregateShipmentByProduct'),
                      //     //   url: '/report/aggregateShipmentByProduct',
                      //     //   icon: 'fa fa-wpforms',
                      //     //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                      //     // },
                      //     {
                      //       name: i18n.t('static.dashboard.stockstatus'),
                      //       url: '/report/stockStatus',
                      //       icon: 'fa fa-exchange',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }

                      //     }
                      //     ,
                      //     {
                      //       name: i18n.t('static.dashboard.stockstatusacrossplanningunit'),
                      //       url: '/report/stockStatusAcrossPlanningUnits',
                      //       icon: 'fa fa-exchange',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }

                      //     },
                      //     {
                      //       name: i18n.t('static.report.expiredInventory'),
                      //       url: '/report/expiredInventory',
                      //       icon: 'fa fa-exchange',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.dashboard.supplierLeadTimes'),
                      //       url: '/report/supplierLeadTimes',
                      //       icon: 'fa fa-wpforms',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.dashboard.productcatalog'),
                      //       url: '/report/productCatalog',
                      //       icon: 'fa fa-th',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PRODUCT_CATALOG_REPORT') ? false : true) }

                      //     }, {
                      //       name: i18n.t('static.dashboard.costOfInventory'),
                      //       url: '/report/costOfInventory',
                      //       icon: 'fa fa-exchange',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT') ? false : true) }
                      //     }, {
                      //       name: i18n.t('static.dashboard.inventoryTurns'),
                      //       url: '/report/inventoryTurns',
                      //       icon: 'fa fa-line-chart',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.report.shipmentDetailReport'),
                      //       url: '/report/shipmentSummery',
                      //       icon: 'fa fa-exchange',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.dashboard.shipmentGlobalDemandViewheader'),
                      //       url: '/report/shipmentGlobalDemandView',
                      //       icon: 'fa fa-wpforms',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                      //     },
                      //     {
                      //       name: i18n.t('static.dashboard.qatProblemList'),
                      //       url: '/report/problemList',
                      //       icon: 'fa fa-file-text-o',
                      //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT') ? false : true) }
                      //     },
                      //   ]
                      // }

                      {
                        name: i18n.t('static.dashboard.report'),
                        icon: 'fa fa-list',
                        // attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_REPORT') ? false : true) },
                        attributes: {
                          hidden: ((this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_OVER_TIME_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_MATRIX_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT'))
                            || (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_FORECAST_ERROR_OVER_TIME_REPORT'))
                            || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_DETAILS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_COST_DETAILS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_ANNUAL_SHIPMENT_COST_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_BUDGET_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT'))
                            || (this.state.businessFunctions.includes('ROLE_BF_EXPIRIES_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_COST_OF_INVENTORY_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_INVENTORY_TURNS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_ADJUSTMENT_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_WAREHOUSE_CAPACITY_REPORT')) ? false : true)
                        },
                        children: [
                          {
                            name: i18n.t('static.dashboard.qatProblemList'),
                            url: '/report/problemList',
                            icon: 'fa fa-file-text-o',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.productcatalog'),
                            url: '/report/productCatalog',
                            icon: 'fa fa-th',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PRODUCT_CATALOG_REPORT') ? false : true) }
                          },
                          // {
                          //   name: i18n.t('static.dashboard.supplierLeadTimes'),
                          //   url: '/report/supplierLeadTimes',
                          //   icon: 'fa fa-wpforms',
                          //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                          // },

                          //4) Stock Status
                          {
                            name: i18n.t('static.dashboard.stockstatusmain'),
                            icon: 'fa fa-list',
                            attributes: { hidden: ((this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_OVER_TIME_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_MATRIX_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT')) ? false : true) },
                            children: [
                              // {
                              //   name: i18n.t('static.dashboard.stockstatus'),
                              //   url: '/report/stockStatus',
                              //   icon: 'fa fa-exchange',
                              //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }

                              // },
                              {
                                name: i18n.t('static.dashboard.stockstatusovertime'),
                                url: '/report/stockStatusOverTime',
                                icon: 'fa fa-line-chart',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_OVER_TIME_REPORT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.dashboard.stockstatusmatrix'),
                                url: '/report/stockStatusMatrix',
                                icon: 'fa fa-exchange',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_MATRIX_REPORT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.dashboard.stockstatusacrossplanningunit'),
                                url: '/report/stockStatusAcrossPlanningUnits',
                                icon: 'fa fa-exchange',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }

                              },

                            ]
                          },

                          //1) Consumption Reports
                          {
                            name: i18n.t('static.report.consumptionReports'),
                            icon: 'fa fa-list',
                            attributes: { hidden: ((this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_FORECAST_ERROR_OVER_TIME_REPORT')) ? false : true) },
                            children: [
                              {
                                name: i18n.t('static.dashboard.consumption'),
                                url: '/report/consumption',
                                icon: 'fa fa-exchange',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_REPORT') ? false : true) }
                              }, {
                                name: i18n.t('static.report.forecasterrorovertime'),
                                url: '/report/forecastOverTheTime',
                                icon: 'fa fa-line-chart',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_FORECAST_ERROR_OVER_TIME_REPORT') ? false : true) }
                              },

                            ]
                          },

                          //3) Shipment Reports
                          {
                            name: i18n.t('static.report.shipmentReports'),
                            icon: 'fa fa-list',
                            attributes: { hidden: ((this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_DETAILS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_COST_DETAILS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_ANNUAL_SHIPMENT_COST_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_BUDGET_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT')) ? false : true) },
                            children: [
                              {
                                name: i18n.t('static.report.shipmentDetailReport'),
                                url: '/report/shipmentSummery',
                                icon: 'fa fa-exchange',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_DETAILS_REPORT') ? false : true) }
                              },
                              // {
                              //   name: i18n.t('static.dashboard.shipmentGlobalDemandViewheader'),
                              //   url: '/report/shipmentGlobalDemandView',
                              //   icon: 'fa fa-wpforms',
                              //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_GLOBAL_VIEW_REPORT') ? false : true) }
                              // },
                              {
                                name: i18n.t('static.report.shipmentCostReport'),
                                url: '/report/procurementAgentExport',
                                icon: 'fa fa-wpforms',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_COST_DETAILS_REPORT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.report.annualshipmentcost'),
                                url: '/report/annualShipmentCost',
                                icon: 'fa fa-file-text',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_ANNUAL_SHIPMENT_COST_REPORT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.budgetHead.budget'),
                                url: '/report/budgets',
                                icon: 'fa fa-exchange',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_BUDGET_REPORT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.dashboard.supplierLeadTimes'),
                                url: '/report/supplierLeadTimes',
                                icon: 'fa fa-wpforms',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                              }

                            ]
                          },

                          //2) Inventory Reports
                          {
                            name: i18n.t('static.report.inventoryReports'),
                            icon: 'fa fa-list',
                            attributes: { hidden: ((this.state.businessFunctions.includes('ROLE_BF_EXPIRIES_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_COST_OF_INVENTORY_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_INVENTORY_TURNS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_ADJUSTMENT_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_WAREHOUSE_CAPACITY_REPORT')) ? false : true) },
                            children: [
                              {
                                name: i18n.t('static.report.expiredInventory'),
                                url: '/report/expiredInventory',
                                icon: 'fa fa-exchange',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_EXPIRIES_REPORT') ? false : true) }
                              },

                              {
                                name: i18n.t('static.dashboard.costOfInventory'),
                                url: '/report/costOfInventory',
                                icon: 'fa fa-exchange',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_COST_OF_INVENTORY_REPORT') ? false : true) }
                              }, {
                                name: i18n.t('static.dashboard.inventoryTurns'),
                                url: '/report/inventoryTurns',
                                icon: 'fa fa-line-chart',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_INVENTORY_TURNS_REPORT') ? false : true) }
                              },

                              {
                                name: i18n.t('static.report.stockAdjustment'),
                                url: '/report/stockAdjustment',
                                icon: 'fa fa-line-chart',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_ADJUSTMENT_REPORT') ? false : true) }
                              },
                              {
                                name: i18n.t('static.report.warehouseCapacity'),
                                url: '/report/warehouseCapacity',
                                icon: 'fa fa-line-chart',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_WAREHOUSE_CAPACITY_REPORT') ? false : true) }
                              },

                            ]
                          },


                          //3) Shipment Reports
                          // {
                          //   name: i18n.t('static.report.shipmentReports'),
                          //   icon: 'fa fa-list',
                          //   attributes: { hidden: ((this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_GLOBAL_VIEW_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_ANNUAL_SHIPMENT_COST_REPORT')) ? false : true) },
                          //   children: [
                          //     {
                          //       name: i18n.t('static.report.shipmentDetailReport'),
                          //       url: '/report/shipmentSummery',
                          //       icon: 'fa fa-exchange',
                          //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT') ? false : true) }
                          //     },
                          //     {
                          //       name: i18n.t('static.dashboard.shipmentGlobalDemandViewheader'),
                          //       url: '/report/shipmentGlobalDemandView',
                          //       icon: 'fa fa-wpforms',
                          //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_GLOBAL_VIEW_REPORT') ? false : true) }
                          //     },
                          //     {
                          //       name: i18n.t('static.report.shipmentCostReport'),
                          //       url: '/report/procurementAgentExport',
                          //       icon: 'fa fa-wpforms',
                          //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                          //     },
                          //     {
                          //       name: i18n.t('static.report.annualshipmentcost'),
                          //       url: '/report/annualShipmentCost',
                          //       icon: 'fa fa-file-text',
                          //       attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_ANNUAL_SHIPMENT_COST_REPORT') ? false : true) }
                          //     },

                          //   ]
                          // },

                          // {
                          //   name: i18n.t('static.dashboard.aggregateShipmentByProduct'),
                          //   url: '/report/aggregateShipmentByProduct',
                          //   icon: 'fa fa-wpforms',
                          //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                          // },


                          // {
                          //   name: i18n.t('static.dashboard.qatProblemList'),
                          //   url: '/report/problemList',
                          //   icon: 'fa fa-file-text-o',
                          //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT') ? false : true) }
                          // },
                        ]
                      }



                    ]
                }} {...this.props} />
              }
            </Suspense>
            <AppSidebarFooter />
            <AppSidebarMinimizer />
          </AppSidebar>
          <main className="main">
            {/* <AppBreadcrumb appRoutes={routes} /> */}
            <Container fluid>
              <Suspense fallback={this.loading()}>
                <Switch>
                  {routes.map((route, idx) => {
                    return route.component ? (
                      <Route
                        key={idx}
                        path={route.path}
                        exact={route.exact}
                        name={route.name != undefined ? (route.name.includes("static.") ? (route.entityname == '' || route.entityname == undefined ? i18n.t(route.name) : i18n.t(route.name, { entityname: i18n.t(route.entityname) })) : route.name) : ''}
                        render={props =>
                          AuthenticationService.authenticatedRoute(route.path) ?
                            (
                              <route.component {...props} onClick={this.displayHeaderTitle(route.name != undefined ? ((route.name.includes("static.") ? (route.entityname == '' || route.entityname == undefined ? i18n.t(route.name) : i18n.t(route.name, { entityname: i18n.t(route.entityname) })) : route.name)) : '')} />
                            ) : (
                              <Redirect to={{ pathname: "/accessDenied" }} />
                            )
                        }
                      />
                    ) : (null);
                  })}
                  <Redirect from="/" to="/login" />
                </Switch>
              </Suspense>
            </Container>
          </main>
          <AppAside fixed>
            <Suspense fallback={this.loading()}>
              <DefaultAside />
            </Suspense>
          </AppAside>
        </div>
        <AppFooter>
          <Suspense fallback={this.loading()}>
            <DefaultFooter />
          </Suspense>
        </AppFooter>
      </div>
    );
  }
}



export default DefaultLayout;
