import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import { Button, Form, FormFeedback, FormGroup, Input, Label, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import { DATE_FORMAT_SM, DATE_PLACEHOLDER_TEXT, SPACE_REGEX } from '../../Constants.js';
import { Date } from 'core-js';
import moment from 'moment';
import '../../../node_modules/react-datepicker/dist/react-datepicker.css';
import JiraTikcetService from '../../api/JiraTikcetService';
import ProgramService from '../../api/ProgramService';
import FundingSourceService from '../../api/FundingSourceService';
import CurrencyService from '../../api/CurrencyService';
import getLabelText from '../../CommonComponent/getLabelText';
import BudgetService from '../../api/BudgetService';

let summaryText_1 = (i18n.t("static.common.edit") + " " + i18n.t("static.dashboard.budget"))
let summaryText_2 = "Edit Budget"
const initialValues = {
    summary: summaryText_1,
    budgetName: "",
    notes: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        budgetName: Yup.string()
            .required(i18n.t('static.common.pleaseSelect').concat(" ").concat((i18n.t('static.dashboard.budget')).concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.dashboard.budget'))))),
        notes: Yup.string()
            .required(i18n.t('static.program.validnotestext'))
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

export default class EditBudgetTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            budget: {
                summary: summaryText_1,
                budgetName: "",
                notes: ""
            },
            lang: localStorage.getItem('lang'),
            message: '',
            budgets: [],
            budgetId: '',
            loading: true
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }

    dataChange(event) {
        let { budget } = this.state
        if (event.target.name == "summary") {
            budget.summary = event.target.value;
        }
        if (event.target.name === "budgetName") {
            var outText = "";            
            if(event.target.value !== "") {
                var budgetT = this.state.budgets.filter(c =>  c.budgetId == event.target.value)[0];
                outText = budgetT.program.label.label_en + " | " + budgetT.label.label_en ;
            }
            budget.budgetName = outText;
            this.setState({
                budgetId: event.target.value
            })
        }
        if (event.target.name == "notes") {
            budget.notes = event.target.value;
        }
        this.setState({
            budget
        }, () => { })
    };

    touchAll(setTouched, errors) {
        setTouched({
            summary: true,
            budgetName: true,
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
        BudgetService.getBudgetList()
            .then(response => {
                console.log(response)
                if (response.status == 200) {
                    console.log("budget after status 200 new console --- ---->", response.data);
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        budgets: listArray,
                        loading: false
                    });
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }
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
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }

    resetClicked() {
        let { budget } = this.state;
        // budget.summary = '';
        budget.budgetName = '';
        budget.notes = '';
        this.setState({
            budget: budget,
            budgetId: ''
        },
            () => { });
    }

    render() {

        const { budgets } = this.state;


        let programList = budgets.length > 0 && budgets.map((item, i) => {
            return (
                <option key={i} value={item.budgetId}>
                    {getLabelText(item.label, this.state.lang) + " | " + getLabelText(item.program.label, this.state.lang)}
                </option>
            )
        }, this);

        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.dashboard.budget')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        initialValues={initialValues}
                        validate={validate(validationSchema)}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.budget.summary = summaryText_2;
                            this.state.budget.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(this.state.budget).then(response => {
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
                                                valid={!errors.summary && this.state.budget.summary != ''}
                                                invalid={touched.summary && !!errors.summary}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.budget.summary}
                                                required />
                                            <FormFeedback className="red">{errors.summary}</FormFeedback>
                                        </FormGroup>

                                        <FormGroup>
                                            <Label htmlFor="budgetName">{i18n.t('static.dashboard.budget')}<span className="red Reqasterisk">*</span></Label>
                                            <Input
                                                type="select"
                                                name="budgetName"
                                                id="budgetName"
                                                bsSize="sm"
                                                valid={!errors.budgetName && this.state.budget.budgetName != ''}
                                                invalid={touched.budgetName && !!errors.budgetName}
                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                onBlur={handleBlur}
                                                required
                                                value={this.state.budgetId}
                                            >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {programList}
                                            </Input>
                                            <FormFeedback className="red">{errors.budgetName}</FormFeedback>
                                        </FormGroup>

                                        <FormGroup>
                                            <Label for="notes">{i18n.t('static.common.notes')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="textarea" name="notes" id="notes"
                                                bsSize="sm"
                                                valid={!errors.notes && this.state.budget.notes != ''}
                                                invalid={touched.notes && !!errors.notes}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                maxLength={600}
                                                value={this.state.budget.notes}
                                            // required 
                                            />
                                            <FormFeedback className="red">{errors.notes}</FormFeedback>
                                        </FormGroup>
                                        <ModalFooter className="pb-0 pr-0">

                                            <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                            <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                            <Button type="submit" size="md" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>

                                        </ModalFooter>
                                        {/* <br></br><br></br> */}
                                        {/* <div className={this.props.className}>
                                        <p>{i18n.t('static.ticket.drodownvaluenotfound')}</p>
                                    </div> */}
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