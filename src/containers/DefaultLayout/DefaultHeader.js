import { AppNavbarBrand, AppSidebarToggler, CFormSwitch } from '@coreui/react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Nav, NavItem } from 'reactstrap';
import logo from '../../assets/img/QAT-logo.png';
import ShowGuidanceImg from '../../assets/img/ShowGuidance.png';
import imageUsermanual from '../../assets/img/User-manual-icon.png';
import QAT from '../../assets/img/brand/QAT-minimize.png';
import imageNotificationCount from '../../assets/img/icons-truck.png';
import i18n from '../../i18n';
import AuthenticationService from '../../views/Common/AuthenticationService';
import DefaultHeaderDropdown from './DefaultHeaderDropdown';
const propTypes = {
  children: PropTypes.node,
};
const defaultProps = {};
/**
 * Component representing the default header of the application.
 * This header includes navigation links, logo, language switcher, user manual link, refresh button, and user actions dropdown.
 */
class DefaultHeader extends Component {
  constructor(props) {
    super(props);
    this.changeLanguage = this.changeLanguage.bind(this);
    this.refreshPage = this.refreshPage.bind(this);
  }
  /**
   * Refreshes the page by reloading the window.
   */
  refreshPage() {
    setTimeout(() => {
      window.location.reload(false);
    }, 0);
  }
  /**
   * Changes the language of the application and reloads the window.
   * @param {string} lang - The language code to switch to.
   */
  changeLanguage(lang) {
    localStorage.setItem('lang', lang);
    i18n.changeLanguage(lang)
    window.location.reload(false);
  }
  /**
   * Renders the DefaultHeader component.
   * @returns {JSX.Element} The rendered JSX element.
   */
  render() {
    // eslint-disable-next-line
    const { children, ...attributes } = this.props;
    const checkOnline = localStorage.getItem('sessionType');
    return (
      <React.Fragment>
        <AppSidebarToggler className="d-lg-none" display="md" mobile />
        <NavLink to="#" >
          <AppNavbarBrand onClick={this.props.onChangeDashboard}
            full={{ src: logo, width: 180, height: 50, alt: 'QAT Logo' }}
            minimized={{ src: QAT, width: 50, height: 50, alt: 'QAT Logo' }}
          />
        </NavLink>
        <AppSidebarToggler className="d-md-down-none" display="lg" />
        <Nav className="" navbar>
          <NavItem className="px-3">
            <NavLink to="#" onClick={this.refreshPage} className={this.props.activeModule == 2 ? "nav-link titleColorModule1" : "nav-link titleColorModule2"} ><b>{this.props.activeModule == 2 ? i18n.t('static.module.supplyPlanningModule') : i18n.t('static.module.forecastingModule')}</b><br></br><b>{this.props.title}</b></NavLink>
          </NavItem>
        </Nav>
        <Nav className="ml-auto " navbar>
          {checkOnline === 'Online' && AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANUAL_TAGGING') && this.props.activeModule == 2 &&
            <NavItem className="">
              <NavLink to="#" className="nav-link">
                {this.props.notificationCount > 0 && <span class="badge badge-danger" style={{ 'zIndex': '6', marginTop: '-17px' }}>{this.props.notificationCount}</span>}
                <img src={imageNotificationCount} onClick={this.props.shipmentLinkingAlerts} className="HomeIcon icon-anim-pulse text-primary" title={i18n.t('static.mt.shipmentLinkingNotification')} style={{ width: '30px', height: '30px', marginTop: '4px' }} />
              </NavLink>
            </NavItem>}
          <DefaultHeaderDropdown mssgs />
          {checkOnline==='Online' && this.props.activeModule == 2 && <span class="badge badge-danger" style={{ 'zIndex': '6', marginTop: '-17px', marginLeft: '-13px' }}>{this.props.openIssues}</span>}
          {checkOnline === 'Online' && this.props.activeModule == 2 &&
            AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_DOWNLOAD_PROGARM') &&
            <NavItem className="">
              <NavLink to="#" className="nav-link">
                {localStorage.getItem("sesLatestProgram") == "true" &&
                  <i class="nav-icon cui-cloud-download icons" onClick={this.props.latestProgram} title={i18n.t('static.header.notLatestVersion')} style={{ fontSize: '25px', paddingTop: '5px', color: '#BA0C2F', lineHeight: '57px' }} ></i>
                }
                {localStorage.getItem("sesLatestProgram") == "false" && <i class="nav-icon cui-cloud-download icons" onClick={this.props.latestProgram} title={i18n.t('static.header.notLatestVersion')} style={{ fontSize: '25px', paddingTop: '5px', color: '#a7c6ed', lineHeight: '57px' }} ></i>}
              </NavLink>
            </NavItem>
          }
          {checkOnline === 'Online' && AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_COMMIT_VERSION') && this.props.activeModule == 2 &&
            <NavItem className="">
              <NavLink to="#" className="nav-link">
                {this.props.changeIcon &&
                  <i class="nav-icon cui-cloud-upload icons" onClick={this.props.commitProgram} title={i18n.t('static.header.changesInLocalVersion')} style={{ fontSize: '25px', paddingTop: '2px', paddingLeft: '5px', color: '#BA0C2F', lineHeight: '57px' }}></i>
                }
                {!this.props.changeIcon &&
                  <i class="nav-icon cui-cloud-upload icons" onClick={this.props.commitProgram} title={i18n.t('static.header.changesInLocalVersion')} style={{ fontSize: '25px', paddingTop: '2px', paddingLeft: '5px', color: '#a7c6ed', lineHeight: '57px' }}></i>
                }
              </NavLink>
            </NavItem>
          }
          {checkOnline==='Online' && this.props.activeModule == 1 && <span class="badge badge-danger" style={{ 'zIndex': '6', marginTop: '-17px', marginLeft: '-13px' }}>{this.props.openIssues}</span>}
          {checkOnline === 'Online' && this.props.activeModule == 2 && <span class="badge badge-danger" style={{ 'zIndex': '6', marginTop: '-17px', marginLeft: '-13px' }}>{this.props.programModifiedCount}</span>}
          {checkOnline === 'Online' && this.props.activeModule == 1 &&
            AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_LOAD_DELETE_DATASET') &&
            <NavItem className="">
              <NavLink to="#" className="nav-link">
                {localStorage.getItem("sesLatestDataset") == "true" &&
                  <i class="nav-icon cui-cloud-download icons" onClick={this.props.latestProgramFC} title={i18n.t('static.header.notLatestVersion')} style={{ fontSize: '25px', paddingTop: '5px', color: '#BA0C2F', lineHeight: '57px' }} ></i>
                }
                {localStorage.getItem("sesLatestDataset") == "false" && <i class="nav-icon cui-cloud-download icons" onClick={this.props.latestProgramFC} title={i18n.t('static.header.notLatestVersion')} style={{ fontSize: '25px', paddingTop: '5px', color: '#a7c6ed', lineHeight: '57px' }} ></i>}
              </NavLink>
            </NavItem>
          }
          {checkOnline === 'Online' && AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_COMMIT_DATASET') && this.props.activeModule == 1 &&
            <NavItem className="">
              <NavLink to="#" className="nav-link">
                {this.props.fuChangeIcon &&
                  <i class="nav-icon cui-cloud-upload icons" onClick={this.props.commitProgramFC} title={i18n.t('static.header.changesInLocalVersion')} style={{ fontSize: '25px', paddingTop: '2px', paddingLeft: '5px', color: '#BA0C2F', lineHeight: '57px' }}></i>
                }
                {!this.props.fuChangeIcon &&
                  <i class="nav-icon cui-cloud-upload icons" onClick={this.props.commitProgramFC} title={i18n.t('static.header.changesInLocalVersion')} style={{ fontSize: '25px', paddingTop: '2px', paddingLeft: '5px', color: '#a7c6ed', lineHeight: '57px' }}></i>
                }
              </NavLink>
            </NavItem>
          }
          {checkOnline === 'Online' && this.props.activeModule == 1 && <span class="badge badge-danger" style={{ 'zIndex': '6', marginTop: '-17px', marginLeft: '-13px' }}>{this.props.programDatasetModifiedCount}</span>}
          {this.props.activeModule == 1 && <NavItem className="">
            <span className="nav-link">
              <a href={localStorage.getItem('lang') == 'en' ?
                "../../../../ShowGuidanceEn.html" :
                localStorage.getItem('lang') == 'fr' ?
                  "../../../../ShowGuidanceFr.html" :
                  localStorage.getItem('lang') == 'sp' ?
                    "../../../../ShowGuidanceSp.html" :
                    "../../../../ShowGuidancePr.html"
              } target="_blank">
                <img src={ShowGuidanceImg} className="HelpIcon" title={i18n.t('static.common.showGuidance')} style={{ width: '25px', height: '25px' }} />
              </a>
            </span>
          </NavItem>
          }
          {checkOnline === 'Online' && <NavItem className="">
            <span className="nav-link">
              <a href={`https://api.quantificationanalytics.org/file/qatUserGuide`}>
                <img src={imageUsermanual} className="HelpIcon" title={i18n.t('static.user.usermanual')} style={{ width: '30px', height: '30px' }} />
              </a>
            </span>
          </NavItem>}
          <NavItem className="" title={i18n.t('static.common.refreshPage')}>
            <span className="nav-link">
              <svg onClick={this.refreshPage} style={{ cursor: 'pointer', width: '28px', height: '28px', color: '#a7c6ed' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon icon-xxl" role="img"><path fill="var(--ci-primary-color, currentColor)" d="M265.614,206.387H456V16H424V149.887L397.863,123.75c-79.539-79.539-208.96-79.54-288.5,0s-79.539,208.96,0,288.5a204.232,204.232,0,0,0,288.5,0l-22.627-22.627c-67.063,67.063-176.182,67.063-243.244,0s-67.063-176.183,0-243.246,176.182-67.063,243.245,0l28.01,28.01H265.614Z" class="ci-primary"></path></svg>
            </span>
          </NavItem>
          <NavItem className="">
            <NavLink to="#" className="nav-link">
              <span className="icon-wrapper icon-wrapper-alt rounded-circle ">
                <span className="icon-wrapper-bg"></span>
                <i className="cui-home icons HomeIcon   icon-anim-pulse text-primary " onClick={this.props.onChangeDashboard} title={i18n.t('static.common.viewDashBoard')}></i>
              </span>
            </NavLink>
          </NavItem>
          <DefaultHeaderDropdown onLogout={this.props.onLogout} accnt onChangePassword={this.props.onChangePassword} onChangeDashboard={this.props.onChangeDashboard} shipmentLinkingAlerts={this.props.shipmentLinkingAlerts} latestProgram={this.props.latestProgram} commitProgram={this.props.commitProgram} goOffline={this.props.goOffline} goOnline={this.props.goOnline} logout={this.props.logout} item={this.props.activeModule}/>
          <NavItem className="">
            <NavLink to="#" className="nav-link">
              <span className="icon-wrapper icon-wrapper-alt rounded-circle ">
                <span className="icon-wrapper-bg "></span>
                <i className="cui-account-logout icons   icon-anim-pulse text-primary " onClick={this.props.onLogout} title={i18n.t('static.common.logout')}></i>
              </span>
            </NavLink>
          </NavItem>
        </Nav>
      </React.Fragment>
    );
  }
}
DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;
export default DefaultHeader;
