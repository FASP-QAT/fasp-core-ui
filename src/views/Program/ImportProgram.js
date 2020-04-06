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
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import i18n from '../../i18n';
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions';
const initialValues = {
    programId: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({
        programId: Yup.string()
        .required(i18n.t('static.program.validselectprogramtext'))
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

    constructor(props) {
        super(props);
        this.state = {
            programList: []
        }
        this.formSubmit = this.formSubmit.bind(this)
        this.importFile = this.importFile.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
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
                alert(i18n.t('static.program.selectfile'));
            } else {
                var file = document.querySelector('input[type=file]').files[0];
                var selectedPrgArr = this.state.programId;
                var db1;
                getDatabase();
                var openRequest = indexedDB.open('fasp', 1);
                openRequest.onsuccess = function (e) {
                    console.log("in success");
                    db1 = e.target.result;
                    var transaction = db1.transaction(['programData'], 'readwrite');
                    var program = transaction.objectStore('programData');
                    var count = 0;
                    // console.log("ProgramListArray",programListArray)
                    var getRequest = program.getAll();
                    getRequest.onerror = function (event) {
                        // Handle errors!
                    };
                    getRequest.onsuccess = function (event) {
                        var myResult = [];
                        myResult = getRequest.result;
                        var programDataJson = this.state.programListArray;
                        console.log("program data json", programDataJson)
                        for (var i = 0; i < myResult.length; i++) {
                            for (var j = 0; j < programDataJson.length; j++) {
                                for(var k=0;k<selectedPrgArr.length;k++){
                                console.log("1",programDataJson[j].filename);
                                if (programDataJson[j].filename == selectedPrgArr[k].value) {
                                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                    console.log("Id", myResult[i].id)
                                    console.log("Id from list", programDataJson[j].programId + "_v" + programDataJson[j].version + "_uId_" + userId)
                                    if (myResult[i].id == programDataJson[j].programId + "_v" + programDataJson[j].version + "_uId_" + userId) {
                                        count++;
                                    }
                                }
                            }
                            }
                            console.log("count", count)
                        }
                        if (count == 0) {
                            JSZip.loadAsync(file).then(function (zip) {
                                Object.keys(zip.files).forEach(function (filename) {
                                    zip.files[filename].async('string').then(function (fileData) {
                                        for (var j = 0; j < selectedPrgArr.length; j++) {
                                            if (selectedPrgArr[j].value == filename) {
                                                var json = JSON.parse(fileData);
                                                db1 = e.target.result;
                                                var transaction2 = db1.transaction(['programData'], 'readwrite');
                                                var program2 = transaction2.objectStore('programData');
                                                var json = JSON.parse(fileData);
                                                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                                json.userId = userId;
                                                json.id = json.programId + "_v" + json.version + "_uId_" + userId
                                                var addProgramDataRequest = program2.put(json);
                                                addProgramDataRequest.onerror = function (event) {
                                                };
                                            }

                                        }
                                    })
                                })
                            })
                            this.setState({
                                message:i18n.t('static.program.dataimportsuccess') 
                            })
                            this.props.history.push(`/dashboard/` + i18n.t('static.program.dataimportsuccess'))
                        } else {
                            confirmAlert({
                                title: i18n.t('static.program.confirmsubmit'),
                                message: i18n.t('static.program.programwithsameversion'),
                                buttons: [
                                    {
                                        label: i18n.t('static.program.yes'),
                                        onClick: () => {
                                            JSZip.loadAsync(file).then(function (zip) {
                                                Object.keys(zip.files).forEach(function (filename) {
                                                    zip.files[filename].async('string').then(function (fileData) {
                                                        for (var j = 0; j < selectedPrgArr.length; j++) {
                                                            if (selectedPrgArr[j].value == filename) {
                                                                var json = JSON.parse(fileData);
                                                                db1 = e.target.result;
                                                                var transaction2 = db1.transaction(['programData'], 'readwrite');
                                                                var program2 = transaction2.objectStore('programData');
                                                                var json = JSON.parse(fileData);
                                                                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                                                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                                                json.userId = userId;
                                                                json.id = json.programId + "_v" + json.version + "_uId_" + userId
                                                                var addProgramDataRequest = program2.put(json);
                                                                addProgramDataRequest.onerror = function (event) {
                                                                };
                                                            }

                                                        }
                                                    })
                                                })
                                            })
                                            this.setState({
                                                message: i18n.t('static.program.dataimportsuccess')
                                            })
                                            this.props.history.push(`/dashboard/` + i18n.t('static.program.dataimportsuccess'))
                                        }
                                    },
                                    {
                                        label: i18n.t('static.program.no'),
                                        onClick: () => {
                                            this.setState({
                                                message: i18n.t('static.program.actioncancelled')
                                            })
                                            this.props.history.push(`/program/downloadProgram/` + i18n.t('static.program.actioncancelled'))
                                        }
                                    }
                                ]
                            });
                        }
                    }.bind(this)
                }.bind(this)

            }
        }

    }

    importFile() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            if (document.querySelector('input[type=file]').files[0] == undefined) {
                alert(i18n.t('static.program.selectfile'));
            } else {
                var file = document.querySelector('input[type=file]').files[0];
                var fileName = file.name;
                var fileExtenstion = fileName.split(".");
                if (fileExtenstion[1] == "zip") {
                    const lan = 'en'
                    JSZip.loadAsync(file).then(function (zip) {
                        var i = 0;
                        var fileName = []
                        var programListArray = []
                        var size = 0;
                        Object.keys(zip.files).forEach(function (filename) {
                            size++;
                        })
                        Object.keys(zip.files).forEach(function (filename) {
                            zip.files[filename].async('string').then(function (fileData) {

                                var programDataJson = JSON.parse(fileData);
                                var bytes = CryptoJS.AES.decrypt(programDataJson.programData, SECRET_KEY);
                                var plaintext = bytes.toString(CryptoJS.enc.Utf8);
                                var programDataJsonDecrypted = JSON.parse(plaintext);
                                console.log("programDatajson", programDataJsonDecrypted.label);
                                console.log("displayName", getLabelText((programDataJsonDecrypted.label), lan));
                                console.log("filename", filename);
                                programDataJson.filename = filename;
                                fileName[i] = {
                                    value: filename, label: (getLabelText((programDataJsonDecrypted.label), lan)) + "~v" + programDataJsonDecrypted.programVersion
                                }
                                programListArray[i] = programDataJson;
                                i++;
                                console.log("Program data list in import", programListArray)
                                if (i === size) {
                                    this.setState({
                                        programList: fileName,
                                        programListArray: programListArray
                                    })
                                    console.log("programList", fileName)
                                    console.log("programDataArrayList after state set", programListArray)

                                    document.getElementById("programIdDiv").style.display = "block";
                                    document.getElementById("formSubmitButton").style.display = "block";
                                    document.getElementById("fileImportDiv").style.display = "none";
                                    document.getElementById("fileImportButton").style.display = "none";
                                }
                            }.bind(this))

                        }.bind(this))

                    }.bind(this))
                } else {
                    alert(i18n.t('static.program.selectzipfile'))
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
                                                <strong>{i18n.t('static.program.import')}</strong>
                                            </CardHeader>
                                            <CardBody>
                                                <FormGroup id="fileImportDiv">
                                                    <Col md="3">
                                                        <Label htmlFor="file-input">{i18n.t('static.program.fileinput')}</Label>
                                                    </Col>
                                                    <Col xs="12" md="9">
                                                        <Input type="file" id="file-input" name="file-input" />
                                                    </Col>
                                                </FormGroup>
                                                <FormGroup id="programIdDiv">
                                                    <Label htmlFor="select">{i18n.t('static.program.program')}</Label>
                                                    <Select
                                                        bsSize="sm"
                                                        valid={!errors.programId}
                                                        invalid={touched.programId && !!errors.programId}
                                                        onChange={(e) => { handleChange(e); this.updateFieldData(e) }}
                                                        onBlur={handleBlur} name="programId" id="programId"
                                                        multi
                                                        options={this.state.programList}
                                                        value={this.state.programId}
                                                    />
                                                    <FormFeedback>{errors.programId}</FormFeedback>
                                                </FormGroup>
                                            </CardBody>
                                            <CardFooter>
                                                <FormGroup>
                                                    <Button type="reset" size="md" color="warning" className="float-right mr-1"><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                    <Button type="button" id="fileImportButton" size="md" color="success" className="float-right mr-1" onClick={() => this.importFile()}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                    <Button type="button" id="formSubmitButton" size="md" color="success" className="float-right mr-1" onClick={() => this.formSubmit()}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                    &nbsp;
                                                </FormGroup>
                                            </CardFooter>
                                        </Form>
                                    )} />
                    </Card>
                </Col>
            </>
        )

    }

    cancelClicked() {
        this.props.history.push(`/dashboard/` + i18n.t('static.program.actioncancelled'))
    }

}