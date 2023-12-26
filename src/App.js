import React, { Component } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import 'react-app-polyfill/stable';
import { withTranslation } from "react-i18next";
import './App.scss';
import i18n from './i18n';
const loading = () => <div className="animated fadeIn pt-3 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>;
const DefaultLayout = React.lazy(() => import('./containers/DefaultLayout/DefaultLayout.js'));
const Login = React.lazy(() => import('./views/Pages/Login/Login.js'));
const UserAgreement = React.lazy(() => import('./views/User/UserAgreement'));
// const Register = React.lazy(() => import('./views/Pages/Register'));
const Page404 = React.lazy(() => import('./views/Pages/Page404/Page404.js'));
const ForgotPassword = React.lazy(() => import('./views/Pages/Login/ForgotPasswordComponent'));
const MasterDataSync = React.lazy(() => import('./views/SyncMasterData/SyncMasterData'));
const MasterDataSyncForTree = React.lazy(() => import('./views/SyncMasterData/SyncMasterDataForTree'));
const SyncProgram = React.lazy(() => import('./views/SyncMasterData/SyncProgram'));
const UpdateExpiredPassword = React.lazy(() => import('./views/Pages/Login/UpdateExpiredPasswordComponent'));
const ResetPassword = React.lazy(() => import('./views/Pages/Login/ResetPasswordComponent'));
const Page500 = React.lazy(() => import('./views/Pages/Page500/Page500.js'));
const PageError = React.lazy(() => import('./views/Pages/PageError/PageError.js'));
class App extends Component {
  componentDidMount() {
  }
  render() {
    return (
      <HashRouter>
        <React.Suspense fallback={loading()}>
          <Switch>
            <Route exact path="/login" name="Login Page" render={props => <Login {...props} />} />
            <Route exact path="/login/:message" name="Login Page" render={props => <Login {...props} />} />
            {/* <Route exact path="/register" name="Register Page" render={props => <Register {...props} />} /> */}
            <Route exact path="/404" name="Page 404" render={props => <Page404 {...props} />} />
            <Route exact path="/500" name="Page 500" render={props => <Page500 {...props} />} />
            <Route exact path="/error" name="Page Error" render={props => <PageError {...props} />} />
            <Route exact path="/error/:message" name="Page Error" render={props => <PageError {...props} />} />
            <Route exact path="/forgotPassword" name="Forgot Password" render={props => <ForgotPassword {...props} />} />
            <Route exact path="/masterDataSync" name="Master data sync" render={props => <MasterDataSync {...props} />} />
            <Route exact path="/masterDataSync/:color/:message" name="Master data sync" render={props => <MasterDataSync {...props} />} />
            <Route exact path="/masterDataSyncForTree" name="Master data sync" render={props => <MasterDataSyncForTree {...props} />} />
            <Route exact path="/syncProgram/:color/:message" name="Sync Program" render={props => <SyncProgram {...props} />} />
            <Route exact path="/syncProgram" name="Sync Program" render={props => <SyncProgram {...props} />} />
            <Route exact path="/updateExpiredPassword" name="Update expired password" render={props => <UpdateExpiredPassword {...props} />} />
            <Route exact path="/resetPassword/:emailId/:token" name="Reset password" render={props => <ResetPassword {...props} />} />
            <Route exact path="/userAgreement" render={props => <UserAgreement {...props} />} />
            <Route path="/" name={i18n.t('static.home')} render={props => <DefaultLayout {...props} />} />
          </Switch>
        </React.Suspense>
      </HashRouter>
    );
  }
}
export default withTranslation('translations')(App);
