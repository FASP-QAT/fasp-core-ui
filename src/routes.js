import React from 'react';
import i18n from './i18n'

const AddDimension = React.lazy(() => import('./views/Dimension/AddDimensionComponent'));
const DimensionList = React.lazy(() => import('./views/Dimension/DimensionListComponent'));
const EditDimension = React.lazy(() => import('./views/Dimension/EditDimensionComponent'));
// const AddHealthArea = React.lazy(() => import('./views/HealthArea/AddHealthArea'));
const AddSubFundingSource = React.lazy(() => import('./views/subFundingSource/AddSubFundingSourceComponent'));
const ListSubFundingSource = React.lazy(() => import('./views/subFundingSource/ListSubFundingSourceComponent'));
const EditSubFundingSource = React.lazy(() => import('./views/subFundingSource/EditSubFundingSourceComponent'));
const ApplicationDashboard = React.lazy(() => import('./views/ApplicationDashboard'));
const RealmDashboard = React.lazy(() => import('./views/RealmDashboard'));
const ProgramDashboard = React.lazy(() => import('./views/ProgramDashboard'));
const AddFundingSource = React.lazy(() => import('./views/fundingSource/AddFundingSourceComponent'));
const ListFundingSource = React.lazy(() => import('./views/fundingSource/ListFundingSourceComponent'));
const EditFundingSource = React.lazy(() => import('./views/fundingSource/EditFundingSourceComponent'));
const AddProcurementAgent = React.lazy(() => import('./views/procurementAgent/AddProcurementAgentComponent'));
const ListProcurementAgent = React.lazy(() => import('./views/procurementAgent/ListProcurementAgentComponent'));
const EditProcurementAgent = React.lazy(() => import('./views/procurementAgent/EditProcurementAgentComponent'));
const AddManufacturer = React.lazy(() => import('./views/manufacturer/AddManufacturerComponent'));
const ListManufacturer = React.lazy(() => import('./views/manufacturer/ListManufacturerComponent'));
const EditManufacturer = React.lazy(() => import('./views/manufacturer/EditManufacturerComponent'));
const AddRegion = React.lazy(() => import('./views/region/AddRegionComponent'));
const ListRegion = React.lazy(() => import('./views/region/ListRegionComponent'));
const EditRegion = React.lazy(() => import('./views/region/EditRegionComponent'));
const ListRealmCountry = React.lazy(() => import('./views/realmCountry/ListRealmCountryComponent'));
const AddRealmCountry = React.lazy(() => import('./views/realmCountry/AddRealmCountryComponent'));
const ForgotPassword = React.lazy(() => import('./views/Pages/Login/ForgotPasswordComponent'));
const UpdateExpiredPassword = React.lazy(() => import('./views/Pages/Login/UpdateExpiredPasswordComponent'));
const ChangePassword = React.lazy(() => import('./views/Pages/Login/ChangePasswordComponent'));
const ResetPassword = React.lazy(() => import('./views/Pages/Login/ResetPasswordComponent'));
const AddRole = React.lazy(() => import('./views/role/AddRoleComponent'));
const ListRole = React.lazy(() => import('./views/role/ListRoleComponent'));
const EditRole = React.lazy(() => import('./views/role/EditRoleComponent'));
const AddUser = React.lazy(() => import('./views/user/AddUserComponent'));
const ListUser = React.lazy(() => import('./views/user/ListUserComponent'));
const EditUser = React.lazy(() => import('./views/user/EditUserComponent'));


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
const Carousels = React.lazy(() => import('./views/Base/Carousels'));
const Collapses = React.lazy(() => import('./views/Base/Collapses'));
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

const AddBudgetComponent = React.lazy(() => import('./views/budget/AddBudgetComponent'));
const ListBudgetComponent = React.lazy(() => import('./views/budget/ListBudgetComponent'));
const EditBudgetComponent = React.lazy(() => import('./views/budget/EditBudgetComponent'));
const AddProgramProduct = React.lazy(() => import('./views/ProgramProduct/AddProgramProduct'));
const AddProductCategory = React.lazy(() => import('./views/ProductCategory/AddProductCategory'));
const AddProgram = React.lazy(() => import('./views/Program/AddProgram'));
const Programs = React.lazy(() => import('./views/Program/ProgramList'));
const EditProgram = React.lazy(() => import('./views/Program/EditProgram'));
const SubFundingSourceList = React.lazy(() => import('./views/subFundingSource/ListSubFundingSourceComponent'));
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

const AddCountry = React.lazy(() => import('./views/Country/AddCountryComponent'));
const ListCountry = React.lazy(() => import('./views/Country/CountryListComponent'));
const EditCountry = React.lazy(() => import('./views/Country/UpdateCountryComponent'));

const AddDataSource = React.lazy(() => import('./views/DataSource/AddDataSource'));
const ListDataSource = React.lazy(() => import('./views/DataSource/DataSourceListComponent'));
const EditDataSource = React.lazy(() => import('./views/DataSource/UpdateDataSourceComponent'));

const AddDataSourceType = React.lazy(() => import('./views/DataSourceType/AddDataSourceTypeComponent'));
const ListDataSourceType = React.lazy(() => import('./views/DataSourceType/DataSourceTypeListComponent'));
const EditDataSourceType = React.lazy(() => import('./views/DataSourceType/UpdateDataSourceTypeComponent'));

const AddCurrency = React.lazy(() => import('./views/Currency/AddCurrencyComponent'));
const ListCurrency = React.lazy(() => import('./views/Currency/CurrencyListComponent'));
const EditCurrency = React.lazy(() => import('./views/Currency/UpdateCurrencyComponent'));
const DatabaseTranslation = React.lazy(() => import('./views/Translations/DatabaseTranslations'));
const LabelTranslation=React.lazy(()=>import('./views/Translations/LabelTranslations'))
const ProgramTree = React.lazy(() => import('./views/Dashboard/ProgramTree'));


const AddRealm = React.lazy(() => import('./views/Realm/AddRealmComponent'));
const RealmList = React.lazy(() => import('./views/Realm/RealmListComponent'));
const EditRealm = React.lazy(() => import('./views/Realm/UpdateRealmComponent'));
// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/programTree', name: 'Program', component: ProgramTree },

  { path: '/diamension/AddDiamension', name: 'Dimension / Add Dimension', component: AddDimension },
  { path: '/diamension/diamensionlist',exact: true,  name: 'Dimension / Dimension List', component: DimensionList },
 { path: '/diamension/diamensionlist/:message', component: DimensionList },
  { path: '/diamension/editDiamension', name: 'Dimension / Edit Dimension', component: EditDimension },

  { path: '/realm/addrealm', name: ' Realm / Add Realm', component: AddRealm },
  { path: '/realm/realmlist',exact: true, name: 'Realm / Realm List', component: RealmList },
  { path: '/realm/updaterealm', name: 'Realm / Edit Realm', component: EditRealm },
  { path: '/realm/realmlist/:message',component: RealmList },



  
  { path: '/product/editProduct', name: 'Edit Product', component: EditProdct },
  { path: '/product/listProduct', name: 'Product ', component: ListProdct },
  { path: '/product/addProduct', name: 'Add Product', component: AddProduct },
  { path: '/program/addProgram', name: 'Add Program', component: AddProgram },
  { path: '/program/listProgram', name: 'Program ', component: Programs },
  { path: '/program/editProgram', name: 'Edit Program', component: EditProgram },
  { path: '/productCategory/addProductCategory', name: 'Add Product Category', component: AddProductCategory },
  { path: '/programProduct/addProgramProduct', name: 'Add Program Product', component: AddProgramProduct },
  { path: '/budget/addBudget', name: 'Add Budget', component: AddBudgetComponent },
  { path: '/budget/listBudget', name: 'Budget List', component: ListBudgetComponent },
  { path: '/budget/listBudget/:message', component: ListBudgetComponent },
  { path: '/budget/editBudget', name: 'Update Budget', component: EditBudgetComponent },
  { path: '/', exact: true, name: 'Home' },
  // { path: '/healthArea/addHealthArea', name: 'Health Area / Add Health Area', component: AddHealthArea },
  { path: '/fundingSource/addFundingSource', name: 'Funding Source / Add Funding Source', component: AddFundingSource },
  { path: '/fundingSource/listFundingSource', exact: true, name: 'Funding Source / Funding Source List', component: ListFundingSource },
  { path: '/fundingSource/editFundingSource', name: 'Funding Source / Edit Funding Source', component: EditFundingSource },
  { path: '/fundingSource/listFundingSource/:message', component: ListFundingSource },
  { path: '/subFundingSource/addSubFundingSource', name: 'Sub Funding Source / Add Sub Funding Source', component: AddSubFundingSource },
  { path: '/subFundingSource/listSubFundingSource', exact: true, name: 'Sub Funding Source / Sub Funding Source List', component: ListSubFundingSource },
  { path: '/subFundingSource/editSubFundingSource', name: 'Sub Funding Source / Edit Sub Funding Source', component: EditSubFundingSource },
  { path: '/subFundingSource/subFundingSourceList/:message',component: SubFundingSourceList },
   { path: '/ApplicationDashboard', name: 'ApplicationDashboard', component: ApplicationDashboard },
    { path: '/RealmDashboard', name: 'RealmDashboard', component: RealmDashboard },
  { path: '/ProgramDashboard', name: 'ProgramDashboard', component: ProgramDashboard },
  { path: '/dashboard',exact:true, name: 'Dashboard', component: Dashboard },
  { path: '/subFundingSource/subFundingSourceList/:message', component: SubFundingSourceList },
  { path: '/subFundingSource/listSubFundingSource/:message', component: ListSubFundingSource },
  { path: '/procurementAgent/addProcurementAgent', name: 'Procurement Agent / Add Procurement Agent', component: AddProcurementAgent },
  { path: '/procurementAgent/listProcurementAgent', exact: true, name: 'Procurement Agent / Procurement Agent List', component: ListProcurementAgent },
  { path: '/procurementAgent/listProcurementAgent/:message', component: ListProcurementAgent },
  { path: '/procurementAgent/editProcurementAgent', name: 'Procurement Agent / Edit Procurement Agent', component: EditProcurementAgent },

  { path: '/manufacturer/addManufacturer', name: 'Manufacturer / Add Manufacturer', component: AddManufacturer },
  { path: '/manufacturer/listManufacturer', exact: true, name: 'Manufacturer / Manufacturer List', component: ListManufacturer },
  { path: '/manufacturer/editManufacturer', name: 'Manufacturer / Edit Manufacturer', component: EditManufacturer },
  { path: '/manufacturer/listManufacturer/:message', component: ListManufacturer },
  { path: '/region/addRegion', name: 'Region / Add Region', component: AddRegion },
  { path: '/region/listRegion', exact: true, name: 'Region / Region List', component: ListRegion },
  { path: '/region/editRegion', name: 'Region / Edit Region', component: EditRegion },
  { path: '/region/listRegion/:message', component: ListRegion },
  { path: '/realmCountry/listRealmCountry/:message', component: ListRealmCountry },
  { path: '/realmCountry/listRealmCountry', exact: true, name: 'Realm Country / Realm Country List', component: ListRealmCountry },
  { path: '/realmCountry/addRealmCountry', exact: true, name: 'Realm Country / Add Realm Country', component: AddRealmCountry },
  { path: '/forgotPassword', exact: true, name: 'Forgot Password', component: ForgotPassword },
  { path: '/updateExpiredPassword', exact: true, name: 'Update expired password', component: UpdateExpiredPassword },
  { path: '/changePassword', exact: true, name: 'Change password', component: ChangePassword },
  { path: '/resetPassword/:username/:token', exact: true, name: 'Reset password', component: ResetPassword },
  { path: '/role/listRole/:message', component: ListRole },
  { path: '/role/listRole', exact: true, name: 'Role / Role List', component: ListRole },
  { path: '/role/addRole', exact: true, name: 'Role / Add Role', component: AddRole },
  { path: '/role/editRole', exact: true, name: 'Role / Edit Role', component: EditRole },
  { path: '/user/listUser/:message', component: ListUser },
  { path: '/user/listUser', exact: true, name: 'User / User List', component: ListUser },
  { path: '/user/addUser', exact: true, name: 'User / Add User', component: AddUser },
  { path: '/user/editUser', exact: true, name: 'User / Edit User', component: EditUser },

  { path: '/dashboard/:message',component: Dashboard },
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
  { path: '/program/downloadProgram', name: 'Download Program', component: DownloadProgram },
  { path: '/program/downloadProgram/:message', name: 'Download Program', component: DownloadProgram },
  { path: '/program/exportProgram', name: 'Export Program', component: ExportProgram },
  { path: '/program/importProgram', name: 'Import Program', component: ImportProgram },
  { path: '/masterDataSync', name: 'Master Data sync', component: MasterDataSync },
  { path: '/consumptionDetails', name: 'Consumption Data', component: ConsumptionDetails },
  { path: '/language/addLanguage', name: 'Language / Add Language', component: AddLanguage },
  { path: '/language/languagelist', exact: true, name: 'Language / Language List', component: ListLanguage },
  { path: '/language/languagelist/:message', component: ListLanguage },
  { path: '/language/editLanguage', name: 'Language / Edit Language', component: EditLanguage },

  { path: '/country/addCountry', name: 'Country / Add Country', component: AddCountry },
  { path: '/country/listCountry', exact: true, name: 'Country / Country List', component: ListCountry },
  { path: '/country/listCountry/:message', component: ListCountry },
  { path: '/country/editCountry', name: 'Country / Edit Country', component: EditCountry },

  { path: '/dataSourceType/addDataSourceType', name: 'DataSource Type / Add DataSource Type', component: AddDataSourceType },
  { path: '/dataSourceType/listDataSourceType', exact: true, name: 'DataSource Type / DataSource Type List', component: ListDataSourceType },
  { path: '/dataSourceType/listDataSourceType/:message', component: ListDataSourceType },
  { path: '/dataSourceType/editDataSourceType', name: 'DataSource Type / Edit DataSource Type', component: EditDataSourceType },

  { path: '/dataSource/addDataSource', name: 'DataSource / Add DataSource', component: AddDataSource },
  { path: '/dataSource/listDataSource', exact: true, name: 'DataSource / DataSource List', component: ListDataSource },
  { path: '/dataSource/listDataSource/:message', component: ListDataSource },
  { path: '/dataSource/editDataSource', name: 'DataSource / Edit DataSource', component: EditDataSource },

  { path: '/currency/addCurrency', name: 'Currency / Add Currency', component: AddCurrency },
  { path: '/currency/listCurrency', exact: true, name: 'Currency / Currency List', component: ListCurrency },
  { path: '/currency/listCurrency/:message', component: ListCurrency },
  { path: '/currency/editCurrency', name: 'Currency / Edit Currency', component: EditCurrency },
  { path: '/translations/databaseTranslations', name: 'Database Translations', component: DatabaseTranslation },
  { path: '/translations/labelTranslations', name: 'Label Translations', component: LabelTranslation },
];

export default routes;
