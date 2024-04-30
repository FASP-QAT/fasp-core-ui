import { AppAside, AppFooter, AppHeader, AppSidebar, AppSidebarFooter, AppSidebarForm, AppSidebarHeader, AppSidebarMinimizer, AppSidebarNav } from '@coreui/react';
import CryptoJS from 'crypto-js';
import React, { Component, Suspense } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import IdleTimer from 'react-idle-timer';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Col, Container, Nav, NavItem, NavLink, Row } from 'reactstrap';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import {
  INDEXED_DB_NAME,
  INDEXED_DB_VERSION,
  SECRET_KEY
} from '../../Constants.js';
import ManualTaggingService from '../../api/ManualTaggingService.js';
import UserService from '../../api/UserService';
import imgforcastmoduletab from '../../assets/img/forcastmoduleicon.png';
import imgforcastmoduletabblue from '../../assets/img/forcastmoduleiconBlue.png';
import i18n from '../../i18n';
import AuthenticationService from '../../views/Common/AuthenticationService.js';
import ErrorBoundary from '../../views/Pages/PageError/ErrorBoundary';
/**
 * Imports for all the components
 */
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
const AddOrganisationType = React.lazy(() => import('../../views/OrganisationType/AddOrganisationType'));
const OrganisationTypeList = React.lazy(() => import('../../views/OrganisationType/OrganisationTypeList'));
const EditOrganisationType = React.lazy(() => import('../../views/OrganisationType/EditOrganisationType'));
const ApplicationDashboard = React.lazy(() => import('../../views/ApplicationDashboard/ApplicationDashboard.js'));
const ShipmentLinkingNotifications = React.lazy(() => import('../../views/ManualTagging/ShipmentLinkingNotifications'));
const AddFundingSource = React.lazy(() => import('../../views/FundingSource/AddFundingSourceComponent'));
const ListFundingSource = React.lazy(() => import('../../views/FundingSource/ListFundingSourceComponent'));
const EditFundingSource = React.lazy(() => import('../../views/FundingSource/EditFundingSourceComponent'));
const AddProcurementAgent = React.lazy(() => import('../../views/ProcurementAgent/AddProcurementAgentComponent'));
const ListProcurementAgent = React.lazy(() => import('../../views/ProcurementAgent/ListProcurementAgentComponent'));
const EditProcurementAgent = React.lazy(() => import('../../views/ProcurementAgent/EditProcurementAgentComponent'));
const AddProcurementAgentType = React.lazy(() => import('../../views/ProcurementAgentType/AddProcurementAgentTypeComponent'));
const ListProcurementAgentType = React.lazy(() => import('../../views/ProcurementAgentType/ListProcurementAgentTypeComponent'));
const EditProcurementAgentType = React.lazy(() => import('../../views/ProcurementAgentType/EditProcurementAgentTypeComponent'));
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
const RealmCountry = React.lazy(() => import('../../views/RealmCountry/RealmCountry'));
const AddProgramIntegration = React.lazy(() => import('../../views/Integration/AddProgramIntegration'));
const MapProcurementAgent = React.lazy(() => import('../../views/Program/MapProcurementAgent'));
const ManualJsonTrigger = React.lazy(() => import('../../views/Integration/ManualJsonTrigger'));
const AddCountrySpecificPrice = React.lazy(() => import('../../views/ProgramProduct/AddCountrySpecificPrice'));
const ChangePassword = React.lazy(() => import('../../views/Pages/Login/ChangePasswordComponent'));
const Logout = React.lazy(() => import('../../views/Pages/Login/LogoutComponent'));
const AddRole = React.lazy(() => import('../../views/Role/AddRoleComponent'));
const ListRole = React.lazy(() => import('../../views/Role/ListRoleComponent'));
const EditRole = React.lazy(() => import('../../views/Role/EditRoleComponent'));
const AddUser = React.lazy(() => import('../../views/User/AddUserComponent'));
const ListUser = React.lazy(() => import('../../views/User/ListUserComponent'));
const EditUser = React.lazy(() => import('../../views/User/EditUserComponent'));
const AccessDenied = React.lazy(() => import('../../views/Common/AccessDeniedComponent'));
const AddBudgetComponent = React.lazy(() => import('../../views/Budget/AddBudgetComponent'));
const ListBudgetComponent = React.lazy(() => import('../../views/Budget/ListBudgetComponent'));
const EditBudgetComponent = React.lazy(() => import('../../views/Budget/EditBudgetComponent'));
const AddProgramProduct = React.lazy(() => import('../../views/ProgramProduct/AddProgramProduct'));
const Programs = React.lazy(() => import('../../views/Program/ProgramList'));
const EditProgram = React.lazy(() => import('../../views/Program/EditProgram'));
const ProgramTree = React.lazy(() => import('../../views/Program/ProgramTree'));
const ExportProgram = React.lazy(() => import('../../views/Program/ExportProgram'));
const ImportProgram = React.lazy(() => import('../../views/Program/ImportProgram'));
const ConsumptionDetails = React.lazy(() => import('../../views/Consumption/ConsumptionDetails'));
const AddLanguage = React.lazy(() => import('../../views/Language/AddLanguageComponent'));
const ListLanguage = React.lazy(() => import('../../views/Language/LanguageListComponent'));
const EditLanguage = React.lazy(() => import('../../views/Language/EditLanguageComponent'));
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
const AddRealm = React.lazy(() => import('../../views/Realm/AddRealmComponent'));
const RealmList = React.lazy(() => import('../../views/Realm/ListRealmComponent'));
const EditRealm = React.lazy(() => import('../../views/Realm/EditRealmComponent'));
const SupplyPlan = React.lazy(() => import('../../views/SupplyPlan/SupplyPlanComponent'));
const WhatIfReport = React.lazy(() => import('../../views/WhatIfReport/whatIfReport'));
const ManualTagging = React.lazy(() => import('../../views/ManualTagging/ManualTagging'));
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
const PlanningUnitCountryList = React.lazy(() => import('../../views/RealmCountry/RealmCountryPlanningUnitList'));
const PlanningUnitCapacity = React.lazy(() => import('../../views/PlanningUnitCapacity/PlanningUnitCapacity'));
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
const ConsumptionForecastErrorSupplyPlan = React.lazy(() => import('../../views/Report/ConsumptionForecastErrorSupplyPlan'));
const pipeline = React.lazy(() => import('../../views/Pipeline/PipelineProgramImport'));
const pipelineProgramSetup = React.lazy(() => import('../../views/Pipeline/PipelineProgramSetup'));
const StockStatusOverTime = React.lazy(() => import('../../views/Report/StockStatusOverTime'));
const SupplyPlanFormulas = React.lazy(() => import('../../views/SupplyPlan/SupplyPlanFormulas'));
const ForecastMetrics = React.lazy(() => import('../../views/Report/ForecastMetrics'));
const ProblemList = React.lazy(() => import('../../views/Report/ProblemList'));
const ProcurementAgentExport = React.lazy(() => import('../../views/Report/ProcurementAgentExport'));
const SupplierLeadTimes = React.lazy(() => import('../../views/Report/SupplierLeadTimes'));
const ShipmentGlobalDemandView = React.lazy(() => import('../../views/Report/ShipmentGlobalDemandView'));
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
const AddIntegration = React.lazy(() => import('../../views/Integration/AddIntegrationComponent'));
const IntegrationList = React.lazy(() => import('../../views/Integration/IntegrationListComponent'));
const EditIntegration = React.lazy(() => import('../../views/Integration/EditIntegrationComponent'));
const UsagePeriodList = React.lazy(() => import('../../views/UsagePeriod/UsagePeriodList'));
const ForecastMethodList = React.lazy(() => import('../../views/ForecastMethod/ForecastMethodList'));
const EquivalancyUnitList = React.lazy(() => import('../../views/EquivalancyUnit/EquivalancyUnitList'));
const UsageTemplateList = React.lazy(() => import('../../views/UsageTemplate/UsageTemplateList'));
const ExtrapolateData = React.lazy(() => import('../../views/Extrapolation/ExtrapolateDataComponent.js'));
const ListTree = React.lazy(() => import('../../views/DataSet/ListTreeComponent'));
const ModelingValidation = React.lazy(() => import('../../views/Validations/ModelingValidations'))
const CompareVersion = React.lazy(() => import('../../views/CompareVersion/CompareVersion'))
const ProductValidation = React.lazy(() => import('../../views/Validations/ProductValidations'))
const CompareAndSelectScenario = React.lazy(() => import('../../views/CompareAndSelect/CompareAndSelectScenario'))
const ConsumptionDataEntryAndAdjustment = React.lazy(() => import('../../views/ConsumptionDataEntryandAdjustment/ConsumptionDataEntryAndAdjustment.js'))
const BuildTree = React.lazy(() => import('../../views/DataSet/BuildTreeComponent'));
const ListTreeTemplate = React.lazy(() => import('../../views/DataSet/ListTreeTemplateComponent'));
const CommitTree = React.lazy(() => import('../../views/DataSet/CommitTreeComponent.js'));
const CreateTreeTemplate = React.lazy(() => import('../../views/DataSet/CreateTreeTemplateComponent'));
const LoadDeleteDataSet = React.lazy(() => import('../../views/DataSet/LoadDeleteDataSet'));
const ExportDataset = React.lazy(() => import('../../views/DataSet/ExportDataset'));
const ImportDataset = React.lazy(() => import('../../views/DataSet/ImportDataset'));
const VersionSettingsComponent = React.lazy(() => import('../../views/DataSet/VersionSettingsComponent'));
const AddDataSet = React.lazy(() => import('../../views/DataSet/AddDataSet'));
const DataSetList = React.lazy(() => import('../../views/DataSet/DataSetList'));
const EditDataSet = React.lazy(() => import('../../views/DataSet/EditDataSet'));
const ImportFromQATSupplyPlan = React.lazy(() => import('../../views/Consumption/ImportFromQATSupplyPlan'));
const PlanningUnitSetting = React.lazy(() => import('../../views/PlanningUnitSetting/PlanningUnitSetting'));
const ImportIntoQATSupplyPlan = React.lazy(() => import('../../views/Consumption/ImportIntoQATSupplyPlan'));
const ForecastOutput = React.lazy(() => import('../../views/ForecastingReports/ForecastOutput'));
const ForecastSummary = React.lazy(() => import('../../views/ForecastingReports/ForecastSummary'));
/**
 * Array of all the routes
 */
const routes = [
  { path: '/dataset/versionSettings', name: 'static.UpdateversionSettings.UpdateversionSettings', component: VersionSettingsComponent },
  { path: '/dataset/loadDeleteDataSet', name: 'static.common.loadDeleteLocalVersion', component: LoadDeleteDataSet },
  { path: '/dataset/exportDataset', name: 'static.common.exportDataset', component: ExportDataset },
  { path: '/dataset/importDataset', name: 'static.common.importDataset', component: ImportDataset },
  { path: '/dataset/loadDeleteDataSet/:message', name: 'static.common.loadDeleteLocalVersion', component: LoadDeleteDataSet },
  { path: '/dataset/listTreeTemplate/:color/:message', name: 'static.dataset.TreeTemplate', component: ListTreeTemplate },
  { path: '/dataset/listTreeTemplate/', exact: true, name: 'static.dataset.TreeTemplate', component: ListTreeTemplate },
  { path: '/validation/modelingValidation', exact: true, name: 'static.dashboard.modelingValidation', component: ModelingValidation },
  { path: '/report/compareVersion', exact: true, name: 'static.dashboard.Versioncomarition', component: CompareVersion },
  { path: '/validation/productValidation', exact: true, name: 'static.dashboard.productValidation', component: ProductValidation },
  { path: '/report/compareAndSelectScenario', exact: true, name: 'static.dashboard.compareAndSelect', component: CompareAndSelectScenario },
  { path: '/report/compareAndSelectScenario/:programId/:planningUnitId/:regionId', exact: true, name: 'static.dashboard.compareAndSelect', component: CompareAndSelectScenario },
  { path: '/dataentry/consumptionDataEntryAndAdjustment', exact: true, name: 'static.dashboard.dataEntryAndAdjustments', component: ConsumptionDataEntryAndAdjustment },
  { path: '/dataentry/consumptionDataEntryAndAdjustment/:color/:message', exact: true, name: 'static.dashboard.dataEntryAndAdjustments', component: ConsumptionDataEntryAndAdjustment },
  { path: '/dataentry/consumptionDataEntryAndAdjustment/:planningUnitId', exact: true, name: 'static.dashboard.dataEntryAndAdjustments', component: ConsumptionDataEntryAndAdjustment },
  { path: '/dataset/createTreeTemplate/:templateId', name: 'Create Tree Template', component: CreateTreeTemplate },
  { path: '/dataSet/buildTree/', exact: true, name: 'static.common.managetree', component: BuildTree },
  { path: '/dataSet/buildTree/tree/:treeId/:programId', exact: true, name: 'static.common.managetree', component: BuildTree },
  { path: '/dataSet/buildTree/treeServer/:treeId/:programId/:isLocal', exact: true, name: 'static.common.managetree', component: BuildTree },
  { path: '/dataSet/buildTree/tree/:treeId/:programId/:scenarioId', name: 'static.common.managetree', component: BuildTree },
  { path: '/dataSet/buildTree/template/:templateId', exact: true, name: 'static.common.managetree', component: BuildTree },
  { path: '/consumptionDetails/:programId/:versionId/:planningUnitId', name: 'static.consumptionDetailHead.consumptionDetail', component: ConsumptionDetails },
  { path: '/shipment/shipmentDetails/:programId/:versionId/:planningUnitId', name: 'static.shipmentDetailHead.shipmentDetail', component: ShipmentList },
  { path: '/report/problemList/:color/:message', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.qatProblem', component: ProblemList },
  { path: '/report/problemList/:programId/:calculate/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.qatProblem', component: ProblemList },
  { path: '/report/problemList/1/:programId/:calculate', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.qatProblem', component: ProblemList },
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
  { path: '/diamension/AddDiamension', name: 'static.breadcrum.add', entityname: 'static.dashboard.dimensionheader', component: AddDimension },
  { path: '/dimension/listDimension', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.dimension', component: DimensionList },
  { path: '/dimension/listDimension/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.dimension', component: DimensionList },
  { path: '/dimension/listDimension/:message', component: DimensionList },
  { path: '/diamension/editDiamension/:dimensionId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.dimensionheader', component: EditDimension },
  { path: '/realm/addrealm', name: 'static.breadcrum.add', entityname: 'static.dashboard.realmheader', component: AddRealm },
  { path: '/realm/listRealm', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.realmheader', component: RealmList },
  { path: '/realm/updateRealm/:realmId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.realmheader', component: EditRealm },
  { path: '/realm/listRealm/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.realmheader', component: RealmList },
  { path: '/program/listProgram', exact: true, name: 'static.breadcrum.list', entityname: 'static.programHead.program', component: Programs },
  { path: '/program/listProgram/:color/:message', name: 'static.breadcrum.list', entityname: 'static.programHead.program', component: Programs },
  { path: '/program/editProgram/:programId', name: 'static.programHead.program', entityname: 'static.programHead.program', component: EditProgram },
  { path: '/programProduct/addProgramProduct', exact: true, name: 'static.Update.PlanningUnits', component: AddProgramProduct },
  { path: '/programProduct/addProgramProduct/:programId/:color/:message', name: 'static.Update.PlanningUnits', component: AddProgramProduct },
  { path: '/procurementAgent/addProcurementAgentPlanningUnit/:procurementAgentId', name: 'static.breadcrum.add', entityname: 'static.dashboard.procurementAgentPlanningUnit', component: AddProcurementAgentPlanningUnit },
  { path: '/procurementAgent/addProcurementAgentProcurementUnit/:procurementAgentId', name: 'static.breadcrum.add', entityname: 'static.dashboard.procurementAgentProcurementUnit', component: AddProcurementAgentProcurementUnit },
  { path: '/budget/addBudget', name: 'static.breadcrum.add', entityname: 'static.dashboard.budget', component: AddBudgetComponent },
  { path: '/budget/listBudget', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.budget', component: ListBudgetComponent },
  { path: '/budget/listBudget/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.budget', component: ListBudgetComponent },
  { path: '/budget/editBudget/:budgetId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.budget', component: EditBudgetComponent },
  { path: '/healthArea/addHealthArea', name: 'static.breadcrum.add', entityname: 'static.dashboard.healthareaheader', component: AddHealthArea },
  { path: '/healthArea/listHealthArea/:color/:message', name: 'static.breadcrum.list', entityname: 'static.healtharea.healtharea', component: HealthAreaList },
  { path: '/healthArea/listHealthArea', exact: true, name: 'static.breadcrum.list', entityname: 'static.healtharea.healtharea', component: HealthAreaList },
  { path: '/healthArea/editHealthArea/:healthAreaId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.healthareaheader', component: EditHealthArea },
  { path: '/organisation/addOrganisation', name: 'static.breadcrum.add', entityname: 'static.organisationHead.organisation', component: AddOrganisation },
  { path: '/organisation/listOrganisation/:color/:message', name: 'static.breadcrum.list', entityname: 'static.organisationHead.organisation', component: OrganisationList },
  { path: '/organisation/listOrganisation', exact: true, name: 'static.breadcrum.list', entityname: 'static.organisationHead.organisation', component: OrganisationList },
  { path: '/organisation/editOrganisation/:organisationId', name: 'static.breadcrum.edit', entityname: 'static.organisationHead.organisation', component: EditOrganisation },
  { path: '/organisationType/addOrganisationType', name: 'static.breadcrum.add', entityname: 'static.organisationType.organisationType', component: AddOrganisationType },
  { path: '/organisationType/listOrganisationType/:color/:message', name: 'static.breadcrum.list', entityname: 'static.organisationType.organisationType', component: OrganisationTypeList },
  { path: '/organisationType/listOrganisationType', exact: true, name: 'static.breadcrum.list', entityname: 'static.organisationType.organisationType', component: OrganisationTypeList },
  { path: '/organisationType/editOrganisationType/:organisationTypeId', name: 'static.breadcrum.edit', entityname: 'static.organisationType.organisationType', component: EditOrganisationType },
  { path: '/fundingSource/addFundingSource', name: 'static.breadcrum.add', entityname: 'static.fundingSourceHead.fundingSource', component: AddFundingSource },
  { path: '/fundingSource/listFundingSource', exact: true, name: 'static.breadcrum.list', entityname: 'static.fundingSourceHead.fundingSource', component: ListFundingSource },
  { path: '/fundingSource/editFundingSource/:fundingSourceId', name: 'static.breadcrum.edit', entityname: 'static.fundingSourceHead.fundingSource', component: EditFundingSource },
  { path: '/fundingSource/listFundingSource/:color/:message', name: 'static.breadcrum.list', entityname: 'static.fundingSourceHead.fundingSource', component: ListFundingSource },
  { path: '/ApplicationDashboard/:id', exact: true, name: 'static.dashboard.applicationdashboard', component: ApplicationDashboard },
  { path: '/ApplicationDashboard/:id/:color/:message', exact: true, name: 'static.dashboard.applicationdashboard', component: ApplicationDashboard },
  { path: '/ApplicationDashboard', exact: true, name: 'static.dashboard.applicationdashboard', component: ApplicationDashboard },
  { path: '/ApplicationDashboard/:color/:message', exact: true, name: 'static.dashboard.applicationdashboard', component: ApplicationDashboard },
  { path: '/shipmentLinkingNotification', exact: true, name: 'static.mt.shipmentLinkingNotification', component: ShipmentLinkingNotifications },
  { path: '/procurementAgent/addProcurementAgent', name: 'static.breadcrum.add', entityname: 'static.dashboard.procurementagentheader', component: AddProcurementAgent },
  { path: '/procurementAgent/listProcurementAgent', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.procurementagent', component: ListProcurementAgent },
  { path: '/procurementAgent/listProcurementAgent/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.procurementagent', component: ListProcurementAgent },
  { path: '/procurementAgent/editProcurementAgent/:procurementAgentId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.procurementagentheader', component: EditProcurementAgent },
  { path: '/procurementAgentType/addProcurementAgentType', name: 'static.breadcrum.add', entityname: 'static.dashboard.procurementagenttypeheader', component: AddProcurementAgentType },
  { path: '/procurementAgentType/listProcurementAgentType', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.procurementagenttype', component: ListProcurementAgentType },
  { path: '/procurementAgentType/listProcurementAgentType/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.procurementagenttype', component: ListProcurementAgentType },
  { path: '/procurementAgentType/editProcurementAgentType/:procurementAgentTypeId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.procurementagenttypeheader', component: EditProcurementAgentType },
  { path: '/tracerCategory/addTracerCategory', name: 'static.breadcrum.add', entityname: 'static.tracerCategoryHead.tracerCategory', component: AddTracerCategory },
  { path: '/tracerCategory/listTracerCategory', exact: true, name: 'static.breadcrum.list', entityname: 'static.tracerCategoryHead.tracerCategory', component: ListTracerCategory },
  { path: '/tracerCategory/listTracerCategory/:color/:message', name: 'static.breadcrum.list', entityname: 'static.tracerCategoryHead.tracerCategory', component: ListTracerCategory },
  { path: '/tracerCategory/editTracerCategory/:tracerCategoryId', name: 'static.breadcrum.edit', entityname: 'static.tracerCategoryHead.tracerCategory', component: EditTracerCategory },
  { path: '/supplier/addSupplier', name: 'static.breadcrum.add', entityname: 'static.dashboard.supplierheader', component: AddSupplier },
  { path: '/supplier/listSupplier', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.supplier', component: ListSupplier },
  { path: '/supplier/editSupplier/:supplierId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.supplierheader', component: EditSupplier },
  { path: '/supplier/listSupplier/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.supplier', component: ListSupplier },
  { path: '/region/addRegion', name: 'static.breadcrum.add', entityname: 'static.regionHead.region', component: AddRegion },
  { path: '/region/listRegion', exact: true, name: 'static.regionHead.region', component: ListRegion },
  { path: '/region/editRegion/:regionId', name: 'static.regionHead.region', entityname: 'static.dashboard.region', component: EditRegion },
  { path: '/region/listRegion/:message', component: ListRegion },
  { path: '/realmCountry/listRealmCountry/:color/:message', name: 'static.dashboard.realmcountry', component: ListRealmCountry },
  { path: '/realmCountry/listRealmCountry', exact: true, name: 'static.dashboard.realmcountry', component: ListRealmCountry },
  { path: '/realmCountry/realmCountry/:realmId', exact: true, name: 'static.dashboard.realmcountry', component: RealmCountry },
  { path: '/program/addIntegration/:programId', exact: true, name: 'static.integration.programIntegration', component: AddProgramIntegration },
  { path: '/program/addManualIntegration', exact: true, name: 'static.integration.manualProgramIntegration', component: ManualJsonTrigger },
  { path: '/programProduct/addCountrySpecificPrice/:programPlanningUnitId/:programId', exact: true, name: 'static.countrySpecificPrices.countrySpecificPrices', component: AddCountrySpecificPrice },
  { path: '/program/mapProcurementAgent/:programId', exact: true, name: 'static.integration.programIntegration', component: MapProcurementAgent },
  { path: '/changePassword', exact: true, name: 'static.dashboard.changepassword', component: ChangePassword },
  { path: '/logout', exact: true, component: Logout },
  { path: '/logout/:message', exact: true, component: Logout },
  { path: '/role/listRole/:color/:message', name: 'static.breadcrum.list', entityname: 'static.roleHead.role', component: ListRole },
  { path: '/role/listRole', exact: true, name: 'static.breadcrum.list', entityname: 'static.roleHead.role', component: ListRole },
  { path: '/role/addRole', exact: true, name: 'static.breadcrum.add', entityname: 'static.roleHead.role', component: AddRole },
  { path: '/role/editRole/:roleId', exact: true, name: 'static.breadcrum.edit', entityname: 'static.roleHead.role', component: EditRole },
  { path: '/user/listUser/:color/:message', name: 'static.breadcrum.list', entityname: 'static.userHead.user', component: ListUser },
  { path: '/user/listUser', exact: true, name: 'static.breadcrum.list', entityname: 'static.userHead.user', component: ListUser },
  { path: '/user/addUser', exact: true, name: 'static.breadcrum.add', entityname: 'static.userHead.user', component: AddUser },
  { path: '/user/editUser/:userId', exact: true, name: 'static.breadcrum.edit', entityname: 'static.userHead.user', component: EditUser },
  { path: '/accessDenied', exact: true, component: AccessDenied },
  { path: '/program/downloadProgram', name: 'static.loadDeleteProgram.loadDeleteProgram', component: ProgramTree },
  { path: '/program/syncPage', name: "static.dashboard.commitVersion", component: syncPage },
  { path: '/program/downloadProgram/:message', component: ProgramTree },
  { path: '/program/exportProgram', name: 'static.dashboard.exportprogram', component: ExportProgram },
  { path: '/program/importProgram', name: 'static.dashboard.importprogram', component: ImportProgram },
  { path: '/consumptionDetails', exact: true, name: 'static.consumptionDetailHead.consumptionDetail', component: ConsumptionDetails },
  { path: '/language/addLanguage', name: 'static.breadcrum.add', entityname: 'static.dashboard.languageheader', component: AddLanguage },
  { path: '/language/listLanguage', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.language', component: ListLanguage },
  { path: '/language/listLanguage/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.language', component: ListLanguage },
  { path: '/language/editLanguage/:languageId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.languageheader', component: EditLanguage },
  { path: '/unit/addUnit', name: 'static.breadcrum.add', entityname: 'static.dashboard.unit', component: AddUnit },
  { path: '/unit/listUnit', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.unit', component: ListUnit },
  { path: '/unit/listUnit/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.unit', component: ListUnit },
  { path: '/unit/editUnit/:unitId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.unit', component: EditUnit },
  { path: '/country/addCountry', name: 'static.breadcrum.add', entityname: 'static.dashboard.country', component: AddCountry },
  { path: '/country/listCountry', exact: true, name: 'static.dashboard.country', component: ListCountry },
  { path: '/country/listCountry/:color/:message', name: 'static.dashboard.country', component: ListCountry },
  { path: '/country/editCountry/:countryId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.country', component: EditCountry },
  { path: '/dataSourceType/addDataSourceType', name: 'static.breadcrum.add', entityname: 'static.dataSourceTypeHead.dataSourceType', component: AddDataSourceType },
  { path: '/dataSourceType/listDataSourceType', exact: true, name: 'static.breadcrum.list', entityname: 'static.dataSourceTypeHead.dataSourceType', component: ListDataSourceType },
  { path: '/dataSourceType/listDataSourceType/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dataSourceTypeHead.dataSourceType', component: ListDataSourceType },
  { path: '/dataSourceType/editDataSourceType/:dataSourceTypeId', name: 'static.breadcrum.edit', entityname: 'static.dataSourceTypeHead.dataSourceType', component: EditDataSourceType },
  { path: '/dataSource/addDataSource', name: 'static.breadcrum.add', entityname: 'static.dashboard.datasourcehaeder', component: AddDataSource },
  { path: '/dataSource/listDataSource', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.datasource', component: ListDataSource },
  { path: '/dataSource/listDataSource/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.datasource', component: ListDataSource },
  { path: '/dataSource/editDataSource/:dataSourceId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.datasourcehaeder', component: EditDataSource },
  { path: '/currency/addCurrency', name: 'static.breadcrum.add', entityname: 'static.dashboard.currency', component: AddCurrency },
  { path: '/currency/listCurrency', exact: true, name: 'static.dashboard.currency', component: ListCurrency },
  { path: '/currency/listCurrency/:color/:message', name: 'static.dashboard.currency', component: ListCurrency },
  { path: '/currency/editCurrency/:currencyId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.currency', component: EditCurrency },
  { path: '/translations/databaseTranslations', name: 'static.label.databaseTranslations', component: DatabaseTranslation },
  { path: '/translations/labelTranslations', name: 'static.label.labelTranslations', component: LabelTranslation },
  { path: '/supplyPlan', exact: true, name: 'static.dashboard.supplyPlan', component: SupplyPlan },
  { path: '/supplyPlan/:programId/:versionId/:planningUnitId', exact: true, name: 'static.dashboard.supplyPlan', component: SupplyPlan },
  { path: '/supplyPlan/:programId/:planningUnitId/:batchNo/:expiryDate', exact: true, name: 'static.dashboard.supplyPlan', component: SupplyPlan },
  { path: '/report/whatIf', name: 'static.dashboard.whatIf', component: WhatIfReport },
  { path: '/shipment/manualTagging', name: 'static.dashboard.manualTagging', exact: true, component: ManualTagging },
  { path: '/shipment/manualTagging/:tab', name: 'static.dashboard.manualTagging', component: ManualTagging },
  { path: '/supplyPlanFormulas', name: 'static.supplyplan.supplyplanformula', component: SupplyPlanFormulas },
  { path: '/forecastingUnit/addForecastingUnit', name: 'static.breadcrum.add', entityname: 'static.dashboard.forecastingunit', component: AddForecastingUnit },
  { path: '/forecastingUnit/listForecastingUnit', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.forecastingunit', component: ForecastingUnitList },
  { path: '/forecastingUnit/listForecastingUnit/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.forecastingunit', component: ForecastingUnitList },
  { path: '/forecastingUnit/editForecastingUnit/:forecastingUnitId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.forecastingunit', component: EditForecastingUnit },
  { path: '/planningUnit/addPlanningUnit', name: 'static.breadcrum.add', entityname: 'static.dashboard.planningunitheader', component: AddPlanningUnit },
  { path: '/planningUnit/listPlanningUnit', exact: true, name: 'static.breadcrum.list', entityname: 'static.dashboard.planningunit', component: PlanningUnitList },
  { path: '/planningUnit/listPlanningUnit/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dashboard.planningunit', component: PlanningUnitList },
  { path: '/procurementUnit/addProcurementUnit', name: 'static.breadcrum.add', entityname: 'static.dashboard.procurementUnitheader', component: AddProcurementUnit },
  { path: '/procurementUnit/listProcurementUnit', exact: true, name: 'static.breadcrum.list', entityname: 'static.procurementUnit.procurementUnit', component: ListProcurementUnit },
  { path: '/procurementUnit/listProcurementUnit/:color/:message', name: 'static.breadcrum.list', entityname: 'static.procurementUnit.procurementUnit', component: ListProcurementUnit },
  { path: '/procurementUnit/editProcurementUnit', exact: true, name: 'static.breadcrum.edit', entityname: 'static.dashboard.procurementUnitheader', component: EditProcurementUnit },
  { path: '/procurementUnit/editProcurementUnit/:procurementUnitId', name: 'static.breadcrum.edit', entityname: 'static.dashboard.procurementUnitheader', component: EditProcurementUnit },
  { path: '/planningUnit/editPlanningUnit/:planningUnitId', exact: true, name: 'static.breadcrum.edit', entityname: 'static.dashboard.planningunitheader', component: EditPlanningUnit },
  { path: '/realmCountry/listRealmCountryPlanningUnit', exact: true, name: 'static.dashboad.planningunitcountry', component: PlanningUnitCountryList },
  { path: '/realmCountry/listRealmCountryPlanningUnit/:color/:message', name: 'static.dashboad.planningunitcountry', component: PlanningUnitCountryList },
  { path: '/planningUnitCapacity/planningUnitCapacity/:planningUnitId', name: 'static.dashboad.planningunitcapacityheader', component: PlanningUnitCapacity },
  { path: '/planningUnitCapacity/listPlanningUnitCapacity', name: 'static.planningUnitVolumeHead.planningUnitVolume', component: PlanningUnitCapacityList },
  { path: '/realmCountry/realmCountryRegion/:realmCountryId', name: 'static.dashboad.regioncountry', component: RealmCountryRegion },
  { path: '/report/productCatalog', name: 'static.dashboard.productcatalog', component: ProductCatalog },
  { path: '/report/consumption', name: 'static.dashboard.consumption', component: ConsumptionReport },
  { path: '/report/stockStatusMatrix', name: 'static.dashboard.stockstatusmatrix', component: StockStatusMatrixReport },
  { path: '/report/stockStatus', name: 'static.dashboard.stockstatus', component: StockStatusReport },
  { path: '/report/globalConsumption', name: 'static.dashboard.globalconsumption', component: GlobalConsumptionReport },
  { path: '/report/forecastOverTheTime', name: 'static.report.forecasterrorovertime', component: ForecastMetricsOverTime },
  { path: '/report/consumptionForecastErrorSupplyPlan', name: 'static.report.forecasterrorovertime', component: ConsumptionForecastErrorSupplyPlan },
  { path: '/report/stockStatusOverTime', name: 'static.dashboard.stockstatusovertime', component: StockStatusOverTime },
  { path: '/report/forecastMetrics', name: 'static.dashboard.forecastmetrics', component: ForecastMetrics },
  { path: '/report/problemList', name: 'static.dashboard.qatProblemList', component: ProblemList },
  { path: '/report/procurementAgentExport', name: 'static.report.shipmentCostReport', component: ProcurementAgentExport },
  { path: '/report/supplierLeadTimes', name: 'static.dashboard.supplierLeadTimes', component: SupplierLeadTimes },
  { path: '/report/shipmentGlobalDemandView', name: 'static.dashboard.shipmentGlobalDemandViewheader', component: ShipmentGlobalDemandView },
  { path: '/report/shipmentGlobalView', name: 'static.dashboard.shipmentGlobalViewheader', component: ShipmentGlobalView },
  { path: '/report/annualShipmentCost', name: 'static.report.annualshipmentcost', component: AnnualShipmentCost },
  { path: '/report/supplyPlanVersionAndReview', exact: true, name: 'static.report.supplyplanversionandreviewReport', component: SupplyPlanVersionAndReview },
  { path: '/report/editStatus/:programId/:versionId', name: 'static.supplyPlan.updateProgramStatus', component: EditSupplyPlanStatus },
  { path: '/report/supplyPlanVersionAndReview/:color/:message', name: 'static.report.supplyplanversionandreviewReport', component: SupplyPlanVersionAndReview },
  { path: '/report/supplyPlanVersionAndReview/:statusId', name: 'static.report.supplyplanversionandreviewReport', component: SupplyPlanVersionAndReview },
  { path: '/report/shipmentSummery', exact: true, name: 'static.report.shipmentDetailReport', component: ShipmentSummery },
  { path: '/report/shipmentSummery/:message', exact: true, name: 'static.report.shipmentSummeryReport', component: ShipmentSummery },
  { path: '/report/shipmentSummery/:budgetId/:budgetCode', name: 'static.report.shipmentDetailReport', component: ShipmentSummery },
  { path: '/report/stockStatusAcrossPlanningUnits', name: 'static.dashboard.stockstatusacrossplanningunit', component: StockStatusReportAcrossPlanningUnits },
  { path: '/report/budgets', name: 'static.budgetHead.budget', component: Budgets },
  { path: '/userManual/uploadUserManual', exact: true, entityname: 'static.dashboard.uploadUserManual', name: 'static.dashboard.uploadUserManual', component: UploadUserManual },
  { path: '/shipment/shipmentDetails', name: 'static.shipmentDetailHead.shipmentDetail', component: ShipmentList, exact: true },
  { path: '/report/warehouseCapacity', name: 'static.report.warehouseCapacity', component: WarehouseCapacity },
  { path: '/report/stockStatusAccrossPlanningUnitGlobalView', name: 'static.report.stockStatusAccrossPlanningUnitGlobalView', component: StockStatusAccrossPlanningUnitGlobalView },
  { path: '/report/stockAdjustment', name: 'static.report.stockAdjustment', component: StockAdjustment },
  { path: '/report/expiredInventory', name: 'static.report.expiredInventory', component: ExpiredInventory },
  { path: '/quantimed/quantimedImport', name: 'static.quantimed.quantimedImport', component: QuantimedImport },
  { path: '/integration/AddIntegration', name: 'static.breadcrum.add', entityname: 'static.integration.integration', component: AddIntegration },
  { path: '/integration/listIntegration', exact: true, name: 'static.breadcrum.list', entityname: 'static.integration.integration', component: IntegrationList },
  { path: '/integration/listIntegration/:color/:message', name: 'static.breadcrum.list', entityname: 'static.integration.integration', component: IntegrationList },
  { path: '/integration/listIntegration/:message', component: IntegrationList },
  { path: '/integration/editIntegration/:integrationId', name: 'static.breadcrum.edit', entityname: 'static.integration.integration', component: EditIntegration },
  { path: '/forecastMethod/listForecastMethod/:color/:message', name: 'static.breadcrum.list', entityname: 'static.forecastMethod.forecastMethod', component: ForecastMethodList },
  { path: '/forecastMethod/listForecastMethod', exact: true, name: 'static.breadcrum.list', entityname: 'static.forecastMethod.forecastMethod', component: ForecastMethodList },
  { path: '/usagePeriod/listUsagePeriod/:color/:message', name: 'static.breadcrum.list', entityname: 'static.usagePeriod.usagePeriod', component: UsagePeriodList },
  { path: '/usagePeriod/listUsagePeriod', exact: true, name: 'static.breadcrum.list', entityname: 'static.usagePeriod.usagePeriod', component: UsagePeriodList },
  { path: '/equivalancyUnit/listEquivalancyUnit/:color/:message', name: 'static.breadcrum.list', entityname: 'static.equivalancyUnit.equivalancyUnits', component: EquivalancyUnitList },
  { path: '/equivalancyUnit/listEquivalancyUnit', exact: true, name: 'static.breadcrum.list', entityname: 'static.equivalancyUnit.equivalancyUnits', component: EquivalancyUnitList },
  { path: '/usageTemplate/listUsageTemplate/:color/:message', name: 'static.breadcrum.list', entityname: 'static.usageTemplate.usageTemplate', component: UsageTemplateList },
  { path: '/usageTemplate/listUsageTemplate', exact: true, name: 'static.breadcrum.list', entityname: 'static.usageTemplate.usageTemplate', component: UsageTemplateList },
  { path: '/extrapolation/extrapolateData', exact: true, name: 'static.dashboard.extrapolation', component: ExtrapolateData },
  { path: '/extrapolation/extrapolateData/:planningUnitId', exact: true, name: 'static.dashboard.extrapolation', component: ExtrapolateData },
  { path: '/dataset/listTree/:color/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.common.managetree') }), component: ListTree },
  { path: '/dataset/commitTree', exact: true, name: i18n.t('static.breadcrum.list', { entityname: 'static.commitProgram.commitProgram' }), component: CommitTree },
  { path: '/dataset/listTree', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.common.managetree') }), component: ListTree },
  { path: '/dataset/addDataSet', name: 'static.breadcrum.add', entityname: 'static.dataset.manageProgramInfo', component: AddDataSet },
  { path: '/dataset/listDataSet', exact: true, name: 'static.breadcrum.list', entityname: 'static.dataset.manageProgramInfo', component: DataSetList },
  { path: '/dataset/listDataSet/:color/:message', name: 'static.breadcrum.list', entityname: 'static.dataset.manageProgramInfo', component: DataSetList },
  { path: '/dataset/editDataSet/:dataSetId', name: i18n.t('static.dataset.manageProgramInfo'), component: EditDataSet },
  { path: '/importFromQATSupplyPlan/listImportFromQATSupplyPlan/:color/:message', name: i18n.t('static.importFromQATSupplyPlan.importFromQATSupplyPlan'), component: ImportFromQATSupplyPlan },
  { path: '/importFromQATSupplyPlan/listImportFromQATSupplyPlan', exact: true, name: i18n.t('static.importFromQATSupplyPlan.importFromQATSupplyPlan'), component: ImportFromQATSupplyPlan },
  { path: '/importIntoQATSupplyPlan/listImportIntoQATSupplyPlan/:color/:message', name: 'Import Into Supply Plan', component: ImportIntoQATSupplyPlan },
  { path: '/importIntoQATSupplyPlan/listImportIntoQATSupplyPlan', exact: true, name: 'Import Into Supply Plan', component: ImportIntoQATSupplyPlan },
  { path: '/planningUnitSetting/listPlanningUnitSetting/:color/:message', name: 'static.updatePlanningUnit.updatePlanningUnit', component: PlanningUnitSetting },
  { path: '/planningUnitSetting/listPlanningUnitSetting', exact: true, name: 'static.updatePlanningUnit.updatePlanningUnit', component: PlanningUnitSetting },
  { path: '/forecastReport/forecastOutput', exact: true, name: 'static.MonthlyForecast.MonthlyForecast', component: ForecastOutput },
  { path: '/forecastReport/forecastOutput/:programId/:versionId', name: 'static.MonthlyForecast.MonthlyForecast', component: ForecastOutput },
  { path: '/forecastReport/forecastSummary', exact: true, name: 'static.ForecastSummary.ForecastSummary', component: ForecastSummary },
  { path: '/forecastReport/forecastSummary/:programId/:versionId', name: 'static.ForecastSummary.ForecastSummary', component: ForecastSummary },
];
/**
 * This is the default component of the application that consists of default header, footer etc
 */
class DefaultLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      businessFunctions: [],
      name: "",
      notificationCount: 0,
      activeTab: 1,
      timeout: 1000 * 1800 * 1,
      timeout_token: 1000 * 21600 * 1,
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
    this.getDatasetData = this.getDatasetData.bind(this);
    this.getProgramData = this.getProgramData.bind(this);
    this.getNotificationCount = this.getNotificationCount.bind(this);
    this.toggle = this.toggle.bind(this);
    this.refreshPage = this.refreshPage.bind(this);
  }
  /**
   * Refreshes the page by reloading the window.
   */
  refreshPage() {
  }
  /**
   * The checkEvent method is responsible for handling events and triggering the _onAction method based on the event type.
   * It ensures that the _onAction method is only called when the event type is not "mousemove".
   * @param {Event} e The event object containing information about the event.
   */
  checkEvent = (e) => {
    if (e.type != "mousemove") {
      this._onAction(e);
    }
  }
  /**
   * Updates the component state to indicate that the timeout has not occurred.
   * @param {Event} e The event object.
   */
  _onAction(e) {
    this.setState({ isTimedOut: false })
  }
  /**
   * Updates the component state to indicate that the timeout has not occurred.
   * @param {Event} e The event object.
   */
  _onActive(e) {
    this.setState({ isTimedOut: false })
  }
  /**
   * Handles the idle state of the component.
   * If the user is already timed out, redirects to the logout page with a session expired message.
   * Otherwise, sets the showModal state to true, resets the idle timer, and marks the user as timed out.
   * @param {Event} e The event object.
   */
  _onIdle(e) {
    const isTimedOut = this.state.isTimedOut
    if (isTimedOut) {
      localStorage.setItem("sessionTimedOut", 1);
      this.props.history.push('/logout/static.message.sessionExpired')
    } else {
      this.setState({ showModal: true })
      this.idleTimer.reset();
      this.setState({ isTimedOut: true })
    }
  }
  /**
   * Updates the header title and performs necessary actions based on the provided name and URL.
   * If the name is different from the current state, it updates the URL and performs additional checks.
   * @param {String} name The new header title.
   * @param {String} url The URL associated with the title.
   */
  displayHeaderTitle = (name, url) => {
    if (this.state.name !== name) {
      if (AuthenticationService.checkTypeOfSession(url)) {
        this.setState({
          url: ""
        })
      } else {
        localStorage.setItem("sessionChanged", 1)
        this.props.history.push(`/login/static.message.sessionChange`);
      }
      this.getDatasetData();
      this.getProgramData();
      this.getNotificationCount();
      this.setState({
        name
      });
    }
  }
  /**
   * Sets the user's online status to false, redirects to the offline dashboard, and reloads the page.
   * @param {Event} e The event triggering the method.
   */
  goOffline(e) {
    localStorage.setItem("loginOnline", false);
    let id = AuthenticationService.displayDashboardBasedOnRole();
    this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.login.successOffline'))
    window.location.reload();
  }
  /**
   * Logs the user out by redirecting to the login page with a session expired message.
   * @param {Event} e The event triggering the method.
   */
  logout(e){
    this.props.history.push('/login/static.message.sessionExpired')
  }
  /**
   * Prompts the user to confirm switching to online mode. If confirmed, redirects to the login page to log in again.
   * @param {Event} e The event triggering the method.
   */
  goOnline(e) {
    confirmAlert({
      message: i18n.t("static.login.confirmSessionChange"),
      buttons: [
        {
          label: i18n.t("static.login.goToLogin"),
          onClick: () => {
            localStorage.setItem("sessionChanged", 1)
            this.props.history.push("/login/static.login.loginAgain");
          }
        },
        {
          label: i18n.t("static.common.cancel"),
          className: "dangerColor",
          onClick: () => {
          }
        },
      ]
    })
  }
  /**
   * Sets the default module on component mount
   */
  componentDidMount() {
    window.addEventListener('blur', this.handleBlur);
    window.addEventListener('click', this.handleFocus);
    var curUserBusinessFunctions = AuthenticationService.getLoggedInUserRoleBusinessFunction();
    var bfunction = [];
    if (curUserBusinessFunctions != null && curUserBusinessFunctions != "") {
      for (let i = 0; i < curUserBusinessFunctions.length; i++) {
        bfunction.push(curUserBusinessFunctions[i]);
      }
      this.setState({ businessFunctions: bfunction });
    }
    if (localStorage.getItem('curUser') != null && localStorage.getItem('curUser') != '') {
      let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
      let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
      var defaultModuleId = 1;
      if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SUPPLY_PLANNING_MODULE') && AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_FORECASTING_MODULE')) {
        defaultModuleId = decryptedUser.defaultModuleId;
      } else if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SUPPLY_PLANNING_MODULE')) {
        defaultModuleId = 2;
      } else {
        defaultModuleId = 1;
      }
      this.setState({
        activeTab: defaultModuleId,
      },
        () => {
          if (this.state.activeTab == 2) {
          } else {
          }
        })
    } else {
      this.setState({
        activeTab: 2,
      },
        () => {
          if (this.state.activeTab == 2) {
          } else {
          }
        })
    }
  }
  /**
   * Removes event listeners for blur and click events on the window object to handle component unmounting.
   */
  componentWillUnmount() {
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('click', this.handleFocus);
  }
  /**
   * Handles blur events on the window object to determine if the session has expired due to user inactivity.
   * Redirects to the logout page if the session has expired.
   */
  handleBlur = () => {
    var lastFocus = localStorage.getItem("lastFocus") ? localStorage.getItem("lastFocus") : new Date();
    var tokenSetTime = localStorage.getItem("tokenSetTime") ? localStorage.getItem("tokenSetTime") : new Date();
    var temp_time = lastFocus == 0 ? 0 : (new Date().getTime() - new Date(lastFocus).getTime());
    var temp_time_token = tokenSetTime == 0 ? 0 : (new Date().getTime() - new Date(tokenSetTime).getTime());
    if((temp_time > this.state.timeout) || (localStorage.getItem('sessionType') === 'Online' && temp_time_token > this.state.timeout_token)){
      console.log("Test Logout @@@ Logged Out - Token - Start - ", tokenSetTime," End - ", new Date()," - Total Time in ms - ", temp_time_token, " - ", (temp_time > this.state.timeout) ? "false" : "true");
      console.log("Test Logout @@@ Logged Out - Idle - Start - ", lastFocus," End - ", new Date()," - Total Time in ms - ", temp_time, " - ", (temp_time > this.state.timeout) ? "true" : "false");
      this.props.history.push('/logout/static.message.sessionExpired')
    }
  };
  /**
   * Handles focus events on the window object to update the last focus time.
   * Checks if the session has expired due to user inactivity and redirects to the logout page if necessary.
   */
  handleFocus = () => {
    var lastFocus = localStorage.getItem("lastFocus") ? localStorage.getItem("lastFocus") : new Date();
    var tokenSetTime = localStorage.getItem("tokenSetTime") ? localStorage.getItem("tokenSetTime") : new Date();
    var temp_time = lastFocus == 0 ? 0 : (new Date().getTime() - new Date(lastFocus).getTime());
    var temp_time_token = tokenSetTime == 0 ? 0 : (new Date().getTime() - new Date(tokenSetTime).getTime());
    if((temp_time > this.state.timeout) || (localStorage.getItem('sessionType') === 'Online' && temp_time_token > this.state.timeout_token)){
      console.log("Test Logout @@@ Logged Out - Token - Start - ", tokenSetTime," End - ", new Date()," - Total Time in ms - ", temp_time_token, " - ", (temp_time > this.state.timeout) ? "false" : "true");
      console.log("Test Logout @@@ Logged Out - Idle - Start - ", lastFocus," End - ", new Date()," - Total Time in ms - ", temp_time, " - ", (temp_time > this.state.timeout) ? "true" : "false");
      this.props.history.push('/logout/static.message.sessionExpired')
    }
    localStorage.setItem("lastFocus", new Date())
  };
  /**
   * Displays a loading indicator while data is being loaded.
   */
  loading = () => <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>;
  /**
   * Redirects the user to the change password page.
   * @param {Event} e The event object
   */
  changePassword(e) {
    e.preventDefault();
    this.props.history.push(`/changePassword`);
  }
  /**
   * Redirects the user to the master data synchronization page.
   * @param {Event} e The event object
   */
  goToMasterDataSync(e) {
    e.preventDefault();
    this.props.history.push({ pathname: `/syncProgram`, state: { "isFullSync": true } })
  }
  /**
   * Displays a confirmation dialog to sign out the user.
   * @param {Event} e The event object
   */
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
  /**
   * Redirects the user to the program loading page.
   * @param {Event} e The event object
   */
  goToLoadProgram(e) {
    e.preventDefault();
    this.props.history.push(`/program/downloadProgram/`)
  }
  /**
   * Redirects the user to the forecast program loading page.
   * @param {Event} e The event object
   */
  goToLoadProgramFC(e) {
    e.preventDefault();
    this.props.history.push(`/dataset/loadDeleteDataSet`)
  }
  /**
   * Redirects the user to the program commit page, showing a confirmation dialog if offline.
   * @param {Event} e The event object
   */
  goToCommitProgram(e) {
    e.preventDefault();
    if (localStorage.getItem("sessionType") === 'Online') {
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
  /**
   * Redirects the user to the forecast program commit page, showing a confirmation dialog if offline.
   * @param {Event} e The event object
   */
  goToCommitProgramFC(e) {
    e.preventDefault();
    if (localStorage.getItem("sessionType") === 'Online') {
      this.props.history.push(`/dataset/commitTree`)
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
  /**
   * Redirects the user to the shipment linking alerts page.
   * @param {Event} e The event object
   */
  showShipmentLinkingAlerts(e) {
    e.preventDefault();
    this.props.history.push(`/shipmentLinkingNotification`)
  }
  /**
   * Redirects the user to the dashboard based on their role.
   * @param {Event} e The event object
   */
  showDashboard(e) {
    e.preventDefault();
    var id = AuthenticationService.displayDashboardBasedOnRole();
    this.props.history.push(`/ApplicationDashboard/` + `${id}`)
  }
  /**
   * Retrieves and updates the notification count.
   */
  getNotificationCount() {
    if (localStorage.getItem("sessionType") === 'Online') {
      AuthenticationService.setupAxiosInterceptors();
      ManualTaggingService.getNotificationCount()
        .then(response => {
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
  /**
   * Retrieves and updates the program data.
   */
  getProgramData() {
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
      this.setState({
        message: i18n.t('static.program.errortext'),
        color: '#BA0C2F'
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
          color: '#BA0C2F',
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
        if (programModified == 1) {
          localStorage.setItem("sesLocalVersionChange", true);
          this.setState({ changeIcon: true });
        } else {
          localStorage.setItem("sesLocalVersionChange", false);
          this.setState({ changeIcon: false });
        }
      }.bind(this);
    }.bind(this)
  }
  /**
   * Retrieves and updates the forecast program data.
   */
  getDatasetData() {
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
      this.setState({
        message: i18n.t('static.program.errortext'),
        color: '#BA0C2F'
      })
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['datasetDetails'], 'readwrite');
      var program = transaction.objectStore('datasetDetails');
      var getRequest = program.getAll();
      getRequest.onerror = function (event) {
        this.setState({
          message: i18n.t('static.program.errortext'),
          color: '#BA0C2F',
          loading: false
        })
      }.bind(this);
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        var programDatasetChanged = 0;
        for (var i = 0; i < myResult.length; i++) {
          if (myResult[i].userId == userId) {
            if (myResult[i].changed == 1) {
              programDatasetChanged = 1;
              break;
            }
          }
        }
        this.setState({
          programDatasetChanged: programDatasetChanged
        })
        if (programDatasetChanged == 1) {
          localStorage.setItem("sesLocalVersionChange", true);
          this.setState({ fuChangeIcon: true });
        } else {
          localStorage.setItem("sesLocalVersionChange", false);
          this.setState({ fuChangeIcon: false });
        }
      }.bind(this);
    }.bind(this)
  }
  /**
   * Toggles between different tabs and updates the active tab state.
   * @param {String} tabPane The tab pane to toggle.
   * @param {String} tab The tab to set as active.
   */
  toggle(tabPane, tab) {
    if (localStorage.getItem("sessionType") === 'Online') {
      UserService.updateUserModule(tab).then(response => {
        if (response.status == 200) {
        } else {
        }
      })
    }
    let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
    let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
    decryptedUser.defaultModuleId = tab;
    localStorage.setItem('user-' + decryptedCurUser, CryptoJS.AES.encrypt(JSON.stringify(decryptedUser), `${SECRET_KEY}`));
    let decryptedUser1 = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
    this.setState({
      activeTab: decryptedUser1.defaultModuleId,
    });
  }
  /**
   * Renders the DefaultLayout component.
   * @returns {JSX.Element} The rendered JSX element.
   */
  render() {
    let events = ["keydown", "mousedown"];
    const checkOnline = localStorage.getItem('sessionType');
    return (
      <ErrorBoundary>
      <div className="app">
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
                <AppHeader fixed >
          <Suspense fallback={this.loading()}>
            <DefaultHeader onLogout={e => this.signOut(e)} onChangePassword={e => this.changePassword(e)} onChangeDashboard={e => this.showDashboard(e)} shipmentLinkingAlerts={e => this.showShipmentLinkingAlerts(e)} latestProgram={e => this.goToLoadProgram(e)} latestProgramFC={e => this.goToLoadProgramFC(e)} title={this.state.name} notificationCount={this.state.notificationCount} changeIcon={this.state.changeIcon} fuChangeIcon={this.state.fuChangeIcon} commitProgram={e => this.goToCommitProgram(e)} commitProgramFC={e => this.goToCommitProgramFC(e)} goOffline={e => this.goOffline(e)} goOnline={e => this.goOnline(e)} logout={e => this.logout(e)} activeModule={this.state.activeTab == 1 ? 1 : 2} />
          </Suspense>
        </AppHeader>
        <div className="app-body">
          <AppSidebar fixed display="lg" className={this.state.activeTab == 2 ? "module1" : "module2"}>
            <AppSidebarHeader />
            <AppSidebarForm />
            <Suspense>
              {checkOnline === 'Online' &&
                <AppSidebarNav navConfig={{
                  items:
                    [
                      {
                        name: i18n.t('static.dashboard.datasync'),
                        icon: 'fa fa-refresh',
                        url: '/syncProgram',
                      },
                      {
                        name: i18n.t('static.translations.translations'),
                        icon: 'fa fa-list',
                        attributes: { hidden: ((this.state.businessFunctions.includes('ROLE_BF_LABEL_TRANSLATIONS')) || (this.state.businessFunctions.includes('ROLE_BUSINESS_FUNCTION_EDIT_APPLICATION_LABELS')) || (this.state.businessFunctions.includes('ROLE_BUSINESS_FUNCTION_EDIT_REALM_LABELS')) || (this.state.businessFunctions.includes('ROLE_BUSINESS_FUNCTION_EDIT_PROGRAM_LABELS')) ? false : true) },
                        children: [
                          {
                            name: i18n.t('static.label.labelTranslations'),
                            url: '/translations/labelTranslations',
                            icon: 'fa fa-exchange',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LABEL_TRANSLATIONS') ? false : true),
                              onClick: e => {
                                this.refreshPage('/translations/labelTranslations');
                              }
                            }
                          },
                          {
                            name: i18n.t('static.label.databaseTranslations'),
                            url: '/translations/databaseTranslations',
                            icon: 'fa fa-exchange',
                            attributes: { hidden: ((this.state.businessFunctions.includes('ROLE_BUSINESS_FUNCTION_EDIT_APPLICATION_LABELS') || this.state.businessFunctions.includes('ROLE_BUSINESS_FUNCTION_EDIT_REALM_LABELS') || this.state.businessFunctions.includes('ROLE_BUSINESS_FUNCTION_EDIT_PROGRAM_LABELS')) ? false : true) }
                          }
                        ]
                      },
                      {
                        name: i18n.t('static.dashboard.applicationmaster'),
                        icon: 'fa fa-list',
                        attributes: {
                          hidden: ((((this.state.businessFunctions.includes('ROLE_BF_UPLOAD_USER_MANUAL')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_COUNTRY')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_CURRENCY'))
                            || (this.state.businessFunctions.includes('ROLE_BF_LIST_DIMENSION')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_LANGUAGE')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_ROLE')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_REALM'))
                            || (this.state.businessFunctions.includes('ROLE_BF_LIST_USER')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_USAGE_PERIOD')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_UNIT')))) ? false : true)
                        },
                        children: [
                          {
                            name: i18n.t('static.dashboard.uploadUserManual'),
                            url: '/userManual/uploadUserManual',
                            icon: 'fa fa-upload',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_UPLOAD_USER_MANUAL') ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.country'),
                            url: '/country/listCountry',
                            icon: 'fa fa-globe',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_COUNTRY') ? false : true),
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.currency'),
                            url: '/currency/listCurrency',
                            icon: 'fa fa-money',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_CURRENCY') ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.dimension'),
                            url: '/dimension/listDimension',
                            icon: 'fa fa-map',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_DIMENSION') ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.language'),
                            url: '/language/listLanguage',
                            icon: 'fa fa-language',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_LANGUAGE') ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.roleHead.role'),
                            url: '/role/listRole',
                            icon: 'fa fa-dot-circle-o',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_ROLE') ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.realmheader'),
                            url: '/realm/listRealm',
                            icon: 'fa fa-th-large',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_REALM') ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.userHead.user'),
                            url: '/user/listUser',
                            icon: 'fa fa-users',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_USER') ? false : true),
                              onClick: e => {
                              }
                            }
                          },
                          {
                            name: i18n.t('static.usagePeriod.usagePeriod'),
                            url: '/usagePeriod/listUsagePeriod',
                            icon: 'fa fa-calendar',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_USAGE_PERIOD') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          , {
                            name: i18n.t('static.dashboard.unit'),
                            url: '/unit/listUnit',
                            icon: 'fa fa-th',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_UNIT') ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          }
                          ,
                        ]
                      },
                      {
                        name: i18n.t('static.dashboard.realmlevelmaster'),
                        icon: 'fa fa-list',
                        attributes: {
                          hidden: ((((this.state.businessFunctions.includes('ROLE_BF_LIST_REALM_COUNTRY')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_DATA_SOURCE')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_DATA_SOURCE_TYPE'))
                            || (this.state.businessFunctions.includes('ROLE_BF_LIST_FUNDING_SOURCE')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_SUPPLIER')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_ORGANIZATION')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_ORGANIZATION_TYPE'))
                            || (this.state.businessFunctions.includes('ROLE_BF_LIST_PROCUREMENT_AGENT')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_FORECASTING_UNIT')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_PLANNING_UNIT'))
                            || (this.state.businessFunctions.includes('ROLE_BF_LIST_PRODUCT_CATEGORY')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_PLANNING_UNIT_CAPACITY')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_PROCUREMENT_UNIT'))
                            || (this.state.businessFunctions.includes('ROLE_BF_LIST_TRACER_CATEGORY')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_EQUIVALENCY_UNIT_MAPPING')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_HEALTH_AREA')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_FORECAST_METHOD')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_INTEGRATION')))) ? false : true)
                        },
                        children: [
                          {
                            name: i18n.t('static.dashboard.realmcountry'),
                            url: '/realmCountry/listRealmCountry',
                            icon: 'fa fa-globe',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_REALM_COUNTRY') ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.datasource'),
                            url: '/dataSource/listDataSource',
                            icon: 'fa fa-database',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_DATA_SOURCE') && this.state.activeTab == 2 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dataSourceTypeHead.dataSourceType'),
                            url: '/dataSourceType/listDataSourceType',
                            icon: 'fa fa-table',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_DATA_SOURCE_TYPE') && this.state.activeTab == 2 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.fundingSourceHead.fundingSource'),
                            icon: 'fa fa-bank',
                            url: '/fundingSource/listFundingSource',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_FUNDING_SOURCE') && this.state.activeTab == 2 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.supplier'),
                            url: '/supplier/listSupplier',
                            icon: 'fa fa-industry',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_SUPPLIER') && this.state.activeTab == 2 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.organisationHead.organisation'),
                            url: '/organisation/listOrganisation',
                            icon: 'fa fa-sitemap',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_ORGANIZATION') ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.organisationType.organisationType'),
                            url: '/organisationType/listOrganisationType',
                            icon: 'fa fa-object-group',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_ORGANIZATION_TYPE') ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.procurementagentType'),
                            url: '/procurementAgentType/listProcurementAgentType',
                            icon: 'fa fa-user-circle-o',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_PROCUREMENT_AGENT') && this.state.activeTab == 2 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.procurementagent'),
                            url: '/procurementAgent/listProcurementAgent',
                            icon: 'fa fa-user-circle-o',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_PROCUREMENT_AGENT') && this.state.activeTab == 2 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.Productmenu'),
                            icon: 'fa fa-cubes',
                            attributes: {
                              hidden: ((((this.state.businessFunctions.includes('ROLE_BF_LIST_FORECASTING_UNIT')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_PLANNING_UNIT')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_PRODUCT_CATEGORY'))
                                || (this.state.businessFunctions.includes('ROLE_BF_LIST_PLANNING_UNIT_CAPACITY')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_PROCUREMENT_UNIT')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_TRACER_CATEGORY')))) ? false : true)
                            },
                            children: [
                              {
                                name: i18n.t('static.dashboard.forecastingunit'),
                                url: '/forecastingUnit/listforecastingUnit',
                                icon: 'fa fa-cube',
                                attributes: {
                                  hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_FORECASTING_UNIT') ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              }, {
                                name: i18n.t('static.dashboard.planningunit'),
                                url: '/planningUnit/listPlanningUnit',
                                icon: 'fa fa-cubes',
                                attributes: {
                                  hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_PLANNING_UNIT') ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.product.productcategory'),
                                url: '/productCategory/productCategoryTree',
                                icon: 'fa fa-th',
                                attributes: {
                                  hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_PRODUCT_CATEGORY') ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.planningUnitVolumeHead.planningUnitVolume'),
                                url: '/planningUnitCapacity/listPlanningUnitcapacity',
                                icon: 'fa fa-tasks',
                                attributes: {
                                  hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_PLANNING_UNIT_CAPACITY') ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.procurementUnit.procurementUnit'),
                                url: '/procurementUnit/listProcurementUnit',
                                icon: 'fa fa-building',
                                attributes: {
                                  hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_PROCUREMENT_UNIT') && this.state.activeTab == 2 ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.tracerCategoryHead.tracerCategory'),
                                url: '/tracerCategory/listTracerCategory',
                                icon: 'fa fa-th',
                                attributes: {
                                  hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_TRACER_CATEGORY') ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                            ]
                          },
                          {
                            name: i18n.t('static.equivalancyUnit.equivalancyUnits'),
                            url: '/equivalancyUnit/listEquivalancyUnit',
                            icon: 'fa fa-exchange',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_EQUIVALENCY_UNIT_MAPPING') ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.healtharea.healtharea'),
                            url: '/healthArea/listHealthArea',
                            icon: 'fa fa-medkit',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_HEALTH_AREA') ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.forecastMethod.forecastMethod'),
                            url: '/forecastMethod/listForecastMethod',
                            icon: 'fa fa-bar-chart',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_FORECAST_METHOD') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.integration.integration'),
                            url: '/integration/listIntegration',
                            icon: 'fa fa-cogs',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_INTEGRATION') && this.state.activeTab == 2 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.integration.manualProgramIntegration'),
                            url: '/program/addManualIntegration',
                            icon: 'fa fa-share-alt',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_MANUAL_INTEGRATION') && this.state.activeTab == 2 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                        ]
                      },
                      {
                        name: i18n.t('static.common.datasetmanagement'),
                        icon: 'fa fa-list',
                        attributes: {
                          hidden: ((((this.state.businessFunctions.includes('ROLE_BF_LIST_DATASET')) || (this.state.businessFunctions.includes('ROLE_BF_VERSION_SETTINGS')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_PLANNING_UNIT_SETTING')) || (this.state.businessFunctions.includes('ROLE_BF_IMPORT_DATASET')) || (this.state.businessFunctions.includes('ROLE_BF_EXPORT_DATASET')) || (this.state.businessFunctions.includes('ROLE_BF_LOAD_DELETE_DATASET')) || (this.state.businessFunctions.includes('ROLE_BF_COMMIT_DATASET'))) && this.state.activeTab == 1) ? false : true)
                        },
                        children: [
                          {
                            name: i18n.t('static.dataset.manageProgramInfo'),
                            url: '/dataSet/listDataSet',
                            icon: 'fa fa-cog',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_DATASET') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.UpdateversionSettings.UpdateversionSettings'),
                            url: '/dataset/versionSettings',
                            icon: 'fa fa-sliders',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_VERSION_SETTINGS') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.updatePlanningUnit.updatePlanningUnit'),
                            url: '/planningUnitSetting/listPlanningUnitSetting',
                            icon: 'fa fa-cubes',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_PLANNING_UNIT_SETTING') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.loadDeleteProgram.loadDeleteProgram'),
                            url: '/dataset/loadDeleteDataSet',
                            icon: 'cui-cloud-download FontBoldIcon',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LOAD_DELETE_DATASET') && this.state.activeTab == 1 ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.importprogram'),
                            url: '/dataset/importDataset',
                            icon: 'fa fa-download',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_IMPORT_DATASET') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.exportprogram'),
                            url: '/dataset/exportDataset',
                            icon: 'fa fa-upload',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_EXPORT_DATASET') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.commitProgram.commitProgram'),
                            url: '/dataset/commitTree',
                            icon: 'cui-cloud-upload FontBoldIcon',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_COMMIT_DATASET') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                        ]
                      },
                      {
                        name: i18n.t('static.ConsumptionBasedForecast.ConsumptionBasedForecast'),
                        icon: 'fa fa-list',
                        attributes: {
                          hidden: ((((this.state.businessFunctions.includes('ROLE_BF_LIST_IMPORT_FROM_QAT_SUPPLY_PLAN')) || (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_DATA_ENTRY_ADJUSTMENT')) || (this.state.businessFunctions.includes('ROLE_BF_VIEW_CONSUMPTION_DATA_ENTRY_ADJUSTMENT')) || (this.state.businessFunctions.includes('ROLE_BF_EXTRAPOLATION')) || (this.state.businessFunctions.includes('ROLE_BF_VIEW_EXTRAPOLATION'))) && this.state.activeTab == 1) ? false : true)
                        },
                        children: [
                          {
                            name: i18n.t('static.importFromQATSupplyPlan.importFromQATSupplyPlan'),
                            url: '/importFromQATSupplyPlan/listImportFromQATSupplyPlan',
                            icon: 'cui-cloud-download FontBoldIcon',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_IMPORT_FROM_QAT_SUPPLY_PLAN') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.dataEntryAndAdjustments'),
                            url: '/dataentry/consumptionDataEntryAndAdjustment',
                            icon: 'fa fa-pencil',
                            attributes: {
                              hidden: ((((this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_DATA_ENTRY_ADJUSTMENT')) || (this.state.businessFunctions.includes('ROLE_BF_VIEW_CONSUMPTION_DATA_ENTRY_ADJUSTMENT'))) && this.state.activeTab == 1) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.extrapolation'),
                            url: '/Extrapolation/extrapolateData',
                            icon: 'fa fa-line-chart',
                            attributes: {
                              hidden: ((((this.state.businessFunctions.includes('ROLE_BF_EXTRAPOLATION')) || (this.state.businessFunctions.includes('ROLE_BF_VIEW_EXTRAPOLATION'))) && this.state.activeTab == 1) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                        ]
                      },
                      {
                        name: i18n.t('static.TreeForecast.TreeForecast'),
                        icon: 'fa fa-list',
                        attributes: {
                          hidden: ((((this.state.businessFunctions.includes('ROLE_BF_LIST_TREE')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_TREE_TEMPLATE')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_USAGE_TEMPLATE')) || (this.state.businessFunctions.includes('ROLE_BF_MODELING_VALIDATION')) || (this.state.businessFunctions.includes('ROLE_BF_PRODUCT_VALIDATION'))) && this.state.activeTab == 1) ? false : true)
                        },
                        children: [
                          {
                            name: i18n.t('static.common.managetree'),
                            url: '/dataset/listTree',
                            icon: 'fa fa-tree',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_TREE') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dataset.TreeTemplate'),
                            url: '/dataset/listTreeTemplate',
                            icon: 'fa fa-sitemap',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_TREE_TEMPLATE') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.usageTemplate.usageTemplate'),
                            url: '/usageTemplate/listUsageTemplate',
                            icon: 'fa fa-leaf',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_USAGE_TEMPLATE') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.modelingValidation'),
                            url: '/validation/modelingValidation',
                            icon: 'fa fa-area-chart',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_MODELING_VALIDATION') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.productValidation'),
                            url: '/validation/productValidation',
                            icon: 'fa fa-cubes',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_PRODUCT_VALIDATION') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                        ]
                      },
                      {
                        name: i18n.t('static.ForecastAnalysisOutput.ForecastAnalysisOutput'),
                        icon: 'fa fa-list',
                        attributes: {
                          hidden: ((((this.state.businessFunctions.includes('ROLE_BF_COMPARE_AND_SELECT')) || (this.state.businessFunctions.includes('ROLE_BF_VIEW_COMPARE_AND_SELECT')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_MONTHLY_FORECAST')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_FORECAST_SUMMARY')) || (this.state.businessFunctions.includes('ROLE_BF_VIEW_FORECAST_SUMMARY')) || (this.state.businessFunctions.includes('ROLE_BF_COMPARE_VERSION')) || (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_FORECAST_ERROR'))) && this.state.activeTab == 1) ? false : true)
                        },
                        children: [
                          {
                            name: i18n.t('static.dashboard.compareAndSelect'),
                            url: '/report/compareAndSelectScenario',
                            icon: 'fa fa-check-square-o',
                            attributes: {
                              hidden: ((((this.state.businessFunctions.includes('ROLE_BF_COMPARE_AND_SELECT')) || (this.state.businessFunctions.includes('ROLE_BF_VIEW_COMPARE_AND_SELECT'))) && this.state.activeTab == 1) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.MonthlyForecast.MonthlyForecast'),
                            url: '/forecastReport/forecastOutput',
                            icon: 'fa fa-bar-chart',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_MONTHLY_FORECAST') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.ForecastSummary.ForecastSummary'),
                            url: '/forecastReport/forecastSummary',
                            icon: 'fa fa-table',
                            attributes: {
                              hidden: ((((this.state.businessFunctions.includes('ROLE_BF_LIST_FORECAST_SUMMARY')) || (this.state.businessFunctions.includes('ROLE_BF_VIEW_FORECAST_SUMMARY'))) && this.state.activeTab == 1) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.Versioncomarition'),
                            url: '/report/compareVersion',
                            icon: 'fa fa-files-o',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_COMPARE_VERSION') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                        ]
                      },
                      {
                        name: i18n.t('static.dashboard.programmaster'),
                        icon: 'fa fa-list',
                        attributes: {
                          hidden: ((((this.state.businessFunctions.includes('ROLE_BF_LIST_ALTERNATE_REPORTING_UNIT')) || (this.state.businessFunctions.includes('ROLE_BF_SET_UP_PROGRAM')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_PROGRAM')) || (this.state.businessFunctions.includes('ROLE_BF_EDIT_PROGRAM'))
                            || (this.state.businessFunctions.includes('ROLE_BF_LIST_BUDGET')) || (this.state.businessFunctions.includes('ROLE_BF_ADD_PROGRAM_PRODUCT')) || (this.state.businessFunctions.includes('ROLE_BF_IMPORT_PROGARM')) || (this.state.businessFunctions.includes('ROLE_BF_EXPORT_PROGARM'))
                            || (this.state.businessFunctions.includes('ROLE_BF_DOWNLOAD_PROGARM')) || (this.state.businessFunctions.includes('ROLE_BF_DELETE_LOCAL_PROGRAM')) || (this.state.businessFunctions.includes('ROLE_BF_PIPELINE_PROGRAM_IMPORT')) || (this.state.businessFunctions.includes('ROLE_BF_COMMIT_VERSION')) || (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_VERSION_AND_REVIEW'))) && this.state.activeTab == 2) ? false : true)
                        },
                        children: [
                          {
                            name: i18n.t('static.dashboad.planningunitcountry'),
                            url: '/realmCountry/listRealmCountryPlanningUnit',
                            icon: 'fa fa-cubes',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_LIST_ALTERNATE_REPORTING_UNIT') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.setupprogram'),
                            url: '/program/programOnboarding',
                            icon: 'fa fa-plus',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_SET_UP_PROGRAM') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.programHead.program'),
                            url: '/program/listProgram',
                            icon: 'fa fa-cog',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_LIST_PROGRAM') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.Update.PlanningUnits'),
                            url: '/programProduct/addProgramProduct',
                            icon: 'fa fa-cubes',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_ADD_PROGRAM_PRODUCT') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.budget'),
                            url: '/budget/listBudget',
                            icon: 'fa fa-money',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_LIST_BUDGET') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.importprogram'),
                            url: '/program/importProgram',
                            icon: 'fa fa-download',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_IMPORT_PROGARM') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.exportprogram'),
                            url: '/program/exportProgram',
                            icon: 'fa fa-upload',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_EXPORT_PROGARM') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.loadDeleteProgram.loadDeleteProgram'),
                            url: '/program/downloadProgram',
                            icon: 'cui-cloud-download FontBoldIcon',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_DOWNLOAD_PROGARM') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.programimport'),
                            url: '/pipeline/pieplineProgramList',
                            icon: 'fa fa-database',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_PIPELINE_PROGRAM_IMPORT') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.commitVersion'),
                            url: '/program/syncPage',
                            icon: 'cui-cloud-upload FontBoldIcon',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_COMMIT_VERSION') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.report.supplyplanversionandreviewReport'),
                            url: '/report/supplyPlanVersionAndReview',
                            icon: 'fa fa-list-ol',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_VERSION_AND_REVIEW') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          }
                        ]
                      },
                      {
                        name: i18n.t('static.dashboard.supplyPlandata'),
                        icon: 'fa fa-list',
                        attributes: {
                          hidden: ((((this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_DATA')) || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_DATA')) || (this.state.businessFunctions.includes('ROLE_BF_INVENTORY_DATA')) || (this.state.businessFunctions.includes('ROLE_BF_MANUAL_TAGGING')) || (this.state.businessFunctions.includes('ROLE_BF_QUANTIMED_IMPORT'))) && this.state.activeTab == 2) ? false : true)
                        },
                        children: [
                          {
                            name: i18n.t('static.consumptionDetailHead.consumptionDetail'),
                            url: '/consumptionDetails',
                            icon: 'fa fa-bar-chart',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_DATA') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.shipmentDetailHead.shipmentDetail'),
                            url: '/shipment/shipmentDetails',
                            icon: 'fa fa-truck',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_DATA') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.inventoryDetailHead.inventoryDetail'),
                            url: '/inventory/addInventory',
                            icon: 'fa fa-archive',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_INVENTORY_DATA') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.manualTagging'),
                            url: '/shipment/manualTagging',
                            icon: 'fa fa-link',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_MANUAL_TAGGING') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.mt.shipmentLinkingNotification'),
                            url: '/shipmentLinkingNotification',
                            icon: 'fa fa-bell',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_MANUAL_TAGGING') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.importIntoQATSupplyPlan.importIntoQATSupplyPlan'),
                            url: '/importIntoQATSupplyPlan/listImportIntoQATSupplyPlan',
                            icon: 'fa cui-cloud-download',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_IMPORT') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.quantimed.quantimedImport'),
                            url: '/quantimed/quantimedImport',
                            icon: 'fa fa-database',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_QUANTIMED_IMPORT') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          }
                        ]
                      },
                      {
                        name: i18n.t('static.dashboard.supplyPlan'),
                        icon: 'fa fa-list',
                        attributes: { hidden: ((((this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN')) || (this.state.businessFunctions.includes('ROLE_BF_SCENARIO_PLANNING')) || (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT'))) && this.state.activeTab == 2) ? false : true) },
                        children: [
                          {
                            name: i18n.t('static.dashboard.supplyPlan'),
                            url: '/supplyPlan',
                            icon: 'fa fa-bar-chart',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.whatIf'),
                            url: '/report/whatIf',
                            icon: 'fa fa-calculator',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_SCENARIO_PLANNING') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.stockstatus'),
                            url: '/report/stockStatus',
                            icon: 'fa fa-file-text',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                        ]
                      },
                      {
                        name: i18n.t('static.dashboard.report'),
                        icon: 'fa fa-list',
                        attributes: {
                          hidden: ((((this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_PRODUCT_CATALOG_REPORT'))
                            || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_OVER_TIME_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_MATRIX_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_GLOBAL_VIEW_REPORT'))
                            || (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_GLOBAL_VIEW_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_FORECAST_ERROR_OVER_TIME_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_FORECAST_MATRIX_REPORT'))
                            || (this.state.businessFunctions.includes('ROLE_BF_GLOBAL_DEMAND_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_OVERVIEW_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_DETAILS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_COST_DETAILS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_ANNUAL_SHIPMENT_COST_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_BUDGET_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT'))
                            || (this.state.businessFunctions.includes('ROLE_BF_EXPIRIES_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_COST_OF_INVENTORY_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_INVENTORY_TURNS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_ADJUSTMENT_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_WAREHOUSE_CAPACITY_REPORT'))
                            || (this.state.businessFunctions.includes('ROLE_BF_REGION'))) && this.state.activeTab == 2) ? false : true)
                        },
                        children: [
                          {
                            name: i18n.t('static.dashboard.qatProblemList'),
                            url: '/report/problemList',
                            icon: 'fa fa-flag',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.productcatalog'),
                            url: '/report/productCatalog',
                            icon: 'fa fa-list-ol',
                            attributes: {
                              hidden: ((this.state.businessFunctions.includes('ROLE_BF_PRODUCT_CATALOG_REPORT') && this.state.activeTab == 2) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.stockstatusmain'),
                            icon: 'fa fa-list',
                            attributes: { hidden: ((((this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_OVER_TIME_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_MATRIX_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_GLOBAL_VIEW_REPORT'))) && this.state.activeTab == 2) ? false : true) },
                            children: [
                              {
                                name: i18n.t('static.dashboard.stockstatusovertime'),
                                url: '/report/stockStatusOverTime',
                                icon: 'fa fa-line-chart',
                                attributes: {
                                  hidden: ((this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_OVER_TIME_REPORT') && this.state.activeTab == 2) ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.dashboard.stockstatusmatrix'),
                                url: '/report/stockStatusMatrix',
                                icon: 'fa fa-table',
                                attributes: {
                                  hidden: ((this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_MATRIX_REPORT') && this.state.activeTab == 2) ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.dashboard.stockstatusacrossplanningunit'),
                                url: '/report/stockStatusAcrossPlanningUnits',
                                icon: 'fa fa-camera',
                                attributes: {
                                  hidden: ((this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') && this.state.activeTab == 2) ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.report.stockStatusAccrossPlanningUnitGlobalView'),
                                url: '/report/stockStatusAccrossPlanningUnitGlobalView',
                                icon: 'fa fa-globe',
                                attributes: {
                                  hidden: ((this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_GLOBAL_VIEW_REPORT') && this.state.activeTab == 2) ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                            ]
                          },
                          {
                            name: i18n.t('static.report.consumptionReports'),
                            icon: 'fa fa-list',
                            attributes: { hidden: ((((this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_GLOBAL_VIEW_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_FORECAST_ERROR_OVER_TIME_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_FORECAST_MATRIX_REPORT'))) && this.state.activeTab == 2) ? false : true) },
                            children: [
                              // {
                              //   name: i18n.t('static.dashboard.consumption'),
                              //   url: '/report/consumption',
                              //   icon: 'fa fa-bar-chart',
                              //   attributes: {
                              //     hidden: ((this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_REPORT') && this.state.activeTab == 2) ? false : true),
                              //     onClick: e => {
                              //       this.refreshPage();
                              //     }
                              //   }
                              // },
                              {
                                name: i18n.t('static.dashboard.globalconsumption'),
                                url: '/report/globalConsumption',
                                icon: 'fa fa-globe',
                                attributes: {
                                  hidden: ((this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_GLOBAL_VIEW_REPORT') && this.state.activeTab == 2) ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              // {
                              //   name: i18n.t('static.report.forecasterrorovertime'),
                              //   url: '/report/forecastOverTheTime',
                              //   icon: 'fa fa-line-chart',
                              //   attributes: {
                              //     hidden: ((this.state.businessFunctions.includes('ROLE_BF_FORECAST_ERROR_OVER_TIME_REPORT') && this.state.activeTab == 2) ? false : true),
                              //     onClick: e => {
                              //       this.refreshPage();
                              //     }
                              //   }
                              // },
                              {
                                name: 'Forecast Error (Monthly)',
                                url: '/report/consumptionForecastErrorSupplyPlan',
                                icon: 'fa fa-line-chart',
                                attributes: {
                                  hidden: ((this.state.businessFunctions.includes('ROLE_BF_FORECAST_ERROR_OVER_TIME_REPORT') && this.state.activeTab == 2) ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.dashboard.forecastmetrics'),
                                url: '/report/forecastMetrics',
                                icon: 'fa fa-table',
                                attributes: {
                                  hidden: ((this.state.businessFunctions.includes('ROLE_BF_FORECAST_MATRIX_REPORT') && this.state.activeTab == 2) ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                            ]
                          },
                          {
                            name: i18n.t('static.report.shipmentReports'),
                            icon: 'fa fa-list',
                            attributes: { hidden: ((((this.state.businessFunctions.includes('ROLE_BF_GLOBAL_DEMAND_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_OVERVIEW_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_DETAILS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_COST_DETAILS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_ANNUAL_SHIPMENT_COST_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_BUDGET_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT'))) && this.state.activeTab == 2) ? false : true) },
                            children: [
                              {
                                name: i18n.t('static.dashboard.shipmentGlobalViewheader'),
                                url: '/report/shipmentGlobalView',
                                icon: 'fa fa-globe',
                                attributes: {
                                  hidden: ((this.state.businessFunctions.includes('ROLE_BF_GLOBAL_DEMAND_REPORT') && this.state.activeTab == 2) ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.dashboard.shipmentGlobalDemandViewheader'),
                                url: '/report/shipmentGlobalDemandView',
                                icon: 'fa fa-pie-chart',
                                attributes: {
                                  hidden: ((this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_OVERVIEW_REPORT') && this.state.activeTab == 2) ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.report.shipmentDetailReport'),
                                url: '/report/shipmentSummery',
                                icon: 'fa fa-truck',
                                attributes: {
                                  hidden: ((this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_DETAILS_REPORT') && this.state.activeTab == 2) ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.report.shipmentCostReport'),
                                url: '/report/procurementAgentExport',
                                icon: 'fa fa-wpforms',
                                attributes: {
                                  hidden: ((this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_COST_DETAILS_REPORT') && this.state.activeTab == 2) ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.report.annualshipmentcost'),
                                url: '/report/annualShipmentCost',
                                icon: 'fa fa-file-pdf-o',
                                attributes: {
                                  hidden: ((this.state.businessFunctions.includes('ROLE_BF_ANNUAL_SHIPMENT_COST_REPORT') && this.state.activeTab == 2) ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.budgetHead.budget'),
                                url: '/report/budgets',
                                icon: 'fa fa-money',
                                attributes: {
                                  hidden: ((this.state.businessFunctions.includes('ROLE_BF_BUDGET_REPORT') && this.state.activeTab == 2) ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.dashboard.supplierLeadTimes'),
                                url: '/report/supplierLeadTimes',
                                icon: 'fa fa-calendar',
                                attributes: {
                                  hidden: ((this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') && this.state.activeTab == 2) ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              }
                            ]
                          },
                          {
                            name: i18n.t('static.report.inventoryReports'),
                            icon: 'fa fa-list',
                            attributes: { hidden: ((((this.state.businessFunctions.includes('ROLE_BF_EXPIRIES_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_COST_OF_INVENTORY_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_INVENTORY_TURNS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_ADJUSTMENT_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_WAREHOUSE_CAPACITY_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_REGION'))) && this.state.activeTab == 2) ? false : true) },
                            children: [
                              {
                                name: i18n.t('static.report.expiredInventory'),
                                url: '/report/expiredInventory',
                                icon: 'fa fa-exclamation-triangle',
                                attributes: {
                                  hidden: ((this.state.businessFunctions.includes('ROLE_BF_EXPIRIES_REPORT') && this.state.activeTab == 2) ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.dashboard.costOfInventory'),
                                url: '/report/costOfInventory',
                                icon: 'fa fa-book',
                                attributes: {
                                  hidden: ((this.state.businessFunctions.includes('ROLE_BF_COST_OF_INVENTORY_REPORT') && this.state.activeTab == 2) ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.dashboard.inventoryTurns'),
                                url: '/report/inventoryTurns',
                                icon: 'fa fa-refresh',
                                attributes: {
                                  hidden: ((this.state.businessFunctions.includes('ROLE_BF_INVENTORY_TURNS_REPORT') && this.state.activeTab == 2) ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.report.stockAdjustment'),
                                url: '/report/stockAdjustment',
                                icon: 'fa fa-table',
                                attributes: {
                                  hidden: ((this.state.businessFunctions.includes('ROLE_BF_STOCK_ADJUSTMENT_REPORT') && this.state.activeTab == 2) ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.report.warehouseCapacity'),
                                url: '/report/warehouseCapacity',
                                icon: 'fa fa-building-o',
                                attributes: {
                                  hidden: ((this.state.businessFunctions.includes('ROLE_BF_WAREHOUSE_CAPACITY_REPORT') && this.state.activeTab == 2) ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.regionHead.region'),
                                url: '/region/listRegion',
                                icon: 'fa fa-building',
                                attributes: {
                                  hidden: ((this.state.businessFunctions.includes('ROLE_BF_REGION') && this.state.activeTab == 2) ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                            ]
                          },
                        ]
                      },
                      ,
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
                        attributes: { hidden: ((((this.state.businessFunctions.includes('ROLE_BF_IMPORT_PROGARM')) || (this.state.businessFunctions.includes('ROLE_BF_EXPORT_PROGARM')) || (this.state.businessFunctions.includes('ROLE_BF_DELETE_LOCAL_PROGRAM'))) && this.state.activeTab == 2) ? false : true) },
                        children: [
                          {
                            name: i18n.t('static.dashboard.importprogram'),
                            url: '/program/importProgram',
                            icon: 'fa fa-download',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_IMPORT_PROGARM') && this.state.activeTab == 2 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.exportprogram'),
                            url: '/program/exportProgram',
                            icon: 'fa fa-upload',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_EXPORT_PROGARM') && this.state.activeTab == 2 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          // {
                          //   name: i18n.t('static.program.deleteLocalProgram'),
                          //   url: '/program/deleteLocalProgram',
                          //   icon: 'fa fa-trash',
                          //   attributes: {
                          //     hidden: (this.state.businessFunctions.includes('ROLE_BF_DELETE_LOCAL_PROGRAM') && this.state.activeTab == 2 ? false : true),
                          //     onClick: e => {
                          //       this.refreshPage();
                          //     }
                          //   }
                          // },
                        ]
                      },
                      {
                        name: i18n.t('static.common.datasetmanagement'),
                        icon: 'fa fa-list',
                        attributes: {
                          hidden: ((((this.state.businessFunctions.includes('ROLE_BF_VERSION_SETTINGS')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_PLANNING_UNIT_SETTING')) || (this.state.businessFunctions.includes('ROLE_BF_IMPORT_DATASET')) || (this.state.businessFunctions.includes('ROLE_BF_EXPORT_DATASET'))) && this.state.activeTab == 1) ? false : true)
                        },
                        children: [
                          {
                            name: i18n.t('static.UpdateversionSettings.UpdateversionSettings'),
                            url: '/dataset/versionSettings',
                            icon: 'fa fa-sliders',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_VERSION_SETTINGS') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.updatePlanningUnit.updatePlanningUnit'),
                            url: '/planningUnitSetting/listPlanningUnitSetting',
                            icon: 'fa fa-cubes',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_PLANNING_UNIT_SETTING') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: 'Import Program',
                            url: '/dataset/importDataset',
                            icon: 'fa fa-download',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_IMPORT_DATASET') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: 'Export Program',
                            url: '/dataset/exportDataset',
                            icon: 'fa fa-upload',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_EXPORT_DATASET') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                        ]
                      },
                      {
                        name: i18n.t('static.ConsumptionBasedForecast.ConsumptionBasedForecast'),
                        icon: 'fa fa-list',
                        attributes: {
                          hidden: ((((this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_DATA_ENTRY_ADJUSTMENT')) || (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_DATA_ENTRY_ADJUSTMENT')) || (this.state.businessFunctions.includes('ROLE_BF_EXTRAPOLATION')) || (this.state.businessFunctions.includes('ROLE_BF_VIEW_EXTRAPOLATION'))) && this.state.activeTab == 1) ? false : true)
                        },
                        children: [
                          {
                            name: i18n.t('static.dashboard.dataEntryAndAdjustments'),
                            url: '/dataentry/consumptionDataEntryAndAdjustment',
                            icon: 'fa fa-pencil',
                            attributes: {
                              hidden: ((((this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_DATA_ENTRY_ADJUSTMENT')) || (this.state.businessFunctions.includes('ROLE_BF_VIEW_CONSUMPTION_DATA_ENTRY_ADJUSTMENT'))) && this.state.activeTab == 1) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.extrapolation'),
                            url: '/Extrapolation/extrapolateData',
                            icon: 'fa fa-line-chart',
                            attributes: {
                              hidden: ((((this.state.businessFunctions.includes('ROLE_BF_EXTRAPOLATION')) || (this.state.businessFunctions.includes('ROLE_BF_VIEW_EXTRAPOLATION'))) && this.state.activeTab == 1) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                        ]
                      },
                      {
                        name: i18n.t('static.TreeForecast.TreeForecast'),
                        icon: 'fa fa-list',
                        attributes: {
                          hidden: ((((this.state.businessFunctions.includes('ROLE_BF_LIST_TREE')) || (this.state.businessFunctions.includes('ROLE_BF_PRODUCT_VALIDATION')) || (this.state.businessFunctions.includes('ROLE_BF_MODELING_VALIDATION'))) && this.state.activeTab == 1) ? false : true)
                        },
                        children: [
                          {
                            name: i18n.t('static.common.managetree'),
                            url: '/dataset/listTree',
                            icon: 'fa fa-tree',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_TREE') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.modelingValidation'),
                            url: '/validation/modelingValidation',
                            icon: 'fa fa-area-chart',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_MODELING_VALIDATION') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.productValidation'),
                            url: '/validation/productValidation',
                            icon: 'fa fa-cubes',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_PRODUCT_VALIDATION') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                        ]
                      },
                      {
                        name: i18n.t('static.ForecastAnalysisOutput.ForecastAnalysisOutput'),
                        icon: 'fa fa-list',
                        attributes: {
                          hidden: ((((this.state.businessFunctions.includes('ROLE_BF_COMPARE_AND_SELECT')) || (this.state.businessFunctions.includes('ROLE_BF_VIEW_COMPARE_AND_SELECT')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_MONTHLY_FORECAST')) || (this.state.businessFunctions.includes('ROLE_BF_LIST_FORECAST_SUMMARY')) || (this.state.businessFunctions.includes('ROLE_BF_VIEW_FORECAST_SUMMARY')) || (this.state.businessFunctions.includes('ROLE_BF_COMPARE_VERSION')) || (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_FORECAST_ERROR'))) && this.state.activeTab == 1) ? false : true)
                        },
                        children: [
                          {
                            name: i18n.t('static.dashboard.compareAndSelect'),
                            url: '/report/compareAndSelectScenario',
                            icon: 'fa fa-check-square-o',
                            attributes: {
                              hidden: ((((this.state.businessFunctions.includes('ROLE_BF_COMPARE_AND_SELECT')) || (this.state.businessFunctions.includes('ROLE_BF_VIEW_COMPARE_AND_SELECT'))) && this.state.activeTab == 1) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.MonthlyForecast.MonthlyForecast'),
                            url: '/forecastReport/forecastOutput',
                            icon: 'fa fa-bar-chart',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_MONTHLY_FORECAST') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.ForecastSummary.ForecastSummary'),
                            url: '/forecastReport/forecastSummary',
                            icon: 'fa fa-table',
                            attributes: {
                              hidden: ((((this.state.businessFunctions.includes('ROLE_BF_LIST_FORECAST_SUMMARY')) || (this.state.businessFunctions.includes('ROLE_BF_VIEW_FORECAST_SUMMARY'))) && this.state.activeTab == 1) ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.Versioncomarition'),
                            url: '/report/compareVersion',
                            icon: 'fa fa-files-o',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_COMPARE_VERSION') && this.state.activeTab == 1 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                        ]
                      },
                      {
                        name: i18n.t('static.dashboard.supplyPlandata'),
                        icon: 'fa fa-list',
                        attributes: { hidden: ((((this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_DATA')) || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_DATA')) || (this.state.businessFunctions.includes('ROLE_BF_INVENTORY_DATA'))) && this.state.activeTab == 2) ? false : true) },
                        children: [
                          {
                            name: i18n.t('static.consumptionDetailHead.consumptionDetail'),
                            url: '/consumptionDetails',
                            icon: 'fa fa-bar-chart',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_DATA') && this.state.activeTab == 2 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.shipmentDetailHead.shipmentDetail'),
                            url: '/shipment/shipmentDetails',
                            icon: 'fa fa-truck',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_DATA') && this.state.activeTab == 2 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.inventoryDetailHead.inventoryDetail'),
                            url: '/inventory/addInventory',
                            icon: 'fa fa-archive',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_INVENTORY_DATA') && this.state.activeTab == 2 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                        ]
                      },
                      {
                        name: i18n.t('static.dashboard.supplyPlan'),
                        icon: 'fa fa-list',
                        attributes: { hidden: ((((this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN')) || (this.state.businessFunctions.includes('ROLE_BF_SCENARIO_PLANNING')) || (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT'))) && this.state.activeTab == 2) ? false : true) },
                        children: [
                          {
                            name: i18n.t('static.dashboard.supplyPlan'),
                            url: '/supplyPlan',
                            icon: 'fa fa-bar-chart',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') && this.state.activeTab == 2 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.whatIf'),
                            url: '/report/whatIf',
                            icon: 'fa fa-calculator',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_SCENARIO_PLANNING') && this.state.activeTab == 2 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.stockstatus'),
                            url: '/report/stockStatus',
                            icon: 'fa fa-file-text',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT') && this.state.activeTab == 2 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                        ]
                      },
                      {
                        name: i18n.t('static.dashboard.report'),
                        icon: 'fa fa-list',
                        attributes: {
                          hidden: ((((this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_OVER_TIME_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_MATRIX_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT'))
                            || (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_FORECAST_ERROR_OVER_TIME_REPORT'))
                            || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_DETAILS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_COST_DETAILS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_ANNUAL_SHIPMENT_COST_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_BUDGET_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT'))
                            || (this.state.businessFunctions.includes('ROLE_BF_EXPIRIES_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_COST_OF_INVENTORY_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_INVENTORY_TURNS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_ADJUSTMENT_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_WAREHOUSE_CAPACITY_REPORT'))) && this.state.activeTab == 2) ? false : true)
                        },
                        children: [
                          {
                            name: i18n.t('static.dashboard.qatProblemList'),
                            url: '/report/problemList',
                            icon: 'fa fa-flag',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT') && this.state.activeTab == 2 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.productcatalog'),
                            url: '/report/productCatalog',
                            icon: 'fa fa-list-ol',
                            attributes: {
                              hidden: (this.state.businessFunctions.includes('ROLE_BF_PRODUCT_CATALOG_REPORT') && this.state.activeTab == 2 ? false : true),
                              onClick: e => {
                                this.refreshPage();
                              }
                            }
                          },
                          {
                            name: i18n.t('static.dashboard.stockstatusmain'),
                            icon: 'fa fa-list',
                            attributes: { hidden: ((((this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_OVER_TIME_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_MATRIX_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT'))) && this.state.activeTab == 2) ? false : true) },
                            children: [
                              {
                                name: i18n.t('static.dashboard.stockstatusovertime'),
                                url: '/report/stockStatusOverTime',
                                icon: 'fa fa-line-chart',
                                attributes: {
                                  hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_OVER_TIME_REPORT') && this.state.activeTab == 2 ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.dashboard.stockstatusmatrix'),
                                url: '/report/stockStatusMatrix',
                                icon: 'fa fa-table',
                                attributes: {
                                  hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_MATRIX_REPORT') && this.state.activeTab == 2 ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.dashboard.stockstatusacrossplanningunit'),
                                url: '/report/stockStatusAcrossPlanningUnits',
                                icon: 'fa fa-camera',
                                attributes: {
                                  hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') && this.state.activeTab == 2 ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                            ]
                          },
                          {
                            name: i18n.t('static.report.consumptionReports'),
                            icon: 'fa fa-list',
                            attributes: { hidden: ((((this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_FORECAST_ERROR_OVER_TIME_REPORT'))) && this.state.activeTab == 2) ? false : true) },
                            children: [
                              // {
                              //   name: i18n.t('static.dashboard.consumption'),
                              //   url: '/report/consumption',
                              //   icon: 'fa fa-bar-chart',
                              //   attributes: {
                              //     hidden: (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_REPORT') && this.state.activeTab == 2 ? false : true),
                              //     onClick: e => {
                              //       this.refreshPage();
                              //     }
                              //   }
                              // },
                              //  {
                              //   name: i18n.t('static.report.forecasterrorovertime'),
                              //   url: '/report/forecastOverTheTime',
                              //   icon: 'fa fa-line-chart',
                              //   attributes: {
                              //     hidden: (this.state.businessFunctions.includes('ROLE_BF_FORECAST_ERROR_OVER_TIME_REPORT') && this.state.activeTab == 2 ? false : true),
                              //     onClick: e => {
                              //       this.refreshPage();
                              //     }
                              //   }
                              // },
                              {
                                name: i18n.t('static.report.forecasterrorovertime'),
                                url: '/report/consumptionForecastErrorSupplyPlan',
                                icon: 'fa fa-line-chart',
                                attributes: {
                                  hidden: (this.state.businessFunctions.includes('ROLE_BF_FORECAST_ERROR_OVER_TIME_REPORT') && this.state.activeTab == 2 ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                            ]
                          },
                          {
                            name: i18n.t('static.report.shipmentReports'),
                            icon: 'fa fa-list',
                            attributes: { hidden: ((((this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_DETAILS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_COST_DETAILS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_ANNUAL_SHIPMENT_COST_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_BUDGET_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT'))) && this.state.activeTab == 2) ? false : true) },
                            children: [
                              {
                                name: i18n.t('static.report.shipmentDetailReport'),
                                url: '/report/shipmentSummery',
                                icon: 'fa fa-truck',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_DETAILS_REPORT') && this.state.activeTab == 2 ? false : true) }
                              },
                              {
                                name: i18n.t('static.report.shipmentCostReport'),
                                url: '/report/procurementAgentExport',
                                icon: 'fa fa-wpforms',
                                attributes: {
                                  hidden: (this.state.businessFunctions.includes('ROLE_BF_SHIPMENT_COST_DETAILS_REPORT') && this.state.activeTab == 2 ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.report.annualshipmentcost'),
                                url: '/report/annualShipmentCost',
                                icon: 'fa fa-file-pdf-o',
                                attributes: {
                                  hidden: (this.state.businessFunctions.includes('ROLE_BF_ANNUAL_SHIPMENT_COST_REPORT') && this.state.activeTab == 2 ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.dashboard.supplierLeadTimes'),
                                url: '/report/supplierLeadTimes',
                                icon: 'fa fa-calendar',
                                attributes: {
                                  hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') && this.state.activeTab == 2 ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              }
                            ]
                          },
                          {
                            name: i18n.t('static.report.inventoryReports'),
                            icon: 'fa fa-list',
                            attributes: { hidden: ((((this.state.businessFunctions.includes('ROLE_BF_EXPIRIES_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_COST_OF_INVENTORY_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_INVENTORY_TURNS_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_STOCK_ADJUSTMENT_REPORT')) || (this.state.businessFunctions.includes('ROLE_BF_WAREHOUSE_CAPACITY_REPORT'))) && this.state.activeTab == 2) ? false : true) },
                            children: [
                              {
                                name: i18n.t('static.report.expiredInventory'),
                                url: '/report/expiredInventory',
                                icon: 'fa fa-exclamation-triangle',
                                attributes: {
                                  hidden: (this.state.businessFunctions.includes('ROLE_BF_EXPIRIES_REPORT') && this.state.activeTab == 2 ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.dashboard.costOfInventory'),
                                url: '/report/costOfInventory',
                                icon: 'fa fa-book',
                                attributes: {
                                  hidden: (this.state.businessFunctions.includes('ROLE_BF_COST_OF_INVENTORY_REPORT') && this.state.activeTab == 2 ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              }, 
                              // {
                              //   name: i18n.t('static.dashboard.inventoryTurns'),
                              //   url: '/report/inventoryTurns',
                              //   icon: 'fa fa-refresh',
                              //   attributes: {
                              //     hidden: (this.state.businessFunctions.includes('ROLE_BF_INVENTORY_TURNS_REPORT') && this.state.activeTab == 2 ? false : true),
                              //     onClick: e => {
                              //       this.refreshPage();
                              //     }
                              //   }
                              // },
                              {
                                name: i18n.t('static.report.stockAdjustment'),
                                url: '/report/stockAdjustment',
                                icon: 'fa fa-table',
                                attributes: {
                                  hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_ADJUSTMENT_REPORT') && this.state.activeTab == 2 ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                              {
                                name: i18n.t('static.report.warehouseCapacity'),
                                url: '/report/warehouseCapacity',
                                icon: 'fa fa-building-o',
                                attributes: {
                                  hidden: (this.state.businessFunctions.includes('ROLE_BF_WAREHOUSE_CAPACITY_REPORT') && this.state.activeTab == 2 ? false : true),
                                  onClick: e => {
                                    this.refreshPage();
                                  }
                                }
                              },
                            ]
                          },
                        ]
                      }
                    ]
                }} {...this.props} />
              }
            </Suspense>
            <Row>
              <Col xs="12" md="12">
                {(AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_FORECASTING_MODULE') && AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SUPPLY_PLANNING_MODULE')) && <Nav tabs className="marginTopTabs" style={{ flexDirection: "row", borderBottom: "none" }} >
                  {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_FORECASTING_MODULE') && <NavItem className="bgColourRemoveItem itemWhidth">
                    <NavLink
                      className="bgColourRemoveLink tab1"
                      active={this.state.activeTab === '1'}
                      onClick={() => { this.toggle(0, '1'); }}
                      href={`/#/ApplicationDashboard/${AuthenticationService.displayDashboardBasedOnRole()}/green/Success`}
                      style={{ border: "none" }}
                      title={i18n.t('static.module.forecasting')}
                    >
                      <i class="nav-icon fa fa-line-chart tabicon" style={{ fontSize: '18px', paddingTop: '5px', color: '#fff' }} ></i>
                      <h6 className="tabtext">{i18n.t('static.module.forecasting')}</h6>
                    </NavLink>
                  </NavItem>}
                  {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SUPPLY_PLANNING_MODULE') && <NavItem className="bgColourRemoveItem itemWhidth">
                    <NavLink
                      className="bgColourRemoveLink tab2"
                      active={this.state.activeTab === '2'}
                      onClick={() => { this.toggle(0, '2'); }}
                      href={`/#/ApplicationDashboard/${AuthenticationService.displayDashboardBasedOnRole()}/green/Success`}
                      style={{ border: "none", padding: "0.75rem 0.2rem" }}
                      title={i18n.t('static.module.supplyPlanningMod')}
                    >
                                            <i class="nav-icon whiteicon"><img className="" src={imgforcastmoduletab} style={{ width: '25px', height: '25px', paddingTop: '0px' }} /></i>
                      <i class="nav-icon blueicon"><img className="" src={imgforcastmoduletabblue} style={{ width: '25px', height: '25px', paddingTop: '0px' }} /></i>
                      <h6 className="tabtext">{i18n.t('static.module.supplyPlanningMod')}</h6>
                    </NavLink>
                  </NavItem>}
                </Nav>}
                              </Col>
            </Row>
            <AppSidebarFooter />
            <AppSidebarMinimizer />
          </AppSidebar>
          <main className="main">
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
                          AuthenticationService.authenticatedRoute(route.path, this.state.url) ?
                            (
                              <route.component {...props} onClick={this.displayHeaderTitle(route.name != undefined ? ((route.name.includes("static.") ? (route.entityname == '' || route.entityname == undefined ? i18n.t(route.name) : i18n.t(route.name, { entityname: i18n.t(route.entityname) })) : route.name)) : '', route.path)} />
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
                          </Suspense>
          </AppAside>
        </div>
        <AppFooter>
          <Suspense fallback={this.loading()}>
            <DefaultFooter syncProgram={e => this.goToMasterDataSync(e)} />
          </Suspense>
        </AppFooter>
      </div>
      </ErrorBoundary>
    );
  }
}
export default DefaultLayout;