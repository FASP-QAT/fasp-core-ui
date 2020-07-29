import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Badge, Button,Dropdown, DropdownItem, DropdownMenu,FormGroup, DropdownToggle,Input,Label, ListGroup, ListGroupItem, Modal, ModalBody, ModalFooter, ModalHeader, Row,Progress } from 'reactstrap';
import { Link } from 'react-router-dom';
import { Online, Offline } from "react-detect-offline";
import i18n from '../../i18n';

import image4 from '../../assets/img/avatars/4.jpg';
import image5 from '../../assets/img/avatars/5.jpg';
import image6 from '../../assets/img/avatars/6.jpg';
import image7 from '../../assets/img/avatars/7.jpg';
import image8 from '../../assets/img/avatars/8.jpg';

import AuthenticationService from '../../views/Common/AuthenticationService';
import UserService from '../../api/UserService'
import getLabelText from '../../CommonComponent/getLabelText';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

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

class DefaultHeaderDropdown extends Component {

  constructor(props) {
    super(props);

    this.state = {
      modal: false,
      large: false,
      small: false,
      primary: false,
      success: false,
      warning: false,
      danger: false,
      info: false,
    };

    this.toggle = this.toggle.bind(this);
    this.changeLanguage = this.changeLanguage.bind(this);
    this.state = {
      dropdownOpen: false,
      roleList: AuthenticationService.getLoggedInUserRole(),
      lang: localStorage.getItem('lang'),
      message: ""
    };

    this.toggle = this.toggle.bind(this);
    this.toggleLarge = this.toggleLarge.bind(this);
    this.toggleSmall = this.toggleSmall.bind(this);
    this.toggleInfo = this.toggleInfo.bind(this);
  }


  changeLanguage(lang) {
    localStorage.setItem('lang', lang);
    AuthenticationService.updateUserLanguage(lang);
    if (navigator.onLine) {
    AuthenticationService.setupAxiosInterceptors();
      UserService.updateUserLanguage(lang)
        .then(response => {
        }).catch(
          error => {
            if (error.message === "Network Error") {
              this.setState({ message: error.message });
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
      i18n.changeLanguage(lang)
      window.location.reload();

  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }

  toggle() {
    this.setState({
      modal: !this.state.modal,
    });
  }

  toggleLarge() {
    this.setState({
      large: !this.state.large,
    });
  }

  toggleSmall() {
    this.setState({
      small: !this.state.small,
    });
  }

  toggleInfo() {
    this.setState({
      info: !this.state.info,
    });
  }
  // dropNotif() {
  //   const itemsCount = 5;
  //   return (
  //     <Dropdown nav className="d-md-down-none" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
  //       <DropdownToggle nav>
  //         <i className="icon-bell"></i><Badge pill color="danger">{itemsCount}</Badge>
  //       </DropdownToggle>
  //       <DropdownMenu right>
  //         <DropdownItem header tag="div" className="text-center"><strong>You have {itemsCount} notifications</strong></DropdownItem>
  //         <DropdownItem><i className="icon-user-follow text-success"></i> New user registered</DropdownItem>
  //         <DropdownItem><i className="icon-user-unfollow text-danger"></i> User deleted</DropdownItem>
  //         <DropdownItem><i className="icon-chart text-info"></i> Sales report is ready</DropdownItem>
  //         <DropdownItem><i className="icon-basket-loaded text-primary"></i> New client</DropdownItem>
  //         <DropdownItem><i className="icon-speedometer text-warning"></i> Server overloaded</DropdownItem>
  //         <DropdownItem header tag="div" className="text-center"><strong>Server</strong></DropdownItem>
  //         <DropdownItem>
  //           <div className="text-uppercase mb-1">
  //             <small><b>CPU Usage</b></small>
  //           </div>
  //           <Progress className="progress-xs" color="info" value="25" />
  //           <small className="text-muted">348 Processes. 1/4 Cores.</small>
  //         </DropdownItem>
  //         <DropdownItem>
  //           <div className="text-uppercase mb-1">
  //             <small><b>Memory Usage</b></small>
  //           </div>
  //           <Progress className="progress-xs" color="warning" value={70} />
  //           <small className="text-muted">11444GB/16384MB</small>
  //         </DropdownItem>
  //         <DropdownItem>
  //           <div className="text-uppercase mb-1">
  //             <small><b>SSD 1 Usage</b></small>
  //           </div>
  //           <Progress className="progress-xs" color="danger" value={90} />
  //           <small className="text-muted">243GB/256GB</small>
  //         </DropdownItem>
  //       </DropdownMenu>
  //     </Dropdown>
  //   );
  // }

  dropAccnt() {
    return (
      <Dropdown nav isOpen={this.state.dropdownOpen} toggle={this.toggle}>
        <DropdownToggle nav>

          <div className="avatar">
            <img src={image6} className="img-avatar" alt="admin@bootstrapmaster.com" />
            <Online>
              <span className="avatar-status badge-success" title="Online"></span>
            </Online>
            <Offline>
              <span className="avatar-status badge-danger" title="Offline"></span>
            </Offline>
          </div>

          {/* <button type="button" id="TooltipDemo" class="btn-open-options btn btn-warning rounded-circle">
            <i class="icon-settings icon-anim-pulse text-primary"></i>
        </button> */}
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem header tag="div" className="text-center"><strong>{i18n.t('static.common.profile')}</strong></DropdownItem>
          <DropdownItem className="nonclickablebox"><i className="icon-user icons icon-size"></i><span className="tittle-role">{AuthenticationService.getLoggedInUsername() ? AuthenticationService.getLoggedInUsername() : i18n.t("static.unknown")}</span>
            {this.state.roleList != null && this.state.roleList != '' && this.state.roleList.map(
              role =>

                <div className=" mb-1 mt-2" key={role.roleId}>
                  {/* <small><i className="fa fa-dot-circle-o"></i>{getLabelText(role.label, this.state.lang)}</small> */}
                  <small><i className="fa fa-dot-circle-o"></i>{getLabelText(role.label, this.state.lang)}</small>
                </div>
            )}
          </DropdownItem>
          <DropdownItem header tag="div" className="text-center"><b>{i18n.t('static.language.preferredlng')}</b></DropdownItem>
          <DropdownItem onClick={this.changeLanguage.bind(this, 'en')}><i className="flag-icon flag-icon-us"></i>
            {localStorage.getItem('lang').toString() == 'undefined' || localStorage.getItem('lang').toString() == 'en' ? <b>{i18n.t('static.language.english')}</b> : i18n.t('static.language.english')}
          </DropdownItem>
          <DropdownItem onClick={this.changeLanguage.bind(this, 'fr')}><i className="flag-icon flag-icon-wf "></i>{localStorage.getItem('lang').toString() == "fr" ? <b>{i18n.t('static.language.french')}</b> : i18n.t('static.language.french')}</DropdownItem>
          <DropdownItem onClick={this.changeLanguage.bind(this, 'sp')}><i className="flag-icon flag-icon-es"></i> {localStorage.getItem('lang').toString() == "sp" ? <b>{i18n.t('static.language.spanish')}</b> : i18n.t('static.language.spanish')}</DropdownItem>
          <DropdownItem onClick={this.changeLanguage.bind(this, 'pr')}><i className="flag-icon flag-icon-pt"></i> {localStorage.getItem('lang').toString() == "pr" ? <b>{i18n.t('static.language.portuguese')}</b> : i18n.t('static.language.portuguese')}</DropdownItem>
          <Online><DropdownItem onClick={this.props.onChangePassword}><i className="fa fa-key"></i> {i18n.t('static.dashboard.changepassword')}</DropdownItem></Online>
          {/* <DropdownItem onClick={this.props.onLogout}><i className="fa fa-sign-out"></i>{i18n.t('static.common.logout')}</DropdownItem> */}
        </DropdownMenu>
      </Dropdown>
    );
  }




  // dropTasks() {
  //   const itemsCount = 15;
  //   return (
  //     <Dropdown nav className="d-md-down-none" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
  //       <DropdownToggle nav>
  //         <i className="icon-list"></i><Badge pill color="warning">{itemsCount}</Badge>
  //       </DropdownToggle>
  //       <DropdownMenu right className="dropdown-menu-lg">
  //         <DropdownItem header tag="div" className="text-center"><strong>You have {itemsCount} pending tasks</strong></DropdownItem>
  //         <DropdownItem>
  //           <div className="small mb-1">Upgrade NPM &amp; Bower <span
  //             className="float-right"><strong>0%</strong></span></div>
  //           <Progress className="progress-xs" color="info" value={0} />
  //         </DropdownItem>
  //         <DropdownItem>
  //           <div className="small mb-1">ReactJS Version <span className="float-right"><strong>25%</strong></span>
  //           </div>
  //           <Progress className="progress-xs" color="danger" value={25} />
  //         </DropdownItem>
  //         <DropdownItem>
  //           <div className="small mb-1">VueJS Version <span className="float-right"><strong>50%</strong></span>
  //           </div>
  //           <Progress className="progress-xs" color="warning" value={50} />
  //         </DropdownItem>
  //         <DropdownItem>
  //           <div className="small mb-1">Add new layouts <span className="float-right"><strong>75%</strong></span>
  //           </div>
  //           <Progress className="progress-xs" color="info" value={75} />
  //         </DropdownItem>
  //         <DropdownItem>
  //           <div className="small mb-1">Angular 2 Cli Version <span className="float-right"><strong>100%</strong></span></div>
  //           <Progress className="progress-xs" color="success" value={100} />
  //         </DropdownItem>
  //         <DropdownItem className="text-center"><strong>View all tasks</strong></DropdownItem>
  //       </DropdownMenu>
  //     </Dropdown>
  //   );
  // }

  dropMssgs() {
    const itemsCount = 7;
    return (
      <Dropdown nav  >
          <i className="fa fa-question-circle HelpIcon" title="Help" onClick={this.toggle} ></i>
        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                       {/* className={'modal-info ' + this.props.className}> */}
                  <ModalHeader toggle={this.toggle} className="ModalHead modal-info-Headher">Ticketing System</ModalHeader>
                  <ModalBody>
                    <div><h4>What do yo want to do?</h4>Please click here you want to sign </div>
                    <div>
                    <FormGroup>
                         <Button type="button" size="sm" className="float-left mr-1 " onClick={this.toggleInfo} className="mr-1" >Bug Report</Button>
                         {/* <Button type="button" size="sm" className="float-left mr-1 " className="mr-1" >Bug Report</Button> */}
                         <Button type="reset" size="sm" className="float-left mr-1" > Change Additional Master</Button>
                       
                    </FormGroup>
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    {/* <Button color="primary" onClick={this.toggleInfo}>Do Something</Button>{' '} */}
                    <Button color="danger" toggle={this.toggle}> <i className="fa fa-times"></i> Cancel</Button>
                  </ModalFooter>
                </Modal>


                <Modal isOpen={this.state.info} toggle={this.toggleInfo}
                       className={'modal-info ' + this.props.className}>
                  <ModalHeader toggle={this.toggleInfo}>Modal title</ModalHeader>
                  <ModalBody>
                   <div>
                   <FormGroup>
                  <Label htmlFor="company">Company</Label>
                  <Input type="text" id="company" placeholder="Enter your company name" />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="vat">VAT</Label>
                  <Input type="text" id="vat" placeholder="DE1234567890" />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="street">Street</Label>
                  <Input type="text" id="street" placeholder="Enter street name" />
                </FormGroup>
                   </div>
                  </ModalBody>
                  <ModalFooter>
                   
                    <Button color="success" onClick={this.toggleInfo}>Submit</Button>
                  </ModalFooter>
                </Modal>
               
        {/* <DropdownMenu right className="dropdown-menu-lg">
          <DropdownItem header tag="div"><strong>You have {itemsCount} messages</strong></DropdownItem>
          <DropdownItem href="#">
            <div className="message">
              <div className="pt-3 mr-3 float-left">
                <div className="avatar">
                  <img src={image7} className="img-avatar" alt="admin@bootstrapmaster.com" />
                  <span className="avatar-status badge-success"></span>
                </div>
              </div>
              <div>
                <small className="text-muted">John Doe</small>
                <small className="text-muted float-right mt-1">Just now</small>
              </div>
              <div className="text-truncate font-weight-bold"><span className="fa fa-exclamation text-danger"></span> Important message</div>
              <div className="small text-muted text-truncate">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt...
              </div>
            </div>
          </DropdownItem>
          <DropdownItem href="#">
            <div className="message">
              <div className="pt-3 mr-3 float-left">
                <div className="avatar">
                  <img src={image6} className="img-avatar" alt="admin@bootstrapmaster.com" />
                  <span className="avatar-status badge-warning"></span>
                </div>
              </div>
              <div>
                <small className="text-muted">Jane Doe</small>
                <small className="text-muted float-right mt-1">5 minutes ago</small>
              </div>
              <div className="text-truncate font-weight-bold">Lorem ipsum dolor sit amet</div>
              <div className="small text-muted text-truncate">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt...
              </div>
            </div>
          </DropdownItem>
          <DropdownItem href="#">
            <div className="message">
              <div className="pt-3 mr-3 float-left">
                <div className="avatar">
                  <img src={image5} className="img-avatar" alt="admin@bootstrapmaster.com" />
                  <span className="avatar-status badge-danger"></span>
                </div>
              </div>
              <div>
                <small className="text-muted">Janet Doe</small>
                <small className="text-muted float-right mt-1">1:52 PM</small>
              </div>
              <div className="text-truncate font-weight-bold">Lorem ipsum dolor sit amet</div>
              <div className="small text-muted text-truncate">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt...
              </div>
            </div>
          </DropdownItem>
          <DropdownItem href="#">
            <div className="message">
              <div className="pt-3 mr-3 float-left">
                <div className="avatar">
                  <img src={image4} className="img-avatar" alt="admin@bootstrapmaster.com" />
                  <span className="avatar-status badge-info"></span>
                </div>
              </div>
              <div>
                <small className="text-muted">Joe Doe</small>
                <small className="text-muted float-right mt-1">4:03 AM</small>
              </div>
              <div className="text-truncate font-weight-bold">Lorem ipsum dolor sit amet</div>
              <div className="small text-muted text-truncate">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt...
              </div>
            </div>
          </DropdownItem>
          <DropdownItem href="#" className="text-center"><strong>View all messages</strong></DropdownItem>
        </DropdownMenu> */}
      </Dropdown>
    );
  }

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
