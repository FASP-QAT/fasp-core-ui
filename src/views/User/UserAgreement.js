import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, FormFeedback, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import i18n from '../../i18n'
import AuthenticationService from '../Common/AuthenticationService.js';
import UserService from '../../api/UserService'
export default class UserAgreementComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: localStorage.getItem('lang'),
            message: ""
        }
        this.accept = this.accept.bind(this);
        this.decline = this.decline.bind(this);
    }
    accept() {
        AuthenticationService.setupAxiosInterceptors();
        UserService.acceptUserAgreement().then(response => {
            this.props.history.push(`/masterDataSync`)
        }).catch(
            error => {
                if (error.message === "Network Error") {
                    this.setState({ message: error.message });
                } else {
                    switch (error.response ? error.response.status : "") {
                        case 500:
                        case 401:
                        case 404:
                        case 412:
                        case 406:
                            this.setState({ message: error.response.data.messageCode });
                            break;
                        default:
                            this.setState({ message: 'static.unkownError' });
                            break;
                    }
                }
            }
        );
    }
    decline() {
        let keysToRemove = ["token-" + AuthenticationService.getLoggedInUserId(), "user-" + AuthenticationService.getLoggedInUserId(), "curUser", "lang", "typeOfSession", "i18nextLng", "lastActionTaken"];
        keysToRemove.forEach(k => localStorage.removeItem(k));
        this.props.history.push(`/login`)
    }
    render() {
        return (
            <div className="animated fadeIn">
                <h5 id="div2">{i18n.t(this.state.message)}</h5>
                <div className="col-md-12">
                    <Col xs="12" sm="12">
                        <Card>
                            <CardHeader>
                                <strong>{i18n.t('static.user.agreement')}</strong>
                            </CardHeader>
                            <CardBody>
                            <Col xs="11" sm="11">
                                <div className="text-left">
                                <h4 className="UserTitle">End-User License Agreement</h4>
                                    <p>
                                    This End-User License Agreement (EULA) is a legal agreement between you 
                                    (either as an individual or on behalf of an entity) and USAID (“Owner”)’s  
                                    Quantification Analytics Tool (QAT), as administered by Chemonics International
                                     (“Administrator”) through the Global Health Supply Chain – Procurement and Supply
                                      Management (GHSC-PSM) program regarding your use of QAT's applications. 
                                      IF YOU DO NOT AGREE TO ALL OF THE TERMS OF THIS EULA, DO NOT INSTALL,
                                       USE OR COPY THE SOFTWARE.
                                    </p>
                                    <p>
                                    <h4 className="UserTitle">Summary</h4>
  <ul class="list-group">
    <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>  &nbsp;&nbsp;<p>You must agree to all of the terms of this EULA to use this Software.</p></li>
    <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp;&nbsp;<p>If so, you may use the Software for free and for any lawful purpose.</p></li>
    <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>&nbsp; &nbsp;<p align="justifly">This Software automatically communicates with QAT servers for three reasons: (1) to receive and install updates; (2) to send error reports; and (3) to send anonymized usage information. You can view sample data to see what information is sent, and you may opt out of sending the anonymized usage data.</p></li>
    <li class="list-summery "><i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p>This Software is provided "as-is" with no warranties, and you agree that the Owner or Administrator are not liable for anything you do with it.</p></li>
  </ul>
  </p>
<p>
  <h4 className="UserTitle">The Agreement</h4>
By downloading, installing, using, or copying the Software, you accept and agree to be bound by the terms of this EULA. If you do not agree to all the terms of this EULA, you may not download, install, use or copy the Software.
  </p>
  <p>
  <h4 className="UserTitle"> The License</h4>
This EULA entitles you to install as many copies of the Software as you want and use the Software for any lawful purpose consistent with this EULA. Your license to use the Software is expressly conditioned upon your agreement to all the terms of this EULA. This software is licensed, not sold. The Owner and Administrator reserve all other rights not granted by this EULA.
  </p>
  <p>
  
    
  <h4 className="UserTitle"> The Restrictions</h4>
  <div className="rounded-list list-group">
  <ol className="list-group">
    <li class=""> &nbsp;&nbsp;<p>When using the Software you must use it in a manner that complies with the applicable laws in the jurisdiction(s) in which you use the Software.</p></li>
    <li class=" ">&nbsp; &nbsp; <p>You may not sell, resell, rent, lease or exchange the Software for anything of value.</p></li>
    <li class=" "> &nbsp; &nbsp;<p>You may redistribute the software, but it must include this EULA and you may not repackage or bundle the Software with any other software.</p></li>
    <li class=" "> &nbsp; &nbsp;<p>You may not remove or alter any proprietary notices or marks on the Software.</p></li>
  </ol>
  </div>
  </p>
  <p>
      <h4 className="UserTitle">Privacy Notices</h4>
      <div className="rounded-list list-group">
      The Software automatically communicates with QAT servers for three purposes : 
  <ol className="list-group">
    <li class=""> &nbsp;&nbsp;<p>updating the Software</p></li>
    <li class=" ">&nbsp; &nbsp; <p>sending error reports and</p></li>
    <li class=" "> &nbsp; &nbsp;<p>sending anonymized usage data so we may improve the Software.</p></li>
    <li class=" "> &nbsp; &nbsp;<p>If you would like to learn more about the specific information we send,<br></br> please visit <a href="https://desktop.QAT.org/usage-data/" target=" /blank">https://desktop.QAT.org/usage-data/</a>.</p></li>
  </ol>
  </div>
      </p>

      <p>
      <h4 className="UserTitle">Automatic Software Updates</h4>
      {/* <div className="rounded-list list-group"> */}
      <p>The Software sends information described at the URL above to determine whether there are any patches, bug fixes, updates, upgrades or other modifications to improve the Software. 
          You agree that the Software may automatically install any such improvements to the 
          Software on your computer without providing any further notice or receiving any 
          additional consent. This feature may not be disabled. If you do not want to receive
           automatic updates, you must uninstall the Software.</p>
      
  <ul className="list-group">
    <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp;&nbsp;<p><strong>Error Reports :</strong> In order to help us improve the Software, when the Software encounters certain errors, it will automatically send some information to QAT about the error (as described at the URL above). This feature may not be disabled. If you do not want to send error reports to QAT, you must uninstall the Software.</p></li>
    <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>&nbsp; &nbsp; <p><strong>Anonymized Usage Data :</strong> QAT collects anonymized data about your usage of the Software to help us improve it. Approximately once a day the Software sends such data (as described in more detail at the URL above) to QAT's servers. If you do not want to send anonymized usage data to QAT, you may opt out by changing your settings in the Preferences view.</p></li>
    <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p><strong>Master Data and Reference Data Sync :</strong> The offline app regularly sends and receives data from the web application. This cannot be disabled as it is a core component of the application.</p></li>
    
  </ul>
  {/* </div> */}
      </p>
      <p>
      <h4 className="UserTitle">Open-Source Notices</h4>
<p>The Software may be subject to open-source software licenses ("Open-Source Components"), 
which means any software license approved as open-source licenses by the Open Source Initiative or any 
substantially similar licenses, including without limitation any license that, as a 
condition of distribution of the software licensed under such license, requires that 
the distributor make the software available in source code format. The Software
 documentation includes copies of the licenses applicable to the Open-Source Components.</p>
<p>To the extent there is conflict between the license terms covering the Open-Source Components 
    and this EULA, the terms of such licenses will apply in lieu of the terms of this EULA. 
    To the extent the terms of the licenses applicable to Open-Source Components prohibit any 
    of the restrictions in this Agreement with respect to such Open-Source Component, 
    such restrictions will not apply to such Open-Source Component. To the extent the terms of 
    the licenses applicable to Open-Source Components require Licensor to make an offer to provide source code in connection with
     the Product, such offer is hereby made, 
    and you may exercise it by contacting <a href="support@QAT.org" target=" /blank">support@QAT.org</a></p>
      </p>

      <p>
      <h4 className="UserTitle">Intellectual Property Notices</h4>
<p>The Software and all worldwide copyrights, trade secrets, and other intellectual property 
    rights therein are the exclusive property of QAT. QAT reserves all rights in and to 
    the Software not expressly granted to you in this EULA.</p>
<p>The names QAT, QAT Desktop, and related QAT logos and/or stylized names are trademarks of QAT.
    You agree not to display or use these trademarks in any manner without the Owner and 
    Administrator's prior, written permission,
     except as allowed by QAT's Logos and Usage 
    Policy:  <a href="https://QAT.com/logos." target=" /blank">https://QAT.com/logos</a>.</p>
      </p>
      <p>
      <h4 className="UserTitle">Disclaimers and Limitations on Liability</h4>
      <p>THE SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, AND NO WARRANTY, EITHER EXPRESS OR IMPLIED, IS GIVEN. YOUR USE OF THE SOFTWARE IS AT YOUR SOLE RISK.<br></br> The Owner and Administrator do not warrant that</p>
      <ul className="list-group">
    <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp;&nbsp;<p>The Software will meet your specific requirements.</p></li>
    <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>&nbsp; &nbsp; <p>The Software is fully compatible with any particular platform.</p></li>
    <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p> Your use of the Software will be uninterrupted, timely, secure, or error-free.</p></li>
    <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p>The results that may be obtained from the use of the Software will be accurate or reliable. </p></li>
    <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p> The quality of any products, services, information, or other material purchased or obtained by you through the Software will meet your expectations. </p></li>
    <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p>Or any errors in the Software will be corrected.</p></li>
   
    
  </ul>
  <p>
  YOU EXPRESSLY UNDERSTAND AND AGREE THAT THE OWNER AND ADMINISTRATOR SHALL NOT BE LIABLE FOR 
  ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR EXEMPLARY DAMAGES, INCLUDING BUT
   NOT LIMITED TO, DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA OR OTHER INTANGIBLE LOSSES
    (EVEN IF THE OWNER AND ADMINISTRATOR HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES) 
    RELATED TO THE SOFTWARE,including, for example: 
  </p>
  <ul className="list-group">
    <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp;&nbsp;<p>The use or the inability to use the Software.</p></li>
    <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>&nbsp; &nbsp; <p>The cost of procurement of substitute goods and services resulting 
        from any goods, data, information or services purchased or obtained or messages received or
         transactions entered into through or from the Software.</p></li>
    <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p> Unauthorized access to or alteration of your transmissions or data.</p></li>
    <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p>Statements or conduct of any third-party on the Software .</p></li>
    <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p> Or any other matter relating to the Software.</p></li>
  </ul>
  <p>The Owner and Administrator reserve the right at any time and from time to time to modify or
      discontinue, temporarily or permanently, the Software (or any part thereof) with or
       without notice. The Owner and Administrator shall not be liable to you or to any 
       third-party for any modification, price change, suspension or discontinuance of the Software.</p>
      </p>

      <p>
      <h4 className="UserTitle">Miscellanea </h4>
      <div className="rounded-list list-group">
        <ol className="list-group">
    <li class=""> &nbsp;&nbsp;<p>If you configure the Software to work with one or more accounts 
        on the <a href="QuantificationAnalytics.org" target=" /blank">QuantificationAnalytics.org</a> website or with an instance of QAT Desktop, your use 
        of the Software will also be governed by the <a href="QuantificationAnalytics.org" target=" /blank">QuantificationAnalytics.org</a> website Terms of
         Service and/or the license agreement applicable to your instance of QAT Desktop.</p>
         </li>
    <li class=" ">&nbsp; &nbsp; <p>The failure of QAT to exercise or enforce any right or
         provision of this EULA shall not constitute a waiver of such right or provision.</p></li>
    <li class=" "> &nbsp; &nbsp;<p>This EULA constitutes the entire agreement between you, the
         Owner and Administrator, and governs your use of the Software, superseding any prior 
         agreements between you, the Owner and Administrator (including, but not limited to, 
         any prior versions of the EULA). Further, Administrator fully and completely indemnifies
          Owner from any and all individual and aggregate claims for damages that may be brought 
          against Owner with regard to or arising from the above mentioned conditions in this 
          clause (Incorporations by Reference: ADS 318 Intellectual Property Rights.
           48 CFR 752.227-14 Rights in Data (general)).</p></li>
    <li class=" "> &nbsp; &nbsp;<p>You agree that this EULA and your use of the Software are 
        governed under District of Columbia law and any dispute related to the Software must 
        be brought in a tribunal of competent jurisdiction located in or near Washington, DC.</p></li>
        <li class=" "> &nbsp; &nbsp;<p>Please send any questions about this EULA to <a href="support@QAT.org">support@QAT.org</a></p></li>
  </ol>
  </div>
      </p>

     

      
                                </div>
                                </Col>
                            </CardBody>

                            <CardFooter id="retryButtonDiv">
                                <FormGroup>
                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.decline}><i className="fa fa-times"></i> {i18n.t('static.common.decline')}</Button>
                                    <Button type="submit" size="md" color="success" onClick={this.accept} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.accept')}</Button>
                                    &nbsp;
                        </FormGroup>
                            </CardFooter>
                        </Card>
                    </Col>
                </div>
                {/* </Container>
            </div> */}
            </div>
        )
    }
}