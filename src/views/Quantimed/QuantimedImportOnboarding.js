import React, { Component } from 'react';
import 'react-select/dist/react-select.min.css';
import { ProgressBar, Step } from "react-step-progress-bar";
import {
    Card, CardBody,
    Col,
    Row
} from 'reactstrap';
import "../../../node_modules/react-step-progress-bar/styles.css";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import QuantimedImportStepFour from './QuantimedImportStepFour';
import QuantimedImportStepOne from './QuantimedImportStepOne';
import QuantimedImportStepThree from './QuantimedImportStepThree';
import QuantimedImportStepTwo from './QuantimedImportStepTwo';
import QunatimedImportStepFive from './QunatimedImportStepFive';
/**
 * Component for quantimed import onboarding.
 * Allows users to go through a multi-step form for quantimed import.
 */
export default class QuantimedImportOnboarding extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            lang: localStorage.getItem('lang'),
            message: '',
            programs: '',
            progressPer: 0,
            importData: '',
            dtmStartYear: 2018,
            dtmStartMonth: 1,
            dtmEndYear: 2023,
            dtmEndMonth: 12,
            program: {
                programId: '',
                rangeValue: '',
                filename: '',
                regionId: '',
                regionConversionFactor: ''
            },
            enableStepOne: 0,
            enableStepTwo: 0,
            enableStepThree: 0,
            enableStepFour: 0,
            enableStepFive: 0,
            qatPlanningList: []
        }
        this.dataChange = this.dataChange.bind(this);
        this.finishedStepOne = this.finishedStepOne.bind(this);
        this.finishedStepTwo = this.finishedStepTwo.bind(this);
        this.finishedStepThree = this.finishedStepThree.bind(this);
        this.finishedStepFour = this.finishedStepFour.bind(this);
        this.previousToStepOne = this.previousToStepOne.bind(this);
        this.previousToStepTwo = this.previousToStepTwo.bind(this);
        this.previousToStepThree = this.previousToStepThree.bind(this);
        this.previousToStepFour = this.previousToStepFour.bind(this);
        this.triggerChildAlert = this.triggerChildAlert.bind(this);
        this.triggerStepThree = this.triggerStepThree.bind(this);
        this.triggerStepFour = this.triggerStepFour.bind(this);
        this.triggerStepFive = this.triggerStepFive.bind(this);
        this.redirectToDashboard = this.redirectToDashboard.bind(this);
    }
    /**
     * Redirects to the dashboard based on the user's role.
     */
    redirectToDashboard() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.quantimed.quantimedImportSuccess'))
    }
    /**
     * Sets up the initial display state for the steps.
     */
    componentDidMount() {
        document.getElementById('stepOne').style.display = 'block';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        this.setState({
            enableStepOne: 1,
            enableStepTwo: 0,
            enableStepThree: 0,
            enableStepFour: 0,
            enableStepFive: 0
        })
    }
    /**
     * Handles the completion of step one and updates the display to show step two.
     */
    finishedStepOne() {
        this.setState({ progressPer: 25 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'block';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        this.setState({
            enableStepOne: 0,
            enableStepTwo: 1,
            enableStepThree: 0,
            enableStepFour: 1,
            enableStepFive: 0
        })
    }
    /**
     * Handles the completion of step two and updates the display to show step three.
     */
    finishedStepTwo() {
        this.setState({ progressPer: 50 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'block';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        this.setState({
            enableStepOne: 0,
            enableStepTwo: 0,
            enableStepThree: 1,
            enableStepFour: 1,
            enableStepFive: 0
        })
    }
    /**
     * Handles the completion of step three and updates the display to show step four.
     */
    finishedStepThree() {
        this.setState({ progressPer: 75 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'block';
        document.getElementById('stepFive').style.display = 'none';
        this.setState({
            enableStepOne: 0,
            enableStepTwo: 0,
            enableStepThree: 0,
            enableStepFour: 1,
            enableStepFive: 0
        })
    }
    /**
     * Handles the completion of step four and updates the display to show step five.
     */
    finishedStepFour() {
        this.setState({ progressPer: 100 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'block';
        this.setState({
            enableStepOne: 0,
            enableStepTwo: 0,
            enableStepThree: 0,
            enableStepFour: 1,
            enableStepFive: 1
        })
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
        this.setState({
            enableStepOne: 1,
            enableStepTwo: 0,
            enableStepThree: 0,
            enableStepFour: 0,
            enableStepFive: 0
        })
    }
    /**
     * Handles moving back to step two from any subsequent step and updates the display accordingly.
     */
    previousToStepTwo() {
        this.setState({ progressPer: 25 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'block';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        this.setState({
            enableStepOne: 0,
            enableStepTwo: 1,
            enableStepThree: 0,
            enableStepFour: 1,
            enableStepFive: 0
        })
    }
    /**
     * Handles moving back to step three from any subsequent step and updates the display accordingly.
     */
    previousToStepThree() {
        this.setState({ progressPer: 50 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'block';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        this.setState({
            enableStepOne: 0,
            enableStepTwo: 0,
            enableStepThree: 1,
            enableStepFour: 1,
            enableStepFive: 0
        })
    }
    /**
     * Handles moving back to step four from any subsequent step and updates the display accordingly.
     */
    previousToStepFour() {
        this.setState({ progressPer: 75 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'block';
        document.getElementById('stepFive').style.display = 'none';
        this.setState({
            enableStepOne: 0,
            enableStepTwo: 0,
            enableStepThree: 0,
            enableStepFour: 1,
            enableStepFive: 0
        })
    }
    /**
     * Handles changes in data.
     * @param {*} event This is the on change event
     */
    dataChange(event) {
    }
    /**
     * Triggers an alert in a child component.
     */
    triggerChildAlert() {
        this.refs.child.loadTableData();
    }
    /**
     * Triggers step three in the form.
     */
    triggerStepThree() {
        this.refs.child_3.loadRegionList();
    }
    /**
     * Triggers step four in the form.
     */
    triggerStepFour() {
    }
    /**
     * Triggers step five in the form.
     */
    triggerStepFive() {
        this.refs.child_5.showFinalData();
    }
    /**
     * Renders the quantimed import screen.
     * @returns {JSX.Element} - Quantimed import screen.
     */
    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
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
                                </ProgressBar>
                                <div className="d-sm-down-none  progressbar">
                                    <ul>
                                        <li className="quantimedProgressbartext1">{i18n.t('static.quantimed.quantimedImportScreenOne')}</li>
                                        <li className="quantimedProgressbartext2">{i18n.t('static.quantimed.quantimedImportScreenSecond')}</li>
                                        <li className="quantimedProgressbartext3">{i18n.t('static.region.region')}</li>
                                        <li className="quantimedProgressbartext4">{i18n.t('static.quantimed.consumptionDate')}</li>
                                        <li className="quantimedProgressbartext5">{i18n.t('static.quantimed.quantimedImportScreenFourth')}</li>
                                    </ul>
                                </div>
                                <br></br>
                                <div id="stepOne">
                                    <QuantimedImportStepOne finishedStepOne={this.finishedStepOne} dataChange={this.dataChange} items={this.state} triggerChildAlert={this.triggerChildAlert}></QuantimedImportStepOne>
                                </div>
                                <div id="stepTwo">
                                    <QuantimedImportStepTwo ref="child" finishedStepTwo={this.finishedStepTwo} previousToStepOne={this.previousToStepOne} dataChange={this.dataChange} items={this.state} triggerStepThree={this.triggerStepThree}></QuantimedImportStepTwo>
                                </div>
                                <div id="stepThree">
                                    <QuantimedImportStepThree ref="child_3" finishedStepThree={this.finishedStepThree} previousToStepTwo={this.previousToStepTwo} dataChange={this.dataChange} items={this.state} triggerStepFour={this.triggerStepFour}></QuantimedImportStepThree>
                                </div>
                                <div id="stepFour">
                                    {this.state.enableStepFour == 1 && <QuantimedImportStepFour ref="child_4" finishedStepFour={this.finishedStepFour} previousToStepThree={this.previousToStepThree} dataChange={this.dataChange} items={this.state} triggerStepFive={this.triggerStepFive}></QuantimedImportStepFour>}
                                </div>
                                <div id="stepFive">
                                    <QunatimedImportStepFive ref="child_5" previousToStepFour={this.previousToStepFour} dataChange={this.dataChange} items={this.state} redirectToDashboard={this.redirectToDashboard}></QunatimedImportStepFive>
                                </div>
                            </CardBody></Card>
                        <div style={{ display: this.state.loading ? "block" : "none" }}>
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                <div class="align-items-center">
                                    <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                    <div class="spinner-border blue ml-4" role="status">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col></Row></div>
        );
    }
}