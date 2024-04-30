import React, { Component } from 'react';
import 'react-select/dist/react-select.min.css';
import { ProgressBar, Step } from "react-step-progress-bar";
import {
    Button,
    Card,
    CardBody,
    Col,
    FormGroup,
    Row
} from 'reactstrap';
import "../../../node_modules/react-step-progress-bar/styles.css";
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL } from "../../Constants";
import HealthAreaService from "../../api/HealthAreaService";
import ProgramService from "../../api/ProgramService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import MapPlanningUnits from './MapPlanningUnits';
import StepFive from './StepFive';
import StepFour from './StepFour.js';
import StepOne from './StepOne.js';
import StepSix from './StepSix.js';
import StepThree from './StepThree.js';
import StepTwo from './StepTwo.js';
import { Capitalize } from '../../CommonComponent/JavascriptCommonFunctions';
const entityname = i18n.t('static.program.programMaster');
/**
 * Component for program onboarding.
 * Allows users to go through a multi-step form for program onboarding.
 */
export default class ProgramOnboarding extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            program: {
                uniqueCode: '',
                programCode: '',
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: ''
                },
                realm: {
                    realmId: ''
                },
                realmCountry: {
                    realmCountryId: ''
                },
                organisation: {
                    id: ''
                },
                programManager: {
                    userId: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                },
                airFreightPerc: '',
                seaFreightPerc: '',
                roadFreightPerc: '',
                draftToSubmittedLeadTime: '',
                plannedToDraftLeadTime: '',
                submittedToApprovedLeadTime: '',
                approvedToShippedLeadTime: '',
                monthsInFutureForAmc: '',
                monthsInPastForAmc: '',
                shippedToArrivedByAirLeadTime: '',
                shippedToArrivedBySeaLeadTime: '',
                shippedToArrivedByRoadLeadTime: '',
                arrivedToDeliveredLeadTime: '',
                plannedToSubmittedLeadTime: '',
                programNotes: '',
                regionArray: [],
                healthAreaArray: [],
                programPlanningUnits: [],
                programTypeId: 1
            },
            lang: localStorage.getItem('lang'),
            regionId: '',
            healthAreaId: '',
            realmList: [],
            realmCountryList: [],
            organisationList: [],
            healthAreaList: [],
            programManagerList: [],
            regionList: [],
            message: '',
            progressPer: 0,
            realmCountryCode: '',
            organisationCode: '',
            healthAreaCode: '',
        }
        this.dataChange = this.dataChange.bind(this);
        this.getDependentLists = this.getDependentLists.bind(this);
        this.getRegionList = this.getRegionList.bind(this);
        this.updateFieldData = this.updateFieldData.bind(this);
        this.updateFieldDataHealthArea = this.updateFieldDataHealthArea.bind(this);
        this.finishedStepOne = this.finishedStepOne.bind(this);
        this.finishedStepTwo = this.finishedStepTwo.bind(this);
        this.finishedStepThree = this.finishedStepThree.bind(this);
        this.finishedStepFour = this.finishedStepFour.bind(this);
        this.finishedStepFive = this.finishedStepFive.bind(this);
        this.finishedStepSix = this.finishedStepSix.bind(this);
        this.finishedStepSeven = this.finishedStepSeven.bind(this);
        this.previousToStepOne = this.previousToStepOne.bind(this);
        this.previousToStepTwo = this.previousToStepTwo.bind(this);
        this.previousToStepThree = this.previousToStepThree.bind(this);
        this.previousToStepFour = this.previousToStepFour.bind(this);
        this.previousToStepFive = this.previousToStepFive.bind(this);
        this.previousToStepSix = this.previousToStepSix.bind(this);
        this.removeMessageText = this.removeMessageText.bind(this);
        this.addRowInJexcel = this.addRowInJexcel.bind(this);
        this.generateCountryCode = this.generateCountryCode.bind(this);
        this.generateOrganisationCode = this.generateOrganisationCode.bind(this);
        this.generateHealthAreaCode = this.generateHealthAreaCode.bind(this);
    }
     /**
     * Sets up the initial display state for the steps.
     */
    componentDidMount() {
        let { program } = this.state;
        let realmId = AuthenticationService.getRealmId();
        if (realmId != -1) {
            program.realm.realmId = realmId;
            this.setState({ program }, () => {
                this.refs.countryChild.getRealmCountryList();
                this.refs.healthAreaChild.getHealthAreaList();
                this.refs.organisationChild.getOrganisationList();
                this.refs.sixChild.getProgramManagerList();
                this.refs.child.getRealmId();
            });
            document.getElementById('realmId').disabled = true;
        } else {
            document.getElementById('realmId').disabled = false;
        }
        document.getElementById('stepOne').style.display = 'block';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
        HealthAreaService.getRealmList()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        realmList: response.data, loading: false
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    })
                }
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
     * Handles the completion of step one and updates the display to show step two.
     */
    finishedStepOne() {
        this.setState({ progressPer: 17 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'block';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
    }
    /**
     * Handles the completion of step two and updates the display to show step three.
     */
    finishedStepTwo() {
        this.setState({ progressPer: 34 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'block';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
    }
    /**
     * Handles the completion of step three and updates the display to show step four.
     */
    finishedStepThree() {
        this.setState({ progressPer: 51 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'block';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
    }
    /**
     * Handles the completion of step four and updates the display to show step five.
     */
    finishedStepFour() {
        this.setState({ progressPer: 68 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'block';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
    }
    /**
     * Handles the completion of step five and updates the display to show step six.
     */
    finishedStepFive() {
        this.setState({ progressPer: 85 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'block';
        document.getElementById('stepSeven').style.display = 'none';
    }
    /**
     * Handles the completion of step six and updates the display to show step seven.
     */
    finishedStepSix() {
        this.setState({ progressPer: 102 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'block';
    }
    /**
     * Method to remove any displayed message text from the component state.
     */
    removeMessageText() {
        this.setState({ message: '' });
    }
    /**
     * Handles the completion of step seven and calling the api for saving the details on server.
     */
    finishedStepSeven() {
        let { program } = this.state;
        var j = this.refs.child.myFunction();
        var validation = this.refs.child.checkValidation();
        program.programPlanningUnits = j;
        this.setState({ program }, () => { });
        if (validation == true) {
            this.setState({ loading: true });
            ProgramService.programInitialize(this.state.program).then(response => {
                if (response.status == "200") {
                    this.props.history.push(`/program/listProgram/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    })
                }
            }
            ).catch(
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
        } else {
            this.setState({ message: "Please Enter Valid Data." });
        }
    }
    /**
     * Function to add a new row to the jexcel table.
     */
    addRowInJexcel() {
        this.refs.child.addRow();
    }
    /**
     * Handles moving back to step one from any subsequent step and updates the display accordingly.
     */
    previousToStepOne() {
        this.setState({ progressPer: 0 });
        document.getElementById('stepOne').style.display = 'block';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
    }
    /**
     * Handles moving back to step two from any subsequent step and updates the display accordingly.
     */
    previousToStepTwo() {
        this.setState({ progressPer: 17 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'block';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
        let { program } = this.state;
        program.healthArea.id = '';
        this.setState({ program }, () => {
        })
    }
    /**
     * Handles moving back to step three from any subsequent step and updates the display accordingly.
     */
    previousToStepThree() {
        this.setState({ progressPer: 34 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'block';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
        let { program } = this.state;
        program.organisation.id = '';
        this.setState({ program }, () => {
        })
    }
    /**
     * Handles moving back to step four from any subsequent step and updates the display accordingly.
     */
    previousToStepFour() {
        this.setState({ progressPer: 51 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'block';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
        let { program } = this.state;
        program.regionArray = [];
        this.setState({ program }, () => {
        })
    }
    /**
     * Handles moving back to step five from any subsequent step and updates the display accordingly.
     */
    previousToStepFive() {
        this.setState({ progressPer: 68 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'block';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
    }
    /**
     * Handles moving back to step six from any subsequent step and updates the display accordingly.
     */
    previousToStepSix() {
        this.setState({ progressPer: 85 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'block';
        document.getElementById('stepSeven').style.display = 'none';
    }
    /**
     * Generates a country code based on the selected realm country ID.
     * @param {Event} event - The change event containing the selected realm country ID.
     */
    generateCountryCode(code) {
        this.setState({ realmCountryCode: code })
    }
    /**
     * Generates a health area code based on the selected health ID.
     * @param {Event} event - The change event containing the selected health area ID.
     */
    generateHealthAreaCode(code) {
        this.setState({ healthAreaCode: code })
    }
    /**
     * Generates a organisation code based on the selected organisation ID.
     * @param {Event} event - The change event containing the selected organisation ID.
     */
    generateOrganisationCode(code) {
        this.setState({ organisationCode: code })
    }
    /**
     * Handles data change in the form.
     * @param {Event} event - The change event.
     */
    dataChange(event) {
        let { program } = this.state;
        if (event.target.name == "programName") {
            program.label.label_en = event.target.value;
        } if (event.target.name == "realmId") {
            program.realm.realmId = event.target.value;
            this.refs.child.getRealmId();
            this.refs.countryChild.getRealmCountryList();
            this.refs.sixChild.getProgramManagerList();
        } if (event.target.name == 'realmCountryId') {
            var dname = this.state.program.programCode;
            program.realmCountry.realmCountryId = event.target.value;
            this.refs.healthAreaChild.getHealthAreaList();
            this.refs.organisationChild.getOrganisationList();
            this.refs.regionChild.getRegionList();
            program.organisation.id = '';
            program.healthAreaArray = [];
            program.regionArray = [];
        } if (event.target.name == 'organisationId') {
            var dname = this.state.program.programCode;
            program.organisation.id = event.target.value;
        } if (event.target.name == 'airFreightPerc') {
            program.airFreightPerc = event.target.value;
        } if (event.target.name == 'seaFreightPerc') {
            program.seaFreightPerc = event.target.value;
        }
        if (event.target.name == 'roadFreightPerc') {
            program.roadFreightPerc = event.target.value;
        }
        if (event.target.name == 'uniqueCode') {
            var dname = this.state.program.programCode;
            var email_array = dname.split('-');
            program.uniqueCode = event.target.value.toUpperCase()
        }
        if (event.target.name == 'programCode1') {
            program.programCode = event.target.value.toUpperCase();
        }
        if (event.target.name == 'plannedToSubmittedLeadTime') {
            program.plannedToSubmittedLeadTime = event.target.value;
        } if (event.target.name == 'submittedToApprovedLeadTime') {
            program.submittedToApprovedLeadTime = event.target.value;
        } if (event.target.name == 'approvedToShippedLeadTime') {
            program.approvedToShippedLeadTime = event.target.value;
        } if (event.target.name == 'monthsInFutureForAmc') {
            program.monthsInFutureForAmc = event.target.value;
        } if (event.target.name == 'monthsInPastForAmc') {
            program.monthsInPastForAmc = event.target.value;
        } if (event.target.name == 'healthAreaId') {
            var dname = this.state.program.programCode;
            program.healthArea.id = event.target.value;
        } if (event.target.name == 'userId') {
            program.programManager.userId = event.target.value;
        } if (event.target.name == 'shippedToArrivedByAirLeadTime') {
            program.shippedToArrivedByAirLeadTime = event.target.value;
        }
        if (event.target.name == 'shippedToArrivedBySeaLeadTime') {
            program.shippedToArrivedBySeaLeadTime = event.target.value;
        }
        if (event.target.name == 'shippedToArrivedByRoadLeadTime') {
            program.shippedToArrivedByRoadLeadTime = event.target.value;
        }
        if (event.target.name == 'arrivedToDeliveredLeadTime') {
            program.arrivedToDeliveredLeadTime = event.target.value;
        }
        else if (event.target.name == 'programNotes') {
            program.programNotes = event.target.value;
        }
        this.setState({ program }, () => {
        })
    }
    getDependentLists(e) {
    }
    /**
     * Reterives the region list
     * @param {Event} event - The change event.
     */
    getRegionList(e) {
        ProgramService.getRegionList(e.target.value)
            .then(response => {
                if (response.status == 200) {
                    var json = response.data;
                    var regList = [];
                    for (var i = 0; i < json.length; i++) {
                        regList[i] = { value: json[i].regionId, label: getLabelText(json[i].label, this.state.lang) }
                    }
                    this.setState({
                        regionId: '',
                        regionList: regList
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
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
     * Handles the change event for regions.
     * @param {Array} event - An array containing the selected region IDs.
     */
    updateFieldData(value) {
        let { program } = this.state;
        this.setState({ regionId: value });
        var regionId = value;
        var regionIdArray = [];
        for (var i = 0; i < regionId.length; i++) {
            regionIdArray[i] = regionId[i].value;
        }
        program.regionArray = regionIdArray;
        this.setState({ program: program });
    }
    /**
     * Handles the change event for health areas.
     * @param {Array} event - An array containing the selected health area IDs.
     */
    updateFieldDataHealthArea(value) {
        let { program } = this.state;
        this.setState({ healthAreaId: value });
        var healthAreaId = value;
        var healthAreaIdArray = [];
        for (var i = 0; i < healthAreaId.length; i++) {
            healthAreaIdArray[i] = healthAreaId[i].value;
        }
        program.healthAreaArray = healthAreaIdArray;
        this.setState({ program: program });
    }
    /**
     * Renders the program onboarding screen.
     * @returns {JSX.Element} - Program onboarding screen.
     */
    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5></h5>
                <Row>
                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                        <Card style={{ display: this.state.loading ? "none" : "block" }}>
                            <CardBody>
                                <ProgressBar
                                    percent={this.state.progressPer}
                                    filledBackground="linear-gradient(to right, #fefb72, #f0bb31)"
                                    style={{ width: '75%' }}
                                >
                                    <Step transition="scale">
                                        {({ accomplished }) => (
                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number1.png"
                                            />
                                        )}
                                    </Step>
                                    <Step transition="scale">
                                        {({ accomplished }) => (
                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number2.png"
                                            />
                                        )}
                                    </Step>
                                    <Step transition="scale">
                                        {({ accomplished }) => (
                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number3.png"
                                            />
                                        )}
                                    </Step>
                                    <Step transition="scale">
                                        {({ accomplished }) => (
                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number4.png"
                                            />
                                        )}
                                    </Step>
                                    <Step transition="scale">
                                        {({ accomplished }) => (
                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number5.png"
                                            />
                                        )}
                                    </Step>
                                    <Step transition="scale">
                                        {({ accomplished }) => (
                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number6.png"
                                            />
                                        )}
                                    </Step>
                                    <Step transition="scale">
                                        {({ accomplished }) => (
                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number7.png"
                                            />
                                        )}
                                    </Step>
                                </ProgressBar>
                                <div className="d-sm-down-none  progressbar">
                                    <ul>
                                        <li className="progressbartext1">{i18n.t('static.program.realm')}</li>
                                        <li className="progressbartext2">{i18n.t('static.region.country')}</li>
                                        <li className="progressbartext3">{i18n.t('static.healtharea.healtharea')}</li>
                                        <li className="progressbartext4">{i18n.t('static.organisation.organisationheader')}</li>
                                        <li className="progressbartext5">{i18n.t('static.program.region')}</li>
                                        <li className="progressbartext6">{i18n.t('static.pipeline.programData')}</li>
                                        <li className="progressbartext7">{i18n.t('static.dashboard.product')}</li>
                                    </ul>
                                </div>
                                <br></br>
                                <div>
                                    <div id="stepOne">
                                        <StepOne finishedStepOne={this.finishedStepOne} dataChange={this.dataChange} getDependentLists={this.getDependentLists} items={this.state}></StepOne>
                                    </div>
                                    <div id="stepTwo">
                                        <StepTwo ref='countryChild' finishedStepTwo={this.finishedStepTwo} previousToStepOne={this.previousToStepOne} dataChange={this.dataChange} getRegionList={this.getRegionList} items={this.state} generateCountryCode={this.generateCountryCode}></StepTwo>
                                    </div>
                                    <div id="stepThree">
                                        <StepThree ref="healthAreaChild" finishedStepThree={this.finishedStepThree} previousToStepTwo={this.previousToStepTwo} updateFieldDataHealthArea={this.updateFieldDataHealthArea} items={this.state} generateHealthAreaCode={this.generateHealthAreaCode}></StepThree>
                                    </div>
                                    <div id="stepFour">
                                        <StepFour ref='organisationChild' finishedStepFour={this.finishedStepFour} previousToStepThree={this.previousToStepThree} dataChange={this.dataChange} items={this.state} generateOrganisationCode={this.generateOrganisationCode}></StepFour>
                                    </div>
                                    <div id="stepFive">
                                        <StepFive ref='regionChild' finishedStepFive={this.finishedStepFive} previousToStepFour={this.previousToStepFour} updateFieldData={this.updateFieldData} items={this.state}></StepFive>
                                    </div>
                                    <div id="stepSix">
                                        <StepSix ref='sixChild' dataChange={this.dataChange} Capitalize={Capitalize} finishedStepSix={this.finishedStepSix} previousToStepFive={this.previousToStepFive} items={this.state}></StepSix>
                                    </div>
                                    <div id="stepSeven">
                                        <MapPlanningUnits ref="child" message={i18n.t(this.state.message)} removeMessageText={this.removeMessageText} items={this.state}></MapPlanningUnits>
                                        <FormGroup className="mt-2">
                                            <Button color="success" size="md" className="float-right mr-1" type="button" name="regionSub" id="regionSub" onClick={this.finishedStepSeven}> <i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                            &nbsp;
                                            <Button color="info" size="md" className="float-right mr-1" type="button" onClick={this.addRowInJexcel}> <i className="fa fa-plus"></i>{i18n.t('static.common.addRow')}</Button>
                                            &nbsp;
                                            <Button color="info" size="md" className="float-left mr-1 px-4" type="button" name="regionPrevious" id="regionPrevious" onClick={this.previousToStepSix} > <i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                            &nbsp;
                                        </FormGroup>
                                    </div>
                                </div>
                                <div style={{ display: this.state.loading ? "block" : "none" }}>
                                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                        <div class="align-items-center">
                                            <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>
                                            <div class="spinner-border blue ml-4" role="status">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardBody></Card>
                    </Col></Row></div>
        );
    }
}