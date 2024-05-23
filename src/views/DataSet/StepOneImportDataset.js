import bsCustomFileInput from 'bs-custom-file-input';
import CryptoJS from 'crypto-js';
import { Formik } from 'formik';
import JSZip from 'jszip';
import React, { Component } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Select from 'react-select';
import { ProgressBar, Step } from "react-step-progress-bar";
import 'react-select/dist/react-select.min.css';
import {
    Row,
    Button,
    Card, CardBody,
    CardFooter,
    Col, Form,
    FormFeedback,
    FormGroup,
    Input,
    Label
} from 'reactstrap';
import * as Yup from 'yup';
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions';
import getLabelText from '../../CommonComponent/getLabelText.js';
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants.js';
import ProgramService from "../../api/ProgramService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Initial values for form fields
const initialValues = {
    programId: ''
}
// Localized entity name
const entityname = i18n.t('static.dashboard.importprogram')
/**
 * Component for importing the forecast program from zip.
 */
export default class StepOneImport extends Component {
    constructor(props) {
        super(props);
    }
    /**
     * Function to stop loader when component loads first
     */
    filterData() {
        this.props.updateStepOneData("loading", false);
    }
    /**
     * Renders the import forecast program screen.
     * @returns {JSX.Element} - Import forecast Program screen.
     */
    render() {
        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
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
                                    <FormGroup id="fileImportDiv">
                                        <Col md="3">
                                            <Label className="uploadfilelable" htmlFor="file-input">{i18n.t('static.program.fileinput')}</Label>
                                        </Col>
                                        <Col xs="12" md="4" className="custom-file">
                                            <Input type="file" className="custom-file-input" id="file-input" name="file-input" accept=".zip" />
                                            <label className="custom-file-label" id="file-input" data-browse={i18n.t('static.uploadfile.Browse')}>{i18n.t('static.chooseFile.chooseFile')}</label>
                                        </Col>
                                    </FormGroup>
                                    <div style={{ display: this.props.loading ? "none" : "block" }}></div>
                                    <div style={{ display: this.props.loading ? "block" : "none" }}>
                                        <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                            <div class="align-items-center">
                                                <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>
                                                <div class="spinner-border blue ml-4" role="status">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='StepCardFooter'>
                                        <Button type="button" id="fileImportButton" size="md" color="info" className="float-right mr-1" onClick={() => this.props.importFile()}>{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                                        &nbsp;
                                    </div>
                                </Form>
                            )} />
            </>
        );
    }
}