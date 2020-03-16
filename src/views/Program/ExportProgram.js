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
import getLabelText from '../../CommonComponent/getLabelText.js';
import * as JsStoreFunction from "../../CommonComponent/JsStoreFunctions.js"
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import JSZip from 'jszip';
import FileSaver from 'file-saver';

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



export default class ExportProgram extends Component {

    constructor() {
        super();
        this.state = {
            programList: []
        }
        this.formSubmit = this.formSubmit.bind(this)
    }

    componentDidMount() {
        const lan = 'en'
        JsStoreFunction.getProgramDataList().then(response => {
            var json = response;
            var prgList = [];
            for (var i = 0; i < json.length; i++) {
                var bytes = CryptoJS.AES.decrypt(json[i].programName, SECRET_KEY);
                var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                console.log("ProgramNameLabel", programNameLabel);
                prgList[i] = { value: json[i].id, label: getLabelText(JSON.parse(programNameLabel), lan) + "~v" + json[i].version }
            }
            console.log("ProgramList", prgList)
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
        var zip = new JSZip();
        var programId = this.state.programId;
        var programIdStr = "";
        for (var i = 0; i < programId.length; i++) {
            programIdStr = programIdStr.concat("'" + programId[i].value).concat("',");
        }
        console.log("programIdStr", programIdStr);
        JsStoreFunction.getProgramDataByprogramIds((programIdStr.substring(0, programIdStr.length - 1)).toString()).then(response => {
            var json = response;
            for (var i = 0; i < json.length; i++) {
                var txt = JSON.stringify(json[i]);
                zip.file(programId[i].label + "_" + parseInt(i + 1) + ".txt", txt);
            }
            zip.generateAsync({
                type: "blob"
            }).then(function (content) {
                FileSaver.saveAs(content, "download.zip");
            });
            this.setState({
                message: "Data exported successfully."
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
        console.log("Value", value);
        // console.log(event.value)
        this.setState({ programId: value });
    }

    render() {
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
                                                <strong>Export Program Data</strong>
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
                                                <Button type="button" onClick={() => this.formSubmit()} size="sm" color="primary"><i className="fa fa-dot-circle-o"></i>Export</Button>
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