import { AppAside, AppFooter, AppHeader, AppSidebar, AppSidebarFooter, AppSidebarForm, AppSidebarHeader, AppSidebarMinimizer, AppSidebarNav } from '@coreui/react';
import React, { Component, Suspense } from 'react';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { Offline, Online } from "react-detect-offline";
import { Redirect, Route, Switch } from 'react-router-dom';
import { Container } from 'reactstrap';
import i18n from '../../i18n';
// routes config
import routes from '../../routes';
import AuthenticationService from '../../views/Common/AuthenticationService.js';

const DefaultAside = React.lazy(() => import('./DefaultAside'));
const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));

class DefaultLayout extends Component {

  constructor(props) {
    super(props);
    this.state = {
      businessFunctions: [],
      name: ""
    }
  }

  displayHeaderTitle = (name) => {
    if (this.state.name !== name) {
      this.setState({
        name
      });
    }
  }
  componentDidMount() {
    var curUserBusinessFunctions = AuthenticationService.getLoggedInUserRoleBusinessFunction();
    var bfunction = [];
    if (curUserBusinessFunctions != null && curUserBusinessFunctions != "") {
      for (let i = 0; i < curUserBusinessFunctions.length; i++) {
        bfunction.push(curUserBusinessFunctions[i]);
      }
      this.setState({ businessFunctions: bfunction });
    }

  }

  loading = () => <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>;
  changePassword(e) {
    e.preventDefault();
    AuthenticationService.setupAxiosInterceptors();
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
  showDashboard(e) {
    console.log("e------------------", e);
    e.preventDefault();
    var id = AuthenticationService.displayDashboardBasedOnRole();
    this.props.history.push(`/ApplicationDashboard/` + `${id}`)
  }


  render() {
    return (
      <div className="app">
        <AppHeader fixed>
          <Suspense fallback={this.loading()}>
            <DefaultHeader onLogout={e => this.signOut(e)} onChangePassword={e => this.changePassword(e)} onChangeDashboard={e => this.showDashboard(e)} title={this.state.name} />
          </Suspense>
        </AppHeader>
        <div className="app-body">
          <AppSidebar fixed display="lg">
            <AppSidebarHeader />
            <AppSidebarForm />
            <Suspense>

              <Online>

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
                        name: i18n.t('static.translations.translations'),
                        icon: 'fa fa-list',
                        attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_VIEW_TRANSLATIONS') ? false : true) },
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
                        attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_VIEW_APPL_MASTERS') ? false : true) },
                        children: [
                          {
                            name: i18n.t('static.dashboard.role'),
                            url: '/role/listRole',
                            icon: 'fa fa-dot-circle-o',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_MANAGE_ROLE') ? false : true) }
                          },
                          // (this.state.businessFunctions.includes('ROLE_BF_CREATE_USERL')?
                          {
                            name: i18n.t('static.dashboard.user'),
                            url: '/user/listUser',
                            icon: 'fa fa-users',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_MANAGE_USER') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.language'),
                            url: '/language/listLanguage',
                            icon: 'fa fa-language',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_MANAGE_LANGUAGE') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.country'),
                            url: '/country/listCountry',
                            icon: 'fa fa-globe',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_MANAGE_COUNTRY') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.currency'),
                            url: '/currency/listCurrency',
                            icon: 'fa fa-money',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_MANAGE_CURRENCY') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.dimension'),
                            url: '/diamension/diamensionlist',
                            icon: 'fa fa-map',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_MANAGE_DIMENSION') ? false : true) }
                          }
                          , {
                            name: i18n.t('static.dashboard.unit'),
                            url: '/unit/listUnit',
                            icon: 'fa fa-th',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_MANAGE_UNIT') ? false : true) }
                          }
                          ,
                          {
                            name: i18n.t('static.dashboard.realm'),
                            icon: 'fa fa-list',
                            // attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_REALM') ? false : true) },
                            children: [{
                              name: i18n.t('static.dashboard.realm'),
                              url: '/realm/realmlist',
                              icon: 'fa fa-th-large',
                              // attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_REALM') ? false : true) }
                            }, {
                              name: i18n.t('static.dashboard.realmcountry'),
                              url: '/realmCountry/listRealmCountry',
                              icon: 'fa fa-globe',
                              attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_MANAGE_REALM_COUNTRY') ? false : true) }
                            }, {
                              name: i18n.t('static.dashboad.planningunitcountry'),
                              url: '/realmCountry/listRealmCountryPlanningUnit',
                              icon: 'fa fa-globe',
                              attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_MANAGE_REALM_COUNTRY_PLANNING_UNIT') ? false : true) }
                            }]
                          },
                        ]
                      },
                      // !this.state.businessFunctions.includes('ROLE_BF_VIEW_GUEST_SCREENS') &&
                      {
                        name: i18n.t('static.dashboard.realmlevelmaster'),
                        icon: 'fa fa-list',
                        attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_VIEW_REALM_LEVEL_MASTERS') ? false : true) },
                        children: [
                          {
                            name: i18n.t('static.dashboard.datasourcetype'),
                            url: '/dataSourceType/listDataSourceType',
                            icon: 'fa fa-table',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_DATA_SOURCE_TYPE') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.datasource'),
                            url: '/dataSource/listDataSource',
                            icon: 'fa fa-database',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_LIST_DATA_SOURCE') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.fundingsource'),
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
                            name: i18n.t('static.dashboard.procurementagent'),
                            url: '/procurementAgent/listProcurementAgent',
                            icon: 'fa fa-link',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.supplier'),
                            url: '/supplier/listSupplier',
                            icon: 'fa fa-user-circle-o',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLIER') ? false : true) }
                          },
                          {
                            name: i18n.t('static.healtharea.healtharea'),
                            url: '/healthArea/listHealthArea',
                            icon: 'fa fa-medkit',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_HEALTH_AREA') ? false : true) }
                          },
                          {
                            name: i18n.t('static.organisation.organisation'),
                            url: '/organisation/listOrganisation',
                            icon: 'fa fa-building',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_ORGANIZATION') ? false : true) }
                          }
                        ]
                      },
                      // !this.state.businessFunctions.includes('ROLE_BF_VIEW_GUEST_SCREENS') &&
                      {
                        name: i18n.t('static.dashboard.programmaster'),
                        url: '/program',
                        icon: 'fa fa-list',
                        attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_VIEW_PROGRAM_MASTERS') ? false : true) },
                        children: [
                          {
                            name: i18n.t('static.dashboard.program'),
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
                          {
                            name: i18n.t('static.dashboard.budget'),
                            url: '/budget/listBudget',
                            icon: 'fa fa-dollar',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_MANAGE_BUDGET') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.tracercategory'),
                            url: '/tracerCategory/listTracerCategory',
                            icon: 'fa fa-th-large',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_TRACER_CATEGORY') ? false : true) }
                          },
                          // {

                          //   name: 'Product Category',
                          //   url: '/ProductCategory/AddProductCategory',
                          //   icon: 'icon-graph'
                          // },
                          {
                            name: 'Product Category',
                            url: '/productCategory/productCategoryTree',
                            icon: 'fa fa-cubes',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PRODUCT_CATEGORY') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.forecastingunit'),
                            url: '/forecastingUnit/listforecastingUnit',
                            icon: 'fa fa-line-chart',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_MANAGE_FORECASTING_UNIT') ? false : true) }
                          }, {
                            name: i18n.t('static.dashboard.planningunit'),
                            url: '/planningUnit/listPlanningUnit',
                            icon: 'fa fa-list-alt',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_MANAGE_PLANNING_UNIT') ? false : true) }
                          }, {
                            name: i18n.t('static.dashboad.planningunitcapacity'),
                            url: '/planningUnitCapacity/listPlanningUnitcapacity',
                            icon: 'fa fa-tasks',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_MANAGE_PLANNING_UNIT_CAPACITY') ? false : true) }
                          },
                          {
                            name: i18n.t('static.procurementUnit.procurementUnit'),
                            url: '/procurementUnit/listProcurementUnit',
                            icon: 'fa fa-building',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_MANAGE_PROCUREMENT_UNIT') ? false : true) }
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
                            icon: 'fa fa-code-fork',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_COMMIT_VERSION') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.program'),
                            icon: 'fa fa-list',
                            // attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_DOWNLOAD_PROGRAM') ? false : true) },
                            children: [
                              // {
                              //   name: i18n.t('static.dashboard.datasync'),
                              //   url: '/masterDataSync',
                              //   icon: 'fa fa-list',
                              // },
                              {
                                name: i18n.t('static.dashboard.downloadprogram'),
                                url: '/program/downloadProgram',
                                icon: 'fa fa-download',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_DOWNLOAD_PROGARM') ? false : true) }
                              },
                              {
                                name: i18n.t('static.dashboard.importprogram'),
                                url: '/program/importProgram',
                                icon: 'fa fa-cloud-download',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_IMPORT_EXPORT_PROGARM') ? false : true) }
                              },
                              {
                                name: i18n.t('static.dashboard.exportprogram'),
                                url: '/program/exportProgram',
                                icon: 'fa fa-sign-in',
                                attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_IMPORT_EXPORT_PROGARM') ? false : true) }
                              }

                            ]
                          },

                          {
                            name: i18n.t('static.dashboard.consumptiondetails'),
                            url: '/consumptionDetails',
                            icon: 'fa fa-bar-chart',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') ? false : true) }
                          },
                          {
                            name: 'Inventory Details',
                            url: '/inventory/addInventory',
                            icon: 'fa fa-cube',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') ? false : true) }
                          },
                          // {
                          //   name: 'Shipment Details',
                          //   url: '/shipment/addShipment',
                          //   icon: 'fa fa-list',
                          // },
                          {
                            name: 'Shipment Details',
                            url: '/shipment/shipmentDetails',
                            icon: 'fa fa-truck',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') ? false : true) }
                          },
                          {
                            name: 'Manual Tagging',
                            url: '/shipment/manualTagging',
                            icon: 'fa fa-truck',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') ? false : true) }
                          },
                          {
                            name: 'Shipment De-linking',
                            url: '/shipment/delinking',
                            icon: 'fa fa-truck',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') ? false : true) }
                          }
                        ]
                      },
                      // !this.state.businessFunctions.includes('ROLE_BF_VIEW_GUEST_SCREENS') &&
                      {
                        name: i18n.t('static.dashboard.report'),
                        icon: 'fa fa-list',
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
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.regionreport'),
                            url: '/region/listRegion',
                            icon: 'fa fa-globe',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_REGION') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.productcatalog'),
                            url: '/report/productCatalog',
                            icon: 'fa fa-th',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PRODUCT_CATALOG_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.consumption'),
                            url: '/report/consumption',
                            icon: 'fa fa-bar-chart',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_REPORT') ? false : true) }
                          }, {
                            name: i18n.t('static.dashboard.globalconsumption'),
                            url: '/report/globalConsumption',
                            icon: 'fa fa-globe',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_GLOBAL_VIEW_REPORT') ? false : true) }
                          }, {
                            name: i18n.t('static.report.forecasterrorovertime'),
                            url: '/report/forecastOverTheTime',
                            icon: 'fa fa-line-chart',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_FORECAST_ERROR_OVER_TIME_REPORT') ? false : true) }
                          }, {
                            name: i18n.t('static.dashboard.forecastmetrics'),
                            url: '/report/forecastMetrics',
                            icon: 'fa fa-bar-chart',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_FORECAST_MATRIX_REPORT') ? false : true) }
                          },
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
                            name: i18n.t('static.dashboard.stockstatus'),
                            url: '/report/stockStatus',
                            icon: 'fa fa-line-chart',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }
                          }, ,
                          {
                            name: i18n.t('static.dashboard.stockstatusacrossplanningunit'),
                            url: '/report/stockStatusAcrossPlanningUnits',
                            icon: 'fa fa-exchange',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }

                          },
                          {
                            name: i18n.t('static.report.warehouseCapacity'),
                            url: '/report/warehouseCapacity',
                            icon: 'fa fa-line-chart',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.report.stockStatusAccrossPlanningUnitGlobalView'),
                            url: '/report/stockStatusAccrossPlanningUnitGlobalView',
                            icon: 'fa fa-line-chart',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.report.stockAdjustment'),
                            url: '/report/stockAdjustment',
                            icon: 'fa fa-line-chart',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.costOfInventory'),
                            url: '/report/costOfInventory',
                            icon: 'fa fa-exchange',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.inventoryTurns'),
                            url: '/report/inventoryTurns',
                            // icon: 'fa fa-exchange'
                            icon: 'fa fa-line-chart',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.qatProblemList'),
                            url: '/report/problemList',
                            icon: 'fa fa-file-text-o',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT') ? false : true) }
                          },
                          // {
                          //   name: 'QAT PROBLEM+ACTION REPORT',
                          //   url: '/report/qatProblemPlusActionReport',
                          //   icon: 'fa fa-file-text-o',
                          //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT') ? false : true) }
                          // },
                          // {
                          //   name: i18n.t('static.dashboard.funderExport'),
                          //   url: '/report/funderExport',
                          //   icon: 'fa fa-list-alt',
                          //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_FUNDER_REPORT') ? false : true) }
                          // },
                          {
                            name: i18n.t('static.report.shipmentCostReport'),
                            url: '/report/procurementAgentExport',
                            icon: 'fa fa-wpforms',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                          }
                          ,
                          {
                            name: i18n.t('static.dashboard.supplierLeadTimes'),
                            url: '/report/supplierLeadTimes',
                            icon: 'fa fa-wpforms',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                          }
                          ,
                          // {
                          //   name: i18n.t('static.dashboard.aggregateShipmentByProduct'),
                          //   url: '/report/aggregateShipmentByProduct',
                          //   icon: 'fa fa-wpforms',
                          //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                          // }
                          ,

                          {
                            name: i18n.t('static.report.annualshipmentcost'),
                            url: '/report/annualShipmentCost',
                            icon: 'fa fa-file-text',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_ANNUAL_SHIPMENT_COST_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.report.supplyplanversionandreviewReport'),
                            url: '/report/supplyPlanVersionAndReview',
                            icon: 'fa fa-exchange',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.report.shipmentDetailReport'),
                            url: '/report/shipmentSummery',
                            icon: 'fa fa-exchange',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.shipmentGlobalDemandViewheader'),
                            url: '/report/shipmentGlobalDemandView',
                            icon: 'fa fa-wpforms',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.shipmentGlobalViewheader'),
                            url: '/report/shipmentGlobalView',
                            icon: 'fa fa-wpforms',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.report.expiredInventory'),
                            url: '/report/expiredInventory',
                            icon: 'fa fa-exchange',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.budgetheader'),
                            url: '/report/budgets',
                            icon: 'fa fa-exchange',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT') ? false : true) }
                          }
                          // {
                          //   name: i18n.t('static.report.supplyplanversionandreviewReport'),
                          //   url: '/report/supplyPlanVersionAndReview',
                          //   icon: 'fa fa-exchange'
                          // }
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
                      {
                        name: 'Setup Program',
                        url: '/program/programOnboarding',
                        icon: 'fa fa-list-ol',
                        attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SET_UP_PROGRAM') ? false : true) }
                      },
                      // !this.state.businessFunctions.includes('ROLE_BF_VIEW_GUEST_SCREENS') &&
                      {
                        name: 'Pipeline Program Import',
                        // url: '/pipeline/pipelineProgramImport',
                        url: '/pipeline/pieplineProgramList',
                        icon: 'fa fa-sitemap',
                        attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PIPELINE_PROGRAM_IMPORT') ? false : true) }
                      },

                    ]

                }} {...this.props} />
              </Online>
              <Offline>
                <AppSidebarNav navConfig={{
                  items:
                    [
                      {
                        name: i18n.t('static.dashboard.program'),
                        icon: 'fa fa-list',
                        children: [
                          {
                            name: i18n.t('static.dashboard.importprogram'),
                            url: '/program/importProgram',
                            icon: 'fa fa-cloud-download',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_IMPORT_EXPORT_PROGARM') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.exportprogram'),
                            url: '/program/exportProgram',
                            icon: 'fa fa-sign-in',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_IMPORT_EXPORT_PROGARM') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.consumptiondetails'),
                            url: '/consumptionDetails',
                            icon: 'fa fa-list',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.inventorydetails'),
                            url: '/inventory/addInventory',
                            icon: 'fa fa-list',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') ? false : true) }
                          },
                          {
                            name: 'Shipment Details',
                            url: '/shipment/shipmentDetails',
                            icon: 'fa fa-list',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') ? false : true) }
                          }
                        ]
                      }, {
                        name: i18n.t('static.dashboard.report'),
                        icon: 'fa fa-list',
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
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.consumption'),
                            url: '/report/consumption',
                            icon: 'fa fa-exchange',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_CONSUMPTION_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.stockstatusmatrix'),
                            url: '/report/stockStatusMatrix',
                            icon: 'fa fa-exchange',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_MATRIX_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.report.stockAdjustment'),
                            url: '/report/stockAdjustment',
                            icon: 'fa fa-line-chart',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.report.warehouseCapacity'),
                            url: '/report/warehouseCapacity',
                            icon: 'fa fa-line-chart',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.report.shipmentCostReport'),
                            url: '/report/procurementAgentExport',
                            icon: 'fa fa-wpforms',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.report.annualshipmentcost'),
                            url: '/report/annualShipmentCost',
                            icon: 'fa fa-file-text',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_ANNUAL_SHIPMENT_COST_REPORT') ? false : true) }
                          },
                          // {
                          //   name: i18n.t('static.dashboard.aggregateShipmentByProduct'),
                          //   url: '/report/aggregateShipmentByProduct',
                          //   icon: 'fa fa-wpforms',
                          //   attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                          // },
                          {
                            name: i18n.t('static.dashboard.stockstatus'),
                            url: '/report/stockStatus',
                            icon: 'fa fa-exchange',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }

                          }
                          ,
                          {
                            name: i18n.t('static.dashboard.stockstatusacrossplanningunit'),
                            url: '/report/stockStatusAcrossPlanningUnits',
                            icon: 'fa fa-exchange',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_STOCK_STATUS_REPORT') ? false : true) }

                          },
                          {
                            name: i18n.t('static.report.expiredInventory'),
                            url: '/report/expiredInventory',
                            icon: 'fa fa-exchange',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.supplierLeadTimes'),
                            url: '/report/supplierLeadTimes',
                            icon: 'fa fa-wpforms',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.productcatalog'),
                            url: '/report/productCatalog',
                            icon: 'fa fa-th',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PRODUCT_CATALOG_REPORT') ? false : true) }

                          }, {
                            name: i18n.t('static.dashboard.costOfInventory'),
                            url: '/report/costOfInventory',
                            icon: 'fa fa-exchange',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT') ? false : true) }
                          }, {
                            name: i18n.t('static.dashboard.inventoryTurns'),
                            url: '/report/inventoryTurns',
                            icon: 'fa fa-line-chart',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.report.shipmentDetailReport'),
                            url: '/report/shipmentSummery',
                            icon: 'fa fa-exchange',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_SUPPLY_PLAN_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.shipmentGlobalDemandViewheader'),
                            url: '/report/shipmentGlobalDemandView',
                            icon: 'fa fa-wpforms',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROCUREMENT_AGENT_REPORT') ? false : true) }
                          },
                          {
                            name: i18n.t('static.dashboard.qatProblemList'),
                            url: '/report/problemList',
                            icon: 'fa fa-file-text-o',
                            attributes: { hidden: (this.state.businessFunctions.includes('ROLE_BF_PROBLEM_AND_ACTION_REPORT') ? false : true) }
                          },
                        ]
                      }
                    ]
                }} {...this.props} />
              </Offline>
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
                        name={route.name}
                        render={props =>
                          AuthenticationService.authenticatedRoute(route.path) ?
                            (
                              <route.component {...props} onClick={this.displayHeaderTitle(route.name)} />
                            ) : (
                              <Redirect to={{ pathname: "/login/static.accessDenied" }} />
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
