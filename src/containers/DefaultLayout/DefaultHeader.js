import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Nav, NavItem, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import PropTypes from 'prop-types';

import { AppAsideToggler, AppNavbarBrand, AppSidebarToggler } from '@coreui/react';
import DefaultHeaderDropdown from './DefaultHeaderDropdown'
import logo from '../../assets/img/QAT-logo.png'
import QAT from '../../assets/img/brand/QAT-minimize.png'
import i18n from '../../i18n'
import { Online, Offline } from 'react-detect-offline';
import AuthenticationService from '../../views/Common/AuthenticationService';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultHeader extends Component {
  constructor(props) {
    super(props);
    this.changeLanguage = this.changeLanguage.bind(this)
  }
  changeLanguage(lang) {
    localStorage.setItem('lang', lang);
    i18n.changeLanguage(lang)
    window.location.reload(false);
  }
  render() {

    // eslint-disable-next-line
    const { children, ...attributes } = this.props;

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
            <NavLink to="#" className="nav-link" ><b>{this.props.title}</b></NavLink>
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
          <DefaultHeaderDropdown mssgs/>
          <NavItem className="">
            <NavLink to="#" className="nav-link">
              <span className="icon-wrapper icon-wrapper-alt rounded-circle ">
                <span className="icon-wrapper-bg "></span>
                <i className="cui-home icons HomeIcon   icon-anim-pulse text-primary " onClick={this.props.onChangeDashboard} title={i18n.t('static.common.viewDashBoard')}></i>
              </span>
            </NavLink>
          </NavItem>
          {/* <DefaultHeaderDropdown /> */}
          <DefaultHeaderDropdown onLogout={this.props.onLogout} accnt onChangePassword={this.props.onChangePassword} onChangeDashboard={this.props.onChangeDashboard} />
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
