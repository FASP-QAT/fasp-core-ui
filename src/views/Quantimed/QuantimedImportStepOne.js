import React, { Component } from 'react';
import i18n from '../../i18n';
import HealthAreaService from "../../api/HealthAreaService";
import AuthenticationService from '../Common/AuthenticationService.js';

import { Formik } from 'formik';
import * as Yup from 'yup'
import bsCustomFileInput from 'bs-custom-file-input'

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


const initialValues = {
    programId: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({

        programId: Yup.string()
            .required(i18n.t('static.common.realmtext')),


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


export default class QuantimedImportStepOne extends Component {
    constructor(props) {
        super(props);
        this.state = {
            program: {
                programId: "",
                file: ""
            },
            programs: []
        }
        this.dataChange = this.dataChange.bind(this);

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
        }
        this.setState({
            program
        }, () => { });
    }

    componentDidMount() {
        bsCustomFileInput.init();
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getProgramList()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        programs: response.data
                    })
                }
                else {

                    this.setState({
                        message: response.data.messageCode
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }

            })
    }
    

    render() {
        const { programs } = this.state;
        let programList = programs.length > 0 && programs.map((item, i) => {
            return (
                <option key={i} value={item.programId}>
                    {getLabelText(item.label, this.state.lang)}
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
                                AuthenticationService.setupAxiosInterceptors();
                                QuantimedImportService.importForecastData(this.state.program).then(response => {                             
                                    
                                    if (response.status == 200 || response.status == 201) {                                                                                                                        
                                        
                                        this.setState({
                                            message: "File import", loading: false
                                        },
                                            () => {
                                                this.props.items.importData = response.data;                                                
                                                this.props.triggerChildAlert();
                                                this.props.finishedStepOne && this.props.finishedStepOne();
                                            })                                
                                    } else {
                                        this.setState({                                    
                                            message: i18n.t('static.unkownError'), loading: false
                                        },
                                            () => {                                        
                                                
                                            })                                
                                    }
                                    
                                })
                                .catch(
                                        error => {
                                            this.setState({                                        
                                                message: i18n.t('static.unkownError'), loading: false
                                            },
                                            () => {                                        
                                               
                                            });                                    
                                        }
                                    );

                                
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
                                <Form className="needs-validation" onSubmit={handleSubmit} noValidate name='programForm'>
                                    <CardBody className="pb-lg-2 pt-lg-2">

                                        <FormGroup id="fileImportDiv">
                                            <Col md="3">
                                                <Label className="uploadfilelable" htmlFor="file-input">Please select the Quantimed file you want to import<span class="red Reqasterisk">*</span></Label>
                                            </Col>
                                            <Col xs="12" md="4" className="custom-file">
                                                {/* <Input type="file" id="file-input" name="file-input" /> */}
                                                <Input type="file" className="custom-file-input" id="file-input" name="file-input" accept=".xml" onChange={(e) => { handleChange(e); this.dataChange(e) }}/>
                                                <label className="custom-file-label" id="file-input">{i18n.t('static.chooseFile.chooseFile')}</label>
                                            </Col>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="select">Select the program that you want to import it into<span class="red Reqasterisk">*</span></Label>
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
                                    </CardBody>
                                    <CardFooter className="pb-0 pr-0">
                                        <FormGroup className="pb-3">
                                            <Button color="info" size="md" className="float-right mr-1" type="submit" disabled={!isValid} onClick={() => this.touchAll(setTouched, errors)}>Import </Button>
                                        </FormGroup>
                                        &nbsp;
                                    </CardFooter>

                                </Form>
                            )} />

            </>
        );
    }
}