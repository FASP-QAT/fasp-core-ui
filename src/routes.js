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

const AddSubFundingSource = React.lazy(() => import('./views/SubFundingSource/AddSubFundingSourceComponent'));
const ListSubFundingSource = React.lazy(() => import('./views/SubFundingSource/ListSubFundingSourceComponent'));
const EditSubFundingSource = React.lazy(() => import('./views/SubFundingSource/EditSubFundingSourceComponent'));
const ApplicationDashboard = React.lazy(() => import('./views/ApplicationDashboard'));
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
const DownloadProgram = React.lazy(() => import('./views/Program/DownloadProgram'));
const ExportProgram = React.lazy(() => import('./views/Program/ExportProgram'));
const ImportProgram = React.lazy(() => import('./views/Program/ImportProgram'));
const MasterDataSync = React.lazy(() => import('./views/SyncMasterData/SyncMasterData'));
const ConsumptionDetails = React.lazy(() => import('./views/Consumption/ConsumptionDetails'));

const AddLanguage = React.lazy(() => import('./views/Language/AddLanguageComponent'));
const ListLanguage = React.lazy(() => import('./views/Language/LanguageListComponent'));
const EditLanguage = React.lazy(() => import('./views/Language/EditLanguageComponent'));

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
const ProgramTree = React.lazy(() => import('./views/Dashboard/ProgramTree'));


const AddRealm = React.lazy(() => import('./views/Realm/AddRealmComponent'));
const RealmList = React.lazy(() => import('./views/Realm/ListRealmComponent'));
const EditRealm = React.lazy(() => import('./views/Realm/EditRealmComponent'));
const SupplyPlan = React.lazy(() => import('./views/SupplyPlan/SupplyPlanComponent'));

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

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [

  { path: '/inventory/addInventory', name: 'Inventory / Add Inventory', component: AddInventory },
  { path: '/productCategory/productCategoryTree', name: 'Product Category Tree', component: ProductCategoryTree },
  { path: '/', exact: true, name: 'Home' },
  { path: '/programTree', name: i18n.t('static.dashboard.program'), component: ProgramTree },
  { path: '/diamension/AddDiamension', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.dimension') }), component: AddDimension },
  { path: '/diamension/diamensionlist', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.dimension') }), component: DimensionList },
  { path: '/diamension/diamensionlist/:message', component: DimensionList },
  { path: '/diamension/editDiamension/:dimensionId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.dimension') }), component: EditDimension },

  { path: '/realm/addrealm', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.realm') }), component: AddRealm },
  { path: '/realm/realmlist', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.realm') }), component: RealmList },
  { path: '/realm/updateRealm/:realmId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.realm') }), component: EditRealm },
  { path: '/realm/realmlist/:message', component: RealmList },

  { path: '/product/editProduct/:productId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.product.product') }), component: EditProdct },
  { path: '/product/listProduct', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.product.product') }), component: ListProdct },
  { path: '/product/listProduct/:message', name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.product.product') }), component: ListProdct },
  { path: '/product/addProduct', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.product.product') }), component: AddProduct },

  { path: '/program/addProgram', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.program') }), component: AddProgram },
  { path: '/program/listProgram', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.program') }), component: Programs },
  { path: '/program/listProgram/:message', component: Programs },
  { path: '/program/editProgram/:programId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.program') }), component: EditProgram },

  { path: '/productCategory/addProductCategory', name: 'Add Product Category', component: AddProductCategory },
  { path: '/programProduct/addProgramProduct/:programId', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.programPlanningUnit') }), component: AddProgramProduct },


  { path: '/procurementAgent/addProcurementAgentPlanningUnit/:procurementAgentId', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.procurementAgentPlanningUnit') }), component: AddProcurementAgentPlanningUnit },
  { path: '/procurementAgent/addProcurementAgentProcurementUnit/:procurementAgentId', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.procurementAgentProcurementUnit') }), component: AddProcurementAgentProcurementUnit },

  { path: '/budget/addBudget', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.budget') }), component: AddBudgetComponent },
  { path: '/budget/listBudget', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.budget') }), component: ListBudgetComponent },
  { path: '/budget/listBudget/:message', component: ListBudgetComponent },
  { path: '/budget/editBudget/:budgetId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.budget') }), component: EditBudgetComponent },

  { path: '/', exact: true, name: 'Home' },

  { path: '/healthArea/addHealthArea', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.healtharea') }), component: AddHealthArea },
  { path: '/healthArea/listHealthArea/:message', component: HealthAreaList },
  { path: '/healthArea/listHealthArea', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.healtharea') }), component: HealthAreaList },
  { path: '/healthArea/editHealthArea/:healthAreaId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.healtharea') }), component: EditHealthArea },

  { path: '/organisation/addOrganisation', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.organisation.organisation') }), component: AddOrganisation },
  { path: '/organisation/listOrganisation/:message', component: OrganisationList },
  { path: '/organisation/listOrganisation', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.organisation.organisation') }), component: OrganisationList },
  { path: '/organisation/editOrganisation/:organisationId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.organisation.organisation') }), component: EditOrganisation },

  { path: '/fundingSource/addFundingSource', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.fundingsource') }), component: AddFundingSource },
  { path: '/fundingSource/listFundingSource', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.fundingsource') }), component: ListFundingSource },
  { path: '/fundingSource/editFundingSource/:fundingSourceId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.fundingsource') }), component: EditFundingSource },
  { path: '/fundingSource/listFundingSource/:message', component: ListFundingSource },

  { path: '/subFundingSource/addSubFundingSource', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.subfundingsource') }), component: AddSubFundingSource },
  { path: '/subFundingSource/listSubFundingSource', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.subfundingsource') }), component: ListSubFundingSource },
  { path: '/subFundingSource/editSubFundingSource/:subFundingSourceId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.subfundingsource') }), component: EditSubFundingSource },
  { path: '/subFundingSource/subFundingSourceList/:message', component: SubFundingSourceList },

  { path: '/ApplicationDashboard', exact: true, name: i18n.t('static.dashboard.applicationdashboard'), component: ApplicationDashboard },
  { path: '/ApplicationDashboard/:message', component: ApplicationDashboard },
  { path: '/RealmDashboard', name: i18n.t('static.dashboard.realmdashboard'), component: RealmDashboard },
  { path: '/ProgramDashboard', name: i18n.t('static.dashboard.programdashboard'), component: ProgramDashboard },
  { path: '/dashboard', exact: true, name: i18n.t('static.common.dashboard'), component: Dashboard },

  { path: '/subFundingSource/subFundingSourceList/:message', component: SubFundingSourceList },
  { path: '/subFundingSource/listSubFundingSource/:message', component: ListSubFundingSource },

  { path: '/procurementAgent/addProcurementAgent', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.procurementagent') }), component: AddProcurementAgent },
  { path: '/procurementAgent/listProcurementAgent', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.procurementagent') }), component: ListProcurementAgent },
  { path: '/procurementAgent/listProcurementAgent/:message', component: ListProcurementAgent },
  { path: '/procurementAgent/editProcurementAgent/:procurementAgentId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.procurementagent') }), component: EditProcurementAgent },

  { path: '/tracerCategory/addTracerCategory', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.tracercategory') }), component: AddTracerCategory },
  { path: '/tracerCategory/listTracerCategory', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.tracercategory') }), component: ListTracerCategory },
  { path: '/tracerCategory/listTracerCategory/:message', component: ListTracerCategory },
  { path: '/tracerCategory/editTracerCategory/:tracerCategoryId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.tracercategory') }), component: EditTracerCategory },

  { path: '/supplier/addSupplier', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.supplier') }), component: AddSupplier },
  { path: '/supplier/listSupplier', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.supplier') }), component: ListSupplier },
  { path: '/supplier/editSupplier/:supplierId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.supplier') }), component: EditSupplier },
  { path: '/supplier/listSupplier/:message', component: ListSupplier },

  { path: '/region/addRegion', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.region') }), component: AddRegion },
  { path: '/region/listRegion', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.region') }), component: ListRegion },
  { path: '/region/editRegion/:regionId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.region') }), component: EditRegion },
  { path: '/region/listRegion/:message', component: ListRegion },

  { path: '/realmCountry/listRealmCountry/:message', component: ListRealmCountry },
  { path: '/realmCountry/listRealmCountry', exact: true, name: i18n.t('static.dashboard.realmcountrylist'), component: ListRealmCountry },
  { path: '/realmCountry/addRealmCountry', exact: true, name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.realmcountry') }), component: AddRealmCountry },
  { path: '/realmCountry/realmCountry/:realmId', exact: true, name: i18n.t('static.dashboard.realm') + " / " + i18n.t('static.dashboard.realmcountry'), component: RealmCountry },

  { path: '/changePassword', exact: true, name: i18n.t('static.dashboard.changepassword'), component: ChangePassword },
  { path: '/logout', exact: true, component: Logout },
  { path: '/logout/:message', exact: true, component: Logout },

  { path: '/role/listRole/:message', component: ListRole },
  { path: '/role/listRole', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.role') }), component: ListRole },
  { path: '/role/addRole', exact: true, name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.role') }), component: AddRole },
  { path: '/role/editRole', exact: true, name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.role') }), component: EditRole },

  { path: '/user/listUser/:message', component: ListUser },
  { path: '/user/listUser', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.user') }), component: ListUser },
  { path: '/user/addUser', exact: true, name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.user') }), component: AddUser },
  { path: '/user/editUser', exact: true, name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.user') }), component: EditUser },
  { path: '/user/accessControl', exact: true, name: i18n.t('static.dashboard.useraccessctrl'), component: AccessControl },
  { path: '/accessDenied', exact: true, component: AccessDenied },

  { path: '/dashboard/:message', component: Dashboard },

  { path: '/program/downloadProgram', name: i18n.t('static.dashboard.downloadprogram'), component: DownloadProgram },
  { path: '/program/downloadProgram/:message', component: DownloadProgram },
  { path: '/program/exportProgram', name: i18n.t('static.dashboard.exportprogram'), component: ExportProgram },
  { path: '/program/importProgram', name: i18n.t('static.dashboard.importprogram'), component: ImportProgram },

  { path: '/masterDataSync', name: i18n.t('static.dashboard.masterdatasync'), component: MasterDataSync },

  { path: '/consumptionDetails', name: i18n.t('static.dashboard.consumptiondetails'), component: ConsumptionDetails },

  { path: '/language/addLanguage', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.language') }), component: AddLanguage },
  { path: '/language/listLanguage', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.language') }), component: ListLanguage },
  { path: '/language/listLanguage/:message', component: ListLanguage },
  { path: '/language/editLanguage/:languageId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.language') }), component: EditLanguage },

  { path: '/unit/addUnit', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.unit') }), component: AddUnit },
  { path: '/unit/listUnit', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.unit') }), component: ListUnit },
  { path: '/unit/listUnit/:message', component: ListUnit },
  { path: '/unit/editUnit/:unitId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.unit') }), component: EditUnit },

  { path: '/country/addCountry', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.country') }), component: AddCountry },
  { path: '/country/listCountry', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.country') }), component: ListCountry },
  { path: '/country/listCountry/:message', component: ListCountry },
  { path: '/country/editCountry/:countryId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.country') }), component: EditCountry },

  { path: '/dataSourceType/addDataSourceType', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.datasourcetype') }), component: AddDataSourceType },
  { path: '/dataSourceType/listDataSourceType', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.datasourcetype') }), component: ListDataSourceType },
  { path: '/dataSourceType/listDataSourceType/:message', component: ListDataSourceType },
  { path: '/dataSourceType/editDataSourceType/:dataSourceTypeId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.datasourcetype') }), component: EditDataSourceType },

  { path: '/dataSource/addDataSource', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.datasource') }), component: AddDataSource },
  { path: '/dataSource/listDataSource', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.datasource') }), component: ListDataSource },
  { path: '/dataSource/listDataSource/:message', component: ListDataSource },
  { path: '/dataSource/editDataSource/:dataSourceId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.datasource') }), component: EditDataSource },

  { path: '/currency/addCurrency', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.currency') }), component: AddCurrency },
  { path: '/currency/listCurrency', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.currency') }), component: ListCurrency },
  { path: '/currency/listCurrency/:message', component: ListCurrency },
  { path: '/currency/editCurrency/:currencyId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.currency') }), component: EditCurrency },

  { path: '/translations/databaseTranslations', name: i18n.t('static.label.databaseTranslations'), component: DatabaseTranslation },
  { path: '/translations/labelTranslations', name: i18n.t('static.label.labelTranslations'), component: LabelTranslation },

  { path: '/supplyPlan', name: i18n.t('static.supplyplan.supplyplan'), component: SupplyPlan },

  { path: '/forecastingUnit/addForecastingUnit', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.forecastingunit') }), component: AddForecastingUnit },
  { path: '/forecastingUnit/listForecastingUnit', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.forecastingunit') }), component: ForecastingUnitList },
  { path: '/forecastingUnit/listForecastingUnit/:message', component: ForecastingUnitList },
  { path: '/forecastingUnit/editForecastingUnit/:forecastingUnitId', name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.forecastingunit') }), component: EditForecastingUnit },

  { path: '/planningUnit/addPlanningUnit', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.planningunit') }), component: AddPlanningUnit },
  { path: '/planningUnit/listPlanningUnit', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.planningunit') }), component: PlanningUnitList },
  { path: '/planningUnit/listPlanningUnit/:message', component: PlanningUnitList },
  { path: '/planningUnitCapacity/planningUnitCapacity/:planningUnitId', name: i18n.t('static.dashboard.planningunit') + " / " + i18n.t('static.dashboad.planningunitcapacity'), component: PlanningUnitCapacity },


  { path: '/procurementUnit/addProcurementUnit', name: i18n.t('static.breadcrum.add', { entityname: i18n.t('static.dashboard.procurementUnit') }), component: AddProcurementUnit },
  { path: '/procurementUnit/listProcurementUnit', exact: true, name: i18n.t('static.breadcrum.list', { entityname: i18n.t('static.dashboard.procurementUnit') }), component: ListProcurementUnit },
  { path: '/procurementUnit/listProcurementUnit/:message', component: ListProcurementUnit },
  { path: '/procurementUnit/editProcurementUnit', exact: true, name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.procurementUnit') }), component: EditProcurementUnit },
  { path: '/procurementUnit/editProcurementUnit/:procurementUnitId', component: EditProcurementUnit },
  { path: '/planningUnit/editPlanningUnit/:planningUnitId', exact: true, name: i18n.t('static.breadcrum.edit', { entityname: i18n.t('static.dashboard.planningunit') }), component: EditPlanningUnit },
  { path: '/realmCountry/listRealmCountryPlanningUnit', name: i18n.t('static.dashboard.planningunit') + " / " + i18n.t('static.dashboad.planningunitcountry'), component: PlanningUnitCountryList },
  { path: '/planningUnitCapacity/planningUnitCapacity/:planningUnitId', name: i18n.t('static.dashboard.planningunit') + " / " + i18n.t('static.dashboad.planningunitcapacity'), component: PlanningUnitCapacity },
  { path: '/realmCountry/realmCountryPlanningUnit/:realmCountryId', name: i18n.t('static.dashboard.realmcountry') + " / " + i18n.t('static.dashboad.planningunitcountry'), component: PlanningUnitCountry },
  { path: '/planningUnitCapacity/listPlanningUnitCapacity', name: i18n.t('static.dashboard.planningunit') + " / " + i18n.t('static.dashboad.planningunitcountry'), component: PlanningUnitCapacityList },
  { path: '/realmCountry/realmCountryRegion/:realmCountryId', name: i18n.t('static.dashboard.realmcountry') + " / " + i18n.t('static.dashboad.planningunitcountry'), component: RealmCountryRegion },


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


];
export default routes;
