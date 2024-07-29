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
export default class StepTwoImport extends Component {
    constructor(props) {
        super(props);
    }
    /**
     * Function to set program list and stop loader when component loads first
     */
    filterData() {
        let programList = this.props.items.programList;
        let programListArray = this.props.items.programListArray;
        this.setState({
            programList: programList,
            programListArray: programListArray,
        })
        this.props.updateStepOneData("loading", false);
    }
    /**
     * Redirects to the dashboard page.
     */
    redirectToDashboard(color, msg) {
        this.props.redirectToDashboard(color, msg);
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
                                <Form noValidate name='simpleForm1'>
                                    <FormGroup id="programIdDiv" className="col-md-7">
                                        <Label htmlFor="select">{i18n.t('static.program.program')}</Label>
                                        <Select
                                            bsSize="sm"
                                            valid={!errors.programId}
                                            invalid={touched.programId && !!errors.programId}
                                            onChange={(e) => { handleChange(e); this.props.updateFieldData(e) }}
                                            onBlur={handleBlur} name="programId" id="programId"
                                            multi
                                            options={this.props.items.programList}
                                            value={this.props.items.programId}
                                        />
                                        <FormFeedback>{errors.programId}</FormFeedback>
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
                                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={this.props.previousToStepOne} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.props.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="button" id="formSubmitButton" size="md" color="success" className="float-right mr-1" onClick={() => this.props.formSubmit()}><i className="fa fa-check"></i>{i18n.t('static.importFromQATSupplyPlan.Import')}</Button>
                                        &nbsp;
                                    </div>
                                </Form>
                            )} />
            </>
        );
    }
}