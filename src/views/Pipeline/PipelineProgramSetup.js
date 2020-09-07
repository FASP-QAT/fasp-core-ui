import React, { Component } from 'react';
import { ProgressBar, Step } from "react-step-progress-bar";
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Row } from 'reactstrap';
import "../../../node_modules/react-step-progress-bar/styles.css";
import PipelineService from '../../api/PipelineService';
import ProgramService from '../../api/ProgramService.js';
import getLabelText from '../../CommonComponent/getLabelText';
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

export default class PipelineProgramSetup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            progressPer: 0,
            pipelineProgramSetupPer: 0,
            program:
            {
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: ''
                },

                realmCountry: {
                    realmCountryId: '',
                    realm: {
                        realmId: 1
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

                arrivedToDeliveredLeadTime: '',
                shippedToArrivedBySeaLeadTime: '',
                shippedToArrivedByAirLeadTime: ''

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
            shipmentStatus: false
            // pipelineConsumptionList: []
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
        // this.backToprogramInfoStepFive = this.backToprogramInfoStepFive.bind(this);
        this.previousToStepOne = this.previousToStepOne.bind(this);
        this.previousToStepTwo = this.previousToStepTwo.bind(this);
        this.previousToStepThree = this.previousToStepThree.bind(this);
        this.previousToStepFour = this.previousToStepFour.bind(this);

        this.dataChange = this.dataChange.bind(this);
        this.getRegionList = this.getRegionList.bind(this);
        this.updateFieldData = this.updateFieldData.bind(this);
    }

    endProgramInfoStepOne() {
        this.setState({ progressPer: 25 });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'block';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
        // document.getElementById('pipelineProgramDataStepSix').style.display = 'none';

    }
    endProgramInfoStepTwo() {
        this.setState({ progressPer: 50 });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'block';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
        // document.getElementById('pipelineProgramDataStepSix').style.display = 'none';
    }
    endProgramInfoStepThree() {
        this.setState({ progressPer: 75 });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'block';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
        // document.getElementById('pipelineProgramDataStepSix').style.display = 'none';
    }
    endProgramInfoStepFour() {
        this.setState({ progressPer: 100 });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'block';
        // document.getElementById('pipelineProgramDataStepSix').style.display = 'block';
    }
    endProgramInfoStepFive() {
        console.log("program Data=======>", this.state.program);
        AuthenticationService.setupAxiosInterceptors();
        PipelineService.addProgramToQatTempTable(this.state.program, this.props.match.params.pipelineId).then(response => {
            if (response.status == "200") {
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
                this.setState({
                    message: response.data.messageCode
                })
            }
        }
        )

    }

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
    finishedStepTwo() {
        // alert(this.refs.child.checkValidation());
        // if (this.refs.child.checkValidation() != true) {
        //     alert("Please resolve all error and then proceed.");
        // }
        // else {
        // console.log("planning unit data---->",this.refs.child.savePlanningUnits());
        var planningUnits = this.refs.child.savePlanningUnits();
        var checkValidation = this.refs.child.checkValidation();
        AuthenticationService.setupAxiosInterceptors();
        PipelineService.addProgramToQatTempPlanningUnits(planningUnits, this.props.match.params.pipelineId).
            then(response => {
                if (response.status == "200") {
                    // PipelineService.getPipelineProgramConsumption(this.props.match.params.pipelineId).then(response => {
                    //     if (response.status == "200") {
                    if (checkValidation == true) {
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
                        alert("Saved rows with vaild data. To proceed further validated all rows and continue.");
                    }

                    // } else {
                    //     this.setState({
                    //         message: response.data.messageCode
                    //     })
                    // }
                    // });


                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            }
            )
        // }

    }
    finishedStepThree() {
        var datasources = this.refs.datasourcechild.saveDataSource();
        var checkValidation = this.refs.datasourcechild.checkValidation();
        // console.log("consumption save------>",consumption);
        AuthenticationService.setupAxiosInterceptors();
        PipelineService.addProgramToQatTempDataSource(datasources, this.props.match.params.pipelineId).
            then(response => {
                // console.log("consumption add response--->", response);
                if (response.status == "200") {
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
                        alert("Saved rows with vaild data. To proceed further validated all rows and continue.");
                    }
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }

            });
    }
    finishedStepFour = () => {
        var consumption = this.refs.fundingSourceChild.saveFundingSource();
        var checkValidation = this.refs.fundingSourceChild.checkValidation();
        // console.log("consumption save------>",consumption);
        AuthenticationService.setupAxiosInterceptors();
        PipelineService.addQatTempFundingSource(consumption, this.props.match.params.pipelineId).
            then(response => {
                // console.log("consumption add response--->", response);
                if (response.status == "200") {
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
                        alert("Saved rows with vaild data. To proceed further validated all rows and continue.");
                        // this.setState({ pipelineProgramSetupPer: 75, inventoryStatus: true });
                        // document.getElementById('stepOne').style.display = 'none';
                        // document.getElementById('stepTwo').style.display = 'none';
                        // document.getElementById('stepThree').style.display = 'none';
                        // document.getElementById('stepFour').style.display = 'block';
                        // document.getElementById('stepFive').style.display = 'none';
                    }
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }

            });
    }

    finishedStepFive = () => {
        var inventory = this.refs.procurementAgentChild.saveProcurementAgent();
        var checkValidation = this.refs.procurementAgentChild.checkValidation();
        console.log("inventory-----data---", inventory);
        AuthenticationService.setupAxiosInterceptors();
        PipelineService.addQatTempProcurementAgent(inventory, this.props.match.params.pipelineId).
            then(response => {
                if (response.status == "200") {

                    if (checkValidation == true) {
                        this.setState({
                            pipelineProgramSetupPer: 72.4, planningUnitStatus: false, consumptionStatus: true, inventoryStatus: false,
                            shipmentStatus: false,
                            dataSourceStatus: false,
                            fundingSourceStatus: false,
                            procurmentAgnetStatus:false,
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
                        alert("Saved rows with vaild data. To proceed further validated all rows and continue.");
                    }

                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            });
    }
    finishedStepSix = () => {
        var consumption = this.refs.consumptionChild.saveConsumption();
        var checkValidation = this.refs.consumptionChild.checkValidation();
        console.log("inventory-----data---", consumption);
        AuthenticationService.setupAxiosInterceptors();
        PipelineService.addQatTempConsumption(consumption, this.props.match.params.pipelineId).
            then(response => {
                if (response.status == "200") {

                    if (checkValidation == true) {
                        this.setState({
                            pipelineProgramSetupPer: 86.68, planningUnitStatus: false, consumptionStatus: false, inventoryStatus: true,
                            shipmentStatus: false,
                            dataSourceStatus: false,
                            fundingSourceStatus: false,
                            procurmentAgnetStatus:false,
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
                        alert("Saved rows with vaild data. To proceed further validated all rows and continue.");
                    }

                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            });
    }
    finishedStepSeven = () => {
        var inventory = this.refs.inventoryChild.saveInventory();
        var checkValidation = this.refs.inventoryChild.checkValidation();
        console.log("inventory-----data---", inventory);
        AuthenticationService.setupAxiosInterceptors();
        PipelineService.addQatTempInventory(inventory, this.props.match.params.pipelineId).
            then(response => {
                if (response.status == "200") {
                    console.log("save indentory date====>", response);
                    if (checkValidation == true) {
                        this.setState({
                            pipelineProgramSetupPer: 101, planningUnitStatus: false, consumptionStatus: false, inventoryStatus: false,
                            shipmentStatus: true,
                            dataSourceStatus: false,
                            fundingSourceStatus: false,
                            procurmentAgnetStatus:false,
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
                        alert("Saved rows with vaild data. To proceed further validated all rows and continue.");
                        // this.setState({ pipelineProgramSetupPer: 100, shipmentStatus: true });
                        // document.getElementById('stepOne').style.display = 'none';
                        // document.getElementById('stepTwo').style.display = 'none';
                        // document.getElementById('stepThree').style.display = 'none';
                        // document.getElementById('stepFour').style.display = 'none';
                        // document.getElementById('stepFive').style.display = 'block';
                    }

                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            });

    }

    finishedStepEignt = () => {
        console.log("final commit -------------->")
    }

    backToprogramInfoStepOne() {
        this.setState({ progressPer: 0 });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'block';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
        // document.getElementById('pipelineProgramDataStepSix').style.display = 'none';
    }
    backToprogramInfoStepTwo() {
        this.setState({ progressPer: 25 });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'block';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
        // document.getElementById('pipelineProgramDataStepSix').style.display = 'none';
    }
    backToprogramInfoStepThree() {
        this.setState({ progressPer: 50 });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'block';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
        // document.getElementById('pipelineProgramDataStepSix').style.display = 'none';
    }
    backToprogramInfoStepFour() {
        this.setState({ progressPer: 75 });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'block';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
        // document.getElementById('pipelineProgramDataStepSix').style.display = 'none';
    }
    // backToprogramInfoStepFive() {
    //     this.setState({ progressPer: 80 });
    //     document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
    //     document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
    //     document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
    //     document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
    //     document.getElementById('pipelineProgramDataStepFive').style.display = 'block';
    //     // document.getElementById('pipelineProgramDataStepSix').style.display = 'none';
    // }

    previousToStepOne() {
        this.setState({
            pipelineProgramSetupPer: 0, planningUnitStatus: false, consumptionStatus: false, inventoryStatus: false,
            shipmentStatus: false,
            dataSourceStatus: false,
            fundingSourceStatus: false,
            procurmentAgnetStatus:false,
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

    previousToStepTwo() {
        this.setState({
            pipelineProgramSetupPer: 15.28, planningUnitStatus: true, consumptionStatus: false, inventoryStatus: false,
            shipmentStatus: false,
            dataSourceStatus: false,
            fundingSourceStatus: false,
            procurmentAgnetStatus:false,
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

    previousToStepThree() {
        this.setState({
            pipelineProgramSetupPer: 29.56, planningUnitStatus: false, consumptionStatus: false, inventoryStatus: false,
            shipmentStatus: false,
            dataSourceStatus: true,
            fundingSourceStatus: false,
            procurmentAgnetStatus:false,
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

    previousToStepFour() {
        this.setState({
            pipelineProgramSetupPer: 43.84, planningUnitStatus: false, consumptionStatus: false, inventoryStatus: false,
            shipmentStatus: false,
            dataSourceStatus: false,
            fundingSourceStatus: true,
            procurmentAgnetStatus:false,
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
    previousToStepFive = () => {
        this.setState({
            pipelineProgramSetupPer: 58.12, planningUnitStatus: false, consumptionStatus: false, inventoryStatus: false,
            shipmentStatus: false,
            dataSourceStatus: false,
            fundingSourceStatus: false,
            procurmentAgnetStatus:true,
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
    previousToStepSix = () => {
        this.setState({
            pipelineProgramSetupPer: 72.4, planningUnitStatus: false, consumptionStatus: true, inventoryStatus: false,
            shipmentStatus: false,
            dataSourceStatus: false,
            fundingSourceStatus: false,
            procurmentAgnetStatus:false,
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
    previousToStepSeven = () => {
        this.setState({
            pipelineProgramSetupPer: 86.68, planningUnitStatus: false, consumptionStatus: false, inventoryStatus: true,
            shipmentStatus: false,
            dataSourceStatus: false,
            fundingSourceStatus: false,
            procurmentAgnetStatus:false,
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


    dataChange(event) {
        let { program } = this.state;
        if (event.target.name == "programName") {
            program.label.label_en = event.target.value;
        } if (event.target.name == "realmId") {
            program.realm.realmId = event.target.value;
        } if (event.target.name == 'realmCountryId') {
            program.realmCountry.realmCountryId = event.target.value;
            // this.refs.regionChild.getRegionList();
        } if (event.target.name == 'organisationId') {
            program.organisation.id = event.target.value;
        } if (event.target.name == 'airFreightPerc') {
            program.airFreightPerc = event.target.value;
        } if (event.target.name == 'seaFreightPerc') {
            program.seaFreightPerc = event.target.value;
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

    getRegionList(e) {

        AuthenticationService.setupAxiosInterceptors();
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
            })
    }

    componentDidMount() {
        // console.log("pipelineProgramId----->", this.props.match.params.pipelineId);
        AuthenticationService.setupAxiosInterceptors();
        PipelineService.getQatTempPorgramByPipelineId(this.props.match.params.pipelineId)
            .then(response => {
                console.log("my resp---", response);
                if (response.status == 200) {
                    if (response.data != "") {
                        console.log("in if----->");
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
                            })
                    } else {
                        console.log("in else------->");
                        PipelineService.getPipelineProgramDataById(this.props.match.params.pipelineId)
                            .then(response => {
                                if (response.status == 200) {
                                    let { program } = this.state;
                                    console.log("============>", response.data);
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
                                            })

                                    }

                                    program.programNotes = response.data.note;
                                    program.label.label_en = response.data.programname;
                                    this.setState({ program: program });
                                } else {
                                    this.setState({
                                        message: response.data.messageCode
                                    })
                                }
                            }).catch(
                                error => {
                                    if (error.message === "Network Error") {
                                        this.setState({ message: error.message });
                                    } else {
                                        switch (error.response ? error.response.status : "") {
                                            case 500:
                                            case 401:
                                            case 404:
                                            case 406:
                                            case 412:
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

                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }


            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
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
        // document.getElementById('pipelineProgramDataStepSix').style.display = 'none';

        document.getElementById('stepOne').style.display = 'block';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
        document.getElementById('stepEight').style.display = 'none';

    }
    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                        <Card className="mt-1">
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>Setup Program</strong>{' '}
                            </CardHeader> */}
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
                                                // src="https://pngimg.com/uploads/number1/number1_PNG14871.png"
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
                                            // src="https://cdn.clipart.email/096a56141a18c8a5b71ee4a53609b16a_data-privacy-news-five-stories-that-you-need-to-know-about-_688-688.png"
                                            />
                                            // <h2>2</h2>
                                        )}

                                    </Step>
                                    <Step transition="scale">
                                        {({ accomplished }) => (
                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number3.png"
                                            // src="https://www.obiettivocoaching.it/wp-content/uploads/2016/04/recruit-circle-3-icon-blue.png"
                                            />
                                            // <h2>3</h2>
                                        )}
                                    </Step>
                                    <Step transition="scale">
                                        {({ accomplished }) => (
                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number4.png"
                                            // src="https://pngriver.com/wp-content/uploads/2017/12/number-4-digit-png-transparent-images-transparent-backgrounds-4.png"
                                            />
                                            // <h2>4</h2>
                                        )}
                                    </Step>
                                    <Step transition="scale">
                                        {({ accomplished }) => (

                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number5.png"
                                            // src="https://dwidude.com/wp-content/uploads/2016/09/recruit-circle-5-icon-blue.png"
                                            />
                                            // <h2>5</h2>
                                        )}
                                    </Step>
                                    <Step transition="scale">
                                        {({ accomplished }) => (

                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number6.png"
                                            // src="https://dwidude.com/wp-content/uploads/2016/09/recruit-circle-5-icon-blue.png"
                                            />
                                            // <h2>5</h2>
                                        )}
                                    </Step>
                                    <Step transition="scale">
                                        {({ accomplished }) => (

                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number7.png"
                                            // src="https://dwidude.com/wp-content/uploads/2016/09/recruit-circle-5-icon-blue.png"
                                            />
                                            // <h2>5</h2>
                                        )}
                                    </Step>
                                    <Step transition="scale">
                                        {({ accomplished }) => (

                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number8.png"
                                            // src="https://dwidude.com/wp-content/uploads/2016/09/recruit-circle-5-icon-blue.png"
                                            />
                                            // <h2>5</h2>
                                        )}
                                    </Step>

                                    {/* <Step transition="scale">
                                        {({ accomplished }) => (
                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number6.png"
                                            // src="http://pngimg.com/uploads/number6/number6_PNG18583.png"
                                            />
                                            // <h2>6</h2>
                                        )}
                                    </Step>

                                    <Step transition="scale">
                                        {({ accomplished }) => (
                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number7.png"
                                            // src="https://www.library.ucla.edu/sites/default/files/styles/custom_crop/public/static_images/BYS7.jpg?itok=9890vsGz"
                                            />
                                            // <h2>7</h2>
                                        )}
                                    </Step> */}
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
                                        {/* <li className="progressbartext6">Program Data</li>
                                        <li className="progressbartext7">Planning Units</li> */}
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


                                                    {/* <Step transition="scale">
                                                        {({ accomplished }) => (
                                                            <img
                                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                                width="30"
                                                                src="../../../../public/assets/img/numbers/number6.png"
                                                            />
                                                        )}
                                                    </Step> */}
                                                </ProgressBar>
                                                <div className="d-sm-down-none  progressbar">
                                                    <ul>
                                                        {/* <li className="progresdatatext1">Realm</li> */}
                                                        <li className="progresdatatext1">{i18n.t('static.program.realmcountry')}</li>
                                                        <li className="progresdatatext2">{i18n.t('static.dashboard.healthareaheader')}</li>
                                                        <li className="progresdatatext3">{i18n.t('static.organisation.organisationheader')}</li>
                                                        <li className="progresdatatext4">{i18n.t('static.inventory.region')}</li>
                                                        <li className="progresdatatext5">{i18n.t('static.pipeline.programData')}</li>
                                                    </ul>
                                                </div>
                                                <br></br>
                                                {/* <div id="pipelineProgramDataStepOne">
                                                    <PipelineProgramDataStepOne realmId={this.state.program.realm.realmId} endProgramInfoStepOne={this.endProgramInfoStepOne}></PipelineProgramDataStepOne>
                                                </div> */}
                                                <div id="pipelineProgramDataStepOne">
                                                    <PipelineProgramDataStepTwo realmId={this.state.program.realmCountry.realm.realmId} endProgramInfoStepOne={this.endProgramInfoStepOne} items={this.state} dataChange={this.dataChange} getRegionList={this.getRegionList}></PipelineProgramDataStepTwo>
                                                </div>
                                                <div id="pipelineProgramDataStepTwo">
                                                    <PipelineProgramDataStepThree endProgramInfoStepTwo={this.endProgramInfoStepTwo} backToprogramInfoStepOne={this.backToprogramInfoStepOne} items={this.state} dataChange={this.dataChange}></PipelineProgramDataStepThree>
                                                </div>
                                                <div id="pipelineProgramDataStepThree">
                                                    <PipelineProgramDataStepFour endProgramInfoStepThree={this.endProgramInfoStepThree} backToprogramInfoStepTwo={this.backToprogramInfoStepTwo} items={this.state} dataChange={this.dataChange}></PipelineProgramDataStepFour>
                                                </div>
                                                <div id="pipelineProgramDataStepFour">
                                                    <PipelineProgramDataStepFive backToprogramInfoStepThree={this.backToprogramInfoStepThree} endProgramInfoStepFour={this.endProgramInfoStepFour} items={this.state} updateFieldData={this.updateFieldData}></PipelineProgramDataStepFive>
                                                </div>
                                                <div id="pipelineProgramDataStepFive">
                                                    <PipelineProgramDataStepSix endProgramInfoStepFive={this.endProgramInfoStepFive} backToprogramInfoStepFour={this.backToprogramInfoStepFour} items={this.state} dataChange={this.dataChange}></PipelineProgramDataStepSix>
                                                    {/* <h3>Program Data</h3>
                                                    <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.backToprogramInfoStepFour} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                                    &nbsp;
                                                    <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.endProgramInfoStepFive}>Save <i className="fa fa-angle-double-right"></i></Button>
                                                    &nbsp; */}

                                                </div>
                                            </CardBody>
                                            {/* <CardFooter>
                                                <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepOne}>Next <i className="fa fa-angle-double-right"></i></Button>
                                            </CardFooter> */}
                                        </Card>
                                        {/* <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepOne}>Next <i className="fa fa-angle-double-right"></i></Button> */}
                                    </Col>
                                </div>
                                <div id="stepTwo">
                                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                                        <Card>
                                            <CardHeader>
                                                <strong>{i18n.t('static.dashboard.programPlanningUnit')}{this.state.planningUnitStatus}</strong>{' '}
                                            </CardHeader>
                                            <CardBody className="pt-0">
                                                {/* <h3>Program Planning Units</h3> */}
                                                {this.state.planningUnitStatus && <PipelineProgramPlanningUnits ref="child" pipelineId={this.props.match.params.pipelineId} items={this.state} realmId={this.state.program.realmCountry.realm.realmId}></PipelineProgramPlanningUnits>}
                                            </CardBody>
                                            {/* <CardFooter>
                                                <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepOne} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                                &nbsp;
                                                <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepTwo}>Next <i className="fa fa-angle-double-right"></i></Button>
                                                &nbsp;

                                            </CardFooter> */}
                                            <CardFooter>
                                                <span className="red">
                                                    {i18n.t('static.pipeline.duplicatePlanningUnittext')}
                                                </span>
                                            </CardFooter>
                                        </Card>

                                        <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepOne} > <i className="fa fa-angle-double-left"></i> Back</Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepTwo}>Save <i className="fa fa-angle-double-right"></i></Button>
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
                                                {/* <h3>Consumption</h3> */}
                                                {/* {this.state.consumptionStatus && <PipelineProgramConsumption ref="consumptionChild" pipelineId={this.props.match.params.pipelineId} pipelineConsumptionList={this.state.pipelineConsumptionList}></PipelineProgramConsumption>} */}
                                              {this.state.dataSourceStatus && <PipelineProgramDataSource ref="datasourcechild" pipelineId={this.props.match.params.pipelineId}></PipelineProgramDataSource>}  
                                            </CardBody>
                                            {/*  <CardFooter>
                                                <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepTwo} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                                &nbsp;
                                                <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepThree}>Next <i className="fa fa-angle-double-right"></i></Button>
                                                &nbsp;

                                            </CardFooter>*/}
                                        </Card>

                                        <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepTwo} > <i className="fa fa-angle-double-left"></i> Back</Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepThree}>Save <i className="fa fa-angle-double-right"></i></Button>
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
                                                {/* <h3>Consumption</h3> */}
                                                {/* {this.state.consumptionStatus && <PipelineProgramConsumption ref="consumptionChild" pipelineId={this.props.match.params.pipelineId} pipelineConsumptionList={this.state.pipelineConsumptionList}></PipelineProgramConsumption>} */}
                                               {this.state.fundingSourceStatus && <PipelineProgramFundingSource ref="fundingSourceChild" pipelineId={this.props.match.params.pipelineId}></PipelineProgramFundingSource>} 
                                            </CardBody>
                                            {/* <CardFooter>
                                                <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepTwo} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                                &nbsp;
                                                <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepThree}>Next <i className="fa fa-angle-double-right"></i></Button>
                                                &nbsp;

                                            </CardFooter>*/}
                                        </Card>
                                        <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepThree} > <i className="fa fa-angle-double-left"></i> Back</Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepFour}>Save <i className="fa fa-angle-double-right"></i></Button>
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
                                                {/* <h3>Consumption</h3> */}
                                                {/* {this.state.consumptionStatus && <PipelineProgramConsumption ref="consumptionChild" pipelineId={this.props.match.params.pipelineId} pipelineConsumptionList={this.state.pipelineConsumptionList}></PipelineProgramConsumption>} */}
                                                {this.state.procurmentAgnetStatus && <PipelineProgramProcurementAgent ref="procurementAgentChild" pipelineId={this.props.match.params.pipelineId}></PipelineProgramProcurementAgent>}
                                            </CardBody>
                                            {/* <CardFooter>
                                                <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepTwo} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                                &nbsp;
                                                <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepThree}>Next <i className="fa fa-angle-double-right"></i></Button>
                                                &nbsp;

                                            </CardFooter> */}
                                        </Card>
                                        <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepFour} > <i className="fa fa-angle-double-left"></i> Back</Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepFive}>Save <i className="fa fa-angle-double-right"></i></Button>
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
                                                {/* <h3>Consumption</h3> */}
                                                {/* {this.state.consumptionStatus && <PipelineProgramConsumption ref="consumptionChild" pipelineId={this.props.match.params.pipelineId} pipelineConsumptionList={this.state.pipelineConsumptionList}></PipelineProgramConsumption>} */}
                                                {this.state.consumptionStatus && <PipelineProgramConsumption ref="consumptionChild" pipelineId={this.props.match.params.pipelineId}></PipelineProgramConsumption>}
                                            </CardBody>
                                            {/* <CardFooter>
                                                <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepTwo} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                                &nbsp;
                                                <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepThree}>Next <i className="fa fa-angle-double-right"></i></Button>
                                                &nbsp;

                                            </CardFooter> */}
                                        </Card>
                                        <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepFive} > <i className="fa fa-angle-double-left"></i> Back</Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepSix}>Save <i className="fa fa-angle-double-right"></i></Button>
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
                                                {/* <h3>Inventory</h3> */}
                                                {this.state.inventoryStatus && <PipelineProgramInventory pipelineId={this.props.match.params.pipelineId} ref="inventoryChild"></PipelineProgramInventory>}
                                            </CardBody>
                                            {/* <CardFooter>
                                                <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepThree} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                                &nbsp;
                                                <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepFour}>Next <i className="fa fa-angle-double-right"></i></Button>
                                                &nbsp;

                                            </CardFooter> */}
                                        </Card>
                                        <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepSix} > <i className="fa fa-angle-double-left"></i> Back</Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepSeven}>Save <i className="fa fa-angle-double-right"></i></Button>
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
                                                {/*<h3>Shipments</h3>*/}
                                            </CardBody>
                                            {this.state.shipmentStatus && <PipelineProgramShipment endProgramInfoStepFive={this.endProgramInfoStepFive} items={this.state} previousToStepFour={this.previousToStepSeven} {...this.props}></PipelineProgramShipment>}

                                            {/* <CardFooter>
                                                <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepFour} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                                &nbsp;
                                                <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepFive}>Next <i className="fa fa-angle-double-right"></i></Button>
                                                &nbsp;

                                            </CardFooter> */}
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
