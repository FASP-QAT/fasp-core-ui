import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Badge, Button, Dropdown, DropdownItem, DropdownMenu, FormGroup, DropdownToggle, Input, Label, ListGroup, ListGroupItem, Modal, ModalBody, ModalFooter, ModalHeader, Row, Col, Progress } from 'reactstrap';
import { Link } from 'react-router-dom';
import { Online, Offline } from "react-detect-offline";
import i18n from '../../i18n';

import image4 from '../../assets/img/avatars/4.jpg';
import image5 from '../../assets/img/avatars/5.jpg';
import image6 from '../../assets/img/avatars/6.jpg';
import image7 from '../../assets/img/avatars/7.jpg';
import image8 from '../../assets/img/avatars/8.jpg';
import imageHelp from '../../assets/img/help-icon.png';

import AuthenticationService from '../../views/Common/AuthenticationService';
import UserService from '../../api/UserService'
import getLabelText from '../../CommonComponent/getLabelText';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import InitialTicketPageComponent from '../../views/Ticket/InitialTicketPageComponent';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
import {
  SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, polling

} from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";

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
      // modal: false,
      // large: false,
      // small: false,
      // bugreport: false,
      // changeadditional: false,
      // changemaster: false,
      // togglehelp: false,
      // initialPage: 1,
      // showOnlyMaster: 0,
      // showBugReport: 0,
      // showAdditionalData: 0
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

    // this.togglehelp = this.togglehelp.bind(this);
    // this.toggleLarge = this.toggleLarge.bind(this);
    // this.toggleSmall = this.toggleSmall.bind(this);
    // this.togglebugreport = this.togglebugreport.bind(this);
    // this.togglechangeadditional = this.togglechangeadditional.bind(this);
    // this.togglechangemaster = this.togglechangemaster.bind(this);
    this.dashboard = this.dashboard.bind(this);
  }
  dashboard() {
    this.props.history.push(`/ApplicationDashboard/`)
  }
  getLanguageList() {
    console.log("Going to get languages for profile section")
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
        console.log("my language list---", languageList);
        this.setState({
          languageList
        });
      }.bind(this);
    }.bind(this)


  }
  changeLanguage(lang) {
    console.log("Going to change language---", lang)
    localStorage.setItem('lang', lang);
    localStorage.removeItem('lastLoggedInUsersLanguage');
    localStorage.setItem('lastLoggedInUsersLanguage', lang);
    AuthenticationService.updateUserLanguage(lang);
    if (isSiteOnline()) {
      console.log("Going to change online")
      AuthenticationService.setupAxiosInterceptors();
      UserService.updateUserLanguage(lang)
        .then(response => {
          console.log("Going to change language api success---", lang)
          i18n.changeLanguage(lang)
          console.log("Going to change language reload location reload---")

          var url = window.location.href;
          if ((url.indexOf("green/") > -1) || (url.indexOf("red/") > -1)) {
            // "The specific word exists";
            var getSplit = ((url.indexOf("green/") > -1 ? url.split("green/") : url.split("red/")))
            window.location.href = getSplit[0] + '%20/' + '%20';
            window.location.reload();
          } else {
            // "The specific word doesn't exist";
            window.location.reload();
          }

          // window.location.reload();
        }).catch(
          error => {
            console.log("Going to change language api error---", error)
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
    else {
      console.log("Going to change language you are offline---")
      i18n.changeLanguage(lang)
      console.log("Going to change language reload location reload---")
      window.location.reload();
    }
    // console.log("Going to change language call changeLanguage function---")
    // i18n.changeLanguage(lang)
    // console.log("Going to change language reload location reload---")
    // window.location.reload();

  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }

  // toggle() {
  //   this.setState({
  //     modal: !this.state.modal,
  //   });
  // }

  // toggleLarge() {
  //   this.setState({
  //     large: !this.state.large,
  //   });
  // }

  // toggleSmall() {
  //   this.setState({
  //     small: !this.state.small,
  //   });
  // }

  // togglebugreport() {
  //   this.setState({
  //     initialPage: 0,
  //     showBugReport: 1
  //   });
  // }

  // togglechangeadditional() {
  //   this.setState({
  //     changeadditional: !this.state.changeadditional,
  //     showOnlyMaster: 0,
  //     showBugReport: 0,
  //     showAdditionalData: 1
  //   });
  // }
  // togglechangemaster() {
  //   this.setState({
  //     changemaster: !this.state.changemaster,
  //     showOnlyMaster: 1,
  //     initialPage: 0,
  //     showBugReport: 0
  //   });
  // }
  // togglehelp() {
  //   this.setState({
  //     help: !this.state.help,
  //     initialPage: 1,
  //     showBugReport:0,
  //     showOnlyMaster:0,
  //     showAdditionalData:0
  //   });
  // }


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

          {/* <button type="button" id="TooltipDemo" class="btn-open-options btn btn-warning rounded-circle">
            <i class="icon-settings icon-anim-pulse text-primary"></i>
        </button> */}
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem header tag="div" className="text-center"><strong>{i18n.t('static.common.profile')}</strong></DropdownItem>
          <DropdownItem className="nonclickablebox"><i className="cui-user icons icon-size"></i><span className="tittle-role">{AuthenticationService.getLoggedInUsername() ? AuthenticationService.getLoggedInUsername() : i18n.t("static.unknown")}</span>
            {this.state.roleList != null && this.state.roleList != '' && this.state.roleList.map(
              role =>

                <div className=" mb-1 mt-2" key={role.roleId}>
                  {/* <small><i className="fa fa-dot-circle-o"></i>{getLabelText(role.label, this.state.lang)}</small> */}
                  <small><i className="fa fa-dot-circle-o"></i>{getLabelText(role.label, this.state.lang)}</small>
                </div>
            )}
          </DropdownItem>
          <DropdownItem header tag="div" className="text-center"><b>{i18n.t('static.language.preferredlng')}</b></DropdownItem>
          {this.state.languageList != null && this.state.languageList != '' && this.state.languageList.filter(c => c.active).map(
            language =>
            <>
              
              <DropdownItem onClick={this.changeLanguage.bind(this, language.languageCode)}>
                <i className={"flag-icon flag-icon-"+language.countryCode}></i>
                {localStorage.getItem('lang') != null && localStorage.getItem('lang').toString() != 'undefined' && localStorage.getItem('lang').toString() == language.languageCode ? 
                <b>{getLabelText(language.label,this.state.lang)}</b> 
                : getLabelText(language.label,this.state.lang)}
                  {/* {language.languageName} */}
              </DropdownItem>
            </>
          )}
          {/* <DropdownItem onClick={this.changeLanguage.bind(this, 'en')}><i className="flag-icon flag-icon-us"></i>
            {localStorage.getItem('lang') == null || localStorage.getItem('lang').toString() == 'undefined' || localStorage.getItem('lang').toString() == 'en' ? <b>{i18n.t('static.language.english')}</b> : i18n.t('static.language.english')}
          </DropdownItem>
          <DropdownItem onClick={this.changeLanguage.bind(this, 'fr')}><i className="flag-icon flag-icon-wf "></i>{localStorage.getItem('lang') != null && localStorage.getItem('lang').toString() != 'undefined' && localStorage.getItem('lang').toString() == "fr" ? <b>{i18n.t('static.language.french')}</b> : i18n.t('static.language.french')}</DropdownItem>
          <DropdownItem onClick={this.changeLanguage.bind(this, 'sp')}><i className="flag-icon flag-icon-es"></i>{localStorage.getItem('lang') != null && localStorage.getItem('lang').toString() != 'undefined' && localStorage.getItem('lang').toString() == "sp" ? <b>{i18n.t('static.language.spanish')}</b> : i18n.t('static.language.spanish')}</DropdownItem>
          <DropdownItem onClick={this.changeLanguage.bind(this, 'pr')}><i className="flag-icon flag-icon-pt"></i>{localStorage.getItem('lang') != null && localStorage.getItem('lang').toString() != 'undefined' && localStorage.getItem('lang').toString() == "pr" ? <b>{i18n.t('static.language.portuguese')}</b> : i18n.t('static.language.portuguese')}</DropdownItem> */}

          {checkOnline === 'Online' && <DropdownItem onClick={this.props.onChangePassword}><i className="fa fa-key"></i>{i18n.t('static.dashboard.changepassword')}</DropdownItem>}
          {/* <DropdownItem onClick={this.props.onLogout}><i className="fa fa-sign-out"></i>{i18n.t('static.common.logout')}</DropdownItem> */}
        </DropdownMenu>
      </Dropdown>
    );
  }




  dropTasks() {
    const itemsCount = 15;
    return (
      <Dropdown nav className="d-md-down-none" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
        {/* <DropdownToggle nav onClick={this.props.onChangeDashboard}>
          <i className="cui-home icons HomeIcon"></i>
        </DropdownToggle> */}
        {/* <DropdownMenu right className="dropdown-menu-lg">
          <DropdownItem header tag="div" className="text-center"><strong>You have {itemsCount} pending tasks</strong></DropdownItem>
          <DropdownItem>
            <div className="small mb-1">Upgrade NPM &amp; Bower <span
              className="float-right"><strong>0%</strong></span></div>
            <Progress className="progress-xs" color="info" value={0} />
          </DropdownItem>
          <DropdownItem>
            <div className="small mb-1">ReactJS Version <span className="float-right"><strong>25%</strong></span>
            </div>
            <Progress className="progress-xs" color="danger" value={25} />
          </DropdownItem>
          <DropdownItem>
            <div className="small mb-1">VueJS Version <span className="float-right"><strong>50%</strong></span>
            </div>
            <Progress className="progress-xs" color="warning" value={50} />
          </DropdownItem>
          <DropdownItem>
            <div className="small mb-1">Add new layouts <span className="float-right"><strong>75%</strong></span>
            </div>
            <Progress className="progress-xs" color="info" value={75} />
          </DropdownItem>
          <DropdownItem>
            <div className="small mb-1">Angular 2 Cli Version <span className="float-right"><strong>100%</strong></span></div>
            <Progress className="progress-xs" color="success" value={100} />
          </DropdownItem>
          <DropdownItem className="text-center"><strong>View all tasks</strong></DropdownItem>
        </DropdownMenu> */}
      </Dropdown>
    );
  }

  dropMssgs() {
    const itemsCount = 7;
    return (
      <InitialTicketPageComponent />

      // <Dropdown nav  >

      //   <img src={imageHelp} className="HelpIcon" title="Help" onClick={this.togglehelp} />
      //   <Modal isOpen={this.state.help} toggle={this.togglehelp} className={this.props.className}>
      //     {/* className={'modal-info ' + this.props.className}> */}
      //     <ModalHeader toggle={this.togglehelp} className="ModalHead modal-info-Headher"><strong>Help</strong></ModalHeader>
      //     <ModalBody className="pb-0">
      //       {this.state.initialPage == 1 && <div className="col-md-12">
      //         <div><h4>What do yo want to do?</h4>Please click here you want to sign  </div>
      //         <div className="mt-2 mb-2">

      //           <ListGroup>
      //             <ListGroupItem className="list-group-item-help" tag="a" onClick={this.togglebugreport} action>  <i className="icon-list icons helpclickicon mr-2"></i> Bug Report</ListGroupItem>
      //             <ListGroupItem className="list-group-item-help" tag="a" onClick={this.togglechangemaster} action><i className="icon-list  icons helpclickicon mr-2"></i> Change Additional Master <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>

      //           </ListGroup>
      //         </div>

      //       </div>}

      //       {/* Bug Report modal */}
      //       {this.state.initialPage == 0 && this.state.showBugReport == 1 && <div isOpen={this.state.bugreport} toggle={this.togglebugreport}>
      //         {/* <ModalHeader toggle={this.togglebugreport} className="ModalHead modal-info-Headher"><strong>Bug Report</strong></ModalHeader> */}
      //         <h4>Bug Report</h4>
      //         <ModalBody>
      //           <div>
      //             <FormGroup className="pr-1 pl-1" >
      //               <Col>
      //                 <Label className="uploadfilelable" htmlFor="file-input">Upload Screenshot</Label>
      //               </Col>
      //               <Col xs="12" className="custom-file">
      //                 {/* <Input type="file" id="file-input" name="file-input" /> */}
      //                 <Input type="file" className="custom-file-input" id="file-input" name="file-input" accept=".zip" />
      //                 <label className="custom-file-label" id="file-input">Choose file</label>
      //               </Col>
      //             </FormGroup>
      //           </div>
      //         </ModalBody>
      //         <ModalFooter>
      //         <Button color="success" >Back</Button>
      //           <Button color="success" onClick={this.togglebugreport}>Submit</Button>
      //         </ModalFooter>
      //       </div>}


      //       {/* Change Additional Master modal */}

      //       <div isOpen={this.state.changemaster} toggle={this.togglechangemaster} className={this.props.className}>
      //         {/* className={'modal-info ' + this.props.className}> */}
      //         {/* <ModalHeader toggle={this.togglechangemaster} className="ModalHead modal-info-Headher"><strong>Help</strong></ModalHeader> */}
      //         <ModalBody>
      //           {this.state.showOnlyMaster == 1 && <div className="mt-2 mb-2">
      //             <ListGroup>
      //               <ListGroupItem className="list-group-item-help" tag="a" onClick={this.togglechangeadditional} action><i className="icon-note  icons helpclickicon mr-2"></i> Planning Unit <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
      //               <ListGroupItem className="list-group-item-help" tag="a" onClick={this.togglechangeadditional} action>  <i className="icon-note icons helpclickicon mr-2"></i>Forecasting Units <i className="fa fa-angle-right helpclickicon mr-2 mt-1 float-right"></i></ListGroupItem>
      //             </ListGroup>
      //             <ModalFooter>
      //                  <Button color="success" >Back</Button>
      //                   {/* <Button color="success" onClick={this.togglebugreport}>Submit</Button> */}
      //             </ModalFooter>
      //           </div>}
      //           {this.state.showAdditionalData == 1 && <div className="col-md-12">
      //             <h4>Add/Update Planning Unit</h4>
      //             <br></br>
      //             <FormGroup>
      //               <Label >Forecasting Unit</Label>
      //               <Input type="text" />
      //             </FormGroup>
      //             <FormGroup>
      //               <Label >Unit</Label>
      //               <Input type="text" />
      //             </FormGroup>
      //             <FormGroup>
      //               <Label >Planning Unit</Label>
      //               <Input type="text" />
      //             </FormGroup>
      //             <FormGroup>
      //               <Label >Multiplier</Label>
      //               <Input type="text" />
      //             </FormGroup>
      //             {/* <FormGroup>
      //               <Button color="success" onClick={this.togglechangeadditional}>Submit</Button>
      //             </FormGroup> */}
      //              <ModalFooter>
      //                  <Button color="success" >Back</Button>
      //                   <Button color="success" onClick={this.togglebugreport}>Submit</Button>
      //             </ModalFooter>
      //           </div>}
      //         </ModalBody>

      //       </div>


      //     </ModalBody>



      //   </Modal>
      // {/*Change Additaion master */}
      // {/* <Modal isOpen={this.state.changeadditional} toggle={this.togglechangeadditional}>
      //           <ModalHeader toggle={this.togglechangeadditional} className="ModalHead modal-info-Headher"><strong>Add/Update Planning Unit</strong></ModalHeader>
      //           <ModalBody>
      //            <div>
      //            <FormGroup>
      //           <Label >Forecasting Unit</Label>
      //           <Input type="text" />
      //         </FormGroup>
      //         <FormGroup>
      //           <Label >Unit</Label>
      //           <Input type="text"  />
      //         </FormGroup>
      //         <FormGroup>
      //           <Label >Planning Unit</Label>
      //           <Input type="text"  />
      //         </FormGroup>
      //         <FormGroup>
      //           <Label >Multiplier</Label>
      //           <Input type="text"  />
      //         </FormGroup>
      //            </div>
      //           </ModalBody>
      //           <ModalFooter>

      //             <Button color="success" onClick={this.togglechangeadditional}>Submit</Button>
      //           </ModalFooter>
      //         </Modal> */}

      // {/* <DropdownMenu right className="dropdown-menu-lg">
      //   <DropdownItem header tag="div"><strong>You have {itemsCount} messages</strong></DropdownItem>
      //   <DropdownItem href="#">
      //     <div className="message">
      //       <div className="pt-3 mr-3 float-left">
      //         <div className="avatar">
      //           <img src={image7} className="img-avatar" alt="admin@bootstrapmaster.com" />
      //           <span className="avatar-status badge-success"></span>
      //         </div>
      //       </div>
      //       <div>
      //         <small className="text-muted">John Doe</small>
      //         <small className="text-muted float-right mt-1">Just now</small>
      //       </div>
      //       <div className="text-truncate font-weight-bold"><span className="fa fa-exclamation text-danger"></span> Important message</div>
      //       <div className="small text-muted text-truncate">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt...
      //       </div>
      //     </div>
      //   </DropdownItem>
      //   <DropdownItem href="#">
      //     <div className="message">
      //       <div className="pt-3 mr-3 float-left">
      //         <div className="avatar">
      //           <img src={image6} className="img-avatar" alt="admin@bootstrapmaster.com" />
      //           <span className="avatar-status badge-warning"></span>
      //         </div>
      //       </div>
      //       <div>
      //         <small className="text-muted">Jane Doe</small>
      //         <small className="text-muted float-right mt-1">5 minutes ago</small>
      //       </div>
      //       <div className="text-truncate font-weight-bold">Lorem ipsum dolor sit amet</div>
      //       <div className="small text-muted text-truncate">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt...
      //       </div>
      //     </div>
      //   </DropdownItem>
      //   <DropdownItem href="#">
      //     <div className="message">
      //       <div className="pt-3 mr-3 float-left">
      //         <div className="avatar">
      //           <img src={image5} className="img-avatar" alt="admin@bootstrapmaster.com" />
      //           <span className="avatar-status badge-danger"></span>
      //         </div>
      //       </div>
      //       <div>
      //         <small className="text-muted">Janet Doe</small>
      //         <small className="text-muted float-right mt-1">1:52 PM</small>
      //       </div>
      //       <div className="text-truncate font-weight-bold">Lorem ipsum dolor sit amet</div>
      //       <div className="small text-muted text-truncate">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt...
      //       </div>
      //     </div>
      //   </DropdownItem>
      //   <DropdownItem href="#">
      //     <div className="message">
      //       <div className="pt-3 mr-3 float-left">
      //         <div className="avatar">
      //           <img src={image4} className="img-avatar" alt="admin@bootstrapmaster.com" />
      //           <span className="avatar-status badge-info"></span>
      //         </div>
      //       </div>
      //       <div>
      //         <small className="text-muted">Joe Doe</small>
      //         <small className="text-muted float-right mt-1">4:03 AM</small>
      //       </div>
      //       <div className="text-truncate font-weight-bold">Lorem ipsum dolor sit amet</div>
      //       <div className="small text-muted text-truncate">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt...
      //       </div>
      //     </div>
      //   </DropdownItem>
      //   <DropdownItem href="#" className="text-center"><strong>View all messages</strong></DropdownItem>
      // </DropdownMenu> */}
      // </Dropdown>
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
