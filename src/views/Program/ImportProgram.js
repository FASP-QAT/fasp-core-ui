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
import { SECRET_KEY } from '../../Constants.js';
import JSZip from 'jszip';
import CryptoJS from 'crypto-js';

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



export default class ImportProgram extends Component {

    constructor() {
        super();
        this.state = {
            programList: []
        }
        this.formSubmit = this.formSubmit.bind(this)
        this.importFile = this.importFile.bind(this);
    }

    componentDidMount() {
        document.getElementById("programIdDiv").style.display = "none";
        document.getElementById("formSubmitButton").style.display = "none";
        document.getElementById("fileImportDiv").style.display = "block";
        document.getElementById("fileImportButton").style.display = "block";
    }

    formSubmit() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            if (document.querySelector('input[type=file]').files[0] == undefined) {
                alert(`Please select file`);
            } else {
                var file = document.querySelector('input[type=file]').files[0];
                var selectedPrgArr = this.state.programId;
                JSZip.loadAsync(file).then(function (zip) {
                    Object.keys(zip.files).forEach(function (filename) {
                        zip.files[filename].async('string').then(function (fileData) {
                            for (var j = 0; j < selectedPrgArr.length; j++) {
                                if (selectedPrgArr[j].value == filename) {
                                    var json = JSON.parse(fileData);
                                    var result = JsStoreFunction.importProgram(json);
                                }

                            }
                        })
                    })
                })
                this.setState({
                    message: `Data imported successfully`
                })
                document.getElementById("programIdDiv").style.display = "none";
                document.getElementById("formSubmitButton").style.display = "none";
                document.getElementById("fileImportDiv").style.display = "block";
                document.getElementById("fileImportButton").style.display = "block";
            }
        }

    }

    importFile() {

        if (window.File && window.FileReader && window.FileList && window.Blob) {
            if (document.querySelector('input[type=file]').files[0] == undefined) {
                alert(`Please select file`);
            } else {
                var file = document.querySelector('input[type=file]').files[0];
                var fileName = file.name;
                var fileExtenstion = fileName.split(".");
                if (fileExtenstion[1] == "zip") {
                    const lan = 'en'
                    JSZip.loadAsync(file).then(function (zip) {
                        var i = 0;
                        var fileName = []
                        var size = 0;
                        Object.keys(zip.files).forEach(function (filename) {
                            size++;
                        })
                        Object.keys(zip.files).forEach(function (filename) {
                            zip.files[filename].async('string').then(function (fileData) {
                                i++;
                                var programDataJson = JSON.parse(fileData);
                                var bytes = CryptoJS.AES.decrypt(programDataJson.programData, SECRET_KEY);
                                var plaintext = bytes.toString(CryptoJS.enc.Utf8);
                                var programDataJsonDecrypted = JSON.parse(plaintext);
                                console.log("programDatajson", programDataJsonDecrypted.label);
                                console.log("displayName", getLabelText((programDataJsonDecrypted.label), lan));
                                console.log("filename", filename);
                                fileName[i] = {
                                    value: filename, label: (getLabelText((programDataJsonDecrypted.label), lan)) + "~v" + programDataJsonDecrypted.programVersion
                                }
                                if (i === size) {
                                    this.setState({
                                        programList: fileName
                                    })
                                    console.log("programList", fileName)

                                    document.getElementById("programIdDiv").style.display = "block";
                                    document.getElementById("formSubmitButton").style.display = "block";
                                    document.getElementById("fileImportDiv").style.display = "none";
                                    document.getElementById("fileImportButton").style.display = "none";
                                }
                            }.bind(this))

                        }.bind(this))

                    }.bind(this))
                } else {
                    alert("Please select zip file")
                }
            }

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
        console.log("Value", value);
        // console.log(event.value)
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
                                                <FormGroup id="fileImportDiv">
                                                    <Col md="3">
                                                        <Label htmlFor="file-input">File input</Label>
                                                    </Col>
                                                    <Col xs="12" md="9">
                                                        <Input type="file" id="file-input" name="file-input" />
                                                    </Col>
                                                </FormGroup>
                                                <FormGroup id="programIdDiv">
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
                                                <Button type="button" id="fileImportButton" onClick={() => this.importFile()} size="sm" color="primary"><i className="fa fa-dot-circle-o"></i>Import</Button>
                                                <Button type="button" id="formSubmitButton" onClick={() => this.formSubmit()} size="sm" color="primary"><i className="fa fa-dot-circle-o"></i>Submit</Button>
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