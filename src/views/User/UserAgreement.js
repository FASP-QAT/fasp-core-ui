import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, FormGroup } from 'reactstrap';
import { API_URL } from '../../Constants';
import UserService from '../../api/UserService';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
/**
 * This component is used to show the end user liceance agreement for the users who are logging in for the first time
 */
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
    /**
     * This function is called when user accepts the user agreement
     */
    accept() {

        UserService.acceptUserAgreement().then(response => {
            this.props.history.push(`/syncProgram`)
        }).catch(
            error => {
                if (error.message === "Network Error") {
                    this.setState({

                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                        loading: false
                    });
                } else {
                    switch (error.response ? error.response.status : "") {

                        case 401:
                            this.props.history.push(`/login/static.message.sessionExpired`)
                            break;
                        case 409:
                            this.setState({
                                message: i18n.t('static.common.accessDenied'),
                                loading: false,
                                color: "#BA0C2F",
                            });
                            break;
                        case 403:
                            this.props.history.push(`/accessDenied`)
                            break;
                        case 500:
                        case 404:
                        case 406:
                            this.setState({
                                message: error.response.data.messageCode,
                                loading: false
                            });
                            break;
                        case 412:
                            this.setState({
                                message: error.response.data.messageCode,
                                loading: false
                            });
                            break;
                        default:
                            this.setState({
                                message: 'static.unkownError',
                                loading: false
                            });
                            break;
                    }
                }
            }
        );
    }
    /**
     * This function is called when user decline the user agreement
     */
    decline() {
        let keysToRemove = ["token-" + AuthenticationService.getLoggedInUserId(), "user-" + AuthenticationService.getLoggedInUserId(), "curUser", "lang", "typeOfSession", "i18nextLng", "lastActionTaken", "sessionType"];
        keysToRemove.forEach(k => localStorage.removeItem(k));
        this.props.history.push(`/login`)
    }
    /**
     * This is used to display the content
     * @returns This returns user agreement screen
     */
    render() {
        return (
            <div className="animated fadeIn">
                <h5 id="div2">{i18n.t(this.state.message)}</h5>
                <div className="col-md-12">
                    <Col xs="12" sm="12">
                        <Card>
                            <CardHeader>
                                <FormGroup>
                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.decline}><i className="fa fa-times"></i> {i18n.t('static.common.decline')}</Button>
                                    <Button type="submit" size="md" color="success" onClick={this.accept} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.accept')}</Button>
                                </FormGroup>
                            </CardHeader>
                            <CardBody>

                                <Col xs="11" sm="11">
                                    <div className="text-justify">
                                        <h4 className="UserTitle">End-User License Agreement</h4>
                                        <p>
                                            This End-User License Agreement (EULA) is a legal agreement between you, either in your
                                            capacity as an individual or duly authorized agent acting as or on behalf an
                                            entity, and Chemonics International (hereinafter “Chemonics” or “Owner”)
                                            for your authorized use of its  Quantification Analytics Tool (QAT) and its applications.
                                            IF YOU DO NOT AGREE TO ALL OF THE TERMS OF THIS EULA, DO NOT INSTALL, USE OR COPY THE
                                            SOFTWARE.
                                        </p>
                                        <p>
                                            <h4 className="UserTitle">Summary</h4>
                                            <ul class="list-group">
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>  &nbsp;&nbsp;<p>You must agree to all of the terms of this EULA to use this Software.</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp;&nbsp;<p>If so, you may use the Software for free and for any lawful purpose.</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>&nbsp; &nbsp;<p align="justifly">This Software automatically communicates with QAT servers for three reasons: <br></br>(1) To receive and install updates<br></br> (2) To send error reports and <br></br>(3) To send anonymized usage information. <br></br>You can view sample data to see what information is sent, and you may opt out of sending the anonymized usage data.</p></li>
                                                <li class="list-summery "><i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p>This Software is provided "as-is" with no warranties, and you agree that the Owner is not liable for anything you do with it.</p></li>
                                            </ul>
                                        </p>
                                        <p>
                                            <h4 className="UserTitle">The Agreement</h4>
                                            By downloading, installing, using, or copying the Software, you accept and agree to be bound by the terms of this EULA. If you do not agree to all the terms of this EULA, you may not download, install, use or copy the Software.

                                        </p>
                                        <p>
                                            <h4 className="UserTitle"> The License</h4>
                                            This EULA entitles you to install as many copies of the Software as you want and use the Software for any lawful purpose consistent with this EULA Your license to use the Software is expressly conditioned upon your agreement to all the terms of this EULA. This software is licensed, not sold. Notwithstanding any provision in this EULA to the contrary, this EULA shall not bind the U.S. Agency for International Development (USAID) nor any person acting in their capacity as a USAID employee or staff member.  In the event that a EULA is executed by any such person, that EULA shall be considered null and void.
                                            All other rights, privileges, duties, and obligations of the Owner pursuant to GHSC-PSM Contract through incorporation by clause or reference remain in effect and fully enforceable, and will control in the event of any discrepancy between the GHSC-PSM Contract and any provision herein included and  created by this EULA.

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
                                                    <li class=""> &nbsp;&nbsp;<p>Updating the Software</p></li>
                                                    <li class=" ">&nbsp; &nbsp; <p>Sending error reports and</p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>Sending anonymized usage data so we may improve the Software.</p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>If you would like to learn more about the specific information we send,<br></br> please visit <a href="https://desktop.QAT.org/usage-data/" target=" /blank">https://desktop.QAT.org/usage-data/</a>.</p></li>
                                                </ol>
                                            </div>
                                        </p>

                                        <p>
                                            <h4 className="UserTitle">Automatic Software Updates</h4>
                                            <p>The Software sends information described at the URL above to determine whether
                                                there are any patches, bug fixes, updates, upgrades or other modifications
                                                to improve the Software. You agree that the Software may automatically install
                                                any such improvements to the Software on your computer without providing any
                                                further notice or receiving any additional consent. This feature may not be
                                                disabled. If you do not want to receive automatic updates, you must uninstall
                                                the Software. </p>

                                            <ul className="list-group">
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp;&nbsp;<p><strong>Error Reports :</strong> In order to help us improve the Software, when the Software encounters certain errors, it will automatically send some information to QAT about the error (as described at the URL above). This feature may not be disabled. If you do not want to send error reports to QAT, you must uninstall the Software.</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>&nbsp; &nbsp; <p><strong>Anonymized Usage Data :</strong> QAT collects anonymized data about your usage of the Software to help us improve it. Approximately once a day the Software sends such data (as described in more detail at the URL above) to QAT's servers. If you do not want to send anonymized usage data to QAT, you may opt out by changing your settings in the Preferences view.</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p><strong>Master Data and Reference Data Sync :</strong> The offline app regularly sends and receives data from the web application. This cannot be disabled as it is a core component of the application.</p></li>

                                            </ul>
                                        </p>
                                        <p>
                                            <h4 className="UserTitle">Open-Source Notices</h4>
                                            <p>The Software may be subject to open-source software licenses ("Open-Source Components"),
                                                which means any software license approved as open-source licenses by the Open Source
                                                Initiative or any substantially similar licenses, including without limitation any
                                                license that, as a condition of distribution of the software licensed under such
                                                license, requires that the distributor make the software available in source code
                                                format. The Software documentation includes copies of the licenses applicable to the
                                                Open-Source Components.
                                            </p>
                                            <p>To the extent there is conflict between the license terms covering the Open-Source
                                                Components and this EULA, the terms of such licenses will apply in lieu of the terms
                                                of this EULA. To the extent the terms of the licenses applicable to Open-Source
                                                Components prohibit any of the restrictions in this Agreement with respect to such
                                                Open-Source Component, such restrictions will not apply to such Open-Source Component.
                                                To the extent the terms of the licenses applicable to Open-Source Components require
                                                Licensor to make an offer to provide source code in connection with the Product,
                                                such offer is hereby made, and you may exercise it by
                                                contacting <a href="support@QAT.org" target=" /blank">support@QAT.org</a></p>
                                        </p>

                                        <p>
                                            <h4 className="UserTitle">Intellectual Property Notices</h4>
                                            <p>This license, the software subject matter thereof, and The Software in and of itself
                                                are subject to and controlled by the relevant controlling terms and conditions
                                                related to intellectual property enumerated by clause or incorporated under the
                                                GHSC-PSM prime contract, namely 48 CFR 752.227-14 Rights in Data (general) and
                                                USAID’s unlimited license to the QAT and its applications pursuant thereto,
                                                and this section of the license must be in agreement therewith in order to be
                                                enforceable.
                                            </p>
                                            <p>The Software and all worldwide copyrights, trade secrets, and other intellectual
                                                property rights therein are the exclusive property of QAT. QAT reserves all rights
                                                in and to the Software not expressly granted to you in this EULA.
                                            </p>
                                            <p>The names QAT, QAT Desktop, and related QAT logos and/or stylized names are trademarks
                                                of QAT. You agree not to display or use these trademarks in any manner without the
                                                Owner’s prior, written permission, except as allowed by QAT's Logos and
                                                Usage Policy:  <a href="https://QAT.com/logos." target=" /blank">https://QAT.com/logos</a>.</p>
                                        </p>
                                        <p>
                                            <h4 className="UserTitle">Disclaimers and Limitations on Liability</h4>
                                            <p>THE SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, AND NO WARRANTY, EITHER EXPRESS OR IMPLIED, IS GIVEN. YOUR USE OF THE SOFTWARE IS AT YOUR SOLE RISK.<br></br> The Owner does not warrant that</p>
                                            <ul className="list-group">
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp;&nbsp;<p>The Software will meet your specific requirements.</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>&nbsp; &nbsp; <p>The Software is fully compatible with any particular platform.</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p> Your use of the Software will be uninterrupted, timely, secure, or error-free.</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p>The results that may be obtained from the use of the Software will be accurate or reliable. </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p> The quality of any products, services, information, or other material purchased or obtained by you through the Software will meet your expectations. </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p>Or any errors in the Software will be corrected.</p></li>


                                            </ul>
                                            <p>
                                                YOU EXPRESSLY UNDERSTAND AND AGREE THAT THE OWNER SHALL NOT BE LIABLE FOR ANY DIRECT,
                                                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR EXEMPLARY DAMAGES, INCLUDING BUT NOT
                                                LIMITED TO, DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA OR OTHER INTANGIBLE
                                                LOSSES (EVEN IF THE OWNER HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES)
                                                RELATED TO THE  SOFTWARE,<br></br>Including, For Example:
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
                                            <p>The Owner reserves the right at any time and from time to time to modify or discontinue,
                                                temporarily  or permanently, the Software (or any part thereof) with or without notice.
                                                The Owner shall not be liable to you or to any third-party for any modification,
                                                price change, suspension or discontinuance of the Software. </p>
                                        </p>

                                        <p>
                                            <h4 className="UserTitle">Miscellanea  </h4>
                                            <div className="rounded-list list-group">
                                                <ol className="list-group">
                                                    <li class=""> &nbsp;&nbsp;<p>If you configure the Software to work with one or more accounts
                                                        on the <a href="QuantificationAnalytics.org" target=" /blank">QuantificationAnalytics.org</a> website or with an instance of QAT Desktop, your use
                                                        of the Software will also be governed by the <a href="QuantificationAnalytics.org" target=" /blank">QuantificationAnalytics.org</a> website Terms of
                                                        Service and/or the license agreement applicable to your instance of QAT Desktop.</p>
                                                    </li>
                                                    <li class=" ">&nbsp; &nbsp; <p>The failure of QAT to exercise or enforce any right or
                                                        provision of this EULA shall not constitute a waiver of such right or provision.</p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>This EULA constitutes the entire agreement between you and  the Owner, and governs your use of the Software,
                                                        superseding any prior agreements between you and the Owner (including, but not limited
                                                        to, any prior versions of the EULA), and subject to all terms, conditions, and
                                                        obligations between Owner and . You further agree to fully and completely indemnify
                                                        Owner from any and all individual and aggregate claims for damages that may be
                                                        brought against Owner with regard to or arising from the aforementioned conditions
                                                        in this clause (Incorporations by Reference: ADS 318 Intellectual Property
                                                        Rights. c</p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>You agree that this EULA and your use of the Software
                                                        are governed under District of Columbia law and any dispute related to the
                                                        Software must be brought in a tribunal of competent jurisdiction located in
                                                        or near Washington, DC. </p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>Please send any questions about this EULA to <a href="support@QAT.org">support@QAT.org</a></p></li>
                                                </ol>
                                            </div>
                                        </p>
                                        <p>
                                            English shall be the controlling language for this Agreement for any and all procedural and
                                            substantive matter related thereto, including but not limited to disagreement or other discrepancy
                                            between the English original writing and translated iteration, in which case the English shall control in full.
                                        </p>




                                    </div>
                                </Col><br />
                                <hr></hr><br />
                                <Col xs="11" sm="11">
                                    <div className="text-justify">
                                        <h4 className="UserTitle">Conditions générales d’utilisation</h4>
                                        <p>
                                            Les présentes conditions générales d’utilisation (CGU) constituent un accord contractuel entre vous-même,
                                            en votre qualité d’individu ou en tant que représentant dûment autorisé agissant en tant que ou au nom d’une
                                            entité, et Chemonics International (ci-après dénommée « Chemonics » ou le « propriétaire »), afin de vous
                                            autoriser à utiliser son outil d’analyse quantitative (QAT, Quantification Analytics Tool) et ses applications.
                                            Si vous n’acceptez pas toutes les modalités des présentes CGU, veuillez ne pas installer, utiliser ou copier le logiciel.
                                        </p>
                                        <p>
                                            <h4 className="UserTitle">Résumé</h4>
                                            <ul class="list-group">
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>  &nbsp;&nbsp;<p>Pour utiliser le logiciel, vous devez accepter l’ensemble des modalités des présentes CGU. </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp;&nbsp;<p>Dans ce cas, vous pouvez utiliser le logiciel gratuitement à toute fin licite. </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>&nbsp; &nbsp;<p align="justifly">Le présent logiciel communique automatiquement avec les serveurs QAT à trois fins spécifiques : <br></br>(1) réception et installation des mises à jour ;<br></br> (2) envoi de rapports d’erreur ; <br></br>(3) envoi d’informations d’utilisation sous forme anonyme. <br></br>Vous pouvez consulter un échantillon de données afin de connaître les informations sont envoyées et vous pouvez choisir de ne pas envoyer de données d’utilisation sous forme anonyme. </p></li>
                                                <li class="list-summery "><i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p>Le present logiciel est fourni « en l’état », sans aucune garantie, et vous convenez que le propriétaire ne saurait être tenu pour responsable de l’utilisation que vous en faites. </p></li>
                                            </ul>
                                        </p>
                                        <p>
                                            <h4 className="UserTitle">Le contrat</h4>
                                            Lorsque vous téléchargez, installez, utilisez ou copiez le logiciel, vous acceptez d’être lié par les dispositions des présentes CGU. Si vous n’acceptez pas toutes les modalités des présentes CGU, vous ne pouvez pas télécharger, installer, utiliser ou copier le logiciel.

                                        </p>
                                        <p>
                                            <h4 className="UserTitle"> La licence </h4>
                                            En vertu des présentes CGU, vous pouvez installer autant de copies du logiciel que vous le souhaitez et utiliser le logiciel à n’importe quelle fin licite conforme aux présentes CGU. La licence d’utilisation du logiciel est expressément subordonnée à votre acceptation de toutes les dispositions des présentes CGU. Le logiciel vous est concédé sous licence et n’est pas vendu. Nonobstant toute disposition contraire des présentes CGU, les présentes CGU n’engageront pas l’USAID (U.S. Agency for International Development) ni une quelconque personne agissant en son nom en tant qu’employé ou membre du personnel de l’USAID. Au cas où des CGU sont exécutées par une telle personne, lesdites CGU seront réputées nulles et non avenues.
                                            Tous les autres droits, devoirs, privilèges et obligations du propriétaire en vertu du contrat GHSC-PSM du fait de son intégration par renvoi ou via une disposition restent de plein effet et prévaudront en cas de contradiction entre le contrat GHSC-PSM et toute disposition intégrée aux présentes ou créée par les présentes CGU.

                                        </p>
                                        <p>


                                            <h4 className="UserTitle"> Restrictions</h4>
                                            <div className="rounded-list list-group">
                                                <ol className="list-group">
                                                    <li class=""> &nbsp;&nbsp;<p>Vous devez utiliser le logiciel dans les limites du droit applicable dans la ou les juridictions où vous l’utilisez. </p></li>
                                                    <li class=" ">&nbsp; &nbsp; <p>Il vous est interdit de vendre, revendre, louer ou échanger le logiciel contre quoi que ce soit de valeur. </p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>Vous pouvez redistribuer le logiciel, mais vous devez lui intégrer les présentes CGU, et vous ne pouvez pas reconditionner le logiciel ni le regrouper avec un autre logiciel. </p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>Il vous est interdit de supprimer ou de modifier les mentions ou marques de propriété présentes sur le logiciel. </p></li>
                                                </ol>
                                            </div>
                                        </p>
                                        <p>
                                            <h4 className="UserTitle">Avis de confidentialité </h4>
                                            <div className="rounded-list list-group">
                                                Le logiciel communique automatiquement avec les serveurs QAT à trois fins spécifiques :
                                                <ol className="list-group">
                                                    <li class=""> &nbsp;&nbsp;<p>mise à jour du logiciel ;</p></li>
                                                    <li class=" ">&nbsp; &nbsp; <p>envoi de rapports d’erreurs ;</p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>envoi de données d’utilisation sous forme anonyme afin de nous aider à améliorer le logiciel.</p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p> Pour en savoir plus à propos des informations spécifiques qui sont envoyées,<br></br> veuillez consulter la page <a href="https://desktop.QAT.org/usage-data/" target=" /blank">https://desktop.QAT.org/usage-data/</a>.</p></li>
                                                </ol>
                                            </div>
                                        </p>

                                        <p>
                                            <h4 className="UserTitle">Mises à niveau automatiques du logiciel</h4>
                                            <p>Le logiciel envoie les informations précisées à l’adresse URL ci-dessus afin de déterminer
                                                si des correctifs, corrections de bogues, mises à niveau, mises à jour ou autres modifications
                                                servant à améliorer le logiciel sont disponibles. Vous acceptez que ces améliorations soient
                                                installées automatiquement sur le logiciel téléchargé sur votre ordinateur sans qu’un préavis ne vous
                                                soit adressé ni que votre consentement ne vous soit à nouveau demandé. Cette fonctionnalité ne
                                                peut pas être désactivée. Si vous refusez que le logiciel soit mis à jour de manière automatique,
                                                vous devez le désinstaller.  </p>

                                            <ul className="list-group">
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp;&nbsp;<p><strong>Rapports d’erreur :</strong> Pour nous aider à améliorer le logiciel, lorsque certaines erreurs se produisent, le logiciel enverra automatiquement certaines informations à QAT, conformément à ce qui est précisé à l’adresse URL ci-dessus. Cette fonctionnalité ne peut pas être désactivée. Si vous refusez que des rapports d’erreur soient envoyés à QAT, vous devez désinstaller le logiciel. </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>&nbsp; &nbsp; <p><strong>Données d’utilisation anonymisées :</strong> QAT collecte des données anonymisées à propos de votre utilisation du logiciel pour nous aider à améliorer celui-ci. À raison d’une fois par jour en moyenne, le logiciel envoie ces données vers les serveurs de QAT, conformément à ce qui est précisé à l’adresse URL ci-dessus. Si vous ne souhaitez pas que des données d’utilisation anonymes soient envoyées à QAT, accédez à vos paramètres dans le volet Préférences pour désactiver cette fonctionnalité. </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p><strong>Synchronisation des données de référence :</strong> L’application hors ligne envoie et reçoit des données depuis l’application web. Cette fonctionnalité ne peut pas être désactivée, car il s’agit d’un élément central de l’application. </p></li>

                                            </ul>
                                        </p>
                                        <p>
                                            <h4 className="UserTitle">Notifications Open Source </h4>
                                            <p>Le logiciel est susceptible d’être soumis à des licences logicielles (« composants open source »),
                                                ce qui signifie toute licence logicielle approuvée comme licence open source par l’Open Source
                                                Initiative ou toute autre licence semblable, y compris sans toutefois s’y limiter toute licence qui,
                                                en tant que condition de distribution du logiciel attribué sous licence en vertu de ladite licence,
                                                nécessite que l’éditeur publie le logiciel au format code source. Une copie des licences applicables
                                                aux composants open source est incluse dans les documents du logiciel.
                                            </p>
                                            <p>S’il devait exister un conflit entre les dispositions des licences couvrant les
                                                composants open source et les présentes CGU, les dispositions de ces licences
                                                s’appliqueront en lieu et place des dispositions des présentes CGU. Dans la
                                                mesure où les dispositions des licences applicables aux composants open source
                                                interdisent l’applicabilité d’une quelconque des restrictions contenues dans le
                                                présent contrat eu égard à un de ces composants open source, ces restrictions ne
                                                s’appliqueront pas à ce composant open source. Dans la mesure où les conditions des
                                                licences applicables aux composants open source nécessitent que le concédant offre
                                                de fournir le code source en relation avec le produit, une telle offre est réputée survenue en vertu des présentes,
                                                et vous pouvez l’exercer en contactant <a href="support@QAT.org" target=" /blank">support@QAT.org</a></p>
                                        </p>

                                        <p>
                                            <h4 className="UserTitle">Notifications relatives à la propriété intellectuelle</h4>
                                            <p>La licence relative au logiciel dont il est ici question et ce logiciel en lui-même sont soumis
                                                aux conditions générales relatives à la propriété intellectuelle, énoncées dans une disposition
                                                ou intégrées en vertu du contrat principal GHSC-PSM, à savoir la clause 48 CFR 752.227-14 Droits
                                                en matière de données (notions générales) ainsi que la licence illimitée de l’USAID eu égard au QAT
                                                et ses applications en vertu des présentes. Cette section de la licence doit être en accord avec
                                                lesdites conditions générales pour être applicable.
                                            </p>
                                            <p>Le logiciel et tous les droits d’auteur, secrets commerciaux et autres droits ayant trait à
                                                la propriété intellectuelle à travers le monde sont la propriété exclusive de QAT.
                                                QAT se réserve tous les droits associés au logiciel qui ne sont pas expressément accordés par les présentes CGU.
                                            </p>
                                            <p>Les noms QAT, QAT Desktop et autres logos ou appellations stylisées QAT sont des marques déposées par QAT.
                                                Vous acceptez de ne pas afficher ni utiliser sans l’autorisation écrite préalable du propriétaire ces marques
                                                déposées de manière que ce soit, sauf de la manière autorisée par la politique relative aux logos et à l’utilisation
                                                du nom de marque de QAT, disponible à l’adresse  <a href="https://QAT.com/logos." target=" /blank">https://QAT.com/logos</a>.</p>
                                        </p>
                                        <p>
                                            <h4 className="UserTitle">Avis de non-responsabilité et limitations de responsabilité </h4>
                                            <p>LE LOGICIEL EST FOURNI « EN L’ÉTAT » ET NE BÉNÉFICIE D’AUCUNE GARANTIE, EXPRESSE OU IMPLICITE. VOUS UTILISEZ CE LOGICIEL À VOS PROPRES RISQUES. Le propriétaire ne garantit pas que</p>
                                            <ul className="list-group">
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp;&nbsp;<p>le logiciel répondra à vos besoins spécifiques ;</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>&nbsp; &nbsp; <p>le logiciel est entièrement compatible avec une quelconque plateforme spécifique ;</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p> votre utilisation du logiciel se fera de manière ininterrompue, régulière, sécurisée ou sans erreur ;</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p>les résultats susceptibles d’être obtenus avec le logiciel sont exacts et fiables ;  </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p> la qualité des produits, services, informations ou de tout autre matériel achetés ou obtenus par vous-même du fait de l’utilisation du logiciel répondra à vos attentes ; ni que </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p>toute erreur présente dans le logiciel sera corrigée. </p></li>


                                            </ul>
                                            <p>
                                                VOUS COMPRENEZ ET CONVENEZ EXPRESSÉMENT QUE LE PROPRIÉTAIRE NE POURRA PAS ÊTRE TENU POUR RESPONSABLE
                                                DE TOUT DOMMAGE DIRECT, INDIRECT, INCIDENTEL, SPÉCIAL, CONSÉCUTIF OU EXEMPLAIRE, Y COMPRIS SANS TOUTEFOIS
                                                S’Y LIMITER TOUT DOMMAGE DÉCOULANT D’UNE PERTE DE PROFITS, DE CLIENTÈLE, D’UTILISATION, DE DONNÉES OU DE
                                                TOUTE AUTRE PERTE IMMATÉRIELLE RÉSULTANT DE L’UTILISATION DU LOGICIEL, MÊME SI LE PROPRIÉTAIRE A ÉTÉ AVISÉ
                                                DE LA POSSIBILITÉ DE TELS DOMMAGES, y compris dans les cas suivants (liste non exhaustive) :
                                            </p>
                                            <ul className="list-group">
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp;&nbsp;<p>utilisation du logiciel ou incapacité à utiliser le logiciel ;</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>&nbsp; &nbsp; <p>coût de l’achat de biens ou de services de substitution résultant de tous biens, données,
                                                    informations ou services achetés ou obtenus ou de messages reçus ou de transactions conclues par l’intermédiaire du logiciel ;</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p> tout accès ou toute modification non autorisé de vos transmissions ou données ;</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p>déclarations ou comportement d’un tiers sur le logiciel ;</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p> ou toute autre question en lien avec le logiciel. </p></li>
                                            </ul>
                                            <p>Le propriétaire se réserve le droit, à tout moment et de manière occasionnelle,
                                                de modifier ou de rendre indisponible le logiciel (ou toute partie de celui-ci),
                                                de façon temporaire ou permanente, avec ou sans préavis. Le propriétaire n’endosse
                                                aucune responsabilité vis-à-vis de vous-même ou d’une quelconque tierce partie,
                                                en cas de modification, variation tarifaire, interruption ou cessation de service du logiciel.  </p>
                                        </p>

                                        <p>
                                            <h4 className="UserTitle">Divers  </h4>
                                            <div className="rounded-list list-group">
                                                <ol className="list-group">
                                                    <li class=""> &nbsp;&nbsp;<p>Si vous configurez le logiciel en vue de travailler avec un ou plusieurs comptes sur le site <a href="QuantificationAnalytics.org" target=" /blank">QuantificationAnalytics.org</a> ou avec une instance de QAT Desktop, votre utilisation du logiciel sera également régie par les conditions d’utilisation et/ou par le contrat de licence du site <a href="QuantificationAnalytics.org" target=" /blank">QuantificationAnalytics.org</a> applicable à votre version de QAT Desktop.</p>
                                                    </li>
                                                    <li class=" ">&nbsp; &nbsp; <p>L’inexécution ou la non-application par QAT d’un droit ou d’une disposition des présentes CGU ne constitue pas une renonciation audit droit ou à ladite disposition. </p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>Les présentes CGU constituent l’intégralité du contrat entre vous-même et
                                                        le propriétaire et régissent votre utilisation du logiciel, se substituant à tout accord préalable
                                                        entre vous-même et le propriétaire (y compris, sans toutefois s’y limiter, toute version précédente
                                                        des présentes CGU), et sous réserve de toute disposition, condition ou obligation entre le propriétaire
                                                        et l'utilisateur. En outre, vous acceptez d’indemniser le propriétaire de toute réclamation pour dommage
                                                        faite à titre individuel ou collectif à l’encontre du propriétaire eu égard aux conditions susmentionnées
                                                        dans cette clause (Incorporations par renvoi : ADS 318 Droits de propriété intellectuelle). </p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>Vous convenez que les présentes CGU et votre utilisation du
                                                        logiciel sont régies par le droit du district de Columbia (États-Unis) et que tout désaccord
                                                        relatif au logiciel doit être porté devant une juridiction compétente, située à Washington, DC (États-Unis) ou à proximité. </p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>Si vous avez des questions à propos des présentes CGU, veuillez les adresser à <a href="support@QAT.org">support@QAT.org</a></p></li>
                                                </ol>
                                            </div>
                                        </p>
                                        <p>
                                            L’anglais est la langue de travail pour toute question relative au présent contrat et à
                                            toute question procédurale et matérielle en lien avec celui-ci, y compris, sans toutefois
                                            s’y limiter, en cas de désaccord ou de divergence entre la version écrite originale en langue
                                            anglaise et toute traduction, auquel cas la version en langue anglaise fera foi.
                                        </p>



                                    </div>
                                </Col><br />
                                <hr></hr><br />
                                <Col xs="11" sm="11">
                                    <div className="text-justify">
                                        <h4 className="UserTitle">Acordo de Licença do Utilizador Final </h4>
                                        <p>
                                            Este Acordo de Licença do Utilizador Final (ALUF) é um acordo jurídico entre si,
                                            quer na capacidade individual ou de agente devidamente autorizado a agir em nome
                                            de uma entidade, e a Chemonics International (doravante “Chemonics” ou “Proprietário”)
                                            relativamente ao uso autorizado da respetiva Quantification Analytics Tool (QAT) e das
                                            suas aplicações. SE NÃO ACEITAR TODOS OS TERMOS DO PRESENTE ALUF, NÃO INSTALE, UTILIZE OU COPIE O SOFTWARE.
                                        </p>
                                        <p>
                                            <h4 className="UserTitle">Resumo</h4>
                                            <ul class="list-group">
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>  &nbsp;&nbsp;<p>Tem de aceitar todos os termos do presente ALUF para utilizar este Software. </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp;&nbsp;<p>Se o fizer, pode utilizar o Software gratuitamente e para qualquer finalidade lícita. </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>&nbsp; &nbsp;<p align="justifly">Este Software comunica automaticamente com servidores da QAT por três motivos:  <br></br>(1) para receber e instalar atualizações;<br></br> (2) para enviar relatórios de erros; e  <br></br>(3) para enviar informações de utilização anonimizadas. <br></br>Pode visualizar dados de amostra para saber que informações são enviadas e pode optar por não enviar os dados de utilização anonimizados. </p></li>
                                                <li class="list-summery "><i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p>Este Software é fornecido “tal como está”, sem garantias, e o utilizador aceita que o Proprietário não é responsável por nada que faça com ele. </p></li>
                                            </ul>
                                        </p>
                                        <p>
                                            <h4 className="UserTitle">O Acordo</h4>
                                            Ao transferir, instalar, utilizar ou copiar o Software, aceita e concorda em vincular-se aos termos do presente ALUF. Se não aceitar todos os termos do presente ALUF, não transfira, instale, utilize ou copie o Software.
                                        </p>
                                        <p>
                                            <h4 className="UserTitle"> A Licença</h4>
                                            O presente ALUF habilita-o a instalar quantas cópias do Software pretender e a utilizar o Software para qualquer finalidade lícita consistente com o presente ALUF. A sua licença de utilização do Software é expressamente condicionada pela sua aceitação de todos os termos do presente ALUF. Este software é licenciado, e não vendido. Não obstante qualquer disposição em contrário no presente ALUF, este ALUF não vincula a U.S. Agency for International Development (USAID) nem qualquer pessoa que aja na capacidade de funcionário ou membro do pessoal da USAID.  Caso um ALUF seja executado por tal pessoa, esse ALUF será considerado nulo e inválido.
                                            Todos os outros direitos, privilégios, deveres e obrigações do Proprietário conforme o Contrato GHSC-PSM através da incorporação por cláusula ou referência permanecem em vigor e totalmente aplicáveis, e exercerão o controlo caso haja alguma discrepância entre o Contrato GHSC-PSM e qualquer disposição incluída no e criada pelo presente ALUF.
                                        </p>
                                        <p>


                                            <h4 className="UserTitle">As Restrições </h4>
                                            <div className="rounded-list list-group">
                                                <ol className="list-group">
                                                    <li class=""> &nbsp;&nbsp;<p>Ao utilizar o Software, deve fazê-lo de forma a cumprir a legislação aplicável na(s) jurisdição(ões) onde utiliza o Software. </p></li>
                                                    <li class=" ">&nbsp; &nbsp; <p>Não pode vender, revender, alugar, locar ou trocar o Software por algo de valor. </p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>Pode redistribuir o software, mas este deverá incluir o presente ALUF e não poderá reembalar ou juntar o Software a qualquer outro software. </p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>Não pode remover ou alterar quaisquer marcas ou avisos proprietários no Software. </p></li>
                                                </ol>
                                            </div>
                                        </p>
                                        <p>
                                            <h4 className="UserTitle">Avisos de privacidade </h4>
                                            <div className="rounded-list list-group">
                                                O Software comunica automaticamente com servidores da QAT para três finalidades:
                                                <ol className="list-group">
                                                    <li class=""> &nbsp;&nbsp;<p>atualizar o Software;</p></li>
                                                    <li class=" ">&nbsp; &nbsp; <p>enviar relatórios de erros; e</p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>enviar dados de utilização para podermos melhorar o Software. </p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>Para mais informações acerca das informações específicas que enviamos,<br></br> visite <a href="https://desktop.QAT.org/usage-data/" target=" /blank">https://desktop.QAT.org/usage-data/</a>.</p></li>
                                                </ol>
                                            </div>
                                        </p>

                                        <p>
                                            <h4 className="UserTitle">Atualizações de software automáticas</h4>
                                            <p>O Software envia as informações descritas no URL acima para determinar se existem correções,
                                                correções de erros, atualizações ou outras modificações que melhorem o Software. O utilizador
                                                aceita que o Software poderá instalar automaticamente tais melhorias do Software no seu computador
                                                sem aviso prévio e sem receber consentimento adicional. Esta funcionalidade não pode ser desativada.
                                                Se não pretender receber atualizações automáticas, terá de desinstalar o Software. </p>

                                            <ul className="list-group">
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp;&nbsp;<p><strong>Relatórios de erros :</strong> Para nos ajudar a melhorar o Software, quando o Software encontra determinados erros, envia automaticamente algumas informações à QAT acerca do erro (conforme descrito no URL acima). Esta funcionalidade não pode ser desativada. Se não pretender enviar relatórios de erros à QAT, terá de desinstalar o Software. </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>&nbsp; &nbsp; <p><strong>Dados de utilização anonimizados :</strong> A QAT recolhe dados anonimizados acerca da sua utilização do Software para nos ajudar a melhorá-lo. Aproximadamente uma vez por dia, o Software envia estes dados (conforme descrito com mais pormenor no URL acima) para os servidores da QAT. Se não pretender enviar dados de utilização anonimizados para a QAT, pode optar por não o fazer alterando as definições na vista Preferências. </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p><strong>Sincronização de dados de referência e dados principais :</strong> A app offline envia e recebe regularmente dados da aplicação da web. Esta ação não pode ser desativada, uma vez que é um componente essencial da aplicação. </p></li>

                                            </ul>
                                        </p>
                                        <p>
                                            <h4 className="UserTitle">Avisos de software open-source </h4>
                                            <p>O Software poderá estar sujeito a licenças de software open-source (“Componentes Open-Source”),
                                                o que significa qualquer licença de software aprovada como licença open-source pela Open Source
                                                Initiative ou outra licença substancialmente semelhante, incluindo, sem limitação, qualquer licença
                                                que, como condição da distribuição do software licenciado ao abrigo da referida licença, requeira
                                                que o distribuidor torne o software disponível no formato de código fonte. A documentação do Software
                                                inclui cópias das licenças aplicáveis aos Componentes Open-Source.
                                            </p>
                                            <p>Na medida em que haja conflito entre os termos da licença que abrange os Componentes
                                                Open-Source e o presente ALUF, os termos das referidas licenças serão aplicados,
                                                em vez dos termos do presente ALUF. Na medida em que os termos das licenças aplicáveis
                                                a Componentes Open-Source proíbam quaisquer restrições do presente Acordo relativamente
                                                aos referidos Componentes Open-Source, tais restrições não serão aplicadas aos referidos
                                                Componentes Open-Source. Na medida em que os termos das licenças aplicáveis a Componentes
                                                Open-Source requeiram que o Licenciador se ofereça a fornecer código fonte associado ao
                                                Produto, tal oferta é efetuada pelo presente e poderá exercê-la
                                                contactando  <a href="support@QAT.org" target=" /blank">support@QAT.org</a></p>
                                        </p>

                                        <p>
                                            <h4 className="UserTitle">Avisos de propriedade intelectual </h4>
                                            <p>Esta licença, as matérias relativas a software por ela abrangidas e o Software por si
                                                só estão sujeitos a e são controlados pelos termos e condições controladores relevantes
                                                relacionados com a propriedade intelectual enumerada por cláusula ou incorporada ao abrigo
                                                do contrato principal GHSC-PSM, nomeadamente os Direitos sobre dados 48 CFR 752.227-14 (geral)
                                                e a licença ilimitada da USAID relativa à QAT e às respetivas aplicações, e esta secção da licença
                                                terá de estar em concordância com o mesmo para ser aplicável.
                                            </p>
                                            <p>O Software e todos os direitos de autor, segredos comerciais e outros direitos de propriedade
                                                intelectual a nível mundial nele presentes são propriedade exclusiva da QAT. A QAT reserva
                                                todos os direitos de e relacionados com o Software que não lhe sejam expressamente concedidos no presente ALUF.
                                            </p>
                                            <p>Os nomes QAT, QAT Desktop e logótipos e/ou nomes estilizados da QAT são marcas comerciais
                                                da QAT. O utilizador concorda em não apresentar ou utilizar estas marcas comerciais de qualquer
                                                forma sem a autorização prévia por escrito do Proprietário, exceto conforme permitido pela Política
                                                de Logótipos e Utilização da QAT:  <a href="https://QAT.com/logos." target=" /blank">https://QAT.com/logos</a>.</p>
                                        </p>
                                        <p>
                                            <h4 className="UserTitle">Renúncias e limitações de responsabilidade</h4>
                                            <p>O SOFTWARE É FORNECIDO “TAL COMO ESTÁ” E NÃO SÃO FORNECIDAS QUAISQUER GARANTIAS EXPLÍCITAS OU IMPLÍCITAS. O UTILIZADOR UTILIZA O SOFTWARE POR SUA CONTA E RISCO.<br></br> O Proprietário não garante que</p>
                                            <ul className="list-group">
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp;&nbsp;<p>o Software cumpra os seus requisitos específicos; </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>&nbsp; &nbsp; <p>o Software seja totalmente compatível com qualquer plataforma específica; </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p> a sua utilização do Software seja ininterrupta, atempada, segura ou livre de erros;</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p>os resultados que possam ser obtidos a partir da utilização do Software sejam precisos ou fiáveis; </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p> a qualidade de quaisquer produtos, serviços, informações ou outros materiais comprados ou obtidos por si através do Software cumpram as suas expectativas; ou </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p>quaisquer erros do Software sejam corrigidos. </p></li>


                                            </ul>
                                            <p>
                                                O UTILIZADOR COMPREENDE E ACEITA EXPRESSAMENTE QUE O PROPRIETÁRIO NÃO SERÁ RESPONSÁVEL POR QUAISQUER DANOS DIRETOS, INDIRETOS, ACIDENTAIS, ESPECIAIS, CONSEQUENTES OU EXEMPLARES, INCLUINDO, SEM LIMITAÇÃO, DANOS POR PERDAS DE LUCROS, FUNDOS DE COMÉRCIO, UTILIZAÇÃO, DADOS OU OUTRAS PERDAS INTANGÍVEIS (MESMO SE O PROPRIETÁRIO TIVER SIDO ALERTADO SOBRE A POSSIBILIDADE DE TAIS DANOS) RELACIONADOS COM O SOFTWARE,<br></br>incluindo, por exemplo:
                                            </p>
                                            <ul className="list-group">
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp;&nbsp;<p>a utilização ou incapacidade de utilização do Software;</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>&nbsp; &nbsp; <p>o custo de aquisição de bens e serviços de substituição resultante da compra ou obtenção de quaisquer bens, dados, informações ou serviços ou de mensagens recebidas ou transações efetuadas através de ou a partir do Software;</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p> o acesso não autorizado ou a alteração das suas transmissões ou dos seus dados;</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p>declarações ou comportamento de terceiros no Software;</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p> ou qualquer outro assunto relativo ao Software.</p></li>
                                            </ul>
                                            <p>O Proprietário reserva o direito de, a qualquer altura e periodicamente,
                                                modificar ou descontinuar, de forma temporária ou permanente, o Software
                                                (ou qualquer parte do mesmo), com ou sem aviso prévio. O Proprietário não
                                                será responsável perante o utilizador ou terceiros por qualquer modificação,
                                                alteração do preço, suspensão ou descontinuação do Software.  </p>
                                        </p>

                                        <p>
                                            <h4 className="UserTitle">Assuntos diversos </h4>
                                            <div className="rounded-list list-group">
                                                <ol className="list-group">
                                                    <li class=""> &nbsp;&nbsp;<p>Se configurar o Software de forma a funcionar com uma ou mais contas no website
                                                        <a href="QuantificationAnalytics.org" target=" /blank">QuantificationAnalytics.org</a> ou uma cópia do QAT Desktop,
                                                        a sua utilização do Software também será regida pelos Termos de Serviço do website <a href="QuantificationAnalytics.org" target=" /blank">QuantificationAnalytics.org</a> e/ou pelo acordo de licença aplicável à sua cópia do QAT Desktop. </p>
                                                    </li>
                                                    <li class=" ">&nbsp; &nbsp; <p>A falha da QAT em exercer ou aplicar qualquer direito ou disposição do presente ALUF não constitui a renúncia de tal direito ou disposição.</p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>O presente ALUF constitui o acordo total entre si e o Proprietário e rege a
                                                        sua utilização do Software, substituindo quaisquer acordos prévios entre si e o Proprietário
                                                        (incluindo, sem limitação, quaisquer versões anteriores do ALUF) e estando sujeito a todos os
                                                        termos, condições e obrigações entre o Proprietário e o utilizador. O utilizador aceita indemnizar
                                                        totalmente o Proprietário por quaisquer e todos os pedidos de indemnização individuais e agregados
                                                        que possam ser apresentados ao Proprietário em relação a ou resultantes das condições referidas
                                                        nesta cláusula (Incorporações por referência: Direitos de propriedade intelectual ADS 318. c </p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>O utilizador aceita que o presente ALUF e a sua utilização do Software
                                                        são regidos pela legislação do District of Columbia e que qualquer litígio relacionado com o Software
                                                        terá de ser levado a um tribunal de jurisdição competente situado em ou perto de Washington, DC. </p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>Envie quaisquer questões acerca do presente ALUF para <a href="support@QAT.org">support@QAT.org</a></p></li>
                                                </ol>
                                            </div>
                                        </p>
                                        <p>
                                            O inglês será o idioma de controlo do presente Acordo
                                            e de quaisquer e todos os assuntos processuais e materiais
                                            com ele relacionado, incluindo, sem limitação, a falta de concordância
                                            ou outras discrepâncias entre a escrita original em inglês e as cópias
                                            traduzidas, em cujo caso o inglês será o único idioma de controlo.
                                        </p>




                                    </div>
                                </Col><br />
                                <hr></hr><br />
                                <Col xs="11" sm="11">
                                    <div className="text-justify">
                                        <h4 className="UserTitle">Contrato de licencia para usuario final </h4>
                                        <p>
                                            El presente Contrato de licencia para usuario final (EULA, por sus siglas en inglés)
                                            es un acuerdo legal entre usted, ya sea en su carácter de individuo o de agente debidamente
                                            autorizado que actúa como una entidad o en su nombre, y Chemonics International
                                            (en adelante «Chemonics» o «Propietario») que lo autoriza a utilizar la Herramienta
                                            de análisis de cuantificación (QAT, por sus siglas en inglés) y sus aplicaciones.
                                            SI NO ESTÁ DE ACUERDO CON LA TOTALIDAD DE LOS TÉRMINOS DEL PRESENTE EULA, NO INSTALE, NO UTILICE NI COPIE EL SOFTWARE.
                                        </p>
                                        <p>
                                            <h4 className="UserTitle">Resumen</h4>
                                            <ul class="list-group">
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>  &nbsp;&nbsp;<p>Usted debe estar de acuerdo con la totalidad de los términos del presente EULA para usar el Software. </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp;&nbsp;<p>Si está de acuerdo, puede usar el Software sin cargo y para cualquier fin legal. </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>&nbsp; &nbsp;<p align="justifly">Este Software se comunica automáticamente con los servidores de la QAT por tres motivos: <br></br>(1) recibir e instalar actualizaciones,<br></br> (2) enviar informes de errores y <br></br>(3) enviar información de uso anonimizada. <br></br>Puede visualizar datos de ejemplo para ver qué información se envía y puede optar por no enviar los datos de uso anonimizados. </p></li>
                                                <li class="list-summery "><i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p>Este Software se proporciona «tal como está», sin garantías, y usted acepta que el Propietario no será responsable de nada de lo que usted haga con el Software. </p></li>
                                            </ul>
                                        </p>
                                        <p>
                                            <h4 className="UserTitle">El contrato</h4>
                                            Al descargar, instalar, utilizar o copiar el Software, usted acepta y acuerda quedar
                                            sujeto a los términos del presente EULA. Si no está de acuerdo con la totalidad de
                                            los términos del presente EULA, no puede descargar, instalar, utilizar ni copiar el Software. </p>
                                        <p>
                                            <h4 className="UserTitle">La licencia </h4>
                                            l presente EULA le da derecho a instalar tantas copias del Software como desee
                                            y a utilizar el Software para cualquier fin legal que guarde relación con el presente EULA.
                                            Su licencia para usar el Software está expresamente condicionada a que usted acepte todos
                                            los términos del presente EULA. Este software se ofrece bajo licencia, no se vende.
                                            No obstante cualquier disposición en contrario contenida en el presente EULA,
                                            el presente EULA no será vinculante para la Agencia de los EE. UU.
                                            para el Desarrollo Internacional (USAID, por sus siglas en inglés)
                                            ni para ninguna persona que actúe en calidad de empleado o miembro
                                            del personal de la USAID.  En el caso de que el EULA sea formalizado por
                                            alguna de estas personas, deberá considerarse nulo y sin efecto.<br />

                                            Todos los demás derechos, privilegios, deberes y obligaciones del Propietario en
                                            virtud del Contrato del programa GHSC-PSM, a través de la incorporación mediante una cláusula o referencia, siguen teniendo efecto y plena aplicación, y prevalecerán en caso de que surja una discrepancia entre el Contrato del programa GHSC-PSM y cualquiera de las disposiciones contenidas en el presente EULA y creadas por él.
                                        </p>
                                        <p>


                                            <h4 className="UserTitle">Las restricciones</h4>
                                            <div className="rounded-list list-group">
                                                <ol className="list-group">
                                                    <li class=""> &nbsp;&nbsp;<p>Cuando use el Software, deberá usarlo de tal manera que cumpla con las leyes aplicables de las jurisdicciones en las que lo utilice. </p></li>
                                                    <li class=" ">&nbsp; &nbsp; <p>No puede vender, revender, alquilar, arrendar ni intercambiar el Software por nada de valor. </p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>Puede redistribuir el Software, pero este debe incluir el presente EULA; no puede empaquetarlo ni reempaquetarlo con ningún otro software. </p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>No puede quitar ni alterar los avisos o marcas sobre derechos de propiedad que aparezcan en el Software. </p></li>
                                                </ol>
                                            </div>
                                        </p>
                                        <p>
                                            <h4 className="UserTitle">Avisos de privacidad </h4>
                                            <div className="rounded-list list-group">
                                                El Software se comunica automáticamente con los servidores de la QAT con tres fines:
                                                <ol className="list-group">
                                                    <li class=""> &nbsp;&nbsp;<p>actualizar el Software,</p></li>
                                                    <li class=" ">&nbsp; &nbsp; <p>enviar informes de errores y</p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>enviar datos de uso anonimizados para poder mejorar el Software. </p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>Si desea saber más sobre la información específica que enviamos,<br></br> visite <a href="https://desktop.QAT.org/usage-data/" target=" /blank">https://desktop.QAT.org/usage-data/</a>.</p></li>
                                                </ol>
                                            </div>
                                        </p>

                                        <p>
                                            <h4 className="UserTitle">Actualizaciones automáticas del Software.</h4>
                                            <p>El Software envía la información que se describe en la URL antes mencionada para determinar
                                                si hay revisiones, correcciones de errores, actualizaciones u otras modificaciones para
                                                mejorar el Software. Usted acepta que el Software pueda instalar automáticamente en su computadora
                                                cualquiera de dichas mejoras sin previo aviso ni consentimiento adicional. Esta función no se puede
                                                deshabilitar. Si no desea recibir actualizaciones automáticas, debe desinstalar el Software. </p>

                                            <ul className="list-group">
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp;&nbsp;<p><strong>Informes de errores :</strong> Cuando el Software encuentra determinados errores, envía automáticamente información relacionada con el error a la QAT (según se describe en la URL antes mencionada) para ayudarnos a mejorar el Software. Esta función no se puede deshabilitar. Si no desea recibir informes de errores en la QAT, debe desinstalar el Software. </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>&nbsp; &nbsp; <p><strong>Datos de uso anonimizados :</strong> La QAT recolecta datos anonimizados sobre el uso del Software para ayudarnos a mejorarlo. Aproximadamente una vez por día, el Software envía dichos datos (según se describe con más detalle en la URL antes mencionada) a los servidores de la QAT. Si no desea enviar datos de uso anonimizados a la QAT, puede cancelar dicha función cambiando su configuración en la vista Preferencias.</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p><strong>Sincronización de datos maestros y datos de referencia :</strong> La aplicación sin conexión periódicamente envía y recibe datos de la aplicación web. Esta función no se puede deshabilitar porque es un componente esencial de la aplicación. </p></li>

                                            </ul>
                                        </p>
                                        <p>
                                            <h4 className="UserTitle">Avisos sobre código abierto </h4>
                                            <p>El Software puede estar sujeto a licencias de software de código abierto («Componentes de código abierto»),
                                                es decir, a una licencia de software aprobada como licencia de código abierto por la Iniciativa para el
                                                Código Abierto o cualquier otra licencia similar en esencia, incluidas, entre otras, las licencias que exigen,
                                                como condición de distribución del software bajo dicha licencia, que el distribuidor proporcione el software en
                                                formato de código abierto. La documentación del Software incluye copias de las licencias aplicables a los Componentes de código abierto. </p>

                                            <p>En caso de que haya un conflicto entre los términos de las licencias que rigen los Componentes de código abierto y el presente EULA, se aplicarán los términos de dichas licencias en lugar de los términos del presente EULA. Si los términos de las licencias aplicables a los Componentes de código abierto prohíben cualquiera de las restricciones que aparecen en el presente Contrato con respecto a dicho Componente de código abierto, dichas restricciones no se aplicarán a dicho Componente de código abierto. Si los términos de las licencias aplicables a los Componentes de código abierto exigen que el Licenciador ofrezca la opción de código abierto en relación con el Producto, dicho ofrecimiento es parte del presente contrato, y usted puede aceptarlo
                                                poniéndose en contacto con <a href="support@QAT.org" target=" /blank">support@QAT.org</a></p>
                                        </p>

                                        <p>
                                            <h4 className="UserTitle">Avisos sobre propiedad intelectual </h4>
                                            <p>Esta licencia, el objeto de esta licencia de software y el Software en
                                                sí mismo están sujetos a los términos y condiciones y se rigen por los
                                                términos y condiciones pertinentes relacionados con la propiedad intelectual
                                                indicada mediante cláusula o incorporada en el contrato principal del GHSC-PSM, es decir,
                                                el título 48 del Código de Regulaciones Federales (CFR, por sus siglas en inglés),
                                                en la sección 752.227-14 de Derechos sobre los datos (general) y la licencia ilimitada
                                                de la USAID para la herramienta QAT y sus aplicaciones en virtud de esta licencia,
                                                y esta sección de la licencia debe ser compatible con dichas regulaciones y esa licencia para que sea aplicable.
                                            </p>
                                            <p>El Software y todos los derechos de autor, secretos comerciales y otros derechos
                                                de propiedad intelectual internacionales contenidos en dicho Software son de exclusiva
                                                propiedad de QAT. QAT se reserva todos los derechos sobre el Software que no le sean expresamente otorgados a usted en el presente EULA.
                                            </p>
                                            <p>Los nombres QAT, QAT Desktop y los logotipos de QAT o nombres estilizados relacionados
                                                son marcas registradas de QAT. Usted acepta no mostrar ni usar estas marcas comerciales de
                                                ninguna manera sin la autorización previa por escrito del Propietario, excepto según lo autoriza
                                                la Política de uso y logotipos de QAT:  <a href="https://QAT.com/logos." target=" /blank">https://QAT.com/logos</a>.</p>
                                        </p>
                                        <p>
                                            <h4 className="UserTitle">Exenciones y limitaciones a la responsabilidad </h4>
                                            <p>EL SOFTWARE SE PROPORCIONA «TAL COMO ESTÁ» Y NO SE OFRECE NINGUNA GARANTÍA, NI EXPRESA NI IMPLÍCITA. EL USO QUE USTED HAGA DEL SOFTWARE ES A SU PROPIA CUENTA Y RIESGO. El Propietario no garantiza que</p>
                                            <ul className="list-group">
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp;&nbsp;<p>el Software cumpla con los requisitos específicos que usted tenga; </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>&nbsp; &nbsp; <p>el Software sea totalmente compatible con una determinada plataforma;</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p> el uso del Software sea ininterrumpido, puntual, seguro o esté libre de errores;</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p>los resultados que se obtengan del uso del Software sean precisos o confiables;  </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p> la calidad de los productos, los servicios, la información o demás materiales que usted haya adquirido u obtenido a través del Software cumpla con sus expectativas; ni que </p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p>se corregirán los errores del Software. </p></li>


                                            </ul>
                                            <p>
                                                USTED COMPRENDE Y ACEPTA EXPRESAMENTE QUE EL PROPIETARIO NO SERÁ RESPONSABLE DE
                                                NINGÚN DAÑO DIRECTO, INDIRECTO, ACCESORIO, ESPECIAL, EMERGENTE O PUNITIVO, INCLUIDOS,
                                                ENTRE OTROS, LOS DAÑOS Y PERJUICIOS POR PÉRDIDA DE BENEFICIOS, DE REPUTACIÓN COMERCIAL,
                                                DE USO, DE DATOS U OTRAS PÉRDIDAS INTANGIBLES (AUN CUANDO EL PROPIETARIO HAYA SIDO NOTIFICADO
                                                DE LA POSIBILIDAD DE DICHOS DAÑOS Y PERJUICIOS) EN RELACIÓN CON EL SOFTWARE, <br></br>incluidos, por ejemplo:
                                            </p>
                                            <ul className="list-group">
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp;&nbsp;<p>el uso o la imposibilidad de uso del Software;</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i>&nbsp; &nbsp; <p>el costo de adquisición de productos o servicios alternativos derivado de la compra u obtención de productos, datos, información o servicios o de mensajes recibidos o transacciones realizadas desde o a través del Software;</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p> el acceso no autorizado a sus transmisiones o datos o la alteración de dichas transmisiones o datos;</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p>declaraciones o conducta de terceros en relación con el Software;</p></li>
                                                <li class="list-summery  "> <i class="fa fa-dot-circle-o list-summer-icon " aria-hidden="true"></i> &nbsp; &nbsp;<p>o cualquier otro asunto que se relacione con el Software. </p></li>
                                            </ul>
                                            <p>El Propietario se reserva el derecho de modificar en cualquier momento y
                                                periódicamente o de discontinuar temporal o definitivamente el Software
                                                (o cualquier parte del Software) con o sin aviso. El Propietario no será
                                                responsable ante usted ni ante un tercero por ninguna modificación,
                                                cambio de precio, suspensión o discontinuidad del Software.  </p>
                                        </p>

                                        <p>
                                            <h4 className="UserTitle">Disposiciones varias </h4>
                                            <div className="rounded-list list-group">
                                                <ol className="list-group">
                                                    <li class=""> &nbsp;&nbsp;<p>Si configura el Software para que funcione con una o más cuentas en el sitio web <a href="QuantificationAnalytics.org" target=" /blank">QuantificationAnalytics.org</a> o con una instancia de QAT Desktop, el uso que haga del Software también se regirá por las Condiciones de servicio del sitio web <a href="QuantificationAnalytics.org" target=" /blank">QuantificationAnalytics.org</a> o el contrato de licencia aplicable a su instancia de QAT Desktop. </p>
                                                    </li>
                                                    <li class=" ">&nbsp; &nbsp; <p>El hecho de que QAT no ejerza o no aplique alguno de los derechos o disposiciones contenidos en el presente EULA no constituirá la renuncia a dicho derecho o disposición. </p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>El presente EULA constituye todo el acuerdo entre usted y el
                                                        Propietario, y rige el uso que usted haga del Software, y reemplaza a los acuerdos anteriores
                                                        entre usted y el Propietario (incluidas, entre otras, las versiones anteriores del EULA),
                                                        sujeto a todos los términos, condiciones y obligaciones entre el Propietario y el usuario.
                                                        Asimismo, usted acepta indemnizar en forma plena y completa al Propietario por todas y
                                                        cada una de las reclamaciones, individuales y en conjunto, por daños y perjuicios que
                                                        pudieran presentarse contra el Propietario respecto de las condiciones mencionadas
                                                        anteriormente en esta cláusula o que surjan de ellas (Incorporaciones mediante referencia:
                                                        Capítulo 318 del Sistema automatizado de directivas (ADS, por sus siglas en inglés) sobre Derechos de propiedad intelectual). </p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>Usted acepta que el presente EULA y el uso que usted haga del Software se rigen de conformidad con las leyes del Distrito de Columbia y que toda disputa relacionada con el Software debe ser presentada ante un tribunal con competencia jurisdiccional ubicado en Washington D. C. o en sus inmediaciones. </p></li>
                                                    <li class=" "> &nbsp; &nbsp;<p>Envíe sus preguntas sobre el presente EULA a <a href="support@QAT.org">support@QAT.org</a></p></li>
                                                </ol>
                                            </div>
                                        </p>
                                        <p>
                                            El inglés será la lengua vehicular del presente Contrato para todas y cada una de las cuestiones sustantivas y de procedimiento relacionadas con dicho Contrato, incluidas, entre otras, las discrepancias o incoherencias entre la redacción original en inglés y la traducción, en cuyo caso la versión en inglés será la que prevalezca.
                                        </p>




                                    </div>
                                </Col><br />
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
            </div>
        )
    }
}