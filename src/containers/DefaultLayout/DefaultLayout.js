import React, { Component, Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Container } from 'reactstrap';
import i18n from './../../i18n'
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
import AuthenticationService from '../../views/common/AuthenticationService.js';

const DefaultAside = React.lazy(() => import('./DefaultAside'));
const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));

class DefaultLayout extends Component {
  loading = () => <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>;
  changePassword(e) {
    console.log("----------------123-----------------")
    e.preventDefault();
    console.log("----------------4567-----------------")
    AuthenticationService.setupAxiosInterceptors();
    this.props.history.push(`/changePassword`);
  }
  signOut(e) {
    e.preventDefault();
    console.log("sign out called---");
    AuthenticationService.setupAxiosInterceptors();
    console.log("interceptors set up---");
    LogoutService.logout()
      .then(response => {
        console.log("logout response---", response);
        if (response.status == 200) {
          localStorage.removeItem("token-" + AuthenticationService.getLoggedInUserId());
          this.props.history.push(`/login/static.logoutSuccess`)
        }
      }).catch(
        error => {
          console.log("logout error---", error);
        }
      );
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
              <AppSidebarNav navConfig={{items: [
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
      name: i18n.t('static.dashboard.healtharea') ,
      url: '/healthArea',
      icon: 'icon-speedometer',
      children: [
        {
          name: i18n.t('static.dashboard.addhealtharea'),
          url: '/healthArea/addHealthArea',
          icon: 'fa fa-code'
        }
      ]
    },
    {
      name: i18n.t('static.dashboard.applicationmaster') ,
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
          icon: 'fa fa-list-alt'
        },
        {
          name:  i18n.t('static.dashboard.language'),
          url: '/language/listLanguage',
          icon: 'fa fa-list-alt'
        },
        {
          name: i18n.t('static.dashboard.country'),
          url: '/country/listCountry',
          icon: 'fa fa-list-alt'
        },
        {
          name: i18n.t('static.dashboard.datasourcetype'),
          url: '/dataSourceType/listDataSourceType',
          icon: 'fa fa-list-alt'
        },
        {
          name: i18n.t('static.dashboard.datasource') ,
          url: '/dataSource/listDataSource',
          icon: 'fa fa-list-alt'
        },
        {
          name:  i18n.t('static.dashboard.currency'),
          url: '/currency/listCurrency',
          icon: 'fa fa-list-alt'
        }
      ]
    },
    {
      name: i18n.t('static.dashboard.realmmaster') ,
      icon: 'fa fa-list',
      children: [
        {
          name: i18n.t('static.dashboard.realmcountry') ,
          icon: 'fa fa-bank',
          url: '/realmCountry/listRealmCountry'
        },
        {
          name: i18n.t('static.dashboard.fundingsource'),
          icon: 'fa fa-bank',
          url: '/fundingSource/listFundingSource'
        },
        {
          name: i18n.t('static.dashboard.subfundingsource') ,
          url: '/subFundingSource/listSubFundingSource',
          icon: 'fa fa-bank'
        },
        {
          name: i18n.t('static.dashboard.procurementagent') ,
          url: '/procurementAgent/listProcurementAgent',
          icon: 'fa fa-user'
        },
        {
          name:  i18n.t('static.dashboard.budget'),
          url: '/budget/listBudget',
          icon: 'fa fa-money'
        },
        {
          name: i18n.t('static.dashboard.manufacturer') ,
          url: '/manufacturer/listManufacturer',
          icon: 'fa fa-industry'
        },
        {
          name: i18n.t('static.dashboard.region'),
          url: '/region/listRegion',
          icon: 'fa fa-globe'
        }
      ]
    },
    {
      name: i18n.t('static.dashboard.programmaster') ,
      url: '/program',
      icon: 'icon-graph',
      children: [
        {
          name:  i18n.t('static.dashboard.program'),
          url: '/program',
          icon: 'icon-graph',
          children: [
            {
              name: i18n.t('static.dashboard.addprogram') ,
              url: '/program/addProgram',
              icon: 'icon-pencil',
            },
            {
              name: i18n.t('static.dashboard.listprogram') ,
              url: '/program/listProgram',
              icon: 'icon-list',
            }
          ]
        },
        {
          name:  i18n.t('static.dashboard.product'),
          url: '/product',
          icon: 'icon-graph',
          children: [
            {
              name: i18n.t('static.dashboard.addproduct') ,
              url: '/product/addProduct',
              icon: 'icon-pencil',
            },
            {
              name: i18n.t('static.dashboard.listproduct') ,
              url: '/product/listProduct',
              icon: 'icon-list',
            }
          ]
        },

            //     {
    //       name: i18n.t('static.dashboard.programproduct'),
    //       url: '/programProduct',
    //       icon: 'icon-graph',
    //       children: [
    //         {
    //           name:  i18n.t('static.dashboard.addprogramproduct'),
    //           url: '/programProduct/addProgramProduct',
    //           icon: 'icon-pencil',
    //         },
    //         {
    //           name: i18n.t('static.dashboard.listprogramproduct'),
    //           url: '/programProduct/listProgramProduct',
    //           icon: 'icon-list',
    //         }
    //       ]
    //     },
    //     {
    //       name: i18n.t('static.dashboard.productcategory') ,
    //       url: '/productCategory',
    //       icon: 'icon-graph',
    //       children: [
    //         {
    //           name: i18n.t('static.dashboard.addproductcategory') ,
    //           url: '/productCategory/addProductCategory',
    //           icon: 'icon-pencil',
    //         }
    //       ]
    //     }
       ]
     },
    {
      name: i18n.t('static.dashboard.program') ,
      icon: 'fa fa-list',
      children: [
        {
          name: i18n.t('static.dashboard.downloadprogram') ,
          url: '/program/downloadProgram',
          icon: 'fa fa-code',
        },
        {
          name: i18n.t('static.dashboard.exportprogram') ,
          url: '/program/exportProgram',
          icon: 'fa fa-code',
        },
        {
          name: i18n.t('static.dashboard.importprogram'),
          url: '/program/importProgram',
          icon: 'fa fa-code',
        }
      ]
    },
    {
      name:  i18n.t('static.dashboard.datasync'),
      url: '/masterDataSync',
      icon: 'icon-speedometer',
    },
    {
      name: i18n.t('static.dashboard.consumptiondetails') ,
      url: '/consumptionDetails',
      icon: 'icon-speedometer',
    },
  ]}} {...this.props} />
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
