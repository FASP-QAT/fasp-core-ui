import React, { Component } from 'react';
import { ProgressBar, Step } from "react-step-progress-bar";
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Row } from 'reactstrap';
import "../../../node_modules/react-step-progress-bar/styles.css";
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, MONTHS_IN_FUTURE_FOR_AMC, MONTHS_IN_PAST_FOR_AMC } from "../../Constants";
import PipelineService from '../../api/PipelineService';
import ProgramService from '../../api/ProgramService.js';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import PipelineProgramConsumption from './PipelineProgramConsumption';
import PipelineProgramDataSource from './PipelineProgramDataSource';
import PipelineProgramDataStepFive from './PipelineProgramDataStepFive';
import PipelineProgramDataStepFour from './PipelineProgramDataStepFour';
import PipelineProgramDataStepSix from './PipelineProgramDataStepSix.js';
import PipelineProgramDataStepThree from './PipelineProgramDataStepThree.js';
import PipelineProgramDataStepTwo from './PipelineProgramDataStepTwo.js';
import PipelineProgramFundingSource from './PipelineProgramFundingSource';
import PipelineProgramInventory from './PipelineProgramInventory.js';
import PipelineProgramPlanningUnits from './PipelineProgramPlanningUnits.js';
import PipelineProgramProcurementAgent from './PipelineProgramProcurementAgent';
import PipelineProgramShipment from './PipelineProgramShipment';
/**
 * Component for pipeline program onboarding.
 * Allows users to go through a multi-step form for pipeline program onboarding.
 */
export default class PipelineProgramSetup extends Component {
    constructor(props) {
        super(props);
        var realmId = AuthenticationService.getRealmId();
        this.state = {
            progressPer: 0,
            pipelineProgramSetupPer: 0,
            program:
            {
                programCode: '',
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: ''
                },
                realmCountry: {
                    realmCountryId: '',
                    realm: {
                        realmId: realmId
                    }
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
                deliveredToReceivedLeadTime: '',
                plannedToSubmittedLeadTime: '',
                submittedToApprovedLeadTime: '',
                approvedToShippedLeadTime: '',
                monthsInFutureForAmc: '',
                monthsInPastForAmc: '',
                shelfLife: '',
                healthArea: {
                    id: ''
                },
                programNotes: '',
                regionArray: [],
                healthAreaArray: [],
                arrivedToDeliveredLeadTime: '',
                shippedToArrivedBySeaLeadTime: '',
                shippedToArrivedByAirLeadTime: '',
                shippedToArrivedByRoadLeadTime: ''
            },
            lang: localStorage.getItem('lang'),
            regionId: '',
            realmList: [],
            realmCountryList: [],
            organisationList: [],
            healthAreaList: [],
            programManagerList: [],
            regionList: [],
            message: '',
            validationFailedMessage: '',
            planningUnitList: [],
            planningUnitStatus: false,
            dataSourceStatus: false,
            fundingSourceStatus: false,
            procurmentAgnetStatus: false,
            consumptionStatus: false,
            inventoryStatus: false,
            shipmentStatus: false,
            realmCountryCode: '',
            organisationCode: '',
            healthAreaCode: '',
            programInfoStatus: false,
            programInfoRegionStatus: false,
            programInfoHealthAreaStatus: false
        }
        this.endProgramInfoStepOne = this.endProgramInfoStepOne.bind(this);
        this.endProgramInfoStepTwo = this.endProgramInfoStepTwo.bind(this);
        this.endProgramInfoStepThree = this.endProgramInfoStepThree.bind(this);
        this.endProgramInfoStepFour = this.endProgramInfoStepFour.bind(this);
        this.endProgramInfoStepFive = this.endProgramInfoStepFive.bind(this);
        this.finishedStepOne = this.finishedStepOne.bind(this);
        this.finishedStepTwo = this.finishedStepTwo.bind(this);
        this.finishedStepThree = this.finishedStepThree.bind(this);
        this.finishedStepFour = this.finishedStepFour.bind(this);
        this.finishedStepFive = this.finishedStepFive.bind(this);
        this.backToprogramInfoStepOne = this.backToprogramInfoStepOne.bind(this);
        this.backToprogramInfoStepTwo = this.backToprogramInfoStepTwo.bind(this);
        this.backToprogramInfoStepThree = this.backToprogramInfoStepThree.bind(this);
        this.backToprogramInfoStepFour = this.backToprogramInfoStepFour.bind(this);
        this.previousToStepOne = this.previousToStepOne.bind(this);
        this.previousToStepTwo = this.previousToStepTwo.bind(this);
        this.previousToStepThree = this.previousToStepThree.bind(this);
        this.previousToStepFour = this.previousToStepFour.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.getRegionList = this.getRegionList.bind(this);
        this.updateFieldData = this.updateFieldData.bind(this);
        this.updateFieldDataHealthArea = this.updateFieldDataHealthArea.bind(this);
        this.generateCountryCode = this.generateCountryCode.bind(this);
        this.generateOrganisationCode = this.generateOrganisationCode.bind(this);
        this.generateHealthAreaCode = this.generateHealthAreaCode.bind(this);
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
     * Handles the completion of step one and updates the display to show step two.
     */
    endProgramInfoStepOne() {
        this.setState({ progressPer: 25, programInfoRegionStatus: false, programInfoStatus: false, programInfoHealthAreaStatus: true });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'block';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
    }
    /**
     * Handles the completion of step two and updates the display to show step three.
     */
    endProgramInfoStepTwo() {
        this.setState({ progressPer: 50, programInfoRegionStatus: false, programInfoStatus: false, programInfoHealthAreaStatus: false });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'block';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
    }
    /**
     * Handles the completion of step three and updates the display to show step four.
     */
    endProgramInfoStepThree() {
        this.setState({ progressPer: 75, programInfoRegionStatus: true, programInfoStatus: false, programInfoHealthAreaStatus: false });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'block';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
    }
    /**
     * Handles the completion of step four and updates the display to show step five.
     */
    endProgramInfoStepFour() {
        this.setState({ progressPer: 100, programInfoStatus: true, programInfoRegionStatus: false, programInfoHealthAreaStatus: false });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'block';
    }
    /**
     * Handles the completion of step five and updates the display to show step six.
     */
    endProgramInfoStepFive() {
        this.refs.programInfoChild.startLoading();
        PipelineService.addProgramToQatTempTable(this.state.program, this.props.match.params.pipelineId).then(response => {
            if (response.status == "200") {
                this.refs.programInfoChild.stopLoading();
                this.setState({
                    pipelineProgramSetupPer: 15, planningUnitStatus: true, consumptionStatus: false, inventoryStatus: false,
                    shipmentStatus: false
                });
                document.getElementById('stepOne').style.display = 'none';
                document.getElementById('stepTwo').style.display = 'block';
                document.getElementById('stepThree').style.display = 'none';
                document.getElementById('stepFour').style.display = 'none';
                document.getElementById('stepFive').style.display = 'none';
            } else {
                this.refs.programInfoChild.stopLoading();
                this.setState({
                    message: response.data.messageCode
                })
            }
        }
        ).catch(
            error => {
                if (error.message === "Network Error") {
                    this.refs.programInfoChild.stopLoading();
                    this.refs.programInfoChild.setErrorMessage(i18n.t('static.unkownError'));
                    this.setState({
                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                        loading: false
                    });
                } else {
                    this.refs.programInfoChild.stopLoading();
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
                            this.refs.programInfoChild.setErrorMessage(error.response.data.messageCode);
                            this.setState({
                                message: error.response.data.messageCode,
                                loading: false
                            });
                            break;
                        case 412:
                            this.refs.programInfoChild.setErrorMessage(error.response.data.messageCode);
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
     * Saves step one data in state.
     */
    finishedStepOne() {
        this.setState({
            pipelineProgramSetupPer: 14.28, planningUnitStatus: true, consumptionStatus: false, inventoryStatus: false,
            shipmentStatus: false
        });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'block';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
        document.getElementById('stepEight').style.display = 'none';
    }
    /**
     * Saves step two data on server.
     */
    finishedStepTwo() {
        var planningUnits = this.refs.child.savePlanningUnits();
        var checkValidation = this.refs.child.checkValidation();
        this.refs.child.startLoading();
        PipelineService.addProgramToQatTempPlanningUnits(planningUnits, this.props.match.params.pipelineId).
            then(response => {
                if (response.status == "200") {
                    this.refs.child.stopLoading();
                    if (checkValidation == true) {
                        var realmCountryId = document.getElementById("realmCountryId").value;
                        PipelineService.createRealmCountryPlanningUnits(this.props.match.params.pipelineId, realmCountryId).
                            then(response => {
                            });
                        this.setState({
                            pipelineProgramSetupPer: 29.56, planningUnitStatus: false, consumptionStatus: false, inventoryStatus: false,
                            shipmentStatus: false,
                            dataSourceStatus: true,
                            fundingSourceStatus: false,
                            procurmentAgnetStatus: false,
                        });
                        document.getElementById('stepOne').style.display = 'none';
                        document.getElementById('stepTwo').style.display = 'none';
                        document.getElementById('stepThree').style.display = 'block';
                        document.getElementById('stepFour').style.display = 'none';
                        document.getElementById('stepFive').style.display = 'none';
                        document.getElementById('stepSix').style.display = 'none';
                        document.getElementById('stepSeven').style.display = 'none';
                        document.getElementById('stepEight').style.display = 'none';
                    }
                    else {
                        this.refs.child.stopLoading();
                        alert(i18n.t('static.message.saveValidData'));
                    }
                } else {
                    this.refs.child.stopLoading();
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            }
            ).catch(error => {
                this.refs.child.stopLoading();
                alert(i18n.t('pipeline.garbageDataValidation'));
            });
    }
    /**
     * Saves step three data on server.
     */
    finishedStepThree() {
        var datasources = this.refs.datasourcechild.saveDataSource();
        var checkValidation = this.refs.datasourcechild.checkValidation();
        this.refs.datasourcechild.startLoading();
        PipelineService.addProgramToQatTempDataSource(datasources, this.props.match.params.pipelineId).
            then(response => {
                if (response.status == "200") {
                    this.refs.datasourcechild.stopLoading();
                    if (checkValidation == true) {
                        this.setState({
                            pipelineProgramSetupPer: 43.48, planningUnitStatus: false, consumptionStatus: false, inventoryStatus: false,
                            shipmentStatus: false,
                            dataSourceStatus: false,
                            fundingSourceStatus: true,
                            procurmentAgnetStatus: false,
                        });
                        document.getElementById('stepOne').style.display = 'none';
                        document.getElementById('stepTwo').style.display = 'none';
                        document.getElementById('stepThree').style.display = 'none';
                        document.getElementById('stepFour').style.display = 'block';
                        document.getElementById('stepFive').style.display = 'none';
                        document.getElementById('stepSix').style.display = 'none';
                        document.getElementById('stepSeven').style.display = 'none';
                        document.getElementById('stepEight').style.display = 'none';
                    }
                    else {
                        this.refs.datasourcechild.stopLoading();
                        alert(i18n.t('static.message.saveValidData'));
                    }
                } else {
                    this.refs.datasourcechild.stopLoading();
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            });
    }
    /**
     * Saves step four data on server.
     */
    finishedStepFour = () => {
        var consumption = this.refs.fundingSourceChild.saveFundingSource();
        var checkValidation = this.refs.fundingSourceChild.checkValidation();
        this.refs.fundingSourceChild.startLoading();
        PipelineService.addQatTempFundingSource(consumption, this.props.match.params.pipelineId).
            then(response => {
                if (response.status == "200") {
                    this.refs.fundingSourceChild.stopLoading();
                    if (checkValidation == true) {
                        this.setState({
                            pipelineProgramSetupPer: 58.12, planningUnitStatus: false, consumptionStatus: false, inventoryStatus: false,
                            shipmentStatus: false,
                            dataSourceStatus: false,
                            fundingSourceStatus: false,
                            procurmentAgnetStatus: true,
                        });
                        document.getElementById('stepOne').style.display = 'none';
                        document.getElementById('stepTwo').style.display = 'none';
                        document.getElementById('stepThree').style.display = 'none';
                        document.getElementById('stepFour').style.display = 'none';
                        document.getElementById('stepFive').style.display = 'block';
                        document.getElementById('stepSix').style.display = 'none';
                        document.getElementById('stepSeven').style.display = 'none';
                        document.getElementById('stepEight').style.display = 'none';
                    }
                    else {
                        this.refs.fundingSourceChild.stopLoading();
                        alert(i18n.t('static.message.saveValidData'));
                    }
                } else {
                    this.refs.fundingSourceChild.stopLoading();
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            });
    }
    /**
     * Saves step five data on server.
     */
    finishedStepFive = () => {
        var inventory = this.refs.procurementAgentChild.saveProcurementAgent();
        var checkValidation = this.refs.procurementAgentChild.checkValidation();
        this.refs.procurementAgentChild.startLoading();
        PipelineService.addQatTempProcurementAgent(inventory, this.props.match.params.pipelineId).
            then(response => {
                if (response.status == "200") {
                    this.refs.procurementAgentChild.stopLoading();
                    if (checkValidation == true) {
                        this.setState({
                            pipelineProgramSetupPer: 72.4, planningUnitStatus: false, consumptionStatus: true, inventoryStatus: false,
                            shipmentStatus: false,
                            dataSourceStatus: false,
                            fundingSourceStatus: false,
                            procurmentAgnetStatus: false,
                        });
                        document.getElementById('stepOne').style.display = 'none';
                        document.getElementById('stepTwo').style.display = 'none';
                        document.getElementById('stepThree').style.display = 'none';
                        document.getElementById('stepFour').style.display = 'none';
                        document.getElementById('stepFive').style.display = 'none';
                        document.getElementById('stepSix').style.display = 'block';
                        document.getElementById('stepSeven').style.display = 'none';
                        document.getElementById('stepEight').style.display = 'none';
                    } else {
                        this.refs.procurementAgentChild.stopLoading();
                        alert(i18n.t('static.message.saveValidData'));
                    }
                } else {
                    this.refs.procurementAgentChild.stopLoading();
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            });
    }
    /**
     * Saves step six data on server.
     */
    finishedStepSix = () => {
        var consumption = this.refs.consumptionChild.saveConsumption();
        PipelineService.addQatTempConsumption(consumption, this.props.match.params.pipelineId).
            then(response => {
                if (response.status == "200") {
                    var checkValidation = this.refs.consumptionChild.checkValidation();
                    this.refs.consumptionChild.stopLoading();
                    if (checkValidation == true) {
                        this.setState({
                            pipelineProgramSetupPer: 86.68, planningUnitStatus: false, consumptionStatus: false, inventoryStatus: true,
                            shipmentStatus: false,
                            dataSourceStatus: false,
                            fundingSourceStatus: false,
                            procurmentAgnetStatus: false,
                        });
                        document.getElementById('stepOne').style.display = 'none';
                        document.getElementById('stepTwo').style.display = 'none';
                        document.getElementById('stepThree').style.display = 'none';
                        document.getElementById('stepFour').style.display = 'none';
                        document.getElementById('stepFive').style.display = 'none';
                        document.getElementById('stepSix').style.display = 'none';
                        document.getElementById('stepSeven').style.display = 'block';
                        document.getElementById('stepEight').style.display = 'none';
                    } else {
                        this.refs.consumptionChild.stopLoading();
                        alert(i18n.t('static.message.saveValidData'));
                    }
                } else {
                    this.refs.consumptionChild.stopLoading();
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            }).catch(error => {
                this.refs.consumptionChild.stopLoading();
                alert(i18n.t('pipeline.garbageDataValidation'));
            });
    }
    /**
     * Saves step seven data on server.
     */
    finishedStepSeven = () => {
        var inventory = this.refs.inventoryChild.saveInventory();
        PipelineService.addQatTempInventory(inventory, this.props.match.params.pipelineId).
            then(response => {
                if (response.status == "200") {
                    var checkValidation = this.refs.inventoryChild.checkValidation();
                    this.refs.inventoryChild.stopLoading();
                    if (checkValidation == true) {
                        this.setState({
                            pipelineProgramSetupPer: 101, planningUnitStatus: false, consumptionStatus: false, inventoryStatus: false,
                            shipmentStatus: true,
                            dataSourceStatus: false,
                            fundingSourceStatus: false,
                            procurmentAgnetStatus: false,
                        });
                        document.getElementById('stepOne').style.display = 'none';
                        document.getElementById('stepTwo').style.display = 'none';
                        document.getElementById('stepThree').style.display = 'none';
                        document.getElementById('stepFour').style.display = 'none';
                        document.getElementById('stepFive').style.display = 'none';
                        document.getElementById('stepSix').style.display = 'none';
                        document.getElementById('stepSeven').style.display = 'none';
                        document.getElementById('stepEight').style.display = 'block';
                    } else {
                        this.refs.inventoryChild.stopLoading();
                        alert(i18n.t('static.message.saveValidData'));
                    }
                } else {
                    this.refs.inventoryChild.stopLoading();
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            }).catch(error => {
                this.refs.inventoryChild.stopLoading();
                alert(i18n.t('pipeline.garbageDataValidation'));
            });
    }
    /**
     * Saves step eight data on server.
     */
    finishedStepEignt = () => {
    }
    /**
     * Handles moving back to step one from any subsequent step and updates the display accordingly.
     */
    backToprogramInfoStepOne() {
        this.setState({ progressPer: 0, programInfoRegionStatus: false, programInfoStatus: false, programInfoHealthAreaStatus: false });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'block';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
    }
    /**
     * Handles moving back to step two from any subsequent step and updates the display accordingly.
     */
    backToprogramInfoStepTwo() {
        this.setState({ progressPer: 25, programInfoRegionStatus: false, programInfoStatus: false, programInfoHealthAreaStatus: true });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'block';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
    }
    /**
     * Handles moving back to step three from any subsequent step and updates the display accordingly.
     */
    backToprogramInfoStepThree() {
        this.setState({ progressPer: 50, programInfoRegionStatus: false, programInfoStatus: false, programInfoHealthAreaStatus: false });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'block';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
    }
    /**
     * Handles moving back to step four from any subsequent step and updates the display accordingly.
     */
    backToprogramInfoStepFour() {
        this.setState({ progressPer: 75, programInfoRegionStatus: true, programInfoStatus: false, programInfoHealthAreaStatus: false });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'block';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
    }
    /**
     * Handles moving back to step one from any subsequent step and updates the display accordingly.
     */
    previousToStepOne() {
        this.setState({
            pipelineProgramSetupPer: 0, planningUnitStatus: false, consumptionStatus: false, inventoryStatus: false,
            shipmentStatus: false,
            dataSourceStatus: false,
            fundingSourceStatus: false,
            procurmentAgnetStatus: false,
            programInfoRegionStatus: false, programInfoHealthAreaStatus: false, programInfoStatus: true
        });
        document.getElementById('stepOne').style.display = 'block';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
        document.getElementById('stepEight').style.display = 'none';
    }
    /**
     * Handles moving back to step two from any subsequent step and updates the display accordingly.
     */
    previousToStepTwo() {
        this.setState({
            pipelineProgramSetupPer: 15.28, planningUnitStatus: true, consumptionStatus: false, inventoryStatus: false,
            shipmentStatus: false,
            dataSourceStatus: false,
            fundingSourceStatus: false,
            procurmentAgnetStatus: false,
        });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'block';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
        document.getElementById('stepEight').style.display = 'none';
    }
    /**
     * Handles moving back to step three from any subsequent step and updates the display accordingly.
     */
    previousToStepThree() {
        this.setState({
            pipelineProgramSetupPer: 29.56, planningUnitStatus: false, consumptionStatus: false, inventoryStatus: false,
            shipmentStatus: false,
            dataSourceStatus: true,
            fundingSourceStatus: false,
            procurmentAgnetStatus: false,
        });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'block';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
        document.getElementById('stepEight').style.display = 'none';
    }
    /**
     * Handles moving back to step four from any subsequent step and updates the display accordingly.
     */
    previousToStepFour() {
        this.setState({
            pipelineProgramSetupPer: 43.84, planningUnitStatus: false, consumptionStatus: false, inventoryStatus: false,
            shipmentStatus: false,
            dataSourceStatus: false,
            fundingSourceStatus: true,
            procurmentAgnetStatus: false,
        });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'block';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
        document.getElementById('stepEight').style.display = 'none';
    }
    /**
     * Handles moving back to step five from any subsequent step and updates the display accordingly.
     */
    previousToStepFive = () => {
        this.setState({
            pipelineProgramSetupPer: 58.12, planningUnitStatus: false, consumptionStatus: false, inventoryStatus: false,
            shipmentStatus: false,
            dataSourceStatus: false,
            fundingSourceStatus: false,
            procurmentAgnetStatus: true,
        });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'block';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
        document.getElementById('stepEight').style.display = 'none';
    }
    /**
     * Handles moving back to step six from any subsequent step and updates the display accordingly.
     */
    previousToStepSix = () => {
        this.setState({
            pipelineProgramSetupPer: 72.4, planningUnitStatus: false, consumptionStatus: true, inventoryStatus: false,
            shipmentStatus: false,
            dataSourceStatus: false,
            fundingSourceStatus: false,
            procurmentAgnetStatus: false,
        });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'block';
        document.getElementById('stepSeven').style.display = 'none';
        document.getElementById('stepEight').style.display = 'none';
    }
    /**
     * Handles moving back to step seven from any subsequent step and updates the display accordingly.
     */
    previousToStepSeven = () => {
        this.setState({
            pipelineProgramSetupPer: 86.68, planningUnitStatus: false, consumptionStatus: false, inventoryStatus: true,
            shipmentStatus: false,
            dataSourceStatus: false,
            fundingSourceStatus: false,
            procurmentAgnetStatus: false,
        });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'block';
        document.getElementById('stepEight').style.display = 'none';
    }
    /**
     * Handles data change in the form.
     * @param {Event} event - The change event.
     */
    dataChange(event) {
        let { program } = this.state;
        if (event.target.name == 'programCode1') {
            program.programCode = event.target.value.toUpperCase();
        }
        if (event.target.name == "programName") {
            program.label.label_en = event.target.value;
        } if (event.target.name == "realmId") {
            program.realm.realmId = event.target.value;
        } if (event.target.name == 'realmCountryId') {
            program.realmCountry.realmCountryId = event.target.value;
        } if (event.target.name == 'organisationId') {
            program.organisation.id = event.target.value;
        } if (event.target.name == 'airFreightPerc') {
            program.airFreightPerc = event.target.value;
        } if (event.target.name == 'seaFreightPerc') {
            program.seaFreightPerc = event.target.value;
        } if (event.target.name == 'roadFreightPerc') {
            program.roadFreightPerc = event.target.value;
        } if (event.target.name == 'deliveredToReceivedLeadTime') {
            program.deliveredToReceivedLeadTime = event.target.value;
        } if (event.target.name == 'plannedToSubmittedLeadTime') {
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
            program.healthArea.id = event.target.value;
        } if (event.target.name == 'userId') {
            program.programManager.userId = event.target.value;
        }
        if (event.target.name == 'arrivedToDeliveredLeadTime') {
            program.arrivedToDeliveredLeadTime = event.target.value;
        }
        if (event.target.name == 'shippedToArrivedBySeaLeadTime') {
            program.shippedToArrivedBySeaLeadTime = event.target.value;
        }
        if (event.target.name == 'shippedToArrivedByRoadLeadTime') {
            program.shippedToArrivedByRoadLeadTime = event.target.value;
        }
        if (event.target.name == 'shippedToArrivedByAirLeadTime') {
            program.shippedToArrivedByAirLeadTime = event.target.value;
        }
        if (event.target.name == 'shelfLife') {
            program.shelfLife = event.target.value;
        }
        else if (event.target.name == 'programNotes') {
            program.programNotes = event.target.value;
        }
        this.setState({ program }, () => { })
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
     * Reterives pipeline program details on component mount
     */
    componentDidMount() {
        PipelineService.getQatTempPorgramByPipelineId(this.props.match.params.pipelineId)
            .then(response => {
                if (response.status == 200) {
                    if (response.data != "") {
                        this.setState({ program: response.data });
                        ProgramService.getRegionList(response.data.realmCountry.realmCountryId)
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
                    } else {
                        PipelineService.getPipelineProgramDataById(this.props.match.params.pipelineId)
                            .then(response => {
                                if (response.status == 200) {
                                    let { program } = this.state;
                                    if (isNaN(parseInt(response.data.countryname))) {
                                        program.realmCountry.realmCountryId = '';
                                        this.setState({ validationFailedMessage: `Country ${response.data.countryname} does not exist please create ticket.` })
                                    } else {
                                        program.realmCountry.realmCountryId = response.data.countryname;
                                        this.setState({ validationFailedMessage: '' })
                                        ProgramService.getRegionList(response.data.countryname)
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
                                    program.programNotes = response.data.note;
                                    program.label.label_en = response.data.programname;
                                    if (response.data.defaultleadtimeplan != 0 && response.data.defaultleadtimeplan != "") {
                                        program.plannedToSubmittedLeadTime = response.data.defaultleadtimeplan;
                                    }
                                    if (response.data.defaultleadtimeorder != 0 && response.data.defaultleadtimeorder != "") {
                                        program.submittedToApprovedLeadTime = 0.5;
                                        program.approvedToShippedLeadTime = parseFloat(response.data.defaultleadtimeorder - 0.5);
                                    }
                                    if (response.data.defaultleadtimeship != 0 && response.data.defaultleadtimeship != "") {
                                        program.arrivedToDeliveredLeadTime = 0.5;
                                        program.shippedToArrivedBySeaLeadTime = parseFloat(response.data.defaultleadtimeship - 0.5);
                                    }
                                    program.monthsInPastForAmc = MONTHS_IN_PAST_FOR_AMC;
                                    program.monthsInFutureForAmc = MONTHS_IN_FUTURE_FOR_AMC;
                                    this.setState({ program: program });
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
        document.getElementById('pipelineProgramDataStepOne').style.display = 'block';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
        document.getElementById('stepOne').style.display = 'block';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
        document.getElementById('stepEight').style.display = 'none';
    }
    /**
     * Renders the pipeline program onboarding screen.
     * @returns {JSX.Element} - Pipeline program onboarding screen.
     */
    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                        <Card className="mt-1">
                            <CardBody>
                                <ProgressBar
                                    percent={this.state.pipelineProgramSetupPer}
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
                                    <Step transition="scale">
                                        {({ accomplished }) => (
                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number8.png"
                                            />
                                        )}
                                    </Step>
                                </ProgressBar>
                                <div className="d-sm-down-none  progressbar">
                                    <ul>
                                        <li className="progressetuptext1">{i18n.t('static.pipeline.programInfo')}</li>
                                        <li className="progressetuptext2">{i18n.t('static.dashboard.planningunit')}</li>
                                        <li className="progressetuptext3">{i18n.t('static.inventory.dataSource')}</li>
                                        <li className="progressetuptext4">{i18n.t('static.budget.fundingsource')}</li>
                                        <li className="progressetuptext5">{i18n.t('static.dashboard.procurementagentheader')}</li>
                                        <li className="progressetuptext6">{i18n.t('static.supplyPlan.consumption')}</li>
                                        <li className="progressetuptext7">{i18n.t('static.inventory.inventory')}</li>
                                        <li className="progressetuptext8">{i18n.t('static.shipment.shipment')}</li>
                                    </ul>
                                </div>
                                <br></br>
                                <div id="stepOne">
                                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                                        <Card>
                                            <CardHeader>
                                                <strong>{i18n.t('static.pipeline.programInfo')}</strong>{' '}
                                            </CardHeader>
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
                                                </ProgressBar>
                                                <div className="d-sm-down-none  progressbar">
                                                    <ul>
                                                        <li className="progresdatatext1">{i18n.t('static.program.realmcountry')}</li>
                                                        <li className="progresdatatext2">{i18n.t('static.dashboard.healthareaheader')}</li>
                                                        <li className="progresdatatext3">{i18n.t('static.organisation.organisationheader')}</li>
                                                        <li className="progresdatatext4">{i18n.t('static.inventory.region')}</li>
                                                        <li className="progresdatatext5">{i18n.t('static.pipeline.programData')}</li>
                                                    </ul>
                                                </div>
                                                <br></br>
                                                <div id="pipelineProgramDataStepOne">
                                                    <PipelineProgramDataStepTwo realmId={this.state.program.realmCountry.realm.realmId} endProgramInfoStepOne={this.endProgramInfoStepOne} items={this.state} dataChange={this.dataChange} getRegionList={this.getRegionList} generateCountryCode={this.generateCountryCode}></PipelineProgramDataStepTwo>
                                                </div>
                                                <div id="pipelineProgramDataStepTwo">
                                                    {this.state.programInfoHealthAreaStatus && <PipelineProgramDataStepThree endProgramInfoStepTwo={this.endProgramInfoStepTwo} backToprogramInfoStepOne={this.backToprogramInfoStepOne} items={this.state} updateFieldDataHealthArea={this.updateFieldDataHealthArea} generateHealthAreaCode={this.generateHealthAreaCode}></PipelineProgramDataStepThree>}
                                                </div>
                                                <div id="pipelineProgramDataStepThree">
                                                    <PipelineProgramDataStepFour endProgramInfoStepThree={this.endProgramInfoStepThree} backToprogramInfoStepTwo={this.backToprogramInfoStepTwo} items={this.state} dataChange={this.dataChange} generateOrganisationCode={this.generateOrganisationCode}></PipelineProgramDataStepFour>
                                                </div>
                                                <div id="pipelineProgramDataStepFour">
                                                    {this.state.programInfoRegionStatus && <PipelineProgramDataStepFive backToprogramInfoStepThree={this.backToprogramInfoStepThree} endProgramInfoStepFour={this.endProgramInfoStepFour} items={this.state} updateFieldData={this.updateFieldData} generateCountryCode={this.generateCountryCode} generateHealthAreaCode={this.generateHealthAreaCode} generateOrganisationCode={this.generateOrganisationCode}></PipelineProgramDataStepFive>}
                                                </div>
                                                <div id="pipelineProgramDataStepFive">
                                                    {this.state.programInfoStatus && <PipelineProgramDataStepSix endProgramInfoStepFive={this.endProgramInfoStepFive} ref="programInfoChild" backToprogramInfoStepFour={this.backToprogramInfoStepFour} items={this.state} dataChange={this.dataChange}></PipelineProgramDataStepSix>}
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </div>
                                <div id="stepTwo">
                                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                                        <Card>
                                            <CardHeader>
                                                <strong>{i18n.t('static.dashboard.programPlanningUnit')}{this.state.planningUnitStatus}</strong>{' '}
                                            </CardHeader>
                                            <CardBody className="pt-0">
                                                {this.state.planningUnitStatus && <PipelineProgramPlanningUnits ref="child" pipelineId={this.props.match.params.pipelineId} items={this.state} realmId={this.state.program.realmCountry.realm.realmId}></PipelineProgramPlanningUnits>}
                                            </CardBody>
                                            <CardFooter>
                                                <span className="red">
                                                    {i18n.t('static.pipeline.duplicatePlanningUnittext')}
                                                </span>
                                            </CardFooter>
                                        </Card>
                                        <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepOne} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepTwo}>{i18n.t('static.pipeline.save')} <i className="fa fa-angle-double-right"></i></Button>
                                        &nbsp;
                                    </Col>
                                </div>
                                <div id="stepThree">
                                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                                        <Card>
                                            <CardHeader>
                                                <strong>  {i18n.t('static.dashboard.datasourcehaeder')} </strong>{' '}
                                            </CardHeader>
                                            <CardBody className="pt-0">
                                                {this.state.dataSourceStatus && <PipelineProgramDataSource ref="datasourcechild" pipelineId={this.props.match.params.pipelineId}></PipelineProgramDataSource>}
                                            </CardBody>
                                        </Card>
                                        <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepTwo} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepThree}>{i18n.t('static.pipeline.save')} <i className="fa fa-angle-double-right"></i></Button>
                                        &nbsp;
                                    </Col>
                                </div>
                                <div id="stepFour">
                                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                                        <Card>
                                            <CardHeader>
                                                <strong>  {i18n.t('static.budget.fundingsource')} </strong>{' '}
                                            </CardHeader>
                                            <CardBody className="pt-0">
                                                {this.state.fundingSourceStatus && <PipelineProgramFundingSource ref="fundingSourceChild" pipelineId={this.props.match.params.pipelineId}></PipelineProgramFundingSource>}
                                            </CardBody>
                                        </Card>
                                        <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepThree} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepFour}>{i18n.t('static.pipeline.save')} <i className="fa fa-angle-double-right"></i></Button>
                                        &nbsp;
                                    </Col>
                                </div>
                                <div id="stepFive">
                                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                                        <Card>
                                            <CardHeader>
                                                <strong>  {i18n.t('static.report.procurementAgentName')} </strong>{' '}
                                            </CardHeader>
                                            <CardBody className="pt-0">
                                                {this.state.procurmentAgnetStatus && <PipelineProgramProcurementAgent ref="procurementAgentChild" pipelineId={this.props.match.params.pipelineId}></PipelineProgramProcurementAgent>}
                                            </CardBody>
                                        </Card>
                                        <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepFour} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepFive}>{i18n.t('static.pipeline.save')} <i className="fa fa-angle-double-right"></i></Button>
                                        &nbsp;
                                    </Col>
                                </div>
                                <div id="stepSix">
                                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                                        <Card>
                                            <CardHeader>
                                                <strong>  {i18n.t('static.dashboard.consumptiondetails')} </strong>{' '}
                                            </CardHeader>
                                            <CardBody className="pt-0">
                                                {this.state.consumptionStatus && <PipelineProgramConsumption ref="consumptionChild" pipelineId={this.props.match.params.pipelineId}></PipelineProgramConsumption>}
                                            </CardBody>
                                        </Card>
                                        <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepFive} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepSix}>{i18n.t('static.pipeline.save')} <i className="fa fa-angle-double-right"></i></Button>
                                        &nbsp;
                                    </Col>
                                </div>
                                <div id="stepSeven">
                                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                                        <Card>
                                            <CardHeader>
                                                <strong>  {i18n.t('static.dashboard.inventorydetails')}</strong>{' '}
                                            </CardHeader>
                                            <CardBody className="pt-0">
                                                {this.state.inventoryStatus && <PipelineProgramInventory pipelineId={this.props.match.params.pipelineId} ref="inventoryChild"></PipelineProgramInventory>}
                                            </CardBody>
                                        </Card>
                                        <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepSix} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepSeven}>{i18n.t('static.pipeline.save')} <i className="fa fa-angle-double-right"></i></Button>
                                        &nbsp;
                                    </Col>
                                </div>
                                <div id="stepEight">
                                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                                        <Card>
                                            <CardHeader>
                                                <strong>  {i18n.t('static.report.shipmentDetailReport')} </strong>{' '}
                                            </CardHeader>
                                            <CardBody className="pt-0">
                                            </CardBody>
                                            {this.state.shipmentStatus && <PipelineProgramShipment endProgramInfoStepFive={this.endProgramInfoStepFive} items={this.state} previousToStepFour={this.previousToStepSeven} {...this.props}></PipelineProgramShipment>}
                                        </Card>
                                    </Col>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row >
            </div >
        );
    }
}
