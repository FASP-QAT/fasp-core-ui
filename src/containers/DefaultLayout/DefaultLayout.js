import React, { Component, Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Container } from 'reactstrap';
import { Online, Offline } from "react-detect-offline";
import {
  AppAside,
  AppBreadcrumb,
  AppFooter,
  AppHeader,
  AppSidebar,
  AppSidebarFooter,
  AppSidebarForm,
  AppSidebarHeader,
  AppSidebarMinimizer,
  AppSidebarNav,
} from '@coreui/react';
// sidebar nav config
import navigation from '../../_nav';
// routes config
import routes from '../../routes';
import LogoutService from "../../api/LogoutService";
import AuthenticationService from '../../views/Common/AuthenticationService.js';
import i18n from '../../i18n'

const DefaultAside = React.lazy(() => import('./DefaultAside'));
const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));


class DefaultLayout extends Component {
  loading = () => <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>;
  changePassword(e) {
    e.preventDefault();
    AuthenticationService.setupAxiosInterceptors();
    this.props.history.push(`/changePassword`);
  }
  signOut(e) {
    e.preventDefault();
    this.props.history.push(`/logout/static.logoutSuccess`)
  }

  render() {
    return (
      <div className="app">
        <AppHeader fixed>
          <Suspense fallback={this.loading()}>
            <DefaultHeader onLogout={e => this.signOut(e)} onChangePassword={e => this.changePassword(e)} />
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
                      {
                        name: i18n.t('static.dashboard.applicationdashboard'),
                        url: '/ApplicationDashboard',
                        icon: 'cui-dashboard icons',
                      },
                      // {
                      //   name: i18n.t('static.dashboard.realmdashboard'),
                      //   url: '/RealmDashboard',
                      //   icon: 'cui-dashboard icons',
                      // },
                      {
                        name: i18n.t('static.dashboard.programdashboard'),
                        url: '/ProgramDashboard',
                        icon: 'cui-dashboard icons',
                      },
                      {
                        name: i18n.t('static.translations.translations'),
                        icon: 'fa fa-list',
                        children: [
                          {
                            name: i18n.t('static.label.labelTranslations'),
                            url: '/translations/labelTranslations',
                            icon: 'fa fa-exchange'
                          },
                          {
                            name: i18n.t('static.label.databaseTranslations'),
                            url: '/translations/databaseTranslations',
                            icon: 'fa fa-exchange'
                          }
                        ]
                      },
                      {
                        name: i18n.t('static.dashboard.applicationmaster'),
                        icon: 'fa fa-list',
                        children: [
                          {
                            name: i18n.t('static.dashboard.role'),
                            url: '/role/listRole',
                            icon: 'fa fa-dot-circle-o'
                          },
                          {
                            name: i18n.t('static.dashboard.user'),
                            url: '/user/listUser',
                            icon: 'fa fa-user'
                          },
                          {
                            name: i18n.t('static.dashboard.language'),
                            url: '/language/listLanguage',
                            icon: 'fa fa-language'
                          },
                          {
                            name: i18n.t('static.dashboard.country'),
                            url: '/country/listCountry',
                            icon: 'fa fa-globe'
                          },
                          {
                            name: i18n.t('static.dashboard.currency'),
                            url: '/currency/listCurrency',
                            icon: 'fa fa-money'
                          },
                          {
                            name: i18n.t('static.dashboard.dimension'),
                            url: '/diamension/diamensionlist',
                            icon: 'fa fa-map'
                          }
                          , {
                            name: i18n.t('static.dashboard.unit'),
                            url: '/unit/listUnit',
                            icon: 'fa fa-th'
                          }
                          ,
                          {
                            name: i18n.t('static.dashboard.realm'),
                            icon: 'fa fa-list',
                            children: [{
                              name: i18n.t('static.dashboard.realm'),
                              url: '/realm/realmlist',
                              icon: 'fa fa-th-large'
                            }, {
                              name: i18n.t('static.dashboard.realmcountry'),
                              url: '/realmCountry/listRealmCountry',
                              icon: 'fa fa-globe'
                            }, {
                              name: i18n.t('static.dashboad.planningunitcountry'),
                              url: '/realmCountry/listRealmCountryPlanningUnit',
                              icon: 'fa fa-globe'
                            }]
                          },
                        ]
                      },
                      {
                        name: i18n.t('static.dashboard.realmlevelmaster'),
                        icon: 'fa fa-list',
                        children: [
                          {
                            name: i18n.t('static.dashboard.datasourcetype'),
                            url: '/dataSourceType/listDataSourceType',
                            icon: 'fa fa-table'
                          },
                          {
                            name: i18n.t('static.dashboard.datasource'),
                            url: '/dataSource/listDataSource',
                            icon: 'fa fa-database'
                          },
                          {
                            name: i18n.t('static.dashboard.fundingsource'),
                            icon: 'fa fa-bank',
                            url: '/fundingSource/listFundingSource'
                          },
                          // {
                          //   name: i18n.t('static.dashboard.subfundingsource'),
                          //   url: '/subFundingSource/listSubFundingSource',
                          //   icon: 'fa fa-building-o'
                          // },
                          {
                            name: i18n.t('static.dashboard.procurementagent'),
                            url: '/procurementAgent/listProcurementAgent',
                            icon: 'fa fa-link'
                          },
                          {
                            name: i18n.t('static.dashboard.budget'),
                            url: '/budget/listBudget',
                            icon: 'fa fa-line-chart'
                          },
                          {
                            name: i18n.t('static.dashboard.supplier'),
                            url: '/supplier/listSupplier',
                            icon: 'fa fa-industry'
                          },
                          {
                            name: i18n.t('static.dashboard.region'),
                            url: '/region/listRegion',
                            icon: 'fa fa-pie-chart'
                          },
                          {
                            name: i18n.t('static.healtharea.healtharea'),
                            url: '/healthArea/listHealthArea',
                            icon: 'fa fa-medkit'
                          },
                          {
                            name: i18n.t('static.organisation.organisation'),
                            url: '/organisation/listOrganisation',
                            icon: 'fa fa-building'
                          }
                        ]
                      },
                      {
                        name: i18n.t('static.dashboard.programmaster'),
                        url: '/program',
                        icon: 'fa fa-list',
                        children: [
                          {
                            name: i18n.t('static.dashboard.program'),
                            url: '/program/listProgram',
                            icon: 'icon-graph',
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
                          }, {
                            name: i18n.t('static.dashboard.tracercategory'),
                            url: '/tracerCategory/listTracerCategory',
                            icon: 'icon-graph'
                          },
                          // {

                          //   name: 'Product Category',
                          //   url: '/ProductCategory/AddProductCategory',
                          //   icon: 'icon-graph'
                          // },
                          {
                            name: 'Product Category',
                            url: '/productCategory/productCategoryTree',
                            icon: 'icon-graph'
                          },
                          {
                            name: i18n.t('static.dashboard.forecastingunit'),
                            url: '/forecastingUnit/listforecastingUnit',
                            icon: 'icon-graph'
                          }, {
                            name: i18n.t('static.dashboard.planningunit'),
                            url: '/planningUnit/listPlanningUnit',
                            icon: 'icon-graph'
                          }, {
                            name: i18n.t('static.dashboad.planningunitcapacity'),
                            url: '/planningUnitCapacity/listPlanningUnitcapacity',
                            icon: 'icon-graph'
                          },
                          {
                            name: i18n.t('static.procurementUnit.procurementUnit'),
                            url: '/procurementUnit/listProcurementUnit',
                            icon: 'fa fa-building'
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
                            name: 'Synchronisation',
                            url: '/program/syncPage',
                            icon: 'fa fa-download',
                          },
                          {
                            name: i18n.t('static.dashboard.program'),
                            icon: 'fa fa-list',
                            children: [
                              {
                                name: i18n.t('static.dashboard.downloadprogram'),
                                url: '/program/downloadProgram',
                                icon: 'fa fa-download',
                              },
                              {
                                name: i18n.t('static.dashboard.exportprogram'),
                                url: '/program/exportProgram',
                                icon: 'fa fa-sign-in',
                              },
                              {
                                name: i18n.t('static.dashboard.importprogram'),
                                url: '/program/importProgram',
                                icon: 'fa fa-cloud-download',
                              }
                            ]
                          },
                          {
                            name: i18n.t('static.dashboard.datasync'),
                            url: '/masterDataSync',
                            icon: 'fa fa-list',
                          },
                          {
                            name: i18n.t('static.dashboard.consumptiondetails'),
                            url: '/consumptionDetails',
                            icon: 'fa fa-list',
                          },
                          {
                            name: 'Inventory Details',
                            url: '/inventory/addInventory',
                            icon: 'fa fa-list',
                          },
                          {
                            name: 'Shipment Details',
                            url: '/shipment/addShipment',
                            icon: 'fa fa-list',
                          }
                        ]
                      }, {
                        name: i18n.t('static.dashboard.report'),
                        icon: 'fa fa-list',
                        children: [
                          {
                            name: i18n.t('static.dashboard.productcatalog'),
                            url: '/report/productCatalog',
                            icon: 'fa fa-exchange'
                          },
                          {
                            name: i18n.t('static.dashboard.consumption'),
                            url: '/report/consumption',
                            icon: 'fa fa-exchange'
                          },
                          {
                            name: i18n.t('static.dashboard.stockstatusmatrix'),
                            url: '/report/stockStatusMatrix',
                            icon: 'fa fa-exchange'
                          }
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
                      ,{
                        name: 'Program Onboarding',
                        url: '/program/programOnboarding',
                        icon: 'icon-graph'
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
                            icon: 'fa fa-long-arrow-down',
                          },
                          {
                            name: i18n.t('static.dashboard.exportprogram'),
                            url: '/program/exportProgram',
                            icon: 'fa fa-upload',
                          },
                          {
                            name: i18n.t('static.dashboard.consumptiondetails'),
                            url: '/consumptionDetails',
                            icon: 'fa fa-list',
                          },
                          {
                            name: i18n.t('static.dashboard.inventorydetails'),
                            url: '/inventory/addInventory',
                            icon: 'fa fa-list',
                          }
                        ]
                      }, {
                        name: i18n.t('static.dashboard.report'),
                        icon: 'fa fa-list',
                        children: [
                           {
                            name: i18n.t('static.dashboard.consumption'),
                            url: '/report/consumption',
                            icon: 'fa fa-exchange'
                          },
                          {
                            name: i18n.t('static.dashboard.stockstatusmatrix'),
                            url: '/report/stockStatusMatrix',
                            icon: 'fa fa-exchange'
                          }
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
            <AppBreadcrumb appRoutes={routes} />
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
                        render={props => (
                          <route.component {...props} />
                        )} />
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