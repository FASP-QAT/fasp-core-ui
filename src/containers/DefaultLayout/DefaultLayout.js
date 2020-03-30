import React, { Component, Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Container } from 'reactstrap';
import i18n from '../../i18n'
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
    if (navigator.onLine) {
      AuthenticationService.setupAxiosInterceptors();
      LogoutService.logout()
        .then(response => {
          if (response.status == 200) {
            localStorage.removeItem("token-" + AuthenticationService.getLoggedInUserId());
            localStorage.removeItem("curUser");
            // localStorage.removeItem("lang");
            this.props.history.push(`/login/static.logoutSuccess`)
          }
        }).catch(
          error => {
          }
        );
    } else {
      localStorage.removeItem("token-" + AuthenticationService.getLoggedInUserId());
      localStorage.removeItem("curUser");
      localStorage.removeItem("lang");
    }
    // this.props.history.push('/login')
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
                      {
                        name: i18n.t('static.dashboard.realmdashboard'),
                        url: '/RealmDashboard',
                        icon: 'cui-dashboard icons',
                      },
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
                            icon: 'fa fa-list-alt'
                          },
                          {
                            name: i18n.t('static.label.databaseTranslations'),
                            url: '/translations/databaseTranslations',
                            icon: 'fa fa-list-alt'
                          },
                          {
                            name: "Supply Plan",
                            url: '/supplyPlan',
                            icon: 'fa fa-list-alt'
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
                            icon: 'fa fa-list-alt'
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
                            name: i18n.t('static.dashboard.currency'),
                            url: '/currency/listCurrency',
                            icon: 'fa fa-money'
                          },
                          {
                            name: 'Dimension',
                            url: '/diamension/diamensionlist',
                            icon: 'fa fa-map'
                          }
                          ,
                          {
                            name: 'Realm',
                            url: '/realm/realmlist',
                            icon: 'fa fa-th-large'
                          },
                        ]
                      },
                      {
                        name: i18n.t('static.dashboard.realmmaster'),
                        icon: 'fa fa-list',
                        children: [

                          {
                            name: i18n.t('static.dashboard.fundingsource'),
                            icon: 'fa fa-bank',
                            url: '/fundingSource/listFundingSource'
                          },
                          {
                            name: i18n.t('static.dashboard.subfundingsource'),
                            url: '/subFundingSource/listSubFundingSource',
                            icon: 'fa fa-building-o'
                          },
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
                            name: i18n.t('static.dashboard.manufacturer'),
                            url: '/manufacturer/listManufacturer',
                            icon: 'fa fa-industry'
                          },
                          {
                            name: i18n.t('static.dashboard.region'),
                            url: '/region/listRegion',
                            icon: 'fa fa-pie-chart'
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
                            url: '/program',
                            icon: 'icon-graph',
                            children: [
                              {
                                name: i18n.t('static.dashboard.addprogram'),
                                url: '/program/addProgram',
                                icon: 'icon-pencil',
                              },
                              {
                                name: i18n.t('static.dashboard.listprogram'),
                                url: '/program/listProgram',
                                icon: 'fa fa-object-group',
                              },
                            ]
                          },
                          {
                            name: i18n.t('static.dashboard.product'),
                            url: '/product',
                            icon: 'icon-graph',
                            children: [
                              {
                                name: i18n.t('static.dashboard.addproduct'),
                                url: '/product/addProduct',
                                icon: 'icon-pencil',
                              },
                              {
                                name: i18n.t('static.dashboard.listproduct'),
                                url: '/product/listProduct',
                                icon: 'fa fa-th-large',
                              },
                            ]
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
                                icon: 'fa fa-upload',
                              },
                              {
                                name: i18n.t('static.dashboard.importprogram'),
                                url: '/program/importProgram',
                                icon: 'fa fa-long-arrow-down',
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
                        ]
                      }
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
                            name: i18n.t('static.dashboard.downloadprogram'),
                            url: '/program/downloadProgram',
                            icon: 'fa fa-download',
                          },
                          {
                            name: i18n.t('static.dashboard.exportprogram'),
                            url: '/program/exportProgram',
                            icon: 'fa fa-upload',
                          },
                          {
                            name: i18n.t('static.dashboard.importprogram'),
                            url: '/program/importProgram',
                            icon: 'fa fa-long-arrow-down',
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
