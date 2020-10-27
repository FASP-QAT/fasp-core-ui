import React, { Component } from 'react';
// import "../node_modules/react-step-progress-bar/styles.css";
import "../../../node_modules/react-step-progress-bar/styles.css"
import { ProgressBar, Step } from "react-step-progress-bar";
import {
    Row, Col,
    Card, CardBody
} from 'reactstrap';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import ProgramService from "../../api/ProgramService";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import QuantimedImportStepOne from './QuantimedImportStepOne';
import QuantimedImportStepTwo from './QuantimedImportStepTwo';
import QuantimedImportStepThree from './QuantimedImportStepThree';
import QuantimedImportStepFour from './QuantimedImportStepFour';
import QunatimedImportStepFive from './QunatimedImportStepFive';
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
            program: {
                programId: '',
                rangeValue: '',
                filename: '',
                regionId: '',
                regionConversionFactor: ''
            },
            qatPlanningList: []
        }
        this.Capitalize = this.Capitalize.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.finishedStepOne = this.finishedStepOne.bind(this);
        this.finishedStepTwo = this.finishedStepTwo.bind(this);
        this.finishedStepThree = this.finishedStepThree.bind(this);
        this.finishedStepFour = this.finishedStepFour.bind(this);

        this.previousToStepOne = this.previousToStepOne.bind(this);
        this.previousToStepTwo = this.previousToStepTwo.bind(this);
        this.previousToStepThree = this.previousToStepThree.bind(this);
        this.previousToStepFour = this.previousToStepFour.bind(this);

        this.removeMessageText = this.removeMessageText.bind(this);
        this.triggerChildAlert = this.triggerChildAlert.bind(this);
        this.triggerStepThree = this.triggerStepThree.bind(this);
        this.triggerStepFour = this.triggerStepFour.bind(this);
        this.triggerStepFive = this.triggerStepFive.bind(this);
        this.redirectToDashboard = this.redirectToDashboard.bind(this);

    }

    redirectToDashboard(){
        let id = AuthenticationService.displayDashboardBasedOnRole();        
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.quantimed.quantimedImportSuccess'))
    }

    componentDidMount() {

        document.getElementById('stepOne').style.display = 'block';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';

    }
    finishedStepOne() {
        this.setState({ progressPer: 25 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'block';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';

    }

    finishedStepTwo() {
        this.setState({ progressPer: 50 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'block';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';

    }

    finishedStepThree() {
        this.setState({ progressPer: 75 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'block';
        document.getElementById('stepFive').style.display = 'none';

    }

    finishedStepFour() {
        this.setState({ progressPer: 100 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'block';

    }

    removeMessageText() {
        this.setState({ message: '' });
    }

    previousToStepOne() {
        this.setState({ progressPer: 0 });
        document.getElementById('stepOne').style.display = 'block';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
    }

    previousToStepTwo() {
        this.setState({ progressPer: 25 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'block';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
    }

    previousToStepThree() {
        this.setState({ progressPer: 50 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'block';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
    }

    previousToStepFour() {
        this.setState({ progressPer: 75 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'block';
        document.getElementById('stepFive').style.display = 'none';
    }

    Capitalize(str) {
        let { program } = this.state
        program.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }
    dataChange(event) {

    }

    triggerChildAlert() {
        this.refs.child.loadTableData();
    }

    triggerStepThree() {
        this.refs.child_3.loadRegionList();
    }

    triggerStepFour() {
        this.refs.child_4.setMinMaxDate();
    }

    triggerStepFive() {
        this.refs.child_5.showFinalData();
    }


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
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>Setup Program</strong>{' '}
                            </CardHeader> */}
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
                                                src="../../../../public/assets/img/numbers/number4.png"
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
                                                src="../../../../public/assets/img/numbers/number5.png"
                                            // src="https://cdn.clipart.email/096a56141a18c8a5b71ee4a53609b16a_data-privacy-news-five-stories-that-you-need-to-know-about-_688-688.png"
                                            />
                                            // <h2>2</h2>
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
                                    <QuantimedImportStepFour ref="child_4" finishedStepFour={this.finishedStepFour} previousToStepThree={this.previousToStepThree} dataChange={this.dataChange} items={this.state} triggerStepFive={this.triggerStepFive}></QuantimedImportStepFour>
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