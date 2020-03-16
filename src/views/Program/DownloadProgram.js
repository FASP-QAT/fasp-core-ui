import React, { Component } from 'react';
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Col, Form
    , FormFeedback
} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import '../Forms/ValidationForms/ValidationForms.css';
import 'react-select/dist/react-select.min.css';
import ProgramService from '../../api/ProgramService';
import getLabelText from '../../CommonComponent/getLabelText.js';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import AuthenticationService from '../common/AuthenticationService.js';

const initialValues = {
    programId: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({
        programId: Yup.string()
            .required('Please select program.')
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



export default class DownloadProgram extends Component {

    constructor() {
        super();
        this.state = {
            programList: []
        }
        this.formSubmit = this.formSubmit.bind(this)
    }

    componentDidMount() {
        const lan = 'en'
        ProgramService.getProgramList().then(response => {
            var json = response.data;
            var prgList = [];
            for (var i = 0; i < json.length; i++) {
                prgList[i] = { value: json[i].programId, label: getLabelText(json[i].label, lan) }
            }
            this.setState({
                programList: prgList
            })
        })
            .catch(
                error => {
                    switch (error.message) {
                        case "Network Error":
                            this.setState({
                                message: error.message
                            })
                            break
                        default:
                            this.setState({
                                message: error.message
                            })
                            break
                    }
                }
            );
    }

    formSubmit() {
        var programId = this.state.programId;
        var programIdStr = "";
        for (var i = 0; i < programId.length; i++) {
            programIdStr = programIdStr.concat(programId[i].value).concat(",");
        }
        if (navigator.onLine) {
            AuthenticationService.setupAxiosInterceptors();
            ProgramService.getProgramData((programIdStr.substring(0, programIdStr.length - 1)).toString())
                .then(response => {
                    var json = response.data;
                    var db1;
                    var openRequest = indexedDB.open('fasp', 1);
                    openRequest.onsuccess = function (e) {
                        db1 = e.target.result;
                        var transaction = db1.transaction(['programData'], 'readwrite');
                        var program = transaction.objectStore('programData');
                        for (var i = 0; i < json.length; i++) {
                            var encryptedText = CryptoJS.AES.encrypt(JSON.stringify(json[i]), SECRET_KEY);
                            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                            var userId = userBytes.toString(CryptoJS.enc.Utf8);
                            var item = {
                                id: json[i].programId + "_v" + json[i].programVersion + "_uId_" + userId,
                                programId: json[i].programId,
                                version: json[i].programVersion,
                                programName: (CryptoJS.AES.encrypt(JSON.stringify((json[i].label)), SECRET_KEY)).toString(),
                                programData: encryptedText.toString(),
                                userId: userId
                            };
                            program.put(item);
                        }
                        console.log("transaction", transaction)
                        transaction.oncomplete = function (event) {
                            console.log("in complete")
                        }
                        transaction.onerror=function(event){
                            console.log("in error");
                        }
                        program.onerror=function(event){
                            console.log("In program error")
                        }
                    }
                })
                .catch(
                    error => {
                        switch (error.message) {
                            case "Network Error":
                                this.setState({
                                    message: error.message
                                })
                                break
                            default:
                                this.setState({
                                    message: error.response
                                })
                                break
                        }
                    }
                );

        } else {
            alert("You must be online.")
        }
    }

    touchAll(setTouched, errors) {
        setTouched({
            programId: true
        }
        )
        this.validateForm(errors)
    }

    validateForm(errors) {
        this.findFirstError('simpleForm', (fieldName) => {
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

    updateFieldData(value) {
        this.setState({ programId: value });
    }

    render() {
        // const lan = 'en';
        // const { programList } = this.state;
        // let programs = programList.length > 0
        //     && programList.map((item, i) => {
        //         return (
        //             <option key={i} value={item.programId}>{getLabelText(item.label, lan)}</option>
        //         )
        //     }, this);
        return (
            <>
                <Col xs="12" sm="8">
                    <Card>
                        <Formik
                            initialValues={initialValues}
                            render={
                                ({
                                    errors,
                                    touched,
                                    handleChange,
                                    handleBlur,
                                }) => (
                                        <Form noValidate name='simpleForm'>
                                            <CardHeader>
                                                <strong>Download Program Data</strong>
                                            </CardHeader>
                                            <CardBody>
                                                <FormGroup >
                                                    <Col md="3">
                                                        <Label htmlFor="select">Select Program</Label>
                                                    </Col>
                                                    <Col xs="12" md="9">
                                                        <Select
                                                            valid={!errors.programId}
                                                            invalid={touched.programId && !!errors.programId}
                                                            onChange={(e) => { handleChange(e); this.updateFieldData(e) }}
                                                            onBlur={handleBlur} name="programId" id="programId"
                                                            multi
                                                            options={this.state.programList}
                                                            value={this.state.programId}
                                                        />
                                                        <FormFeedback>{errors.programId}</FormFeedback>
                                                    </Col>

                                                </FormGroup>
                                            </CardBody>
                                            <CardFooter>
                                                <Button type="button" onClick={() => this.formSubmit()} size="sm" color="primary"><i className="fa fa-dot-circle-o"></i> Download</Button>
                                                <Button type="reset" size="sm" color="danger"><i className="fa fa-ban"></i> Reset</Button>
                                            </CardFooter>
                                        </Form>
                                    )} />
                    </Card>
                </Col>
            </>
        )

    }

}