import React, { Component } from 'react';
import i18n from '../../i18n';
import HealthAreaService from "../../api/HealthAreaService";
import AuthenticationService from '../Common/AuthenticationService.js';

import { Formik } from 'formik';
import * as Yup from 'yup'
import bsCustomFileInput from 'bs-custom-file-input'
// import XMLParser from "react-xml-parser";

import {
    Row, Col,
    Card, CardHeader, CardFooter,
    Button, FormFeedback, CardBody,
    FormText, Form, FormGroup, Label, Input,
    InputGroupAddon, InputGroupText, ModalFooter
} from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import ProgramService from '../../api/ProgramService';
import QuantimedImportService from '../../api/QuantimedImportService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants';
import CryptoJS from 'crypto-js'


const initialValues = {
    programId: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({

        programId: Yup.string()
            .required(i18n.t('static.program.validselectprogramtext')),


    })
}

const validate = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values)
        try {
            validationSchema.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationError(error)
        }
    }
}

const getErrorsFromValidationError = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}

const entityname = i18n.t('static.quantimed.quantimedImport')

class QuantimedImportStepOne extends Component {
    constructor(props) {
        super(props);
        this.state = {
            program: {
                programId: "",
                file: "",
                loading: false
            },
            programs: []
        }
        this.dataChange = this.dataChange.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);

    }

    hideFirstComponent() {
        document.getElementById('div1').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }

    touchAll(setTouched, errors) {
        setTouched({
            programId: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('programForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }
    findFirstError(formName, hasError) {
        const form = document.forms[formName]
        for (let i = 0; i < form.length; i++) {
            if (hasError(form[i].name)) {
                form[i].focus()
                break
            }
        }
    }
    dataChange(event) {

        let { program } = this.state;
        if (event.target.name == "programId") {
            program.programId = event.target.value;
            this.props.items.program.programId = event.target.value;
        }
        if (event.target.name == "file-input") {
            program.file = event.target.files[0];
            this.props.items.program.filename = event.target.files[0].name;
        }
        this.setState({
            program
        }, () => { });
    }

    componentDidMount() {
        bsCustomFileInput.init();
        AuthenticationService.setupAxiosInterceptors();
        this.setState({
            loading: true
        })
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext'),
                loading: false,
                color: "#BA0C2F"
            })
            this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
            var program = transaction.objectStore('programQPLDetails');
            var getRequest = program.getAll();
            var proList = []
            getRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false,
                    color: "#BA0C2F"
                })
                this.hideFirstComponent()
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId && !myResult[i].readonly) {

                        // var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        // var programJson1 = JSON.parse(programData);
                        var programJson = {
                            label: myResult[i].programCode + "~v" + myResult[i].version,
                            value: myResult[i].id
                        }
                        proList.push(programJson);
                    }
                }

                proList.sort((a, b) => {
                    var itemLabelA = a.label.toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = b.label.toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    programs: proList,
                    loading: false
                })


            }.bind(this);
        }.bind(this);

    }


    render() {
        const { programs } = this.state;
        let programList = programs.length > 0 && programs.map((item, i) => {
            return (
                <option key={i} value={item.value}>
                    {item.label}
                </option>
            )
        }, this);

        return (
            <>

                <Formik
                    enableReinitialize={true}
                    initialValues={{

                    }}
                    validate={validate(validationSchema)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {

                        if (window.File && window.FileReader && window.FileList && window.Blob) {
                            if (document.querySelector('input[type=file]').files[0] == undefined) {
                                this.setState({ loading: false })
                                alert(i18n.t('static.program.selectfile'));
                            } else {
                                this.setState({
                                    loading: true
                                })


                                // const reader = new FileReader();

                                // reader.readAsText(document.querySelector('input[type=file]').files[0]);

                                // reader.onloadend = evt => {
                                //     const readerData = evt.target.result;

                                //     const parser = new DOMParser();
                                //     const xml = parser.parseFromString(readerData, "text/xml");

                                //     console.log(
                                //     "data",
                                //     new XMLSerializer().serializeToString(xml.documentElement)
                                //     );
                                //     var XMLParser = require("react-xml-parser");
                                //     var NewXml = new XMLParser().parseFromString(
                                //     new XMLSerializer().serializeToString(xml.documentElement)
                                //     ); // Assume xmlText contains the example XML
                                //     console.log("newxml", NewXml);
                                //     };



                                AuthenticationService.setupAxiosInterceptors();
                                QuantimedImportService.importForecastData(this.state.program).then(response => {

                                    if (response.status == 200 || response.status == 201) {

                                        var startDate = new Date(response.data.dtmStart);
                                        var endDate = new Date(response.data.dtmEnd);
                                        this.props.items.dtmStartYear = startDate.getFullYear();
                                        this.props.items.dtmStartMonth = startDate.getMonth() + 1;
                                        this.props.items.dtmEndYear = endDate.getFullYear();
                                        this.props.items.dtmEndMonth = endDate.getMonth() + 1;

                                        this.setState({
                                            message: "", color: "green", loading: false
                                        },
                                            () => {
                                                this.props.items.importData = response.data;

                                                this.props.triggerChildAlert();
                                                this.props.finishedStepOne && this.props.finishedStepOne();
                                            })
                                    } else {
                                        this.setState({
                                            message: i18n.t('static.unkownError'), color: "#BA0C2F", loading: false
                                        },
                                            () => {
                                                this.hideFirstComponent()
                                            })
                                    }

                                })
                                    .catch(
                                        error => {
                                            if (error.message === "Network Error") {
                                                this.setState({
                                                    message: 'static.unkownError',
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
                                // this.setState({
                                //     loading: false
                                // })

                            }
                        }


                    }}
                    render={
                        ({
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                            isValid,
                            setTouched
                        }) => (
                                <div className="animated fadeIn">
                                    <AuthenticationServiceComponent history={this.props.history} />
                                    <h5 className={this.state.color} id="div1">{i18n.t(this.state.message, { entityname }) || this.state.supplyPlanError}</h5>
                                    <div style={{ display: this.state.loading ? "none" : "block" }}>
                                        <Form className="needs-validation" onSubmit={handleSubmit} noValidate name='programForm'>
                                            <CardBody>

                                                <FormGroup id="fileImportDiv">
                                                    <Col md="4">
                                                        <Label className="uploadfilelable" htmlFor="file-input">{i18n.t('static.quantimed.quantimedImportSelectFileLabel')}<span class="red Reqasterisk">*</span></Label>
                                                    </Col>
                                                    <Col xs="12" md="4" className="custom-file">
                                                        {/* <Input type="file" id="file-input" name="file-input" /> */}
                                                        <Input type="file" className="custom-file-input" id="file-input" name="file-input" accept=".xml" onChange={(e) => { handleChange(e); this.dataChange(e) }} />
                                                        <label className="custom-file-label" id="file-input" data-browse={i18n.t('static.uploadfile.Browse')}>{i18n.t('static.chooseFile.chooseFile')}</label>
                                                    </Col>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="select">{i18n.t('static.quantimed.quantimedImportSelectProgramLabel')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        valid={!errors.programId}
                                                        invalid={touched.programId && !!errors.programId}
                                                        bsSize="sm"
                                                        className="col-md-4"
                                                        onBlur={handleBlur}
                                                        type="select" name="programId" id="programId"
                                                        value={this.state.program.programId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {programList}
                                                    </Input>
                                                    <FormFeedback className="red">{errors.programId}</FormFeedback>
                                                    {/* <Button color="info" size="md" className="float-right mr-1" type="button" name="planningPrevious" id="planningPrevious" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}>Next <i className="fa fa-angle-double-right"></i></Button> */}

                                                </FormGroup>
                                                {/* </CardBody>
                                            <CardFooter className="pb-0 pr-0"> */}
                                                <br></br>
                                                <FormGroup className="">
                                                    <Button color="info" size="md" className="float-right " type="submit" disabled={!isValid} onClick={() => this.touchAll(setTouched, errors)}>Import </Button>
                                                </FormGroup>

                                                {/* </CardFooter> */}
                                            </CardBody>
                                        </Form>
                                    </div>
                                    <div style={{ display: this.state.loading ? "block" : "none" }}>
                                        <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                            <div class="align-items-center">
                                                <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                                <div class="spinner-border blue ml-4" role="status">

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )} />

            </>
        );
    }
}
export default QuantimedImportStepOne;