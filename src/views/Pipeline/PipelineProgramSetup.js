import React, { Component } from 'react';
import { Row, Col, Card, CardBody, CardHeader, Button, CardFooter } from 'reactstrap';
import "../../../node_modules/react-step-progress-bar/styles.css"
import { ProgressBar, Step } from "react-step-progress-bar";

export default class PipelineProgramSetup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            progressPer: 0,
            pipelineProgramSetupPer: 0,
            pipelineProgramInfo:
            {
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
                deliveredToReceivedLeadTime: '',
                draftToSubmittedLeadTime: '',
                plannedToDraftLeadTime: '',
                submittedToApprovedLeadTime: '',
                approvedToShippedLeadTime: '',
                monthsInFutureForAmc: '',
                monthsInPastForAmc: '',
                healthArea: {
                    id: ''
                },
                programNotes: '',
                regionArray: []

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
        }
        this.endProgramInfoStepOne = this.endProgramInfoStepOne.bind(this);
        this.endProgramInfoStepTwo = this.endProgramInfoStepTwo.bind(this);
        this.endProgramInfoStepThree = this.endProgramInfoStepThree.bind(this);
        this.endProgramInfoStepFour = this.endProgramInfoStepFour.bind(this);
        this.endProgramInfoStepFive = this.endProgramInfoStepFive.bind(this);
        this.endProgramInfoStepSix = this.endProgramInfoStepSix.bind(this);

        this.finishedStepOne = this.finishedStepOne.bind(this);
        this.finishedStepTwo = this.finishedStepTwo.bind(this);
        this.finishedStepThree = this.finishedStepThree.bind(this);
        this.finishedStepFour = this.finishedStepFour.bind(this);
        this.finishedStepFive = this.finishedStepFive.bind(this);

        this.backToprogramInfoStepOne = this.backToprogramInfoStepOne.bind(this);
        this.backToprogramInfoStepTwo = this.backToprogramInfoStepTwo.bind(this);
        this.backToprogramInfoStepThree = this.backToprogramInfoStepThree.bind(this);
        this.backToprogramInfoStepFour = this.backToprogramInfoStepFour.bind(this);
        this.backToprogramInfoStepFive = this.backToprogramInfoStepFive.bind(this);

        this.previousToStepOne = this.previousToStepOne.bind(this);
        this.previousToStepTwo = this.previousToStepTwo.bind(this);
        this.previousToStepThree = this.previousToStepThree.bind(this);
        this.previousToStepFour = this.previousToStepFour.bind(this);
    }

    endProgramInfoStepOne() {
        this.setState({ progressPer: 20 });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'block';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
        document.getElementById('pipelineProgramDataStepSix').style.display = 'none';

    }
    endProgramInfoStepTwo() {
        this.setState({ progressPer: 40 });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'block';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
        document.getElementById('pipelineProgramDataStepSix').style.display = 'none';
    }
    endProgramInfoStepThree() {
        this.setState({ progressPer: 60 });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'block';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
        document.getElementById('pipelineProgramDataStepSix').style.display = 'none';
    }
    endProgramInfoStepFour() {
        this.setState({ progressPer: 80 });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'block';
        document.getElementById('pipelineProgramDataStepSix').style.display = 'none';
    }
    endProgramInfoStepFive() {
        this.setState({ progressPer: 100 });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
        document.getElementById('pipelineProgramDataStepSix').style.display = 'block';
    }
    endProgramInfoStepSix() {
        console.log("end of program info setp six-----");
    }


    finishedStepOne() {
        this.setState({ pipelineProgramSetupPer: 25 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'block';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';

    }
    finishedStepTwo() {
        this.setState({ pipelineProgramSetupPer: 50 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'block';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';

    }
    finishedStepThree() {
        this.setState({ pipelineProgramSetupPer: 75 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'block';
        document.getElementById('stepFive').style.display = 'none';

    }
    finishedStepFour() {
        this.setState({ pipelineProgramSetupPer: 100 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'block';

    }

    finishedStepFive() {
        console.log("final commit -------------->")
    }

    backToprogramInfoStepOne() {
        this.setState({ progressPer: 0 });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'block';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
        document.getElementById('pipelineProgramDataStepSix').style.display = 'none';
    }
    backToprogramInfoStepTwo() {
        this.setState({ progressPer: 20 });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'block';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
        document.getElementById('pipelineProgramDataStepSix').style.display = 'none';
    }
    backToprogramInfoStepThree() {
        this.setState({ progressPer: 40 });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'block';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
        document.getElementById('pipelineProgramDataStepSix').style.display = 'none';
    }
    backToprogramInfoStepFour() {
        this.setState({ progressPer: 60 });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'block';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
        document.getElementById('pipelineProgramDataStepSix').style.display = 'none';
    }
    backToprogramInfoStepFive() {
        this.setState({ progressPer: 80 });
        document.getElementById('pipelineProgramDataStepOne').style.display = 'none';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'block';
        document.getElementById('pipelineProgramDataStepSix').style.display = 'none';
    }

    previousToStepOne() {
        this.setState({ pipelineProgramSetupPer: 0 });
        document.getElementById('stepOne').style.display = 'block';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';

    }

    previousToStepTwo() {
        this.setState({ pipelineProgramSetupPer: 25 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'block';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';

    }

    previousToStepThree() {
        this.setState({ pipelineProgramSetupPer: 50 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'block';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';

    }

    previousToStepFour() {
        this.setState({ pipelineProgramSetupPer: 75 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'block';
        document.getElementById('stepFive').style.display = 'none';

    }

    componentDidMount() {
        console.log("get pipeline program info from pipeline tabel by api call------->");
        document.getElementById('pipelineProgramDataStepOne').style.display = 'block';
        document.getElementById('pipelineProgramDataStepTwo').style.display = 'none';
        document.getElementById('pipelineProgramDataStepThree').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFour').style.display = 'none';
        document.getElementById('pipelineProgramDataStepFive').style.display = 'none';
        document.getElementById('pipelineProgramDataStepSix').style.display = 'none';


        document.getElementById('stepOne').style.display = 'block';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';

    }
    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>Setup Program</strong>{' '}
                            </CardHeader>
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
                                        <li className="progressetuptext1">Program Info</li>
                                        <li className="progressetuptext2">Planning Units</li>
                                        <li className="progressetuptext3">Consumption</li>
                                        <li className="progressetuptext4">Inventory</li>
                                        <li className="progressetuptext5">Shipment</li>
                                        {/* <li className="progressbartext6">Program Data</li>
                                        <li className="progressbartext7">Planning Units</li> */}
                                    </ul>
                                </div>
                                <br></br>

                                <div id="stepOne">
                                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                                        <Card>
                                            <CardHeader>
                                                <i className="icon-note"></i><strong>Pipeline Program Data</strong>{' '}
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
                                                    <Step transition="scale">
                                                        {({ accomplished }) => (
                                                            <img
                                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                                width="30"
                                                                src="../../../../public/assets/img/numbers/number6.png"
                                                            />
                                                        )}
                                                    </Step>
                                                </ProgressBar>
                                                <div className="d-sm-down-none  progressbar">
                                                    <ul>
                                                        <li className="progresdatatext1">Realm</li>
                                                        <li className="progresdatatext2">Country</li>
                                                        <li className="progresdatatext3">Health Area</li>
                                                        <li className="progresdatatext4">Organisation</li>
                                                        <li className="progresdatatext5">Region</li>
                                                        <li className="progresdatatext6">Program Data</li>
                                                    </ul>
                                                </div>
                                                <br></br>
                                                <div id="pipelineProgramDataStepOne">
                                                    <h3>Realm</h3>
                                                    <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.endProgramInfoStepOne}>Next <i className="fa fa-angle-double-right"></i></Button>

                                                </div>
                                                <div id="pipelineProgramDataStepTwo">
                                                    <h3>Country</h3>
                                                    <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.backToprogramInfoStepOne} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                                    &nbsp;
                                                    <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.endProgramInfoStepTwo}>Next <i className="fa fa-angle-double-right"></i></Button>
                                                    &nbsp;
                                                   
                                                </div>
                                                <div id="pipelineProgramDataStepThree">
                                                    <h3>Health Area</h3>
                                                    <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.backToprogramInfoStepTwo} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                                    &nbsp;
                                                    <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.endProgramInfoStepThree}>Next <i className="fa fa-angle-double-right"></i></Button>
                                                    &nbsp;
                                                   
                                                </div>
                                                <div id="pipelineProgramDataStepFour">
                                                    <h3>Organisation</h3>
                                                    <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.backToprogramInfoStepThree} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                                    &nbsp;
                                                    <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.endProgramInfoStepFour}>Next <i className="fa fa-angle-double-right"></i></Button>
                                                    &nbsp;
                                                    
                                                </div>
                                                <div id="pipelineProgramDataStepFive">
                                                    <h3> Region</h3>
                                                    <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.backToprogramInfoStepFour} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                                    &nbsp;
                                                    <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.endProgramInfoStepFive}>Next <i className="fa fa-angle-double-right"></i></Button>
                                                    &nbsp;
                                                   
                                                </div>
                                                <div id="pipelineProgramDataStepSix">
                                                    <h3>Program Data</h3>
                                                    <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.backToprogramInfoStepFive} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                                    &nbsp;
                                                    <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.endProgramInfoStepSix}>Next <i className="fa fa-angle-double-right"></i></Button>
                                                    &nbsp;
                                                  
                                                </div>
                                            </CardBody>
                                            <CardFooter>
                                                <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepOne}>Next <i className="fa fa-angle-double-right"></i></Button>
                                            </CardFooter>
                                        </Card>
                                    </Col>
                                </div>
                                <div id="stepTwo">
                                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                                        <Card>
                                            <CardHeader>
                                                <i className="icon-note"></i><strong>Program Planning Units</strong>{' '}
                                            </CardHeader>
                                            <CardBody>
                                                <h3>Program Planning Units</h3>
                                            </CardBody>
                                            <CardFooter>
                                            <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepOne} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                                &nbsp;
                                                <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepTwo}>Next <i className="fa fa-angle-double-right"></i></Button>
                                                &nbsp;
                                                 
                                            </CardFooter>
                                        </Card>
                                    </Col>
                                </div>
                                <div id="stepThree">
                                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                                        <Card>
                                            <CardHeader>
                                                <i className="icon-note"></i><strong>Consumption Details</strong>{' '}
                                            </CardHeader>
                                            <CardBody>
                                                <h3>Consumption</h3>
                                            </CardBody>
                                            <CardFooter>
                                            <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepTwo} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                                &nbsp;
                                                <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepThree}>Next <i className="fa fa-angle-double-right"></i></Button>
                                                &nbsp;
                                                   
                                            </CardFooter>
                                        </Card>
                                    </Col>
                                </div>
                                <div id="stepFour">
                                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                                        <Card>
                                            <CardHeader>
                                                <i className="icon-note"></i><strong>Inventory Details</strong>{' '}
                                            </CardHeader>
                                            <CardBody>
                                                <h3>Inventory</h3>
                                            </CardBody>
                                            <CardFooter>
                                            <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepThree} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                                &nbsp;
                                                <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepFour}>Next <i className="fa fa-angle-double-right"></i></Button>
                                                &nbsp;
                                                 
                                            </CardFooter>
                                        </Card>
                                    </Col>
                                </div>
                                <div id="stepFive">
                                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                                        <Card>
                                            <CardHeader>
                                                <i className="icon-note"></i><strong>Shipment Details</strong>{' '}
                                            </CardHeader>
                                            <CardBody>
                                                <h3>Shipments</h3>
                                            </CardBody>
                                            <CardFooter>
                                            <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepFour} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                                &nbsp;
                                                <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.finishedStepFive}>Next <i className="fa fa-angle-double-right"></i></Button>
                                                &nbsp;
                                                   
                                            </CardFooter>
                                        </Card></Col>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }

}