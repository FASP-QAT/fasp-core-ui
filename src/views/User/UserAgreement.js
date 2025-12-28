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
                                        <h4 className="UserTitleH2">Chemonics International Inc.</h4>
                                        <h4 className="UserTitleH2">Quantification Analytics Tool (QAT)</h4>
                                        <h4 className="UserTitleH2">Software-as-a-Service (SaaS) End User License Agreement</h4>
                                        <h4 className="UserTitle">PLEASE READ CAREFULLY BEFORE ACCESSING THE PLATFORM:</h4>
                                        <p>
                                            This License agreement (<b>License</b>) is a legal agreement between you (<b>Partner</b> or <b>you</b>) and Chemonics International, Inc. of   
                                            Corporation Trust Center, 1209 Orange Street, Wilmington, New Castle, Delaware, United States, 19801 (<b>Chemonics, us,  
                                            our</b> or <b>we</b>) for the provision of (and delivery of the Support Services through) the Platform, and specifically for the purposes   
                                            of delivering:  
                                        </p>
                                        <ul>
                                            <li>
                                                Procurement services, (specifically commodity forecasting and supply planning) and any such data supplied with those services as delivered through the Platform.
                                            </li>
                                            <li>
                                                Any online software applications provided as part of the Platform (<b>Software.</b>)
                                            </li>
                                            <li>
                                                Any online documents provided related to the Platform (<b>Documents.</b>)
                                            </li>
                                        </ul>
                                        <p>
                                            We license use of the Platform (as defined at section 1.1) to you on the basis of this License. We do not sell the Platform to   
                                            you. Chemonics, or its licensors, remain the owners of the Platform at all times.
                                        </p>
                                        <p>
                                            The Platform is primarily expected to be accessed via laptops and desktops with standard operating systems such as MS   
                                            Windows, Linux/Ubuntu, and iOS. The recommended web browser is Google Chrome, but Chromium, Edge, Mozilla Firefox   
                                            or Safari may also be utilized. It is also suggested that each user of the Platform have enough space on their C: drive to allow   
                                            for storing browser cache data successfully. The amount of space needed depends on the size of the Platform program that is   
                                            being downloaded and how many applications are currently running and utilizing browser data. Temporary storage is shared   
                                            among all web applications running in the browser. This shared pool can require up to one-third of the of available disk space.   
                                            Each application can then have up to 20% of the shared pool of storage. For example, if the total available C: drive space is   
                                            60GB, the shared pool is 20GB; thus, the Platform can potentially utilize up to 4GB. This is calculated from 20% (up to 4GB)   
                                            of one-third (up to 20GB) of the available C: drive space (60GB)  
                                        </p>
                                        <h4 className="UserTitle"><u>IMPORTANT NOTICE TO ALL USERS:</u></h4>
                                        <ul>
                                            <li>
                                                BY CLICKING ON THE “ACCEPT” BUTTON YOU AGREE TO THE TERMS OF THIS LICENSE WHICH WILL   
                                                BIND YOU AND YOUR AUTHORISED USERS. THE TERMS OF THIS LICENSE INCLUDE, IN PARTICULAR,   
                                                LIMITATIONS ON LIABILITY IN SECTION 6 AND SECTION 7.
                                            </li>
                                            <li>
                                                IF YOU DO NOT AGREE TO THE TERMS OF THIS LICENSE, YOU MUST CLICK ON THE “DECLINE”   
                                                BUTTON AND YOU MAY NOT ACCESS THE PLATFORM.
                                            </li>
                                        </ul>
                                        <h4 className="UserTitle">1. DEFINITIONS</h4>
                                        <p>1.1 The following definitions are used in this License:</p>
                                        <ol class="alpha-list">
                                            <li>
                                                <b>Authorised Users</b> means the employees, agents and independent contractors of you, your subsidiaries and   
                                                affiliates, determined in accordance with the User Role Types, who you authorise to use the Platform, in   
                                                accordance with the Data Use Rights Table.  
                                            </li>
                                            <li>
                                                <b>Confidential Information</b> means any information about the Platform that you receive or access, including   
                                                but not limited to the Documents, as well as User Data and Partner Data that are defined as “Confidential   
                                                Data” in the Data Use Rights Table.   
                                            </li>
                                            <li>
                                                <b>Data Use Rights</b> means the rights of access to and use of the Platform, granted to Authorised Users in   
                                                accordance with this Licence, specifically in relation to how access rights and business roles are determined   
                                                by reference to the applicable User Role Types, as set out in the Data Use Rights Table.  
                                            </li>
                                            <li>
                                                <b>Data Use Rights Table</b> means the table of information relating to the Data Use Rights, found <a href="https://api.quantificationanalytics.org/file/qatTou" target="_blank">here</a> , which   
                                                may be amended by Chemonics as applicable from time to time.  
                                            </li>
                                            <li>
                                                <b>Good Industry Practice</b> means the exercise of that degree of skill, care, prudence, efficiency, foresight and   
                                                timeliness as would be expected from a leading company within the relevant industry or business sector.  
                                            </li>
                                            <li>
                                                <b>Governance Council</b> means the governmental, intergovernmental, and non- governmental organizations,   
                                                corporations, institutions or individuals which are core funding providers to the Platform and strategic support   
                                                (including in respect of decision-making and governance) in delivering the Platform and the Support Services.  
                                            </li>
                                            <li>
                                                <b>Partner Data</b> means the data owned or controlled by you, and inputted on the Platform by or on behalf of   
                                                you, for the purpose of using or facilitating your use of the Platform but excluding the Platform Data.  
                                            </li>
                                            <li>
                                                <b>Platform</b> means the Quantification Analytics Tool (<b>QAT</b>) Global Health Instance, a cloud-based software-
                                                as-a-service that allows Partners to enter, access, and analyze global health forecasting and supply planning   
                                                data based on role and function. Unless otherwise stated, the term "Platform" shall refer to and include the   
                                                Software and the Documents.  
                                            </li>
                                            <li>
                                                <b>Platform Data</b> means all data generated by the digital activity of end users (including, without limitation,   
                                                you and all Authorised Users) whilst using the Platform, whether hosted or stored within the Platform or   
                                                elsewhere.  
                                            </li>
                                            <li>
                                                <b>Support Services</b> means the support services provided in relation to the Platform by or on behalf of   
                                                Chemonics (or third parties authorised by Chemonics) to you, as may be specified by us from time to time.  
                                            </li>
                                            <li>
                                                <b>User Role Type(s)</b> means the categories of access to the Platform provided to Authorised Users, as more   
                                                particularly set out in the Data Use Rights Table.  
                                            </li>
                                            <li>
                                                <b>Viruses</b> means anything or device (including any software, code, file or programme) which may prevent,   
                                                impair or otherwise adversely affect the operation of any computer software, hardware or network, any   
                                                telecommunications service, equipment or network or any other service or device; prevent, impair or   
                                                otherwise adversely affect access to or the operation of any programme or data, including the reliability of   
                                                any programme or data (whether by re-arranging, altering or erasing the programme or data in whole or part   
                                                or otherwise); or adversely affect the user experience, including worms, trojan horses, viruses and other   
                                                similar things or devices.  
                                            </li>
                                            <li>
                                                <b>Vulnerability</b> means a weakness in the computational logic (for example, code) found in software and   
                                                hardware components that, when exploited, results in a negative impact to confidentiality, integrity, or   
                                                availability, and the term Vulnerabilities shall be construed accordingly.  
                                            </li>
                                        </ol>
                                        <h4 className="UserTitle">2. LICENSE</h4>
                                        <p>
                                            2.1 In consideration of the access to and use of the Partner Data by us in delivering the Platform, and otherwise strictly   
                                            subject to the terms and conditions herein, we grant to you a limited, non-exclusive, non-transferable, revocable   
                                            License, without the right to sublicense, to access and use the Platform.
                                        </p>
                                        <p>2.2 You shall at all times:</p>
                                        <ol class="alpha-list">
                                            <li>
                                                provide Chemonics with all necessary:
                                                <ol class="roman-list">
                                                    <li>
                                                        co-operation in relation to this License; and
                                                    </li>
                                                    <li>
                                                        access to such information as may be required by Chemonics,
                                                    </li>
                                                </ol>
                                                to the extent required to provide the Platform, including but not limited to Partner Data, security access   
                                                information and configuration services;  
                                            </li>
                                            <li>
                                                without affecting your other obligations under this License, comply (and ensure that all such Authorised   
                                                Users comply) with all applicable laws and regulations at all times with respect to your activities under this   
                                                License; and
                                            </li>
                                            <li>
                                                ensure that your network and systems (and, as applicable, those of the Authorised Users) comply with the   
                                                relevant specifications provided by Chemonics from time to time.
                                            </li>
                                        </ol>
                                        <p>
                                            2.3 You shall have sole responsibility for the legality, reliability, integrity, accuracy and quality of all Partner Data. You   
                                            hereby license us to use the Partner Data for:  
                                        </p>
                                        <ol class="alpha-list">
                                            <li>
                                                the proper performance and delivery of the Platform and Support Services, including the provision of the   
                                                Software and the Documents;  
                                            </li>
                                            <li>
                                                the purposes set out in our Privacy Notice.  
                                            </li>
                                            <li>
                                                our making amendments to (and repairing of) the Platform as applicable; and  
                                            </li>
                                            <li>
                                                all other purposes relevant to the proper exercise of our rights and obligations under this License.  
                                            </li>
                                        </ol>
                                        <p>
                                            2.4 You undertake that:
                                        </p>
                                        <ol class="alpha-list">
                                            <li>
                                                you will not allow or suffer any User Subscription to be used by more than one individual Authorised User unless it   
                                                has been reassigned in its entirety to another individual Authorised User (and must be used strictly in accordance with   
                                                the applicable User Role Type), in which case the prior Authorised User shall no longer have any right to access or   
                                                use the Platform;  
                                            </li>
                                            <li>
                                                you shall permit Chemonics or a Chemonics’s designated third party to periodically audit (or otherwise monitor) your   
                                                use of the Platform from time-to-time, specifically in that the Platform is being used in accordance with each   
                                                applicable User Role Type. This audit or monitoring may take place physically on the Partner’s premises, or remotely,   
                                                at Chemonics’s option, and Chemonics may deploy reasonable online audit and/or monitoring tools for these purposes; 
                                            </li>
                                            <li>
                                                you shall supervise and control use of the Platform and ensure they are used by your employees and representatives   
                                                only in accordance with the terms of this License (including but not limited to the Data Use Rights Table); and  
                                            </li>
                                            <li>
                                                you shall comply with all technology control or export laws and regulations, applicable from time to time.  
                                            </li>
                                        </ol>
                                        <p>
                                            2.5 Where requested and subscribed, Chemonics shall provide the Support Services to you from time to time and strictly   
                                            in accordance with the terms and conditions herein.
                                        </p>
                                        <h4 className="UserTitle">3. RESTRICTIONS</h4>
                                        <p>
                                            3.1 Excluding any 'open-source' materials, and except as expressly set out in this License or as permitted by any local law 
                                            which is incapable of exclusion by agreement between the parties, you shall not:
                                        </p>
                                        <ol class="alpha-list">
                                            <li>
                                                attempt to copy, modify, duplicate, create derivative works from, frame, mirror, republish, download, display,   
                                                transmit, or distribute all or any portion of the Platform in any form or media or by any means; or   
                                            </li>
                                            <li>
                                                attempt to de-compile, reverse compile, disassemble, reverse engineer or otherwise reduce to human-perceivable   
                                                form all or any part of the Software;  
                                            </li>
                                            <li>
                                                access all or any part of the Platform to build a product or service which competes with the Platform;
                                            </li>
                                            <li>
                                                use the Platform to provide services to third parties;
                                            </li>
                                            <li>
                                                license, sell, rent, lease, transfer, assign, distribute, display, disclose, or otherwise commercially exploit, or   
                                                otherwise make the Platform available to any third party except the Authorised Users; or
                                            </li>
                                            <li>
                                                attempt to obtain, or assist third parties in obtaining, access to the Platform, other than as provided under this   
                                                License. 
                                            </li>
                                        </ol>
                                        <p>
                                            3.2 You shall not use the Platform to:  
                                        </p>
                                        <ol class="alpha-list">
                                            <li>
                                                distribute or transmit any Viruses or Vulnerability and shall implement procedures in line with Good Industry   
                                                Practice to prevent such distribution or transmission;  
                                            </li>
                                            <li>
                                                store, access, publish, disseminate, distribute or transmit any material which:
                                                <ol class="roman-list">
                                                    <li>
                                                        is unlawful, harmful, threatening, defamatory, obscene, infringing, harassing or racially or ethnically   
                                                        offensive;
                                                    </li>
                                                    <li> 
                                                        facilitates illegal activity;  
                                                    </li>
                                                    <li>
                                                        depicts sexually explicit images;  
                                                    </li>
                                                    <li>
                                                        promotes unlawful violence;  
                                                    </li>
                                                    <li>
                                                        is discriminatory based on race, gender, colour, religious belief, sexual orientation, disability; or  
                                                    </li>
                                                    <li>
                                                        is otherwise illegal or causes damage or injury to any person or property,
                                                    </li>
                                                </ol>
                                                and we reserve the right, on no less than thirty (30) days’ prior written notice to you, such notice specifying the   
                                                breach of this section and requiring it to be remedied within the thirty (30) day period, to disable your access to   
                                                the Platform for the duration of time that the breach remains unremedied.
                                            </li>     
                                        </ol>
                                        <p>
                                            3.3 Use of the Platform is subject to all export and technology laws. You agree to comply with all applicable local, state,   
                                            national, and international laws, treaties, conventions, and regulations in connection with your use, including without   
                                            limitation those related to data privacy, international communications, antitrust and competition, and the exportation   
                                            of technical or personal data.
                                        </p>
                                        <p>
                                            3.4 The Platform may not be acquired for, provided to, or used or accessed within or by, or otherwise exported to:  
                                        </p>
                                        <ol class="alpha-list">
                                            <li>
                                                any United States embargoed or proscribed country or its nationals; or
                                            </li>
                                            <li>
                                                anyone on the United States Treasury Department’s list of Specially Designated Nations, the United States   
                                                Department of Commerce’s Table of Denial Orders, or other similar list.
                                            </li>
                                        </ol>
                                        <p>
                                            3.5 You certify that you are not on the U.S. Department of Commerce's Denied Persons List or affiliated lists or on the   
                                            U.S. Department of Treasury's Specially Designated Nationals List. You agree to comply strictly with all U.S. export   
                                            laws and assume sole responsibility for obtaining licenses to export or re-export as may be required. You are solely 
                                            responsible for obtaining all licenses and permissions necessary related to the Partner Data.
                                        </p>
                                        <p>
                                            3.6 You may use the Platform for as long as Chemonics (or such third party as authorised by Chemonics) makes it   
                                            available to you pursuant to the License.
                                        </p>  
                                        <h4 className="UserTitle">4. CONFIDENTIAL INFORMATION</h4>
                                        <p>
                                            4.1 Notwithstanding the foregoing obligations of confidentiality, you may disclose Confidential Information to a third   
                                            party, provided that the third party is also an Authorised User who has permission to access the same Confidential   
                                            Information in accordance with the Data Use Rights, and otherwise strictly in accordance with the terms and   
                                            conditions contained herein.  
                                        </p>
                                        <h4 className="UserTitle">5. INTELLECTUAL PROPERTY RIGHTS</h4>
                                        <p>
                                            5.1 You acknowledge that:
                                        </p>
                                        <ol class="alpha-list">
                                            <li>
                                                all intellectual property rights in the Platform and the Platform Data anywhere in the world belong to us or our   
                                                licensors, that rights in the Platform are licensed (not sold) to you, and that you have no rights in, or to, the   
                                                Platform other than the right to use it strictly in accordance with the terms of this License; and
                                            </li>
                                            <li>
                                                you have no right to have access to any Software in source code form.
                                            </li>
                                        </ol>
                                        <p>
                                        5.2 All intellectual property rights in the Partner Data belong to you. When you submit or otherwise make the Partner   
                                        Data available on the Platform:
                                        </p>
                                        <ol class="alpha-list">
                                            <li>
                                                you agree that Chemonics, may, on a worldwide basis and free of charge, access and use the Partner Data in   
                                                accordance with the terms and conditions herein and as otherwise specified in the Data Use Rights Table for the   
                                                respective, applicable Platform User Role Type. Chemonics shall not access or use the Partner Data in any   
                                                manner other than as provided in this License. You further acknowledge and agree that the Partner Data may be:
                                                <ol class="roman-list">
                                                    <li>
                                                        accessed, used and processed by Chemonics, the Governance Council, and strategic partners, ;
                                                    </li>
                                                    <li>
                                                        transferred outside of the country or other jurisdiction where you are located; and  
                                                    </li>
                                                </ol>
                                                solely for the purpose of delivering the Platform and Support Services.
                                            </li>
                                            <li>
                                                you represent and warrant that you:
                                                <ol class="roman-list">
                                                    <li>
                                                        have all necessary right, title, interest, and licenses to upload the Partner Data and make it available to   
                                                        Chemonics, the Governance Council, strategic partners, and other users for their use in accordance with   
                                                        the terms and conditions herein; and
                                                    </li>
                                                    <li>
                                                        will undertake best efforts not to (or permit the) upload, post, or otherwise transmit or publish through   
                                                        the Platform any content or any other materials whatsoever which:
                                                        <ol class="alpha-dot">
                                                            <li>
                                                                are (or have the potential to be) defamatory, obscene, invasive to another person’s privacy or   
                                                                protected data, or tortious;
                                                            </li>
                                                            <li>
                                                                infringe upon any intellectual property rights, including any patent, trademark, trade secret,   
                                                                copyright, or right of publicity;
                                                            </li>
                                                            <li>
                                                                contain any software viruses or any other harmful computer code, files, or programs, including   
                                                                any designed to interrupt, destroy, or limit the functionality of any computer software or hardware   
                                                                or telecommunications equipment; or
                                                            </li>
                                                            <li>
                                                                violate any applicable license, law, or contractual or fiduciary duty or provision, including by   
                                                                exercise of the rights you grant to Chemonics, any Governance Council member, or other users 
                                                                of the Platform.
                                                            </li>
                                                        </ol>
                                                    </li>
                                                </ol>
                                            </li>
                                        </ol>
                                        <h4 className="UserTitle">6. LIMITED WARRANTY</h4>
                                        <p>
                                            6.1 We warrant that provided, and for as long as, you receive Support Services:
                                        </p>
                                        <ol class="alpha-list">
                                            <li>  
                                                the Support Services and Software will, when properly used and on an operating system for which it was   
                                                designed, perform substantially in accordance with the functions described in the Documents; and  
                                            </li>
                                            <li>
                                                that the Documents correctly describe the operation of the Support Services and Software in all material   
                                                respects,
                                            </li>
                                        </ol>
                                        <p>
                                            6.2 If you notify us in writing of any defect or fault in the Platform as a result of which it fails to perform substantially   
                                            in accordance with the Documents, we will, at our sole option, either repair or replace the Platform, Software and/or   
                                            Support Services, provided that you make available all the information that may be necessary to help us to remedy   
                                            the defect or fault, including sufficient information to enable us to recreate the defect or fault.
                                        </p>  
                                        <p>
                                            6.3 The warranty does not apply:
                                        </p>
                                        <ol class="alpha-list">
                                            <li>  
                                                if the defect or fault in the Platform results from you having accessed or used the Platform in breach of the   
                                                terms of this License; and
                                            </li>
                                            <li>
                                                the Events Outside of Our Control.  
                                            </li>  
                                        </ol>
                                        <h4 className="UserTitle">7. LIMITATION OF LIABILITY </h4> 
                                        <p>
                                            7.1 You accept responsibility for the selection of the services delivered via the Platform to achieve your intended results   
                                            and acknowledge that the Platform has not been developed or designed to meet or support any individual requirements   
                                            you have, including any particular cybersecurity requirements you might be subject to, or any regulated activity that   
                                            you may be engaged in, including the provision of an online intermediation service, an online search engine or service   
                                            that facilitates online interaction between users (such as, but not limited to, a social media platform) (each a <b>Regulated   
                                            Activity</b>). If you use the Platform for any Regulated Activity you agree to comply with any requirements that apply   
                                            to such Regulated Activity from time to time (including in any jurisdiction in which you operate or where the   
                                            Regulated Activity is undertaken) and you shall defend, indemnify and hold us harmless against any loss or damage   
                                            (including regulatory fines or penalties) costs (including legal fees) and expenses which we may suffer or incur as a   
                                            result of your breach of this section 7.1.
                                        </p>
                                        <p>  
                                            7.2 We only supply the Platform for internal use by your business, and you agree not to use the Platform for any resale   
                                            purposes.
                                        </p>
                                        <p>
                                            7.3 We shall not in any circumstances whatever be liable to you, whether in contract, tort (including negligence), breach   
                                            of statutory duty, or otherwise, arising under or in connection with the License for:  
                                        </p>
                                        <ol class="alpha-list">
                                            <li>  
                                                loss of profits, sales, business, or revenue;
                                            </li>
                                            <li>  
                                                business interruption;  
                                            </li>
                                            <li>
                                                loss of anticipated savings;  
                                            </li>
                                            <li>
                                                wasted expenditure;  
                                            </li>
                                            <li>
                                                loss or corruption of data or information; 
                                            </li>
                                            <li> 
                                                loss of business opportunity, goodwill or reputation, 
                                            </li>
                                            <li> 
                                                where any of the losses set out in section 7.3(a) to section 7.3(f) are direct or indirect; or
                                            </li>
                                            <li>
                                                any special, indirect or consequential loss, damage, charges or expenses.  
                                            </li>
                                        </ol>
                                        <p>
                                            7.4 You accept and acknowledge that we are providing the Platform free of any financial consideration. Other than the   
                                            losses set out in section 7.3 (for which we are not liable), our maximum aggregate liability under or in connection   
                                            with this License whether in contract, tort (including negligence) or otherwise, shall in all circumstances be limited   
                                            to $25,000. This maximum cap does not apply to section 7.5.
                                        </p>
                                        <p>  
                                            7.5 Nothing in this License shall limit or exclude our liability for: 
                                        </p> 
                                        <ol class="alpha-list">
                                            <li>
                                                death or personal injury resulting from our negligence;
                                            </li>
                                            <li>  
                                                fraud or fraudulent misrepresentation; or  
                                            </li>
                                            <li>
                                                any other liability that cannot be excluded or limited by English law.  
                                            </li>
                                        </ol>
                                        <p>
                                            7.6 This License sets out the full extent of our obligations and liabilities in respect of the supply of the Platform. Except   
                                            as expressly stated in this License, there are no sections, warranties, representations or other terms, express or implied,   
                                            that are binding on us. Any provision, warranty, representation or other term concerning the supply of services and   
                                            Documents which might otherwise be implied into, or incorporated in, this License whether by statute, common law   
                                            or otherwise, is excluded to the fullest extent permitted by law.  
                                        </p>
                                        <h4 className="UserTitle">8. TERMINATION</h4>  
                                        <p>
                                            8.1 We may terminate this License immediately by written notice if you:  
                                        </p>
                                        <ol class="alpha-list">
                                            <li>
                                                (or any of your group companies, associates or suppliers) do anything which brings (or has the potential to   
                                                bring) us, the Platform or the Governance Council into disrepute;  
                                            </li>
                                            <li>
                                                become insolvent, have appointed a receiver, administrative receiver or administrator of the whole or any part   
                                                of its assets or business, make any composition or arrangement with your creditors, or are the subject of a   
                                                resolution passed for the dissolution or liquidation (other than for the purpose of solvent amalgamation or   
                                                reconstruction) of your business; or  
                                            </li>
                                            <li>
                                                commit a material or persistent breach of any term or terms of this License which you fail to remedy (if   
                                                remediable) within 14 days after the service of written notice requiring you to do so.  
                                            </li>
                                        </ol>
                                        <p>
                                            8.2 On termination of this License for any reason:  
                                        </p>
                                        <ol class="alpha-list">
                                            <li>
                                                all rights granted to you under this License shall immediately cease;  
                                            </li>
                                            <li>
                                                you must immediately cease all activities authorised by this License; and  
                                            </li>
                                            <li>
                                                you must immediately and permanently delete or disable interfaces to the Platform from all computer   
                                                equipment in your possession, and immediately and irreversibly destroy, delete or return to us (at our sole   
                                                option) all copies of the Documents and Software then in your possession, custody or control and, in the case   
                                                of destruction or deletion, certify to us that you have done so within ten (10) calendar days.  
                                            </li>
                                        </ol>
                                        <h4 className="UserTitle">9. AMENDMENTS TO THIS LICENSE</h4>  
                                        <p>
                                            9.1 We may update the terms of this License at any time on notice to you in accordance with this section 9. Your continued   
                                            use of the Platform following the deemed receipt and service of the notice under section 9.3 shall constitute your   
                                            acceptance to the terms of this License, as varied. If you do not wish to accept the terms of the License (as varied)   
                                            you must immediately stop using and accessing the Platform on the deemed receipt and service of the notice.  
                                        </p>
                                        <p>
                                            9.2 If we have to contact you, we will do so by email you provided in accordance with your user account.
                                        </p>
                                        <p>
                                            9.3 Any notice:
                                        </p>
                                        <ol class="alpha-list">
                                            <li>
                                                given by us to you will be deemed received and properly served 24 hours after it is first posted on our website, 24   
                                                hours after an email is sent, or three days after the date of posting of any letter; and  
                                            </li>
                                            <li>
                                                given by you to us will be deemed received and properly served 24 hours after an email is sent, or three days after the   
                                                date of posting of any letter.  
                                            </li>
                                        </ol>
                                        <p>
                                            9.4 In proving the service of any notice, it will be sufficient to prove, in the case of posting on our website, that the website   
                                            was generally accessible to the public for a period of 24 hours after the first posting of the notice; in the case of a   
                                            letter, that such letter was properly addressed, stamped and placed in the post to the address of the recipient given for   
                                            these purposes; and, in the case of an email, that such email was sent to the email address of the recipient given for   
                                            these purposes.
                                        </p>  
                                        <h4 className="UserTitle">10. EVENTS OUTSIDE OUR CONTROL </h4>  
                                        <p>
                                            10.1 Neither we (or the Governance Council) shall be liable or responsible for any failure to perform, or delay in   
                                            performance of, any of our obligations under this License that is caused by an Event Outside Our Control. An   
                                            Event Outside Our Control is defined below in section 10.2.  
                                        </p>
                                        <p>
                                            10.2 An <b>Event Outside Our Control</b> means any act or event beyond our reasonable control, including without   
                                            limitation failure of public or private telecommunications networks.  
                                        </p>
                                        <p>
                                            10.3 If an Event Outside Our Control takes place that affects the performance of our obligations under this License:  
                                        </p>
                                        <ol class="alpha-list">
                                            <li>
                                                our obligations under this License will be suspended and the time for performance of our obligations will be   
                                                extended for the duration of the Event Outside Our Control; and  
                                            </li>
                                            <li>
                                                we will use our commercially reasonable endeavours to find a solution by which our obligations under this   
                                                License may be performed despite the Event Outside Our Control.
                                            </li>
                                        </ol>  
                                        <h4 className="UserTitle">11. HOW WE MAY USE YOUR PERSONAL INFORMATION </h4>   
                                        <p>
                                            11.1 We will carry out any processing of personal data in the course of providing the Platform and Support Services (if   
                                            applicable) to You as a processor on Your behalf, in each case subject to the data processing terms found <a href="https://api.quantificationanalytics.org/file/qatDpa" target="_blank">here</a>, which   
                                            are hereby incorporated into this License.
                                        </p>
                                        <p>  
                                            11.2 To the extent We at any time act as a controller in respect of personal data of Your users or representatives processed   
                                            by Us in connection with the Platform and Support Services (if applicable), We will process that personal data as   
                                            controller as further explained in Chemonics' fair processing notice, which is available <a href="https://api.quantificationanalytics.org/file/qatPrivacyNotice" target="_blank">here</a> (<b>Privacy Notice</b>) and it   
                                            is important that you read that information.
                                        </p>
                                        <p>
                                            11.3 By accepting the terms of this License, you acknowledge that you have read and understood the terms of the   
                                            Privacy Notice.
                                        </p>  
                                        <h4 className="UserTitle">12. OTHER IMPORTANT TERMS</h4>  
                                        <p>
                                            12.1 We may transfer our rights and obligations under this License to another organisation, but this will not affect   
                                            your rights or our obligations under this License.  
                                        </p>
                                        <p>
                                            12.2 You may only transfer your rights or your obligations under this License to another person if we agree in writing.  
                                        </p>
                                        <p>
                                            12.3 This License and any document referred to in it constitutes the entire agreement between us and supersedes and   
                                            extinguishes all previous and contemporaneous agreements, promises, assurances and understandings between   
                                            us, whether written or oral, relating to its subject matter.  
                                        </p>
                                        <p>
                                            12.4 You acknowledge that in entering into this License you do not rely on and shall have no remedies in respect of   
                                            any statement, representation, assurance or warranty (whether made innocently or negligently) that is not set out   
                                            in this License or any document expressly referred to in it.
                                        </p>
                                        <p>
                                            12.5 You agree that you shall have no claim for innocent or negligent misrepresentation or negligent misstatement   
                                            based on any statement in this License or any document expressly referred to in it.  
                                        </p>
                                        <p>
                                            12.6 A waiver of any right or remedy is only effective if given in writing and shall not be deemed a waiver of any   
                                            subsequent right or remedy.  
                                        </p>
                                        <p>
                                            12.7 A delay or failure to exercise, or the single or partial exercise of, any right or remedy does not waive that or any   
                                            other right or remedy, nor does it prevent or restrict the further exercise of that or any other right or remedy.  
                                        </p>
                                        <p>
                                            12.8 Each provision of this License operates separately. If any court or competent authority decides that any of them   
                                            are unlawful or unenforceable, the remaining provisions shall remain in full force and effect.
                                        </p>
                                        <p>
                                            12.9 This License, its subject matter and its formation (and any non-contractual disputes or claims) shall be governed   
                                            and construed under the laws of the District of Columbia. All disputes shall be resolved by arbitration   
                                            administered by the American Arbitration Association in accordance with its Commercial Arbitration Rules.   
                                            Arbitration shall be conduced in Washington, DC. Arbitrators shall be empowered to award only direct damages   
                                            consistent with the terms of this Agreement. Each party shall bear its own cost of arbitration, including attorneys’   
                                            fees and experts’ fees. An arbitration decision shall be final and judgment may be entered upon it in accordance   
                                            with applicable law in any court having jurisdiction. 
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