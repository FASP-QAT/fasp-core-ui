import React from 'react';
import i18n from './i18n';

const AddInventory = React.lazy(() => import('./views/Inventory/AddInventory'));
const AddDimension = React.lazy(() => import('./views/Dimension/AddDimensionComponent'));
const DimensionList = React.lazy(() => import('./views/Dimension/DimensionListComponent'));
const EditDimension = React.lazy(() => import('./views/Dimension/EditDimensionComponent'));

const ProductCategoryTree = React.lazy(() => import('./views/ProductCategory/ProductCategoryTree'));

const AddHealthArea = React.lazy(() => import('./views/HealthArea/AddHealthArea'));
const HealthAreaList = React.lazy(() => import('./views/HealthArea/HealthAreaList'));
const EditHealthArea = React.lazy(() => import('./views/HealthArea/EditHealthArea'));

const AddOrganisation = React.lazy(() => import('./views/Organisation/AddOrganisation'));
const OrganisationList = React.lazy(() => import('./views/Organisation/OrganisationList'));
const EditOrganisation = React.lazy(() => import('./views/Organisation/EditOrganisation'));

const AddOrganisationType = React.lazy(() => import('./views/OrganisationType/AddOrganisationType'));
const OrganisationTypeList = React.lazy(() => import('./views/OrganisationType/OrganisationTypeList'));
const EditOrganisationType = React.lazy(() => import('./views/OrganisationType/EditOrganisationType'));

const AddSubFundingSource = React.lazy(() => import('./views/SubFundingSource/AddSubFundingSourceComponent'));
const ListSubFundingSource = React.lazy(() => import('./views/SubFundingSource/ListSubFundingSourceComponent'));
const EditSubFundingSource = React.lazy(() => import('./views/SubFundingSource/EditSubFundingSourceComponent'));
const ApplicationDashboard = React.lazy(() => import('./views/ApplicationDashboard'));
const ShipmentLinkingNotifications = React.lazy(() => import('./views/ManualTagging/ShipmentLinkingNotifications'));
const RealmDashboard = React.lazy(() => import('./views/RealmDashboard'));
const ProgramDashboard = React.lazy(() => import('./views/ProgramDashboard'));
const AddFundingSource = React.lazy(() => import('./views/FundingSource/AddFundingSourceComponent'));
const ListFundingSource = React.lazy(() => import('./views/FundingSource/ListFundingSourceComponent'));
const EditFundingSource = React.lazy(() => import('./views/FundingSource/EditFundingSourceComponent'));
const AddProcurementAgent = React.lazy(() => import('./views/ProcurementAgent/AddProcurementAgentComponent'));
const ListProcurementAgent = React.lazy(() => import('./views/ProcurementAgent/ListProcurementAgentComponent'));
const EditProcurementAgent = React.lazy(() => import('./views/ProcurementAgent/EditProcurementAgentComponent'));
const AddTracerCategory = React.lazy(() => import('./views/TracerCategory/AddTracerCategoryComponent'));
const ListTracerCategory = React.lazy(() => import('./views/TracerCategory/ListTracerCategoryComponent'));
const EditTracerCategory = React.lazy(() => import('./views/TracerCategory/EditTracerCategoryComponent'));
const AddSupplier = React.lazy(() => import('./views/Supplier/AddSupplierComponent'));
const ListSupplier = React.lazy(() => import('./views/Supplier/ListSupplierComponent'));
const EditSupplier = React.lazy(() => import('./views/Supplier/EditSupplierComponent'));
const AddRegion = React.lazy(() => import('./views/Region/AddRegionComponent'));
const ListRegion = React.lazy(() => import('./views/Region/ListRegionComponent'));
const EditRegion = React.lazy(() => import('./views/Region/EditRegionComponent'));
const ListRealmCountry = React.lazy(() => import('./views/RealmCountry/ListRealmCountryComponent'));
const AddRealmCountry = React.lazy(() => import('./views/RealmCountry/AddRealmCountryComponent'));
const RealmCountry = React.lazy(() => import('./views/RealmCountry/RealmCountry'));
const ChangePassword = React.lazy(() => import('./views/Pages/Login/ChangePasswordComponent'));
const Logout = React.lazy(() => import('./views/Pages/Login/LogoutComponent'));
const AddRole = React.lazy(() => import('./views/Role/AddRoleComponent'));
const ListRole = React.lazy(() => import('./views/Role/ListRoleComponent'));
const EditRole = React.lazy(() => import('./views/Role/EditRoleComponent'));
const AddUser = React.lazy(() => import('./views/User/AddUserComponent'));
const ListUser = React.lazy(() => import('./views/User/ListUserComponent'));
const EditUser = React.lazy(() => import('./views/User/EditUserComponent'));
const AccessControl = React.lazy(() => import('./views/User/AccessControlComponent'));
const AccessDenied = React.lazy(() => import('./views/Common/AccessDeniedComponent'));


const CodeEditors = React.lazy(() => import('./views/Editors/CodeEditors'));
const TextEditors = React.lazy(() => import('./views/Editors/TextEditors'));

const Compose = React.lazy(() => import('./views/Apps/Email/Compose'));
const Inbox = React.lazy(() => import('./views/Apps/Email/Inbox'));
const Message = React.lazy(() => import('./views/Apps/Email/Message'));
const Invoice = React.lazy(() => import('./views/Apps/Invoicing/Invoice'));

const AdvancedForms = React.lazy(() => import('./views/Forms/AdvancedForms'));
const BasicForms = React.lazy(() => import('./views/Forms/BasicForms'));
const ValidationForms = React.lazy(() => import('./views/Forms/ValidationForms'));
const GoogleMaps = React.lazy(() => import('./views/GoogleMaps'));
const Toastr = React.lazy(() => import('./views/Notifications/Toastr'));
const Calendar = React.lazy(() => import('./views/Plugins/Calendar'));
const Draggable = React.lazy(() => import('./views/Plugins/Draggable'));
const Spinners = React.lazy(() => import('./views/Plugins/Spinners'));
const DataTable = React.lazy(() => import('./views/Tables/DataTable'));
const Tables = React.lazy(() => import('./views/Tables/Tables'));
const LoadingButtons = React.lazy(() => import('./views/Buttons/LoadingButtons'));

const Breadcrumbs = React.lazy(() => import('./views/Base/Breadcrumbs'));
const Cards = React.lazy(() => import('./views/Base/Cards'));
const Collapses = React.lazy(() => import('./views/Base/Collapses'));
const Carousels = React.lazy(() => import('./views/Base/Carousels'));
const Dropdowns = React.lazy(() => import('./views/Base/Dropdowns'));

const Jumbotrons = React.lazy(() => import('./views/Base/Jumbotrons'));
const ListGroups = React.lazy(() => import('./views/Base/ListGroups'));
const Navbars = React.lazy(() => import('./views/Base/Navbars'));
const Navs = React.lazy(() => import('./views/Base/Navs'));
const Paginations = React.lazy(() => import('./views/Base/Paginations'));
const Popovers = React.lazy(() => import('./views/Base/Popovers'));
const ProgressBar = React.lazy(() => import('./views/Base/ProgressBar'));
const SpinnersB4 = React.lazy(() => import('./views/Base/Spinners'));
const Switches = React.lazy(() => import('./views/Base/Switches'));

const Tabs = React.lazy(() => import('./views/Base/Tabs'));
const Tooltips = React.lazy(() => import('./views/Base/Tooltips'));
const BrandButtons = React.lazy(() => import('./views/Buttons/BrandButtons'));
const ButtonDropdowns = React.lazy(() => import('./views/Buttons/ButtonDropdowns'));
const ButtonGroups = React.lazy(() => import('./views/Buttons/ButtonGroups'));
const Buttons = React.lazy(() => import('./views/Buttons/Buttons'));
const Charts = React.lazy(() => import('./views/Charts'));

const Dashboard = React.lazy(() => import('./views/Dashboard'));
const CoreUIIcons = React.lazy(() => import('./views/Icons/CoreUIIcons'));
const Flags = React.lazy(() => import('./views/Icons/Flags'));
const FontAwesome = React.lazy(() => import('./views/Icons/FontAwesome'));
const SimpleLineIcons = React.lazy(() => import('./views/Icons/SimpleLineIcons'));
const Alerts = React.lazy(() => import('./views/Notifications/Alerts'));
const Badges = React.lazy(() => import('./views/Notifications/Badges'));
const Modals = React.lazy(() => import('./views/Notifications/Modals'));
const Colors = React.lazy(() => import('./views/Theme/Colors'));
const Typography = React.lazy(() => import('./views/Theme/Typography'));
const Widgets = React.lazy(() => import('./views/Widgets/Widgets'));
const Users = React.lazy(() => import('./views/Users/Users'));
const User = React.lazy(() => import('./views/Users/User'));

const AddBudgetComponent = React.lazy(() => import('./views/Budget/AddBudgetComponent'));
const ListBudgetComponent = React.lazy(() => import('./views/Budget/ListBudgetComponent'));
const EditBudgetComponent = React.lazy(() => import('./views/Budget/EditBudgetComponent'));
const AddProgramProduct = React.lazy(() => import('./views/ProgramProduct/AddProgramProduct'));
const AddProductCategory = React.lazy(() => import('./views/ProductCategory/AddProductCategory'));
const AddProgram = React.lazy(() => import('./views/Program/AddProgram'));
const Programs = React.lazy(() => import('./views/Program/ProgramList'));
const EditProgram = React.lazy(() => import('./views/Program/EditProgram'));
const SubFundingSourceList = React.lazy(() => import('./views/SubFundingSource/ListSubFundingSourceComponent'));
const AddProduct = React.lazy(() => import('./views/Product/AddProduct'));
const ListProdct = React.lazy(() => import('./views/Product/ProductList'));
const EditProdct = React.lazy(() => import('./views/Product/EditProduct'));
const ProgramTree = React.lazy(() => import('./views/Program/ProgramTree'));
const ExportProgram = React.lazy(() => import('./views/Program/ExportProgram'));
const ImportProgram = React.lazy(() => import('./views/Program/ImportProgram'));
// const MasterDataSync = React.lazy(() => import('./views/SyncMasterData/SyncMasterData'));
const ConsumptionDetails = React.lazy(() => import('./views/Consumption/ConsumptionDetails'));

const AddLanguage = React.lazy(() => import('./views/Language/AddLanguageComponent'));
const ListLanguage = React.lazy(() => import('./views/Language/LanguageListComponent'));
const EditLanguage = React.lazy(() => import('./views/Language/EditLanguageComponent'));
const EditProblem = React.lazy(() => import('./views/Report/EditProblem'));
const AddProblem = React.lazy(() => import('./views/Report/AddProblem'));

const AddUnit = React.lazy(() => import('./views/Unit/AddUnitComponent'));
const ListUnit = React.lazy(() => import('./views/Unit/UnitListComponent'));
const EditUnit = React.lazy(() => import('./views/Unit/EditUnitComponent'));

const AddCountry = React.lazy(() => import('./views/Country/AddCountryComponent'));
const ListCountry = React.lazy(() => import('./views/Country/ListCountryComponent'));
const EditCountry = React.lazy(() => import('./views/Country/EditCountryComponent'));

const AddDataSource = React.lazy(() => import('./views/DataSource/AddDataSource'));
const ListDataSource = React.lazy(() => import('./views/DataSource/DataSourceListComponent'));
const EditDataSource = React.lazy(() => import('./views/DataSource/UpdateDataSourceComponent'));

const AddDataSourceType = React.lazy(() => import('./views/DataSourceType/AddDataSourceTypeComponent'));
const ListDataSourceType = React.lazy(() => import('./views/DataSourceType/DataSourceTypeListComponent'));
const EditDataSourceType = React.lazy(() => import('./views/DataSourceType/UpdateDataSourceTypeComponent'));

const AddCurrency = React.lazy(() => import('./views/Currency/AddCurrencyComponent'));
const ListCurrency = React.lazy(() => import('./views/Currency/ListCurrencyComponent'));
const EditCurrency = React.lazy(() => import('./views/Currency/EditCurrencyComponent'));
const DatabaseTranslation = React.lazy(() => import('./views/Translations/DatabaseTranslations'));
const LabelTranslation = React.lazy(() => import('./views/Translations/LabelTranslations'))
// const ProgramTree = React.lazy(() => import('./views/Dashboard/ProgramTree'));


const AddRealm = React.lazy(() => import('./views/Realm/AddRealmComponent'));
const RealmList = React.lazy(() => import('./views/Realm/ListRealmComponent'));
const EditRealm = React.lazy(() => import('./views/Realm/EditRealmComponent'));
const SupplyPlan = React.lazy(() => import('./views/SupplyPlan/SupplyPlanComponent'));
const WhatIfReport = React.lazy(() => import('./views/WhatIfReport/whatIfReport'));
const ManualTagging = React.lazy(() => import('./views/ManualTagging/ManualTagging'));
const ShipmentDelinking = React.lazy(() => import('./views/ManualTagging/ShipmentDelinking'));


const AddForecastingUnit = React.lazy(() => import('./views/ForecastingUnit/AddForecastingUnitComponent'));
const ForecastingUnitList = React.lazy(() => import('./views/ForecastingUnit/ForecastingUnitListComponent'));
const EditForecastingUnit = React.lazy(() => import('./views/ForecastingUnit/EditForecastingUnitComponent'));

const AddPlanningUnit = React.lazy(() => import('./views/PlanningUnit/AddPlanningUnit'));
const PlanningUnitList = React.lazy(() => import('./views/PlanningUnit/PlanningUnitListComponent'));
const EditPlanningUnit = React.lazy(() => import('./views/PlanningUnit/EditPlanningUnitComponent'));

const ListProcurementUnit = React.lazy(() => import('./views/ProcurementUnit/ListProcurementUnit'))
const AddProcurementUnit = React.lazy(() => import('./views/ProcurementUnit/AddProcurementUnit'))
const EditProcurementUnit = React.lazy(() => import('./views/ProcurementUnit/EditProcurementUnit'))
const AddProcurementAgentPlanningUnit = React.lazy(() => import('./views/ProcurementAgentPlanningUnit/AddProcurementAgentPlanningUnit'));
const AddProcurementAgentProcurementUnit = React.lazy(() => import('./views/ProcurementAgentProcurementUnit/AddProcurementAgentProcurementUnit'));
const PlanningUnitCapacity = React.lazy(() => import('./views/PlanningUnitCapacity/PlanningUnitCapacity'));
const PlanningUnitCountry = React.lazy(() => import('./views/RealmCountry/RealmCountryPlanningUnit'));
const PlanningUnitCountryList = React.lazy(() => import('./views/RealmCountry/RealmCountryPlanningUnitList'));
const PlanningUnitCapacityList = React.lazy(() => import('./views/PlanningUnitCapacity/PlanningUnitCapacityList'));
const RealmCountryRegion = React.lazy(() => import('./views/RealmCountry/RealmCountryRegion'));
const syncPage = React.lazy(() => import('./views/Synchronisation/syncPage'));

const ProductCatalog = React.lazy(() => import('./views/Report/ProductCatalog'));
const ConsumptionReport = React.lazy(() => import('./views/Report/Consumption'));
const StockStatusMatrixReport = React.lazy(() => import('./views/Report/StockStatusMatrix'));
const StockStatusReport = React.lazy(() => import('./views/Report/StockStatus'));
const GlobalConsumptionReport = React.lazy(() => import('./views/Report/GlobalConsumption'));
const ProgramOnboarding = React.lazy(() => import('./views/Program/ProgramOnboarding'));
const DeleteLocalPrograms = React.lazy(() => import('./views/Program/DeleteLocalProgramComponent'));
const ShipmentList = React.lazy(() => import('./views/Shipment/ShipmentDetails'));
const ForecastMetricsOverTime = React.lazy(() => import('./views/Report/ForecastMetricsOverTime'));
const pipeline = React.lazy(() => import('./views/Pipeline/PipelineProgramImport'));
const pipelineProgramSetup = React.lazy(() => import('./views/Pipeline/PipelineProgramSetup'));
const StockStatusOverTime = React.lazy(() => import('./views/Report/StockStatusOverTime'));
const SupplyPlanFormulas = React.lazy(() => import('./views/SupplyPlan/SupplyPlanFormulas'));
const ForecastMetrics = React.lazy(() => import('./views/Report/ForecastMetrics'));

const QatProblemPlusActionReport = React.lazy(() => import('./views/Report/QatProblemPlusActionReport'));
const ProblemList = React.lazy(() => import('./views/Report/ProblemList'));
const FunderExport = React.lazy(() => import('./views/Report/FunderExport'));
const ProcurementAgentExport = React.lazy(() => import('./views/Report/ProcurementAgentExport'));
const SupplierLeadTimes = React.lazy(() => import('./views/Report/SupplierLeadTimes'));
const ShipmentGlobalDemandView = React.lazy(() => import('./views/Report/ShipmentGlobalDemandView'));
const AggregateShipmentByProduct = React.lazy(() => import('./views/Report/AggregateShipmentByProduct'));
const ShipmentGlobalView = React.lazy(() => import('./views/Report/ShipmentGlobalView'));

const AnnualShipmentCost = React.lazy(() => import('./views/Report/AnnualShipmentCost'));
const SupplyPlanVersionAndReview = React.lazy(() => import('./views/Report/SupplyPlanVersionAndReview'));
const EditSupplyPlanStatus = React.lazy(() => import('./views/Report/EditSupplyPlanStatus'));


const PipelineProgramList = React.lazy(() => import('./views/Pipeline/PipelineProgramList'));

const PlanningUnitListNegativeInventory = React.lazy(() => import('./views/Pipeline/PlanningUnitListNegativeInventory'));
const CostOfInventoryReport = React.lazy(() => import('./views/Report/CostOfInventory'));
const InventoryTurnsReport = React.lazy(() => import('./views/Report/InventoryTurns'));
const ShipmentSummery = React.lazy(() => import('./views/Report/ShipmentSummery'));

const WarehouseCapacity = React.lazy(() => import('./views/Report/WarehouseCapacity'));
const StockStatusAccrossPlanningUnitGlobalView = React.lazy(() => import('./views/Report/StockStatusAccrossPlanningUnitGlobalView'));
const StockAdjustment = React.lazy(() => import('./views/Report/StockAdjustment'));
const StockStatusReportAcrossPlanningUnits = React.lazy(() => import('./views/Report/StockStatusAcrossPlanningUnits'));
const ExpiredInventory = React.lazy(() => import('./views/Report/ExpiredInventory'));
const Budgets = React.lazy(() => import('./views/Report/Budgets'));

const UsagePeriodList = React.lazy(() => import('./views/UsagePeriod/UsagePeriodList'));
const ModelingTypeList = React.lazy(() => import('./views/ModelingType/ModelingTypeList'));
const ForecastMethodList = React.lazy(() => import('./views/ForecastMethod/ForecastMethodList'));
const EquivalancyUnitList = React.lazy(() => import('./views/EquivalancyUnit/EquivalancyUnitList'));
const UsageTemplateList = React.lazy(() => import('./views/UsageTemplate/UsageTemplateList'));

const ListTree = React.lazy(() => import('./views/DataSet/ListTreeComponent'));

// const EditProblem = React.lazy(() => import('./views/Problem/EditProblem'));

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [

  { path: '/consumptionDetails/:programId/:versionId/:planningUnitId', name: i18n.t('static.dashboard.consumptiondetails'), component: ConsumptionDetails },
  { path: '/shipment/shipmentDetails/:programId/:versionId/:planningUnitId', name: i18n.t('static.dashboard.shipmentdetails'), component: ShipmentList },
  { path: '/report/addProblem/:color/:message', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.report.problem') }), component: AddProblem },
  { path: '/report/problemList/:color/:message', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.qatProblem') }), component: ProblemList },
  { path: '/report/problemList/:programId/:calculate/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.qatProblem') }), component: ProblemList },
  { path: '/report/problemList/1/:programId/:calculate', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.qatProblem') }), component: ProblemList },
  // { path: '/report/problemList', name: 'Qat Problem List', component: ProblemList },

  { path: '/problem/editProblem', name: ' Edit Problem', component: EditProblem },
  { path: '/report/inventoryTurns', name: ' Inventory Turns', component: InventoryTurnsReport },
  { path: '/report/costOfInventory', name: ' Cost of Inventory', component: CostOfInventoryReport },
  { path: '/pipeline/planningUnitListFinalInventory/:pipelineId', name: 'Planning Unit List', component: PlanningUnitListNegativeInventory },
  { path: '/pipeline/pieplineProgramList/:color/:message', name: 'Program List', component: PipelineProgramList },
  { path: '/pipeline/pieplineProgramList', exact: true, name: 'Program List', component: PipelineProgramList },
  { path: '/pipeline/pieplineProgramSetup/:pipelineId', name: 'Pipeline Program Setup', component: pipelineProgramSetup },
  { path: '/pipeline/pipelineProgramImport', name: 'Pipeline Program Import', component: pipeline },
  { path: '/program/programOnboarding', name: 'Setup Program', component: ProgramOnboarding },

  { path: '/inventory/addInventory/:programId/:versionId/:planningUnitId', name: i18n.t('static.dashboard.inventorydetails'), component: AddInventory },
  { path: '/inventory/addInventory', name: i18n.t('static.dashboard.inventorydetails'), component: AddInventory, exact: true },

  { path: '/productCategory/productCategoryTree', name: 'Product Category', component: ProductCategoryTree },
  { path: '/productCategory/productCategoryTree/:color/:message', name: 'Product Category', component: ProductCategoryTree },

  { path: '/', exact: true, name: i18n.t('static.home') },
  { path: '/programTree', name: i18n.t('static.dashboard.program'), component: ProgramTree },
  { path: '/diamension/AddDiamension', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.dimensionheader') }), component: AddDimension },
  { path: '/dimension/listDimension', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.dimension') }), component: DimensionList },
  // { path: '/dimension/listDimension/:message', component: DimensionList },
  { path: '/dimension/listDimension/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.dimension') }), component: DimensionList },
  { path: '/dimension/listDimension/:message', component: DimensionList },
  { path: '/diamension/editDiamension/:dimensionId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.dimensionheader') }), component: EditDimension },

  { path: '/realm/addrealm', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.realmheader') }), component: AddRealm },
  { path: '/realm/listRealm', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.realm') }), component: RealmList },
  { path: '/realm/updateRealm/:realmId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.realmheader') }), component: EditRealm },
  { path: '/realm/listRealm/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.realm') }), component: RealmList },

  { path: '/product/editProduct/:productId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.product.product') }), component: EditProdct },
  { path: '/product/listProduct', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.product.product') }), component: ListProdct },
  { path: '/product/listProduct/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.product.product') }), component: ListProdct },
  { path: '/product/addProduct', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.product.product') }), component: AddProduct },

  { path: '/program/addProgram', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.programheader') }), component: AddProgram },
  { path: '/program/listProgram', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.program') }), component: Programs },
  // { path: '/program/listProgram/:message', component: Programs },
  { path: '/program/listProgram/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.program') }), component: Programs },
  { path: '/program/editProgram/:programId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.programheader') }), component: EditProgram },

  { path: '/productCategory/addProductCategory', name: 'Add Product Category', component: AddProductCategory },
  // { path: '/programProduct/addProgramProduct/:programId', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.programPlanningUnit') }), component: AddProgramProduct },
  { path: '/programProduct/addProgramProduct', name: i18n.t('static.Update.PlanningUnits'), component: AddProgramProduct },


  { path: '/procurementAgent/addProcurementAgentPlanningUnit/:procurementAgentId', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.procurementAgentPlanningUnit') }), component: AddProcurementAgentPlanningUnit },
  { path: '/procurementAgent/addProcurementAgentProcurementUnit/:procurementAgentId', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.procurementAgentProcurementUnit') }), component: AddProcurementAgentProcurementUnit },

  { path: '/budget/addBudget', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.budget') }), component: AddBudgetComponent },
  { path: '/budget/listBudget', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.budgetheader') }), component: ListBudgetComponent },
  // { path: '/budget/listBudget/:message', component: ListBudgetComponent },
  { path: '/budget/listBudget/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.budgetheader') }), component: ListBudgetComponent },
  { path: '/budget/editBudget/:budgetId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.budget') }), component: EditBudgetComponent },

  { path: '/', exact: true, name: i18n.t('static.home') },

  { path: '/healthArea/addHealthArea', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.healthareaheader') }), component: AddHealthArea },
  // { path: '/healthArea/listHealthArea/:message', component: HealthAreaList },
  { path: '/healthArea/listHealthArea/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.healtharea') }), component: HealthAreaList },
  { path: '/healthArea/listHealthArea', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.healtharea') }), component: HealthAreaList },
  { path: '/healthArea/editHealthArea/:healthAreaId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.healthareaheader') }), component: EditHealthArea },

  { path: '/organisation/addOrganisation', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.organisation.organisationheader') }), component: AddOrganisation },
  // { path: '/organisation/listOrganisation/:message', component: OrganisationList },
  { path: '/organisation/listOrganisation/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.organisation.organisation') }), component: OrganisationList },
  { path: '/organisation/listOrganisation', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.organisation.organisation') }), component: OrganisationList },
  { path: '/organisation/editOrganisation/:organisationId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.organisation.organisationheader') }), component: EditOrganisation },

  { path: '/organisationType/addOrganisationType', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.organisationType.organisationType') }), component: AddOrganisationType },
  // { path: '/organisationType/listOrganisationType/:message', component: OrganisationTypeList },
  { path: '/organisationType/listOrganisationType/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.organisationType.organisationType') }), component: OrganisationTypeList },
  { path: '/organisationType/listOrganisationType', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.organisationType.organisationType') }), component: OrganisationTypeList },
  { path: '/organisationType/editOrganisationType/:organisationTypeId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.organisationType.organisationType') }), component: EditOrganisationType },

  { path: '/fundingSource/addFundingSource', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.fundingsourceheader') }), component: AddFundingSource },
  { path: '/fundingSource/listFundingSource', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.fundingsource') }), component: ListFundingSource },
  { path: '/fundingSource/editFundingSource/:fundingSourceId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.fundingsourceheader') }), component: EditFundingSource },
  // { path: '/fundingSource/listFundingSource/:message', component: ListFundingSource },
  { path: '/fundingSource/listFundingSource/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.fundingsource') }), component: ListFundingSource },

  { path: '/subFundingSource/addSubFundingSource', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.subfundingsource') }), component: AddSubFundingSource },
  { path: '/subFundingSource/listSubFundingSource', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.subfundingsource') }), component: ListSubFundingSource },
  { path: '/subFundingSource/editSubFundingSource/:subFundingSourceId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.subfundingsource') }), component: EditSubFundingSource },
  { path: '/subFundingSource/subFundingSourceList/:message', component: SubFundingSourceList },
  { path: '/ApplicationDashboard/:id', exact: true, name: i18n.t('static.dashboard.applicationdashboard'), component: ApplicationDashboard },
  { path: '/ApplicationDashboard/:id/:color/:message', exact: true, name: i18n.t('static.dashboard.applicationdashboard'), component: ApplicationDashboard },
  { path: '/ApplicationDashboard', exact: true, name: i18n.t('static.dashboard.applicationdashboard'), component: ApplicationDashboard },
  // { path: '/ApplicationDashboard/:message', component: ApplicationDashboard },
  { path: '/ApplicationDashboard/:color/:message', exact: true, name: i18n.t('static.dashboard.applicationdashboard'), component: ApplicationDashboard },

  { path: '/shipmentLinkingNotification', exact: true, name: i18n.t('static.mt.shipmentLinkingNotification'), component: ShipmentLinkingNotifications },
  { path: '/RealmDashboard', name: i18n.t('static.dashboard.realmdashboard'), component: RealmDashboard },
  { path: '/ProgramDashboard', name: i18n.t('static.dashboard.programdashboard'), component: ProgramDashboard },
  { path: '/dashboard', exact: true, name: i18n.t('static.common.dashboard'), component: Dashboard },

  { path: '/subFundingSource/subFundingSourceList/:message', component: SubFundingSourceList },
  { path: '/subFundingSource/listSubFundingSource/:message', component: ListSubFundingSource },

  { path: '/procurementAgent/addProcurementAgent', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.procurementagentheader') }), component: AddProcurementAgent },
  { path: '/procurementAgent/listProcurementAgent', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.procurementagent') }), component: ListProcurementAgent },
  // { path: '/procurementAgent/listProcurementAgent/:message', component: ListProcurementAgent },
  { path: '/procurementAgent/listProcurementAgent/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.procurementagent') }), component: ListProcurementAgent },
  { path: '/procurementAgent/editProcurementAgent/:procurementAgentId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.procurementagentheader') }), component: EditProcurementAgent },

  { path: '/tracerCategory/addTracerCategory', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.tracercategoryheader') }), component: AddTracerCategory },
  { path: '/tracerCategory/listTracerCategory', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.tracercategory') }), component: ListTracerCategory },
  // { path: '/tracerCategory/listTracerCategory/:message', component: ListTracerCategory },
  { path: '/tracerCategory/listTracerCategory/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.tracercategory') }), component: ListTracerCategory },
  { path: '/tracerCategory/editTracerCategory/:tracerCategoryId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.tracercategoryheader') }), component: EditTracerCategory },

  { path: '/supplier/addSupplier', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.supplierheader') }), component: AddSupplier },
  { path: '/supplier/listSupplier', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.supplier') }), component: ListSupplier },
  { path: '/supplier/editSupplier/:supplierId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.supplierheader') }), component: EditSupplier },
  // { path: '/supplier/listSupplier/:message', component: ListSupplier },
  { path: '/supplier/listSupplier/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.supplier') }), component: ListSupplier },



  { path: '/region/addRegion', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.region') }), component: AddRegion },
  // { path: '/region/listRegion', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.region') }), component: ListRegion },
  { path: '/region/listRegion', exact: true, name: i18n.t('static.dashboard.region'), component: ListRegion },
  { path: '/region/editRegion/:regionId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.region') }), component: EditRegion },
  { path: '/region/listRegion/:message', component: ListRegion },



  // { path: '/realmCountry/listRealmCountry/:message', component: ListRealmCountry },
  { path: '/realmCountry/listRealmCountry/:color/:message', name: i18n.t('static.dashboard.realmcountrylist'), component: ListRealmCountry },
  { path: '/realmCountry/listRealmCountry', exact: true, name: i18n.t('static.dashboard.realmcountrylist'), component: ListRealmCountry },
  { path: '/realmCountry/addRealmCountry', exact: true, name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.realmcountry') }), component: AddRealmCountry },
  { path: '/realmCountry/realmCountry/:realmId', exact: true, name: i18n.t('static.dashboard.realmcountry'), component: RealmCountry },

  { path: '/changePassword', exact: true, name: i18n.t('static.dashboard.changepassword'), component: ChangePassword },
  { path: '/logout', exact: true, component: Logout },
  { path: '/logout/:message', exact: true, component: Logout },
  { path: '/role/listRole/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.role') }), component: ListRole },
  { path: '/role/listRole', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.role') }), component: ListRole },
  { path: '/role/addRole', exact: true, name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.role') }), component: AddRole },
  { path: '/role/editRole/:roleId', exact: true, name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.role') }), component: EditRole },

  // { path: '/user/listUser/:message', component: ListUser },
  { path: '/user/listUser/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.user') }), component: ListUser },
  { path: '/user/listUser', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.user') }), component: ListUser },
  { path: '/user/addUser', exact: true, name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.addupdateuser') }), component: AddUser },
  { path: '/user/editUser/:userId', exact: true, name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.addupdateuser') }), component: EditUser },
  { path: '/user/accessControl/:userId', exact: true, name: i18n.t('static.dashboard.useraccessctrl'), component: AccessControl },
  { path: '/accessDenied', exact: true, name: i18n.t('static.accessDenied'), component: AccessDenied },

  // { path: '/dashboard/:message', component: Dashboard },
  { path: '/dashboard/:color/:message', component: Dashboard },
  { path: '/program/downloadProgram', name: i18n.t('static.dashboard.downloadprogram'), component: ProgramTree },
  { path: '/program/syncPage', name: "Commit Version", component: syncPage },
  { path: '/program/downloadProgram/:message', component: ProgramTree },
  { path: '/program/exportProgram', name: i18n.t('static.dashboard.exportprogram'), component: ExportProgram },
  { path: '/program/importProgram', name: i18n.t('static.dashboard.importprogram'), component: ImportProgram },

  // { path: '/masterDataSync', name: i18n.t('static.dashboard.masterdatasync'), component: MasterDataSync },
  // { path: '/masterDataSync/:message',  component: MasterDataSync },

  { path: '/consumptionDetails', exact: true, name: i18n.t('static.dashboard.consumptiondetails'), component: ConsumptionDetails },

  { path: '/language/addLanguage', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.languageheader') }), component: AddLanguage },
  { path: '/language/listLanguage', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.language') }), component: ListLanguage },
  { path: '/language/listLanguage/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.language') }), component: ListLanguage },
  { path: '/language/editLanguage/:languageId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.languageheader') }), component: EditLanguage },
  { path: '/report/editProblem/:problemReportId/:programId/:index/:problemStatusId/:problemTypeId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.report.problem') }), component: EditProblem },
  { path: '/report/addProblem', name: i18n.t('static.dashboard.add.problem'), component: AddProblem },

  { path: '/unit/addUnit', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.unit') }), component: AddUnit },
  { path: '/unit/listUnit', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.unit') }), component: ListUnit },
  // { path: '/unit/listUnit/:message', component: ListUnit },
  { path: '/unit/listUnit/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.unit') }), component: ListUnit },
  { path: '/unit/editUnit/:unitId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.unit') }), component: EditUnit },

  { path: '/country/addCountry', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.country') }), component: AddCountry },
  { path: '/country/listCountry', exact: true, name: i18n.t('static.dashboard.countryheader'), component: ListCountry },
  // { path: '/country/listCountry/:message', component: ListCountry },
  { path: '/country/listCountry/:color/:message', name: i18n.t('static.dashboard.countryheader'), component: ListCountry },
  { path: '/country/editCountry/:countryId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.country') }), component: EditCountry },

  { path: '/dataSourceType/addDataSourceType', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.datasourcetype') }), component: AddDataSourceType },
  { path: '/dataSourceType/listDataSourceType', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.datasourcetype') }), component: ListDataSourceType },
  // { path: '/dataSourceType/listDataSourceType/:message', component: ListDataSourceType },
  { path: '/dataSourceType/listDataSourceType/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.datasourcetype') }), component: ListDataSourceType },
  { path: '/dataSourceType/editDataSourceType/:dataSourceTypeId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.datasourcetype') }), component: EditDataSourceType },

  { path: '/dataSource/addDataSource', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.datasourcehaeder') }), component: AddDataSource },
  { path: '/dataSource/listDataSource', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.datasource') }), component: ListDataSource },
  // { path: '/dataSource/listDataSource/:message', component: ListDataSource },
  { path: '/dataSource/listDataSource/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.datasource') }), component: ListDataSource },
  { path: '/dataSource/editDataSource/:dataSourceId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.datasourcehaeder') }), component: EditDataSource },

  { path: '/currency/addCurrency', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.currency') }), component: AddCurrency },
  { path: '/currency/listCurrency', exact: true, name: i18n.t('static.dashboard.currencyheader'), component: ListCurrency },
  { path: '/currency/listCurrency/:color/:message', name: i18n.t('static.dashboard.currencyheader'), component: ListCurrency },
  // { path: '/currency/listCurrency/:message', component: ListCurrency },
  { path: '/currency/editCurrency/:currencyId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.currency') }), component: EditCurrency },

  { path: '/translations/databaseTranslations', name: i18n.t('static.label.databaseTranslations'), component: DatabaseTranslation },
  { path: '/translations/labelTranslations', name: i18n.t('static.label.labelTranslations'), component: LabelTranslation },

  { path: '/supplyPlan', exact: true, name: i18n.t('static.dashboard.supplyPlan'), component: SupplyPlan },
  { path: '/supplyPlan/:programId/:versionId/:planningUnitId', name: i18n.t('static.dashboard.supplyPlan'), component: SupplyPlan },
  { path: '/report/whatIf', name: i18n.t('static.dashboard.whatIf'), component: WhatIfReport },
  { path: '/shipment/manualTagging', name: i18n.t('static.dashboard.manualTagging'), component: ManualTagging },
  { path: '/shipment/delinking', name: i18n.t('static.dashboard.delinking'), component: ShipmentDelinking },
  { path: '/supplyPlanFormulas', name: i18n.t('static.supplyplan.supplyplanformula'), component: SupplyPlanFormulas },


  { path: '/forecastingUnit/addForecastingUnit', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.forecastingunit') }), component: AddForecastingUnit },
  { path: '/forecastingUnit/listForecastingUnit', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.forecastingunit') }), component: ForecastingUnitList },
  // { path: '/forecastingUnit/listForecastingUnit/:message', component: ForecastingUnitList },
  { path: '/forecastingUnit/listForecastingUnit/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.forecastingunit') }), component: ForecastingUnitList },
  { path: '/forecastingUnit/editForecastingUnit/:forecastingUnitId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.forecastingunit') }), component: EditForecastingUnit },

  { path: '/planningUnit/addPlanningUnit', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.planningunitheader') }), component: AddPlanningUnit },
  { path: '/planningUnit/listPlanningUnit', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.planningunit') }), component: PlanningUnitList },
  // { path: '/planningUnit/listPlanningUnit/:message', component: PlanningUnitList },
  { path: '/planningUnit/listPlanningUnit/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.planningunit') }), component: PlanningUnitList },
  { path: '/planningUnitCapacity/planningUnitCapacity/:planningUnitId', name: i18n.t('static.dashboad.planningunitcapacityheader'), component: PlanningUnitCapacity },


  { path: '/procurementUnit/addProcurementUnit', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.procurementUnitheader') }), component: AddProcurementUnit },
  { path: '/procurementUnit/listProcurementUnit', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.procurementUnit') }), component: ListProcurementUnit },
  // { path: '/procurementUnit/listProcurementUnit/:message', component: ListProcurementUnit },
  { path: '/procurementUnit/listProcurementUnit/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.procurementUnit') }), component: ListProcurementUnit },
  { path: '/procurementUnit/editProcurementUnit', exact: true, name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.procurementUnitheader') }), component: EditProcurementUnit },
  { path: '/procurementUnit/editProcurementUnit/:procurementUnitId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.procurementUnitheader') }), component: EditProcurementUnit },
  { path: '/planningUnit/editPlanningUnit/:planningUnitId', exact: true, name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.planningunitheader') }), component: EditPlanningUnit },
  { path: '/realmCountry/listRealmCountryPlanningUnit', exact: true, name: i18n.t('static.dashboad.planningunitcountry'), component: PlanningUnitCountryList },
  { path: '/realmCountry/listRealmCountryPlanningUnit/:color/:message', name: i18n.t('static.dashboad.planningunitcountry'), component: PlanningUnitCountryList },
  { path: '/planningUnitCapacity/planningUnitCapacity/:planningUnitId', name: i18n.t('static.dashboad.planningunitcapacity'), component: PlanningUnitCapacity },
  { path: '/realmCountry/realmCountryPlanningUnit/:realmCountryId', name: i18n.t('static.dashboad.planningunitcountry'), component: PlanningUnitCountry },
  { path: '/planningUnitCapacity/listPlanningUnitCapacity', name: i18n.t('static.dashboad.planningunitcapacity'), component: PlanningUnitCapacityList },
  { path: '/realmCountry/realmCountryRegion/:realmCountryId', name: i18n.t('static.dashboad.regioncountry'), component: RealmCountryRegion },
  { path: '/report/productCatalog', name: i18n.t('static.dashboard.productcatalog'), component: ProductCatalog },
  { path: '/report/consumption', name: i18n.t('static.dashboard.consumption'), component: ConsumptionReport },
  { path: '/report/stockStatusMatrix', name: i18n.t('static.dashboard.stockstatusmatrix'), component: StockStatusMatrixReport },
  { path: '/report/stockStatus', name: i18n.t('static.dashboard.stockstatus'), component: StockStatusReport },
  { path: '/report/globalConsumption', name: i18n.t('static.dashboard.globalconsumption'), component: GlobalConsumptionReport },
  { path: '/report/forecastOverTheTime', name: i18n.t('static.report.forecasterrorovertime'), component: ForecastMetricsOverTime },
  { path: '/report/stockStatusOverTime', name: i18n.t('static.dashboard.stockstatusovertime'), component: StockStatusOverTime },
  { path: '/report/forecastMetrics', name: i18n.t('static.dashboard.forecastmetrics'), component: ForecastMetrics },

  { path: '/report/qatProblemPlusActionReport', name: 'Qat Problem Plus Action Report', component: QatProblemPlusActionReport },
  { path: '/report/problemList', name: i18n.t('static.dashboard.qatProblemList'), component: ProblemList },

  { path: '/report/funderExport', name: i18n.t('static.dashboard.funderExport'), component: FunderExport },
  { path: '/report/procurementAgentExport', name: i18n.t('static.report.shipmentCostReport'), component: ProcurementAgentExport },
  { path: '/report/supplierLeadTimes', name: i18n.t('static.dashboard.supplierLeadTimes'), component: SupplierLeadTimes },
  { path: '/report/shipmentGlobalDemandView', name: i18n.t('static.dashboard.shipmentGlobalDemandViewheader'), component: ShipmentGlobalDemandView },
  { path: '/report/aggregateShipmentByProduct', name: i18n.t('static.dashboard.aggregateShipmentByProduct'), component: AggregateShipmentByProduct },
  { path: '/report/shipmentGlobalView', name: i18n.t('static.dashboard.shipmentGlobalViewheader'), component: ShipmentGlobalView },


  { path: '/report/annualShipmentCost', name: i18n.t('static.report.annualshipmentcost'), component: AnnualShipmentCost },

  { path: '/report/supplyPlanVersionAndReview', exact: true, name: i18n.t('static.report.supplyplanversionandreviewReport'), component: SupplyPlanVersionAndReview },
  { path: '/report/editStatus/:programId/:versionId', name: i18n.t('static.dashboard.report') + " / " + i18n.t('static.report.supplyplanversionandreviewReport'), component: EditSupplyPlanStatus },
  { path: '/report/supplyPlanVersionAndReview/:color/:message', name: i18n.t('static.dashboard.report') + " / " + i18n.t('static.report.supplyplanversionandreviewReport'), component: SupplyPlanVersionAndReview },

  { path: '/report/shipmentSummery', exact: true, name: i18n.t('static.report.shipmentDetailReport'), component: ShipmentSummery },
  { path: '/report/shipmentSummery/:message', name: i18n.t('static.dashboard.report') + " / " + i18n.t('static.report.shipmentSummeryReport'), component: ShipmentSummery },
  { path: '/report/stockStatusAcrossPlanningUnits', name: i18n.t('static.dashboard.stockstatusacrossplanningunit'), component: StockStatusReportAcrossPlanningUnits },
  { path: '/report/budgets', name: i18n.t('static.dashboard.budgetheader'), component: Budgets },
  { path: '/program/deleteLocalProgram', name: i18n.t('static.program.deleteLocalProgram'), component: DeleteLocalPrograms },



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
  { path: '/shipment/shipmentDetails', name: i18n.t('static.dashboard.shipmentdetails'), component: ShipmentList, exact: true },
  { path: '/report/warehouseCapacity', name: i18n.t('static.report.warehouseCapacity'), component: WarehouseCapacity },
  { path: '/report/stockStatusAccrossPlanningUnitGlobalView', name: i18n.t('static.report.stockStatusAccrossPlanningUnitGlobalView'), component: StockStatusAccrossPlanningUnitGlobalView },
  { path: '/report/stockAdjustment', name: i18n.t('static.report.stockAdjustment'), component: StockAdjustment },
  // { path: '/report/expiredInventory', name: i18n.t('static.dashboard.report') + " / " + i18n.t('static.report.expiredInventory'), component: ExpiredInventory },
  { path: '/report/expiredInventory', name: i18n.t('static.report.expiredInventory'), component: ExpiredInventory },

  { path: '/usagePeriod/listUsagePeriod/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.usagePeriod.usagePeriod') }), component: UsagePeriodList },
  { path: '/usagePeriod/listUsagePeriod', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.usagePeriod.usagePeriod') }), component: UsagePeriodList },

  { path: '/forecastMethod/listForecastMethod/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.forecastMethod.forecastMethod') }), component: ForecastMethodList },
  { path: '/forecastMethod/listForecastMethod', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.forecastMethod.forecastMethod') }), component: ForecastMethodList },

  { path: '/modelingTypeType/listModelingType/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.modelingType.modelingType') }), component: ModelingTypeList },
  { path: '/modelingTypeType/listModelingType', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.modelingType.modelingType') }), component: ModelingTypeList },

  { path: '/equivalancyUnit/listEquivalancyUnit/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.equivalancyUnit.equivalancyUnit') }), component: EquivalancyUnitList },
  { path: '/equivalancyUnit/listEquivalancyUnit', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.equivalancyUnit.equivalancyUnit') }), component: EquivalancyUnitList },

  { path: '/usageTemplate/listUsageTemplate/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.usageTemplate.usageTemplate') }), component: UsageTemplateList },
  { path: '/usageTemplate/listUsageTemplate', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.usageTemplate.usageTemplate') }), component: UsageTemplateList },
  { path: '/dataset/listTree/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.common.listtree') }), component: ListTree },
  { path: '/dataset/listTree', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.common.listtree') }), component: ListTree },
];
export default routes;
