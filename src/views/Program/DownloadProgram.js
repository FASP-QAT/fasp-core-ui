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
import AuthenticationService from '../Common/AuthenticationService.js';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import i18n from '../../i18n';

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



export default class DownloadProgram extends Component {

    constructor(props) {
        super(props);
        this.state = {
            programList: []
        }
        this.formSubmit = this.formSubmit.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
    }

    componentDidMount() {
        const lan = 'en'
        AuthenticationService.setupAxiosInterceptors();
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
                    console.log("Json", json);
                    console.log("Json length", json.length)
                    var db1;
                    var openRequest = indexedDB.open('fasp', 1);
                    openRequest.onsuccess = function (e) {
                        console.log("in success");
                        db1 = e.target.result;
                        var transaction = db1.transaction(['programData'], 'readwrite');
                        var program = transaction.objectStore('programData');
                        var count = 0;
                        var getRequest = program.getAll();
                        getRequest.onerror = function (event) {
                            // Handle errors!
                        };
                        getRequest.onsuccess = function (event) {
                            var myResult = [];
                            myResult = getRequest.result;
                            for (var i = 0; i < myResult.length; i++) {
                                for (var j = 0; j < json.length; j++) {
                                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                    if (myResult[i].id == json[j].programId + "_v" + json[j].programVersion + "_uId_" + userId) {
                                        count++;
                                    }
                                }
                                console.log("count", count)
                            }
                            if (count == 0) {
                                db1 = e.target.result;
                                var transactionForSavingData = db1.transaction(['programData'], 'readwrite');
                                var programSaveData = transactionForSavingData.objectStore('programData');
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
                                    var putRequest = programSaveData.put(item);
                                    putRequest.onerror = function (error) {
                                        this.props.history.push(`/program/downloadProgram/` +i18n.t('static.program.errortext') )
                                    }.bind(this);
                                }
                                transactionForSavingData.oncomplete = function (event) {
                                    console.log("in transaction complete")
                                    this.props.history.push(`/dashboard/` + i18n.t('static.program.downloadsuccess'))
                                }.bind(this);
                                transactionForSavingData.onerror = function (event) {
                                    this.props.history.push(`/program/downloadProgram/` + i18n.t('static.program.errortext'))
                                }.bind(this);
                                programSaveData.onerror = function (event) {
                                    this.props.history.push(`/program/downloadProgram/` + i18n.t('static.program.errortext'))
                                }.bind(this)
                            } else {
                                confirmAlert({
                                    title: i18n.t('static.program.confirmsubmit'),
                                    message: i18n.t('static.program.programwithsameversion'),
                                    buttons: [
                                        {
                                            label: i18n.t('static.program.yes'),
                                            onClick: () => {
                                                db1 = e.target.result;
                                                var transactionForOverwrite = db1.transaction(['programData'], 'readwrite');
                                                var programOverWrite = transactionForOverwrite.objectStore('programData');
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
                                                    var putRequest = programOverWrite.put(item);
                                                    putRequest.onerror = function (error) {
                                                        this.props.history.push(`/program/downloadProgram/` + "An error occured please try again.")
                                                    }.bind(this);

                                                }
                                                transactionForOverwrite.oncomplete = function (event) {
                                                    console.log("in transaction complete")
                                                    this.props.history.push(`/dashboard/` + "Program downloaded successfully.")
                                                }.bind(this);
                                                transactionForOverwrite.onerror = function (event) {
                                                    this.props.history.push(`/program/downloadProgram/` + "An error occured please try again.")
                                                }.bind(this);
                                                transactionForOverwrite.onerror = function (event) {
                                                    this.props.history.push(`/program/downloadProgram/` + "An error occured please try again.")
                                                }.bind(this)
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
                })
                .catch(
                    error => {
                        switch (error.message) {
                            case "Network Error":
                                this.setState({
                                    message: error.message
                                })
                                this.props.history.push(`/program/downloadProgram/` +  i18n.t('static.program.errortext'))
                                break
                            default:
                                this.setState({
                                    message: error.response
                                })
                                this.props.history.push(`/program/downloadProgram/` +  i18n.t('static.program.errortext'))
                                break
                        }
                    }
                )

        } else {
            alert( i18n.t('static.common.online'))
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
                                                <strong>{i18n.t('static.program.download')}</strong>
                                            </CardHeader>
                                            <CardBody>
                                                <FormGroup>
                                                    <Label htmlFor="select">{i18n.t('static.program.program')}</Label>
                                                    <Select
                                                        valid={!errors.programId}
                                                        bsSize="sm"
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
                                                    <Button type="button" size="md" color="success" className="float-right mr-1" onClick={() => this.formSubmit()}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
        this.props.history.push(`/dashboard/` +    i18n.t('static.program.actioncancelled') )
    }

}