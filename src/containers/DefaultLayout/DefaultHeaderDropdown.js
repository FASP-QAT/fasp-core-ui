import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert, Table, Badge } from 'reactstrap';
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
      message: "",
      notificationModalOpen: false,
      notificationPreferences: [],
      loadingPreferences: false,
      savingPreferences: false,
      notificationSuccessMsg: '',
      notificationErrorMsg: ''
    };
    this.toggleNotificationPreferencesModal = this.toggleNotificationPreferencesModal.bind(this);
    this.loadNotificationPreferences = this.loadNotificationPreferences.bind(this);
    this.handlePreferenceToggle = this.handlePreferenceToggle.bind(this);
    this.saveNotificationPreferences = this.saveNotificationPreferences.bind(this);
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

  toggleTheme(e) {
    if (e.target.checked) {
      setDark();
    } else {
      setLight();
    }
  };
  toggleNotificationPreferencesModal() {
    this.setState({
      notificationModalOpen: !this.state.notificationModalOpen,
      notificationSuccessMsg: '',
      notificationErrorMsg: ''
    }, () => {
      if (this.state.notificationModalOpen) {
        this.loadNotificationPreferences();
      }
    });
  }

  loadNotificationPreferences() {
    this.setState({ loadingPreferences: true, notificationErrorMsg: '' });
    UserService.getNotificationPreferences()
      .then(response => {
        this.setState({
          notificationPreferences: response.data,
          loadingPreferences: false
        });
      })
      .catch(err => {
        this.setState({
          loadingPreferences: false,
          notificationErrorMsg: 'Failed to load notification preferences.'
        });
      });
  }

  handlePreferenceToggle(categoryId) {
    const updated = this.state.notificationPreferences.map(p => {
      if (p.categoryId === categoryId && p.allowOptOut) {
        return { ...p, optedOut: !p.optedOut };
      }
      return p;
    });
    this.setState({ notificationPreferences: updated });
  }

  saveNotificationPreferences() {
    this.setState({ savingPreferences: true, notificationSuccessMsg: '', notificationErrorMsg: '' });
    UserService.updateNotificationPreferences(this.state.notificationPreferences)
      .then(response => {
        this.setState({
          savingPreferences: false,
          notificationSuccessMsg: 'Notification preferences updated successfully.'
        });
      })
      .catch(err => {
        this.setState({
          savingPreferences: false,
          notificationErrorMsg: 'Failed to save preferences. Please try again.'
        });
      });
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
          {checkOnline === 'Online' && <DropdownItem onClick={this.toggleNotificationPreferencesModal}><i className="fa fa-bell-o"></i>{i18n.t('static.broadcast.notificationPreferences', 'Notification Preferences')}</DropdownItem>}
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
           <DropdownItem style={{ borderTop: "2px solid #000", padding: "11px 20px" }}>
            <div class="row RowMarginToggle">
              <div class="col-1"><i style={{marginLeft:'-12px'}} className={`fa ${localStorage.getItem("theme") === "dark" ? "fa-moon-o" : "fa-sun-o"}`}></i></div>
              <div class="col-5"><span style={{marginLeft:'-10px'}}>{localStorage.getItem("theme") === "dark" ? i18n.t('static.common.darktheme') : i18n.t('static.common.lighttheme')}</span></div>
              <div class="col-4">
                <Switch
                className={`form-check form-switch ${localStorage.getItem("theme") === "dark" ? 'dark-switch' : 'light-switch'}`}
                checked={localStorage.getItem("theme") === "dark"}
                color={localStorage.getItem("theme") === "dark" ? "default" : "primary"}
                onChange={this.toggleTheme}
              />
              </div>
            </div>
          </DropdownItem>

          {this.props.item == 2 &&
            <DropdownItem className='ShowdecimalClr' style={{ borderTop: "2px solid #000", padding: "11px 20px" }}>
              <div class="row RowMarginToggle">
                <div class="col-1"><i style={{ fontStyle: 'normal' }}>.00</i></div>
                <div class="col-5"><span style={{marginLeft:'-10px'}}>Show Decimals</span></div>
                <div class="col-4"><Switch className='form-check form-switch' defaultChecked checked={localStorage.getItem("roundingEnabled") != undefined && localStorage.getItem("roundingEnabled").toString() == "false" ? true : false} color="primary" onChange={this.handleDefaultRounding} /></div>
              </div>
            </DropdownItem>}
        </DropdownMenu>

        <Modal isOpen={this.state.notificationModalOpen} toggle={this.toggleNotificationPreferencesModal} className="modal-lg modal-dialog-centered">
          <ModalHeader toggle={this.toggleNotificationPreferencesModal} className="ModalHead modal-info-Headher">
            <strong className="TextWhite"><i className="fa fa-bell-o mr-2"></i>{i18n.t('static.broadcast.notificationPreferences', 'Notification Preferences')}</strong>
          </ModalHeader>
          <ModalBody>
            {this.state.notificationSuccessMsg && <Alert color="success">{this.state.notificationSuccessMsg}</Alert>}
            {this.state.notificationErrorMsg && <Alert color="danger">{this.state.notificationErrorMsg}</Alert>}
            <p className="text-muted mb-3">
              {i18n.t('static.broadcast.notificationPrefHelp', 'Manage your email subscription preferences for notifications and announcements sent by QAT.')}
            </p>
            {this.state.loadingPreferences ? (
              <div className="d-flex align-items-center justify-content-center py-4">
                <div className="spinner-border blue" role="status"></div>
              </div>
            ) : (
              <Table className="table-striped table-bordered text-center mt-2" bordered responsive size="sm">
                <thead>
                  <tr>
                    <th style={{ width: '22%' }} className="text-left">{i18n.t('static.broadcast.category', 'Category')}</th>
                    <th style={{ width: '48%' }} className="text-left">{i18n.t('static.message.description', 'Description')}</th>
                    <th style={{ width: '15%' }}>{i18n.t('static.common.status', 'Status')}</th>
                    <th style={{ width: '15%' }}>{i18n.t('static.broadcast.receiveEmails', 'Receive Emails')}</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.notificationPreferences && this.state.notificationPreferences.map(pref => {
                    const isMandatory = !pref.allowOptOut;
                    const isSubscribed = isMandatory || !pref.optedOut;
                    return (
                      <tr key={pref.categoryId}>
                        <td className="text-left align-middle font-weight-bold">
                          {pref.label ? getLabelText(pref.label, this.state.lang) : pref.categoryName}
                        </td>
                        <td className="text-left align-middle">
                          {pref.categoryCode === 'SYSTEM_UPDATE' && (
                            i18n.t('static.broadcast.systemUpdateDesc', 'System updates, maintenance downtime, and mandatory deadlines (e.g., you must upload by X date). No opt out.')
                          )}
                          {pref.categoryCode === 'PROMOTIONAL' && (
                            i18n.t('static.broadcast.promotionalDesc', 'Newsletters and general announcements. Default is to receive; user can opt out.')
                          )}
                          {pref.categoryCode === 'TRANSACTIONAL' && (
                            i18n.t('static.broadcast.transactionalDesc', 'Workflow notifications (e.g. supply plan approved, sent back, or upload notifications). Default is to receive; user can opt out.')
                          )}
                        </td>
                        <td className="align-middle">
                          {isMandatory ? (
                            <Badge color="secondary" style={{ fontSize: '12px', padding: '5px 10px', fontWeight: '500' }}>{i18n.t('static.common.mandatory', 'Mandatory')}</Badge>
                          ) : isSubscribed ? (
                            <Badge color="success" style={{ fontSize: '12px', padding: '5px 10px', fontWeight: '500' }}>{i18n.t('static.broadcast.subscribed', 'Subscribed')}</Badge>
                          ) : (
                            <Badge color="danger" style={{ fontSize: '12px', padding: '5px 10px', fontWeight: '500' }}>{i18n.t('static.broadcast.optedOut', 'Opted Out')}</Badge>
                          )}
                        </td>
                        <td className="align-middle text-center ShowdecimalClr">
                          <Switch
                            className="form-check form-switch"
                            checked={isSubscribed}
                            disabled={isMandatory}
                            color="primary"
                            onChange={() => this.handlePreferenceToggle(pref.categoryId)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </ModalBody>
          <ModalFooter>
            <Button type="button" size="md" color="danger" className="mr-1 text-white" onClick={this.toggleNotificationPreferencesModal}>
              <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}
            </Button>
            <Button type="button" size="md" color="success" className="mr-1 text-white" onClick={this.saveNotificationPreferences} disabled={this.state.savingPreferences || this.state.loadingPreferences}>
              <i className="fa fa-check"></i> {this.state.savingPreferences ? <i className="fa fa-spinner fa-spin mr-1"></i> : null}{i18n.t('static.common.save', 'Save')}
            </Button>
          </ModalFooter>
        </Modal>
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
      <InitialTicketPageComponent isIcon={true}/>
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