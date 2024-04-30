import 'chartjs-plugin-annotation';
import "jspdf-autotable";
import React, { Component } from 'react';
import 'react-select/dist/react-select.min.css';
import { ProgressBar, Step } from "react-step-progress-bar";
import {
    Card,
    CardBody,
    Col,
    Row
} from 'reactstrap';
import "../../../node_modules/react-step-progress-bar/styles.css";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import StepOneImport from './StepOneImportIntoQATSP';
import StepThreeImport from './StepThreeImportIntoQATSP';
import StepTwoImport from './StepTwoImportIntoQATSP';
import { hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Localized entity name
const entityname = i18n.t('static.program.programMaster');
/**
 * Component for import into QAT supply plan.
 * Allows users to go through a multi-step form for Import into QAT supply plan.
 */
export default class ImportIntoQATSupplyPlan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            lang: localStorage.getItem('lang'),
            message: '',
            color: '',
            progressPer: 0,
            programId: '',
            forecastProgramId: '',
            programs: [],
            datasetList: [],
            datasetList1: [],
            startDate: '',
            stopDate: '',
            stepOneData: [],
            versionId: '',
            planningUnitListJexcel: [],
            forecastProgramVersionId: '',
            planningUnitList: [],
            selSource1: [],
            selSource2: [],
            stepTwoData: [],
        }
        this.finishedStepOne = this.finishedStepOne.bind(this);
        this.finishedStepTwo = this.finishedStepTwo.bind(this);
        this.finishedStepThree = this.finishedStepThree.bind(this);
        this.previousToStepOne = this.previousToStepOne.bind(this);
        this.previousToStepTwo = this.previousToStepTwo.bind(this);
        this.removeMessageText = this.removeMessageText.bind(this);
        this.updateStepOneData = this.updateStepOneData.bind(this);
        this.redirectToDashboard = this.redirectToDashboard.bind(this);
    }
    /**
     * Redirects to the dashboard based on the user's role.
     */
    redirectToDashboard() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.importIntoQATSupplyPlan.importIntoQATSupplyPlanSuccess'))
    }
    /**
     * Updates the state with the provided key-value pair.
     * @param {String} key The key of the state to be updated.
     * @param {any} value The value to be assigned to the specified key in the state.
     */
    updateStepOneData(key, value) {
        this.setState({
            [key]: value
        },
            () => {
            })
    }
    /**
     * Sets up the initial display state for the steps.
     */
    componentDidMount() {
        hideSecondComponent();
        document.getElementById('stepOneImport').style.display = 'block';
        document.getElementById('stepTwoImport').style.display = 'none';
        document.getElementById('stepThreeImport').style.display = 'none';
    }
    /**
     * Handles the completion of step one and updates the display to show step two.
     */
    finishedStepOne() {
        this.setState({ progressPer: 50, loading: true });
        document.getElementById('stepOneImport').style.display = 'none';
        document.getElementById('stepTwoImport').style.display = 'block';
        document.getElementById('stepThreeImport').style.display = 'none';
        this.refs.countryChild.filterData();
    }
    /**
     * Handles the completion of step two and updates the display to show step three.
     */
    finishedStepTwo() {
        this.setState({ progressPer: 100, loading: true });
        document.getElementById('stepOneImport').style.display = 'none';
        document.getElementById('stepTwoImport').style.display = 'none';
        document.getElementById('stepThreeImport').style.display = 'block';
        this.refs.child.filterData();
    }
    /**
     * Handles the completion of step three and updates the display to show step four.
     */
    finishedStepThree() {
        this.setState({ progressPer: 0, loading: true });
        document.getElementById('stepOneImport').style.display = 'block';
        document.getElementById('stepTwoImport').style.display = 'none';
        document.getElementById('stepThreeImport').style.display = 'none';
    }
    /**
     * Updates the state of message to blank
     */
    removeMessageText() {
        this.setState({ message: '' });
    }
    /**
     * Handles moving back to step one from any subsequent step and updates the display accordingly.
     */
    previousToStepOne() {
        this.setState({ progressPer: 0, loading: true });
        document.getElementById('stepOneImport').style.display = 'block';
        document.getElementById('stepTwoImport').style.display = 'none';
        document.getElementById('stepThreeImport').style.display = 'none';
        this.refs.stepOneChild.filterData();
    }
    /**
     * Handles moving back to step two from any subsequent step and updates the display accordingly.
     */
    previousToStepTwo() {
        this.setState({ progressPer: 50, loading: true });
        document.getElementById('stepOneImport').style.display = 'none';
        document.getElementById('stepTwoImport').style.display = 'block';
        document.getElementById('stepThreeImport').style.display = 'none';
        this.refs.countryChild.filterData();
    }
    /**
     * Renders the Import into QAT supply plan screen.
     * @returns {JSX.Element} - Import into QAT supply plan screen.
     */
    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message)}</h5>
                <Row>
                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                        <Card>
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
                                </ProgressBar>
                                <div className="d-sm-down-none  progressbar">
                                    <ul>
                                        <li className="progressbartext1Import">{i18n.t('static.importFromQATSupplyPlan.ProgramAndPlanningUnits')}</li>
                                        <li className="progressbartext2Import">{i18n.t('static.program.region')}</li>
                                        <li className="progressbartext3Import">{i18n.t('static.quantimed.quantimedImportScreenFourth')}</li>
                                    </ul>
                                </div>
                                <br></br>
                                <div>
                                    <div id="stepOneImport">
                                        <StepOneImport ref='stepOneChild' finishedStepOne={this.finishedStepOne} updateStepOneData={this.updateStepOneData} items={this.state}></StepOneImport>
                                    </div>
                                    <div id="stepTwoImport">
                                        <StepTwoImport ref='countryChild' finishedStepTwo={this.finishedStepTwo} updateStepOneData={this.updateStepOneData} previousToStepOne={this.previousToStepOne} items={this.state}></StepTwoImport>
                                    </div>
                                    <div id="stepThreeImport">
                                        <StepThreeImport ref="child" message={i18n.t(this.state.message)} updateStepOneData={this.updateStepOneData} previousToStepTwo={this.previousToStepTwo} finishedStepThree={this.finishedStepThree} removeMessageText={this.removeMessageText} hideSecondComponent={hideSecondComponent} redirectToDashboard={this.redirectToDashboard} items={this.state} {...this.props}></StepThreeImport>
                                    </div>
                                </div>
                            </CardBody></Card>
                    </Col></Row></div>
        );
    }
}
