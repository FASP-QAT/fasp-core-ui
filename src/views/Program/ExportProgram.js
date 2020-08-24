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
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME } from '../../Constants.js'
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import i18n from '../../i18n';
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';

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


const entityname = i18n.t('static.dashboard.exportprogram')
export default class ExportProgram extends Component {

    constructor(props) {
        super(props);
        this.state = {
            programList: [],
            message: '',
            selectProgramMessage: ''
        }
        this.formSubmit = this.formSubmit.bind(this)
        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
    }

    componentDidMount() {
        const lan = 'en'
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME,INDEXED_DB_VERSION );
        openRequest.onsuccess = function (e) {
            console.log("in success");
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var prgList = [];
            var getRequest = program.getAll();
            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                console.log("in success")
                var json = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < json.length; i++) {
                    var bytes = CryptoJS.AES.decrypt(json[i].programName, SECRET_KEY);
                    var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                    console.log("ProgramNameLabel", programNameLabel);
                    if (json[i].userId == userId) {
                        prgList[i] = { value: json[i].id, label: getLabelText(JSON.parse(programNameLabel), lan) + "~v" + json[i].version }
                    }
                }
            }.bind(this)
            transaction.oncomplete = function (event) {
                console.log("ProgramList", prgList)
                this.setState({
                    programList: prgList
                })
                console.log("ProgramList", this.state.programList);
            }.bind(this)
        }.bind(this)
    }

    formSubmit() {
        var zip = new JSZip();
        var programId = this.state.programId;
        console.log("ProgramId", programId)
        if (programId != "" && programId != undefined) {
            this.setState({
                selectProgramMessage: ""
            })
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME,INDEXED_DB_VERSION );
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['programData'], 'readwrite');
                var program = transaction.objectStore('programData');
                var getRequest = program.getAll();
                getRequest.onerror = function (event) {
                    // Handle errors!
                };
                getRequest.onsuccess = function (event) {
                    var myResult = [];
                    myResult = getRequest.result;
                    for (var i = 0; i < myResult.length; i++) {
                        for (var j = 0; j < programId.length; j++) {
                            if (myResult[i].id == programId[j].value) {
                                var txt = JSON.stringify(myResult[i]);
                                var labelName = (programId[j].label).replace("/", "-")
                                zip.file(labelName + "_" + parseInt(j + 1) + ".txt", txt);
                            }
                        }
                        if (i == myResult.length - 1) {
                            zip.generateAsync({
                                type: "blob"
                            }).then(function (content) {
                                FileSaver.saveAs(content, "download.zip");
                                this.props.history.push(`/ApplicationDashboard/` + 'green/' + i18n.t('static.program.dataexportsuccess'))

                            }.bind(this));
                        }
                    }
                }.bind(this);
            }.bind(this)
        } else {
            console.log("in ekse")
            this.setState({
                selectProgramMessage: i18n.t('static.program.validselectprogramtext')
            })
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
        if (value != "" && value != undefined) {
            this.setState({
                selectProgramMessage: ""
            })
        } else {
            this.setState({
                selectProgramMessage: i18n.t('static.program.validselectprogramtext')
            })
        }
        console.log("Value", value);
        // console.log(event.value)
        this.setState({ programId: value });
    }

    render() {
        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <Card className="mt-2">
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
                                        {/* <CardHeader>
                                            <strong>{i18n.t('static.program.export')}</strong>
                                        </CardHeader> */}
                                        <CardBody className="pb-lg-2 pt-lg-2">
                                            <FormGroup className="col-md-4" >
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
                                                <span className="red">{this.state.selectProgramMessage}</span>
                                            </FormGroup>
                                        </CardBody>
                                        <CardFooter>
                                            <FormGroup>

                                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                <Button type="button" size="md" color="success" className="float-right mr-1" onClick={() => this.formSubmit()}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                &nbsp;
                                                </FormGroup>
                                        </CardFooter>
                                    </Form>
                                )} />
                </Card>

            </>
        )
    }

    cancelClicked() {
        this.props.history.push(`/ApplicationDashboard/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        this.state.programId = '';
        // this.setState({ programId }, () => { });
        this.setState({ programId: '' });
    }

}