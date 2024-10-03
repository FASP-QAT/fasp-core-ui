import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import getLabelText from '../../CommonComponent/getLabelText';
import {
  API_URL,
  INDEXED_DB_NAME,
  INDEXED_DB_VERSION
} from '../../Constants.js';
import UserService from '../../api/UserService';
import image6 from '../../assets/img/avatars/6.jpg';
import i18n from '../../i18n';
import AuthenticationService from '../../views/Common/AuthenticationService';
import InitialTicketPageComponent from '../../views/Ticket/InitialTicketPageComponent';
import { Switch } from '@material-ui/core';

const propTypes = {
  notif: PropTypes.bool,
  accnt: PropTypes.bool,
  tasks: PropTypes.bool,
  mssgs: PropTypes.bool,
};
const defaultProps = {
  notif: false,
  accnt: false,
  tasks: false,
  mssgs: false,
};

const setDark = () => {
  localStorage.setItem("theme", "dark");
  AuthenticationService.updateUserTheme(2);
    if (localStorage.getItem("sessionType") === 'Online') {
      AuthenticationService.setupAxiosInterceptors();
      UserService.updateUserTheme(2)
        .then(response => {
        }).catch(
          error => {
          })
    }
  document.documentElement.setAttribute("data-theme", "dark");
};

const setLight = () => {
  localStorage.setItem("theme", "light");
  AuthenticationService.updateUserTheme(1);
    if (localStorage.getItem("sessionType") === 'Online') {
      AuthenticationService.setupAxiosInterceptors();
      UserService.updateUserTheme(1)
        .then(response => {
        }).catch(
          error => {
          })
    }
  document.documentElement.setAttribute("data-theme", "light");
};

const storedTheme = localStorage.getItem("theme");

const prefersDark =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const defaultDark =
  storedTheme === "dark" || (storedTheme === null && prefersDark);

if (defaultDark) {
  setDark();
}
/**
 * Component representing the default header dropdown in the application.
 * This dropdown includes user profile information, language selection, and user actions.
 */
class DefaultHeaderDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.toggle = this.toggle.bind(this);
    this.changeLanguage = this.changeLanguage.bind(this);
    this.getLanguageList = this.getLanguageList.bind(this);
    this.state = {
      dropdownOpen: false,
      roleList: AuthenticationService.getLoggedInUserRole(),
      lang: localStorage.getItem('lang'),
      languageList: [],
      message: ""
    };
  }
  /**
   * Retrieves the list of languages from the IndexedDB.
   */
  getLanguageList() {
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
      this.setState({
        message: i18n.t('static.program.errortext'),
        color: '#BA0C2F'
      })
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['language'], 'readwrite');
      var program = transaction.objectStore('language');
      var getRequest = program.getAll();
      getRequest.onerror = function (event) {
        this.setState({
          message: i18n.t('static.program.errortext'),
          color: '#BA0C2F',
          loading: false
        })
      }.bind(this);
      getRequest.onsuccess = function (event) {
        var languageList = [];
        languageList = getRequest.result;
        this.setState({
          languageList
        });
      }.bind(this);
    }.bind(this)
  }
  /**
   * Changes the language of the application and performs related actions.
   * @param {string} lang - The language code to switch to.
   */
  changeLanguage(lang) {
    localStorage.setItem('lang', lang);
    localStorage.removeItem('lastLoggedInUsersLanguage');
    localStorage.setItem('lastLoggedInUsersLanguage', lang);
    AuthenticationService.updateUserLanguage(lang);
    if (localStorage.getItem("sessionType") === 'Online') {
      AuthenticationService.setupAxiosInterceptors();
      UserService.updateUserLanguage(lang)
        .then(response => {
          i18n.changeLanguage(lang)
          var url = window.location.href;
          if ((url.indexOf("green/") > -1) || (url.indexOf("red/") > -1)) {
            var getSplit = ((url.indexOf("green/") > -1 ? url.split("green/") : url.split("red/")))
            window.location.href = getSplit[0] + '%20/' + '%20';
            window.location.reload();
          } else {
            window.location.reload();
          }
        }).catch(
          error => {
            if (error.message === "Network Error") {
              this.setState({
                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage"))
              });
            } else {
              this.setState({ message: error.response.data.messageCode });
            }
            confirmAlert({
              message: this.state.message,
              buttons: [
                {
                  label: i18n.t('static.common.close')
                }
              ]
            });
          })
    }
    else {
      i18n.changeLanguage(lang)
      window.location.reload();
    }
  }
  /**
   * Toggles the dropdown open/closed state.
   */
  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }
  /**
   * Redirects the user to the logout action.
   */
  redirect() {
    this.props.logout();
  }

  applyLightTheme() {
    setLight();
  }

  applyDarkTheme() {
    setDark();
  }
  handleDefaultRounding(e){
    var showDecimals=e.target.checked;
    localStorage.setItem("roundingEnabled",!(showDecimals));
    AuthenticationService.updateUserTheme(1);
    if (localStorage.getItem("sessionType") === 'Online') {
      AuthenticationService.setupAxiosInterceptors();
      UserService.updateUserDecimalPreference(showDecimals)
        .then(response => {
        }).catch(
          error => {
          })
    }
    setTimeout(() => {
      window.location.reload(false);
    }, 0);
  }
  /**
   * Renders the user profile dropdown.
   * @returns {JSX.Element} The rendered JSX element.
   */
  dropAccnt() {
    const checkOnline = localStorage.getItem('sessionType');
    return (
      <Dropdown nav isOpen={this.state.dropdownOpen} toggle={this.toggle}>
        <DropdownToggle nav>
          <div className="avatar" onClick={this.getLanguageList}>
            <img src={image6} className="img-avatar" alt="admin@bootstrapmaster.com" />
            {checkOnline === 'Online' &&
              <span className="avatar-status badge-success" title="Online"></span>
            }
            {checkOnline === 'Offline' &&
              <span className="avatar-status badge-danger" title="Offline"></span>
            }
          </div>
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem header tag="div" className="text-center"><strong>{i18n.t('static.common.profile')}</strong></DropdownItem>
          <DropdownItem className="nonclickablebox" style={{ borderBottom: "2px solid #000" }}><i className="cui-user icons icon-size"></i><span className="tittle-role">{AuthenticationService.getLoggedInUsername() ? AuthenticationService.getLoggedInUsername() : this.redirect()}</span>
            {this.state.roleList != null && this.state.roleList != '' && this.state.roleList.map(
              role =>
                <div className=" mb-1 mt-2" key={role.roleId}>
                  <small><i className="fa fa-dot-circle-o"></i>{getLabelText(role.label, this.state.lang)}</small>
                </div>
            )}
          </DropdownItem>
          {checkOnline === 'Online' && <DropdownItem onClick={this.props.onChangePassword}><i className="fa fa-key"></i>{i18n.t('static.dashboard.changepassword')}</DropdownItem>}
          {checkOnline === 'Online' ? <DropdownItem onClick={this.props.goOffline}><i class="fa fa-solid fa-circle fa-lg" style={{ color: "#BA0C2F" }}></i>{i18n.t("static.login.goOffline")}</DropdownItem> : <DropdownItem onClick={this.props.goOnline}><i class="fa fa-solid fa-circle fa-lg" style={{ color: "#4dbd74" }}></i>{i18n.t("static.login.goOnline")}</DropdownItem>}
          <DropdownItem header tag="div" className="text-center"><b>{i18n.t('static.language.preferredlng')}</b></DropdownItem>
          {this.state.languageList != null && this.state.languageList != '' && this.state.languageList.filter(c => c.active).map(
            language =>
              <>
                <DropdownItem onClick={this.changeLanguage.bind(this, language.languageCode)}>
                  <i className={"flag-icon flag-icon-" + language.countryCode}></i>
                  {localStorage.getItem('lang') != null && localStorage.getItem('lang').toString() != 'undefined' && localStorage.getItem('lang').toString() == language.languageCode ?
                    <b>{getLabelText(language.label, this.state.lang)}</b>
                    : getLabelText(language.label, this.state.lang)}
                </DropdownItem>
              </>
          )}
          <DropdownItem header tag="div" className="text-center"><b>{i18n.t('static.common.changetheme')}</b></DropdownItem>
          <DropdownItem onClick={this.applyLightTheme}><i className="fa fa-sun-o"></i> {i18n.t('static.common.lighttheme')}</DropdownItem>
          <DropdownItem onClick={this.applyDarkTheme}><i className="fa fa-moon-o"></i> {i18n.t('static.common.darktheme')}</DropdownItem>
          {this.props.item == 2 && <DropdownItem style={{borderTop:"2px solid #000"}}><span style={{color:'#23a8d8'}}>.00</span> Show Decimals <Switch defaultChecked checked={localStorage.getItem("roundingEnabled")!=undefined && localStorage.getItem("roundingEnabled").toString()=="false"?true:false} color="primary" onChange={this.handleDefaultRounding} /></DropdownItem>}
        </DropdownMenu>
        {/* <DropdownMenu>
        <div className="toggle-theme-wrapper">
      
      <label className="toggle-theme" htmlFor="checkbox">
        <input
          type="checkbox"
          id="checkbox"
          onChange={toggleTheme}
          defaultChecked={defaultDark}
        />
        <div className="slider round"></div>
      </label>
      
    </div>
          </DropdownMenu>
         */}
      </Dropdown>
      
    );
  }
  /**
   * Renders the tasks dropdown.
   * @returns {JSX.Element} The rendered JSX element.
   */
  dropTasks() {
    const itemsCount = 15;
    return (
      <Dropdown nav className="d-md-down-none" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
      </Dropdown>
    );
  }
  /**
   * Renders the messages dropdown.
   * @returns {JSX.Element} The rendered JSX element.
   */
  dropMssgs() {
    const itemsCount = 7;
    return (
      <InitialTicketPageComponent />
    );
  }
  /**
   * Renders the DefaultHeaderDropdown component.
   * @returns {JSX.Element} The rendered JSX element.
   */
  render() {
    const { notif, accnt, tasks, mssgs } = this.props;
    return (
      notif ? this.dropNotif() :
        accnt ? this.dropAccnt() :
          tasks ? this.dropTasks() :
            mssgs ? this.dropMssgs() : null
    );
  }
}
DefaultHeaderDropdown.propTypes = propTypes;
DefaultHeaderDropdown.defaultProps = defaultProps;
export default DefaultHeaderDropdown;
