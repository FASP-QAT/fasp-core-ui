import { AppNavbarBrand, AppSidebarToggler } from '@coreui/react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Alert, Col, Nav, NavItem, Row } from 'reactstrap';
import QAT from '../../assets/img/brand/QAT-minimize.png';
import imageNotificationCount from '../../assets/img/icons-truck.png';
import logo from '../../assets/img/QAT-logo.png';
import imageUsermanual from '../../assets/img/User-manual-icon.png';
import ShowGuidanceImg from '../../assets/img/ShowGuidance.png';
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions';
import { API_URL, INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants';
import i18n from '../../i18n';
import AuthenticationService from '../../views/Common/AuthenticationService';
import DefaultHeaderDropdown from './DefaultHeaderDropdown';
import eventBus from './eventBus.js'
import CryptoJS from 'crypto-js'
import ProgramService from "../../api/ProgramService"

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultHeader extends Component {
  constructor(props) {
    super(props);
    this.changeLanguage = this.changeLanguage.bind(this);
    this.refreshPage = this.refreshPage.bind(this);
  }

  refreshPage() {
    setTimeout(() => {
      window.location.reload(false);
    }, 0);
  }

  changeLanguage(lang) {
    localStorage.setItem('lang', lang);
    i18n.changeLanguage(lang)
    window.location.reload(false);
  }

  componentDidMount() {

  }

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
        {/* <Nav className="d-md-down-none" navbar>
          <NavItem className="px-3">
            <NavLink to="/dashboard" className="nav-link" >Application Dashboard</NavLink>
          </NavItem>
         
        </Nav> */}
        <Nav className="" navbar>


          {/*          <NavItem className="px-3">
            <NavLink to="/dashboard" className="nav-link" >{i18n.t('static.common.dashboard')}</NavLink>
    </NavItem>*/}
          <NavItem className="px-3">
            {console.log("Inside header called---", this)}
            <NavLink to="#" onClick={this.refreshPage} className={this.props.activeModule == 2 ? "nav-link titleColorModule1" : "nav-link titleColorModule2"} ><b>{this.props.activeModule == 2 ? i18n.t('static.module.supplyPlanningModule') : i18n.t('static.module.forecastingModule')}</b><br></br><b>{this.props.title}</b></NavLink>
          </NavItem>
        </Nav>
        <Nav className="ml-auto " navbar>

          {/* <div className="box-role d-none d-sm-block"><i className="icon-user-follow "></i> */}
          {/* <span><b>
          {AuthenticationService.getLoggedInUsername() ? AuthenticationService.getLoggedInUsername() : "Unknown"}
          </b></span> */}
          {/* <br></br><span>
              <small>{AuthenticationService.getLoggedInUserRole() ? AuthenticationService.getLoggedInUserRole() : "Unknown"}</small>
            </span> */}
          {/* </div> */}
          {/* <UncontrolledDropdown nav direction="down" className="lang-btn">
            <DropdownToggle nav className="nav-link-lng">

              {localStorage.getItem('lang').toString() == 'undefined' ? 'en' : localStorage.getItem('lang').toString()}
              &nbsp;<i className="fa fa-caret-down"></i>
            </DropdownToggle >
            <DropdownMenu right>
              <DropdownItem onClick={this.changeLanguage.bind(this, 'en')}> {i18n.t('static.language.english')}</DropdownItem>
              <DropdownItem onClick={this.changeLanguage.bind(this, 'sp')}> {i18n.t('static.language.spanish')}</DropdownItem>
              <DropdownItem onClick={this.changeLanguage.bind(this, 'fr')}> {i18n.t('static.language.french')}</DropdownItem>
              <DropdownItem onClick={this.changeLanguage.bind(this, 'pr')}> {i18n.t('static.language.Portuguese')}</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown> */}

          {checkOnline === 'Online' && AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANUAL_TAGGING') && this.props.activeModule == 2 &&
            <NavItem className="">
              <NavLink to="#" className="nav-link">
                {this.props.notificationCount > 0 && <span class="badge badge-danger" style={{ 'zIndex': '6' }}>{this.props.notificationCount}</span>}
                <img src={imageNotificationCount} onClick={this.props.shipmentLinkingAlerts} className="HomeIcon icon-anim-pulse text-primary" title={i18n.t('static.mt.shipmentLinkingNotification')} style={{ width: '30px', height: '30px', marginTop: '-1px' }} />
              </NavLink>
            </NavItem>}
          <DefaultHeaderDropdown mssgs />

          {/* <NavItem className="">
            <NavLink to="#" className="nav-link">
              <img src={imageUsermanual} className="HelpIcon" title={i18n.t('static.user.changesInLocalVersion')} />
            </NavLink>
          </NavItem> */}
          {checkOnline === 'Online' && this.props.activeModule == 2 &&
            AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_DOWNLOAD_PROGARM') &&
            <NavItem className="">
              <NavLink to="#" className="nav-link">
                {localStorage.getItem("sesLatestProgram") == "true" &&
                  // <img src={iconsDownarrowRed} className="HelpIcon" onClick={this.props.latestProgram} title={i18n.t('static.header.notLatestVersion')} style={{ width: '30px', height: '30px' }} />
                  <i class="nav-icon cui-cloud-download icons" onClick={this.props.latestProgram} title={i18n.t('static.header.notLatestVersion')} style={{ fontSize: '25px', paddingTop: '5px', color: '#BA0C2F',lineHeight:'57px' }} ></i>
                }
                {/* {localStorage.getItem("sesLatestProgram") == "false" &&
                  <img src={iconsDownarrowBlue} className="HelpIcon" onClick={this.props.latestProgram} title={i18n.t('static.header.notLatestVersion')} style={{ width: '30px', height: '30px' }} />} */}
                {localStorage.getItem("sesLatestProgram") == "false" && <i class="nav-icon cui-cloud-download icons" onClick={this.props.latestProgram} title={i18n.t('static.header.notLatestVersion')} style={{ fontSize: '25px', paddingTop: '5px', color: '#a7c6ed',lineHeight:'57px' }} ></i>}
              </NavLink>
            </NavItem>
          }
          {/* <Online> */}
          {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_COMMIT_VERSION') && this.props.activeModule == 2 &&
            <NavItem className="">
              <NavLink to="#" className="nav-link">
                {console.log("localStorage.getItem(sesLocalVersionChange)----" + this.props.changeIcon)}

                {this.props.changeIcon &&
                  // <img src={iconsUparrowRed} className="HelpIcon" onClick={this.props.commitProgram} title={i18n.t('static.header.changesInLocalVersion')} style={{ width: '30px', height: '30px' }} />
                  <i class="nav-icon cui-cloud-upload icons" onClick={this.props.commitProgram} title={i18n.t('static.header.changesInLocalVersion')} style={{ fontSize: '25px', paddingTop: '2px', paddingLeft: '5px', color: '#BA0C2F',lineHeight:'57px' }}></i>

                }
                {!this.props.changeIcon &&
                  // <img src={iconsUparrowBlue} className="HelpIcon" onClick={this.props.commitProgram} title={i18n.t('static.header.changesInLocalVersion')} style={{ width: '30px', height: '30px' }} />
                  <i class="nav-icon cui-cloud-upload icons" onClick={this.props.commitProgram} title={i18n.t('static.header.changesInLocalVersion')} style={{ fontSize: '25px', paddingTop: '2px', paddingLeft: '5px', color: '#a7c6ed',lineHeight:'57px' }}></i>

                }
              </NavLink>
            </NavItem>
          }


          {/*Forecast Module*/}
          {checkOnline === 'Online' && this.props.activeModule == 1 &&
            AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_DOWNLOAD_PROGARM') &&
            <NavItem className="">
              <NavLink to="#" className="nav-link">
                {localStorage.getItem("sesLatestProgram") == "true" &&
                  // <img src={iconsDownarrowRed} className="HelpIcon" onClick={this.props.latestProgram} title={i18n.t('static.header.notLatestVersion')} style={{ width: '30px', height: '30px' }} />
                  <i class="nav-icon cui-cloud-download icons" onClick={this.props.latestProgram} title={i18n.t('static.header.notLatestVersion')} style={{ fontSize: '25px', paddingTop: '5px', color: '#BA0C2F',lineHeight:'57px' }} ></i>
                }
                {/* {localStorage.getItem("sesLatestProgram") == "false" &&
                  <img src={iconsDownarrowBlue} className="HelpIcon" onClick={this.props.latestProgram} title={i18n.t('static.header.notLatestVersion')} style={{ width: '30px', height: '30px' }} />} */}
                {localStorage.getItem("sesLatestProgram") == "false" && <i class="nav-icon cui-cloud-download icons" onClick={this.props.latestProgram} title={i18n.t('static.header.notLatestVersion')} style={{ fontSize: '25px', paddingTop: '5px', color: '#a7c6ed',lineHeight:'57px' }} ></i>}
              </NavLink>
            </NavItem>
          }
          {/* <Online> */}
          {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_COMMIT_VERSION') && this.props.activeModule == 1 &&
            <NavItem className="">
              <NavLink to="#" className="nav-link">
                {console.log("localStorage.getItem(sesLocalVersionChange)----" + this.props.changeIcon)}

                {this.props.changeIcon &&
                  // <img src={iconsUparrowRed} className="HelpIcon" onClick={this.props.commitProgram} title={i18n.t('static.header.changesInLocalVersion')} style={{ width: '30px', height: '30px' }} />
                  <i class="nav-icon cui-cloud-upload icons" onClick={this.props.commitProgram} title={i18n.t('static.header.changesInLocalVersion')} style={{ fontSize: '25px', paddingTop: '2px', paddingLeft: '5px', color: '#BA0C2F',lineHeight:'57px' }}></i>

                }
                {!this.props.changeIcon &&
                  // <img src={iconsUparrowBlue} className="HelpIcon" onClick={this.props.commitProgram} title={i18n.t('static.header.changesInLocalVersion')} style={{ width: '30px', height: '30px' }} />
                  <i class="nav-icon cui-cloud-upload icons" onClick={this.props.commitProgram} title={i18n.t('static.header.changesInLocalVersion')} style={{ fontSize: '25px', paddingTop: '2px', paddingLeft: '5px', color: '#a7c6ed',lineHeight:'57px' }}></i>

                }
              </NavLink>
            </NavItem>
          }
          {/* </Online> */}
          {/* <NavItem className="">
            <span className="nav-link">
              <a href={"../../../../src/ShowGuidanceHtmlFile/ShowGuidance.html"} target="_blank">
              <i class="nav-icon fa fa-compass ShowGuidanceIcon" title={'Show Guidance'}></i>
              </a>
            </span>
          </NavItem> */}

          <NavItem className="">
            <span className="nav-link">
              <a href={localStorage.getItem('lang') == 'en' ?
                "../../../../src/ShowGuidanceHtmlFile/ShowGuidanceEn.html" :
                localStorage.getItem('lang') == 'fr' ?
                  "../../../../src/ShowGuidanceHtmlFile/ShowGuidanceFr.html" :
                  localStorage.getItem('lang') == 'sp' ?
                    "../../../../src/ShowGuidanceHtmlFile/ShowGuidanceSp.html" :
                    "../../../../src/ShowGuidanceHtmlFile/ShowGuidancePr.html"
              } target="_blank">
                {/* <i class="nav-icon fa fa-compass ShowGuidanceIcon" title={'Show Guidance'}></i> */}
                <img src={ShowGuidanceImg} className="HelpIcon" title={'Show Guidance'} style={{ width: '25px', height: '25px' }} />
              </a>
            </span>
          </NavItem>

          <NavItem className="">
            <span className="nav-link">
              <a href={`${API_URL}/file/qatUserGuide`}>
                <img src={imageUsermanual} className="HelpIcon" title={i18n.t('static.user.usermanual')} style={{ width: '30px', height: '30px' }} />
              </a>
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
          {/* <DefaultHeaderDropdown /> */}
          <DefaultHeaderDropdown onLogout={this.props.onLogout} accnt onChangePassword={this.props.onChangePassword} onChangeDashboard={this.props.onChangeDashboard} shipmentLinkingAlerts={this.props.shipmentLinkingAlerts} latestProgram={this.props.latestProgram} commitProgram={this.props.commitProgram} />
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
