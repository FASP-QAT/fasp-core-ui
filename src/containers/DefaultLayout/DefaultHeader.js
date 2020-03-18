import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Nav, NavItem ,UncontrolledDropdown,DropdownToggle,DropdownMenu,DropdownItem} from 'reactstrap';
import PropTypes from 'prop-types';

import { AppAsideToggler, AppNavbarBrand, AppSidebarToggler } from '@coreui/react';
import DefaultHeaderDropdown from './DefaultHeaderDropdown'
import logo from '../../assets/img/brand/logo.svg'
// import QAT from '../../assets/img/brand/QAT.svg'

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultHeader extends Component {
  constructor(props){
    super(props);
    this.changeLanguage=this.changeLanguage.bind(this)
  }
  changeLanguage(lang ) {
   
  localStorage.setItem('lang',lang);
  window.location.reload();
  }
  render() {

    // eslint-disable-next-line
    const { children, ...attributes } = this.props;

    return (
      <React.Fragment>
        <AppSidebarToggler className="d-lg-none" display="md" mobile />
        <AppNavbarBrand
          full={{ src: logo, width: 160, height: 200, alt: 'QAT Logo' }}
          // minimized={{ src: QAT, width: 30, height: 30, alt: 'QAT Logo' }}
        />
        <AppSidebarToggler className="d-md-down-none" display="lg" />
        <Nav className="d-md-down-none" navbar>
          {/* <NavItem className="px-3">
            <NavLink to="/dashboard" className="nav-link" >Dashboard</NavLink>
          </NavItem> */}
        </Nav>
        <Nav className="ml-auto" navbar>
        <UncontrolledDropdown nav direction="down">
            <DropdownToggle nav>
           { localStorage.getItem('lang').toString()}
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem  onClick= {this.changeLanguage.bind(this,'en')}> English</DropdownItem>
              <DropdownItem onClick={this.changeLanguage.bind(this,'sp')}> Spanish</DropdownItem>
             </DropdownMenu>
          </UncontrolledDropdown>
          <DefaultHeaderDropdown onLogout={this.props.onLogout} accnt />
        </Nav>
      </React.Fragment>
    );
  }
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;
