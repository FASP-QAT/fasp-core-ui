import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import { SPACE_REGEX } from '../../Constants';

let summaryText_1 = (i18n.t("static.common.add") + " " + i18n.t("static.realm.realm"))
let summaryText_2 = "Add Realm"
const initialValues = {
    summary: "",
    realmName: "",
    realmCode: "",
    minMosMinGaurdrail: "",
    minMosMaxGaurdrail: "",
    maxMosMaxGaurdrail: "",
    notes: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        realmName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.realm.realmNameText')),
        // realmCode: Yup.string()
        //     .required(i18n.t('static.realm.realmCodeText')),
        minMosMinGaurdrail: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.realm.minMosMinGaurdrail')),
        minMosMaxGaurdrail: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.realm.minMosMaxGaurdrail')),
        maxMosMaxGaurdrail: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.realm.maxMosMaxGaurdrail')),
        realmCode: Yup.string()
            .matches(/^\S*$/, i18n.t('static.validNoSpace.string'))
            .required(i18n.t('static.realm.realmCodeText'))
            .max(6, i18n.t('static.realm.realmCodeLength')),
        // notes: Yup.string()
        //     .required(i18n.t('static.common.notestext'))
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

export default class RealmTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            realm: {
                summary: summaryText_1,
                realmName: "",
                realmCode: "",
                minMosMinGaurdrail: "",
                minMosMaxGaurdrail: "",
                maxMosMaxGaurdrail: "",
                notes: ""
            },
            lang: localStorage.getItem('lang'),
            message: '',
            loading: false
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }

    dataChange(event) {
        let { realm } = this.state
        if (event.target.name == "summary") {
            realm.summary = event.target.value;
        }
        if (event.target.name == "realmName") {
            realm.realmName = event.target.value;
        }
        if (event.target.name == "realmCode") {
            realm.realmCode = event.target.value;
        }
        if (event.target.name == "minMosMinGaurdrail") {
            realm.minMosMinGaurdrail = event.target.value;
        }
        if (event.target.name == "minMosMaxGaurdrail") {
            realm.minMosMaxGaurdrail = event.target.value;
        }
        if (event.target.name == "maxMosMaxGaurdrail") {
            realm.maxMosMaxGaurdrail = event.target.value;
        }
        if (event.target.name == "notes") {
            realm.notes = event.target.value;
        }
        this.setState({
            realm
        }, () => { })
    };

    touchAll(setTouched, errors) {
        setTouched({
            summary: true,
            realmName: true,
            realmCode: true,
            minMosMinGaurdrail: true,
            minMosMaxGaurdrail: true,
            maxMosMaxGaurdrail: true,
            notes: true
        })
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

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }

    resetClicked() {
        let { realm } = this.state;
        // realm.summary = '';
        realm.realmName = '';
        realm.realmCode = '';
        realm.minMosMinGaurdrail = '';
        realm.minMosMaxGaurdrail = '';
        realm.maxMosMaxGaurdrail = '';
        realm.notes = '';
        this.setState({
            realm
        },
            () => { });
    }

    render() {

        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.realm.realm')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        enableReinitialize={true}
                        initialValues={{
                            summary: summaryText_1,
                            realmName: this.state.realm.realmName,
                            realmCode: this.state.realm.realmCode,
                            minMosMinGaurdrail: this.state.realm.minMosMinGaurdrail,
                            minMosMaxGaurdrail: this.state.realm.minMosMaxGaurdrail,
                            maxMosMaxGaurdrail: this.state.realm.maxMosMaxGaurdrail,
                            notes: this.state.realm.notes
                        }}
                        validate={validate(validationSchema)}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.realm.summary = summaryText_2;
                            this.state.realm.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(values).then(response => {
                                console.log("Response :", response.status, ":", JSON.stringify(response.data));
                                if (response.status == 200 || response.status == 201) {
                                    var msg = response.data.key;
                                    this.setState({
                                        message: msg, loading: false
                                    },
                                        () => {
                                            this.resetClicked();
                                            this.hideSecondComponent();
                                        })
                                } else {
                                    this.setState({
                                        message: i18n.t('static.unkownError'), loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                }
                                this.props.togglehelp();
                                this.props.toggleSmall(this.state.message);
                            }).catch(
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
                                setTouched,
                                handleReset
                            }) => (
                                <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">
                                    < FormGroup >
                                        <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="summary" id="summary" readOnly={true}
                                            bsSize="sm"
                                            valid={!errors.summary && this.state.realm.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realm.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="realmName">{i18n.t('static.realm.realmName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="realmName" id="realmName"
                                            bsSize="sm"
                                            valid={!errors.realmName && this.state.realm.realmName != ''}
                                            invalid={touched.realmName && !!errors.realmName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realm.realmName}
                                            required />
                                        <FormFeedback className="red">{errors.realmName}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="realmCode">{i18n.t('static.realm.realmCode')}</Label>
                                        <Input type="text" name="realmCode" id="realmCode"
                                            bsSize="sm"
                                            valid={!errors.realmCode && this.state.realm.realmCode != ''}
                                            invalid={touched.realmCode && !!errors.realmCode}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realm.realmCode}
                                        // required 
                                        />
                                        <FormFeedback className="red">{errors.realmCode}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="minMosMinGaurdrail">{i18n.t('static.realm.minMosMinGaurdraillabel')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="number" name="minMosMinGaurdrail" id="minMosMinGaurdrail"
                                            bsSize="sm"
                                            valid={!errors.minMosMinGaurdrail && this.state.realm.minMosMinGaurdrail != ''}
                                            invalid={touched.minMosMinGaurdrail && !!errors.minMosMinGaurdrail}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realm.minMosMinGaurdrail}
                                            required />
                                        <FormFeedback className="red">{errors.minMosMinGaurdrail}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="minMosMaxGaurdrail">{i18n.t('static.realm.minMosMaxGaurdraillabel')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="number" name="minMosMaxGaurdrail" id="minMosMaxGaurdrail"
                                            bsSize="sm"
                                            valid={!errors.minMosMaxGaurdrail && this.state.realm.minMosMaxGaurdrail != ''}
                                            invalid={touched.minMosMaxGaurdrail && !!errors.minMosMaxGaurdrail}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realm.minMosMaxGaurdrail}
                                            required />
                                        <FormFeedback className="red">{errors.minMosMaxGaurdrail}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="maxMosMaxGaurdrail">{i18n.t('static.realm.maxMosMaxGaurdraillabel')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="number" name="maxMosMaxGaurdrail" id="maxMosMaxGaurdrail"
                                            bsSize="sm"
                                            valid={!errors.maxMosMaxGaurdrail && this.state.realm.maxMosMaxGaurdrail != ''}
                                            invalid={touched.maxMosMaxGaurdrail && !!errors.maxMosMaxGaurdrail}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realm.maxMosMaxGaurdrail}
                                            required />
                                        <FormFeedback className="red">{errors.maxMosMaxGaurdrail}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            valid={!errors.notes && this.state.realm.notes != ''}
                                            invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realm.notes}
                                            maxLength={600}
                                        // required 
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                        <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className=" mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                    </ModalFooter>
                                </Form>
                            )} />
                </div>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                            <div class="spinner-border blue ml-4" role="status"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}