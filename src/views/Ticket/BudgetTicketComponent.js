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

const initialValues = {
    summary: "static.common.add",
    programName: "",
    fundingSourceName: "",
    budgetName: "",
    budgetCode: "",
    currency: "",
    budgetAmount: "",
    notes: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        programName: Yup.string()
            .required(i18n.t('static.budget.programtext').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?',i18n.t('static.budget.program')))),
        fundingSourceName: Yup.string()
            .required(i18n.t('static.fundingSource.selectFundingSource').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?',i18n.t('static.budget.fundingsource')))),
        budgetName: Yup.string()
            .required(i18n.t('static.budget.budgetamountdesc')),
        // budgetCode: Yup.string()
        //     .max(10, i18n.t('static.common.max10digittext'))
        //     .required(i18n.t('static.budget.budgetCodeText')),
        currency: Yup.string()
            .required(i18n.t('static.country.currencytext')),
        budgetAmount: Yup.string()
            .matches(/^[0-9]+([,\.][0-9]+)?/, i18n.t('static.program.validBudgetAmount'))
            .required(i18n.t('static.budget.budgetamounttext')),
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

export default class BudgetTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            budget: {
                summary: "Add Budget",
                programName: "",
                fundingSourceName: "",
                budgetName: "",
                budgetCode: "",
                currency: "",
                budgetAmount: "",
                startDate: "",
                stopDate: "",
                notes: ""
            },
            message: '',
            programs: [],
            fundingSources: [],
            currencies: [],
            programId: '',
            fundingSourceId: '',
            currencyId: '',
            loading: false
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.addMonths = this.addMonths.bind(this);
        this.currentDate = this.currentDate.bind(this);
        this.dataChangeDate = this.dataChangeDate.bind(this);
        this.dataChangeEndDate = this.dataChangeEndDate.bind(this);
    }

    dataChange(event) {
        let { budget } = this.state
        if (event.target.name == "summary") {
            budget.summary = event.target.value;
        }
        if (event.target.name === "budgetName") {
            budget.budgetName = event.target.value;
        }
        if (event.target.name === "programName") {
            budget.programName = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                programId : event.target.value
            })            
        }
        if (event.target.name === "fundingSourceName") {            
            budget.fundingSourceName = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                fundingSourceId : event.target.value
            }) 
        }
        if (event.target.name === "budgetAmount") {
            budget.budgetAmount = event.target.value;
        }
        if (event.target.name === "budgetCode") {
            budget.budgetCode = event.target.value.toUpperCase();
        }
        if (event.target.name === "currency") {            
            budget.currency = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                currencyId : event.target.value
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
            programName: true,
            fundingSourceName: true,
            budgetName: true,
            budgetCode: true,
            currency: true,
            budgetAmount: true,
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
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getProgramList()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        programs: response.data
                    })
                }
                else {

                    this.setState({
                        message: response.data.messageCode
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }

            })

        FundingSourceService.getFundingSourceListAll()
            .then(response => {
                this.setState({
                    fundingSources: response.data
                })
            })

        CurrencyService.getCurrencyList().then(response => {
            if (response.status == 200) {
                this.setState({
                    currencies: response.data,
                })
            } else {
                this.setState({ message: response.data.messageCode })
            }
        })
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
        budget.programName = '';
        budget.fundingSourceName = '';
        budget.budgetName = '';
        budget.budgetCode = '';
        budget.currency = '';
        budget.budgetAmount = '';
        budget.startDate = '';
        budget.stopDate = '';
        budget.notes = '';
        this.setState({
            budget
        },
            () => { });
    }

    addMonths(date, months) {
        date.setMonth(date.getMonth() + months);
        return date;
    }

    dataChangeDate(date) {
        let { budget } = this.state
        budget.startDate = date;
        // budget.stopDate = '';
        this.setState({ budget: budget });
    }

    dataChangeEndDate(date) {
        let { budget } = this.state;
        budget.stopDate = date;
        this.setState({ budget: budget });
    }

    currentDate() {
        var todaysDate = new Date();
        var yyyy = todaysDate.getFullYear().toString();
        var mm = (todaysDate.getMonth() + 1).toString();
        var dd = todaysDate.getDate().toString();
        var mmChars = mm.split('');
        var ddChars = dd.split('');
        let date = yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
        // console.log("------date", date)
        return date;
    }

    render() {

        const { programs } = this.state;
        const { fundingSources } = this.state;
        const { currencies } = this.state;


        let programList = programs.length > 0 && programs.map((item, i) => {
            return (
                <option key={i} value={item.programId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);
        let fundingSourceList = fundingSources.length > 0 && fundingSources.map((item, i) => {
            return (
                <option key={i} value={item.fundingSourceId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);

        let currencyList = currencies.length > 0 && currencies.map((item, i) => {
            return (
                <option key={i} value={item.currencyId + "~" + item.conversionRateToUsd}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);

        return (
            <div className="col-md-12">
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>
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
                        JiraTikcetService.addEmailRequestIssue(this.state.budget).then(response => {                                         
                            console.log("Response :",response.status, ":" ,JSON.stringify(response.data));
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
                        })
                        .catch(
                            error => {
                                this.setState({                                        
                                    message: i18n.t('static.unkownError'), loading: false
                                },
                                () => {                                        
                                    this.hideSecondComponent();                                     
                                });                                    
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
                                        <Input type="text" name="summary" id="summary" readOnly = {true}
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
                                        <Label htmlFor="programName">{i18n.t('static.budget.program')}<span className="red Reqasterisk">*</span></Label>
                                        <Input
                                            type="select"
                                            name="programName"
                                            id="programName"
                                            bsSize="sm"
                                            valid={!errors.programName && this.state.budget.programName != ''}
                                            invalid={touched.programName && !!errors.programName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            required
                                            value={this.state.programId}
                                        >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {programList}
                                        </Input>
                                        <FormFeedback className="red">{errors.programName}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label htmlFor="fundingSourceName">{i18n.t('static.budget.fundingsource')}<span className="red Reqasterisk">*</span></Label>
                                        <Input
                                            type="select"
                                            name="fundingSourceName"
                                            id="fundingSourceName"
                                            bsSize="sm"
                                            valid={!errors.fundingSourceName && this.state.budget.fundingSourceName != ''}
                                            invalid={touched.fundingSourceName && !!errors.fundingSourceName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            required
                                            value={this.state.fundingSourceId}
                                        >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {fundingSourceList}
                                        </Input>
                                        <FormFeedback className="red">{errors.fundingSourceName}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="budgetName">{i18n.t('static.budget.budget')}<span className="red Reqasterisk">*</span></Label>
                                        <Input type="text"
                                            name="budgetName"
                                            id="budgetName"
                                            bsSize="sm"
                                            valid={!errors.budgetName && this.state.budget.budgetName != ''}
                                            invalid={touched.budgetName && !!errors.budgetName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.budget.budgetName}
                                            required />
                                        <FormFeedback className="red">{errors.budgetName}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="budget">{i18n.t('static.budget.budgetCode')}</Label>
                                        <Input type="text"
                                            name="budgetCode"
                                            id="budgetCode"
                                            bsSize="sm"
                                            // valid={!errors.budgetCode && this.state.budget.budgetCode != ''}
                                            // invalid={touched.budgetCode && !!errors.budgetCode}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            value={this.state.budget.budgetCode}
                                            // required 
                                            />
                                        <FormFeedback className="red">{errors.budgetCode}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label htmlFor="currency">{i18n.t("static.country.currency")}<span className="red Reqasterisk">*</span></Label>
                                        <Input
                                            type="select"
                                            name="currency"
                                            id="currency"
                                            bsSize="sm"
                                            valid={!errors.currency && this.state.budget.currency != ''}
                                            invalid={touched.currency && !!errors.currency}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            required
                                            value={this.state.currencyId}
                                        >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {currencyList}
                                        </Input>
                                        <FormFeedback className="red">{errors.currency}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="budgetAmount">{i18n.t('static.budget.budgetamount')}<span className="red Reqasterisk">*</span></Label>
                                        <Input
                                            type="number"
                                            name="budgetAmount"
                                            id="budgetAmount"
                                            bsSize="sm"
                                            valid={!errors.budgetAmount && this.state.budget.budgetAmount != ''}
                                            invalid={touched.budgetAmount && !!errors.budgetAmount}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}                                            
                                            value={this.state.budget.budgetAmount}
                                            required />
                                        <FormFeedback className="red">{errors.budgetAmount}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="startDate">{i18n.t('static.common.startdate')}</Label>
                                        <DatePicker
                                            id="startDate"
                                            name="startDate"
                                            bsSize="sm"
                                            minDate={this.addMonths(new Date(), -6)}
                                            selected={this.state.budget.startDate}
                                            onChange={(date) => { this.dataChangeDate(date) }}
                                            placeholderText={DATE_PLACEHOLDER_TEXT}
                                            className="form-control-sm form-control date-color"
                                            disabledKeyboardNavigation
                                            autoComplete={"off"}
                                            dateFormat={DATE_FORMAT_SM}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="stopDate">{i18n.t('static.common.stopdate')}</Label>
                                        <DatePicker
                                            id="stopDate"
                                            name="stopDate"
                                            bsSize="sm"
                                            minDate={this.state.budget.startDate}
                                            selected={this.state.budget.stopDate}
                                            onChange={(date) => { this.dataChangeEndDate(date) }}
                                            placeholderText={DATE_PLACEHOLDER_TEXT}
                                            className="form-control-sm form-control date-color"
                                            disabledKeyboardNavigation
                                            autoComplete={"off"}
                                            dateFormat={DATE_FORMAT_SM}
                                        />
                                    </FormGroup>

                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            valid={!errors.notes && this.state.budget.notes != ''}
                                            invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.budget.notes}
                                            // required 
                                            />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                   
                                        <Button type="button" size="md" color="info" className="mr-1" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
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