import { Date } from 'core-js';
import { Formik } from 'formik';
import moment from 'moment';
import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import '../../../node_modules/react-datepicker/dist/react-datepicker.css';
import BudgetService from "../../api/BudgetService";
import CurrencyService from '../../api/CurrencyService.js';
import FundingSourceService from '../../api/FundingSourceService';
import ProgramService from "../../api/ProgramService";
import getLabelText from '../../CommonComponent/getLabelText';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import '../Forms/ValidationForms/ValidationForms.css';
import { DATE_FORMAT_SM,DATE_PLACEHOLDER_TEXT } from '../../Constants.js';

const entityname = i18n.t('static.dashboard.budget');
// const [startDate, setStartDate] = useState(new Date());
const initialValues = {
    budget: '',
    programId: '',
    fundingSourceId: '',
    budgetAmt: '',
    // startDate: '',
    // stopDate: '',
    programList: [],
    budgetCode: '',
    fundingSourceList: [],

    currencyId: ''
}

const validationSchema = function (values, t) {
    return Yup.object().shape({
        budget: Yup.string()
            .required(i18n.t('static.budget.budgetamountdesc')),
        programId: Yup.string()
            .required(i18n.t('static.budget.programtext')),
        fundingSourceId: Yup.string()
            .required(i18n.t('static.budget.fundingtext')),
        budgetAmt: Yup.string()
            // .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .required(i18n.t('static.budget.budgetamounttext')).min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^[0-9]+([,\.][0-9]+)?/, i18n.t('static.program.validBudgetAmount')),
        // startDate: Yup.string()
        //     .required(i18n.t('static.budget.startdatetext')),
        // stopDate: Yup.string()
        //     .required(i18n.t('static.budget.stopdatetext'))
        currencyId: Yup.string()
            .required(i18n.t('static.country.currencytext')),
        budgetCode: Yup.string()
            .max(10, i18n.t('static.common.max10digittext'))
            .required(i18n.t('static.budget.budgetCodeText')),
    })
}
const validate = (getValidationSchema) => {
    return (values) => {

        const validationSchema = getValidationSchema(values, i18n.t)
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
class AddBudgetComponent extends Component {
    constructor(props) {

        super(props);
        this.state = {
            programs: [],
            fundingSources: [],
            currencyList: [],
            message: '',
            lang: localStorage.getItem('lang'),
            budget: {
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: ''
                },
                program: {
                    id: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                },
                fundingSource: {
                    fundingSourceId: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                },
                currency: {
                    currencyId: '',
                    conversionRateToUsd: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                },
                startDate: '',
                stopDate: '',
                budgetAmt: '',
                notes: '',
                budgetCode: '',

            },

        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.currentDate = this.currentDate.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.dataChangeDate = this.dataChangeDate.bind(this);
        this.dataChangeEndDate = this.dataChangeEndDate.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.addMonths = this.addMonths.bind(this);
        this.CommaFormatted = this.CommaFormatted.bind(this);

    }

    CommaFormatted(cell) {
        cell += '';
        cell = cell.replace(/,/g, '');
        var x = cell.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        // return "(" + currencyCode + ")" + "  " + x1 + x2;
        return x1 + x2;
    }

    addMonths(date, months) {
        date.setMonth(date.getMonth() + months);
        return date;
    }



    Capitalize(str) {
        let { budget } = this.state
        budget.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
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

    dataChange(event) {
        let { budget } = this.state;
        if (event.target.name === "budget") {
            budget.label.label_en = event.target.value;
        }
        if (event.target.name === "programId") {
            budget.program.id = event.target.value;
        }
        if (event.target.name === "fundingSourceId") {
            budget.fundingSource.fundingSourceId = event.target.value;
        }
        if (event.target.name === "budgetAmt") {
            var chnageValue = this.CommaFormatted(event.target.value);
            budget.budgetAmt = chnageValue;
        }
        if (event.target.name === "budgetCode") {
            budget.budgetCode = event.target.value.toUpperCase();
        }
        if (event.target.name === "currencyId") {
            var currencyAndrate = event.target.value;
            var values = currencyAndrate.split("~");
            budget.currency.currencyId = event.target.value;
            budget.currency.conversionRateToUsd = values[1];
        }
        // if (event.target.name === "startDate") {
        //     budget.startDate = event.target.value;
        //     budget.stopDate = ''
        // }
        // if (event.target.name === "stopDate") {
        //     budget.stopDate = event.target.value;
        // }
        else if (event.target.name === "notes") {
            budget.notes = event.target.value;
        }
        this.setState({
            budget
        },
            () => { });
    };

    touchAll(setTouched, errors) {
        setTouched({
            budget: true,
            programId: true,
            fundingSourceId: true,
            budgetAmt: true,
            currencyId: true,
            budgetCode: true,
            // startDate: true,
            // stopDate: true
        }
        );
        this.validateForm(errors);
    }
    validateForm(errors) {
        this.findFirstError('budgetForm', (fieldName) => {
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
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    componentDidMount() {
        console.log("new date--->", new Date());
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
                    currencyList: response.data,
                })
            } else {
                this.setState({ message: response.data.messageCode })
            }
        })
    }

    render() {

        const { programs } = this.state;
        const { fundingSources } = this.state;
        const { currencyList } = this.state;


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

        let currencyes = currencyList.length > 0 && currencyList.map((item, i) => {
            return (
                <option key={i} value={item.currencyId + "~" + item.conversionRateToUsd}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    console.log("this.state--->", this.state);
                                    let { budget } = this.state;
                                    var getCurrencyId = this.state.budget.currency.currencyId;
                                    var currencyId = getCurrencyId.split("~");
                                    budget.currency.currencyId = currencyId[0];

                                    var amount = this.state.budget.budgetAmt.replace(/,/g, '');
                                    budget.budgetAmt = amount;
                                    // alert(this.state.budget.startDate);
                                    var startDate = moment(this.state.budget.startDate).format("YYYY-MM-DD");
                                    budget.startDate = startDate;

                                    var stopDate = moment(this.state.budget.stopDate).format("YYYY-MM-DD");
                                    budget.stopDate = stopDate;

                                    // alert("hiiiiii");
                                    // this.setState({ budget: budget });

                                    console.log("this.state.budget--->", budget);
                                    BudgetService.addBudget(budget)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/budget/listBudget/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode
                                                },
                                                    () => {
                                                        this.hideSecondComponent();
                                                    })
                                            }
                                        })
                                        .catch(
                                            error => {
                                                if (error.message === "Network Error") {
                                                    this.setState({ message: error.message });
                                                } else {
                                                    switch (error.response ? error.response.status : "") {
                                                        case 500:
                                                        case 401:
                                                        case 404:
                                                        case 406:
                                                        case 412:
                                                            this.setState({ message: error.response.data.messageCode });
                                                            break;
                                                        default:
                                                            this.setState({ message: 'static.unkownError' });
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
                                            <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='budgetForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label htmlFor="programId">{i18n.t('static.budget.program')}<span className="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa-object-group"></i></InputGroupText> */}
                                                        <Input
                                                            type="select"
                                                            name="programId"
                                                            id="programId"
                                                            bsSize="sm"
                                                            valid={!errors.programId && this.state.budget.program.id != ''}
                                                            invalid={touched.programId && !!errors.programId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.budget.program.id}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {programList}
                                                        </Input>
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.programId}</FormFeedback>
                                                    </FormGroup>


                                                    <FormGroup>
                                                        <Label htmlFor="fundingSourceId">{i18n.t('static.budget.fundingsource')}<span className="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-building-o"></i></InputGroupText> */}
                                                        <Input
                                                            type="select"
                                                            name="fundingSourceId"
                                                            id="fundingSourceId"
                                                            bsSize="sm"
                                                            valid={!errors.fundingSourceId && this.state.budget.fundingSource.fundingSourceId != ''}
                                                            invalid={touched.fundingSourceId && !!errors.fundingSourceId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.budget.fundingSource.fundingSourceId}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {fundingSourceList}
                                                        </Input>
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.fundingSourceId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="budget">{i18n.t('static.budget.budget')}<span className="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-money"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            name="budget"
                                                            id="budget"
                                                            bsSize="sm"
                                                            valid={!errors.budget && this.state.budget.label.label_en != ''}
                                                            invalid={touched.budget && !!errors.budget}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.budget.label.label_en}
                                                            required />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.budget}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label for="budget">{i18n.t('static.budget.budgetCode')}<span className="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="budgetCode"
                                                            id="budgetCode"
                                                            bsSize="sm"
                                                            valid={!errors.budgetCode && this.state.budget.budgetCode != ''}
                                                            invalid={touched.budgetCode && !!errors.budgetCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.budget.budgetCode}
                                                            required />
                                                        <FormFeedback className="red">{errors.budgetCode}</FormFeedback>
                                                    </FormGroup>


                                                    <FormGroup>
                                                        <Label htmlFor="currencyId">{i18n.t("static.country.currency")}<span className="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-building-o"></i></InputGroupText> */}
                                                        <Input
                                                            type="select"
                                                            name="currencyId"
                                                            id="currencyId"
                                                            bsSize="sm"
                                                            valid={!errors.currencyId && this.state.budget.currency.currencyId != ''}
                                                            invalid={touched.currencyId && !!errors.currencyId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.budget.currency.currencyId}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {currencyes}
                                                        </Input>
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.currencyId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label for="conversionRateToUsd">{i18n.t("static.currency.conversionrateusd")}<span className="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="text"
                                                            name="conversionRateToUsd"
                                                            id="conversionRateToUsd"
                                                            bsSize="sm"
                                                            value={this.state.budget.currency.conversionRateToUsd}
                                                            disabled />
                                                        <FormFeedback className="red">{errors.budget}</FormFeedback>
                                                    </FormGroup>






                                                    <FormGroup>
                                                        <Label for="budgetAmt">{i18n.t('static.budget.budgetamount')}<span className="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-usd"></i></InputGroupText> */}
                                                        <Input
                                                            type="number"
                                                            // min="0"
                                                            name="budgetAmt"
                                                            id="budgetAmt"
                                                            bsSize="sm"
                                                            valid={!errors.budgetAmt && this.state.budget.budgetAmt != ''}
                                                            invalid={touched.budgetAmt && !!errors.budgetAmt}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            type="text"
                                                            value={this.state.budget.budgetAmt}
                                                            // placeholder={i18n.t('static.budget.budgetamountdesc')}
                                                            required />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.budgetAmt}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        {/* <Label for="startDate">{i18n.t('static.common.startdate')}</Label> */}
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-calendar-plus-o"></i></InputGroupText> */}
                                                        {/* <Input */}
                                                        {/* // value={this.state.budget.st} */}
                                                        {/* className="fa fa-calendar Fa-right"
                                                            name="startDate"
                                                            id="startDate" */}
                                                        {/* // bsSize="sm" */}
                                                        {/* // valid={!errors.startDate} */}
                                                        {/* // invalid={touched.startDate && !!errors.startDate} */}
                                                        {/* onChange={(e) => { */}
                                                        {/* // handleChange(e);  */}
                                                        {/* this.dataChange(e) */}
                                                        {/* }} */}
                                                        {/* // onBlur={handleBlur} */}
                                                        {/* type="date" */}
                                                        {/* min={this.currentDate()} */}
                                                        {/* value={this.state.budget.startDate} */}
                                                        {/* placeholder={i18n.t('static.budget.budgetstartdate')} */}
                                                        {/* // required  */}
                                                        {/* /> */}
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red"></FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        {/* <Label for="stopDate">{i18n.t('static.common.stopdate')}</Label> */}
                                                        {/* <InputGroupAddon addonType="prepend"> 
                                                        {/* <InputGroupText><i className="fa fa-calendar-minus-o"></i></InputGroupText> */}
                                                        {/* <Input

                                                            className="fa fa-calendar Fa-right"
                                                            value={this.state.budget.stopDate}
                                                            name="stopDate"
                                                            id="stopDate" */}
                                                        {/* // bsSize="sm" */}
                                                        {/* // valid={!errors.stopDate} */}
                                                        {/* // invalid={touched.stopDate && !!errors.stopDate} */}
                                                        {/* onChange={(e) => {/ */}
                                                        {/* // handleChange(e);  */}
                                                        {/* this.dataChange(e) */}
                                                        {/* }} */}
                                                        {/* onBlur={handleBlur} */}
                                                        {/* type="date" */}
                                                        {/* value={this.state.budget.stopDate} */}
                                                        {/* min={this.state.budget.startDate} */}
                                                        {/* placeholder={i18n.t('static.budget.budgetstopdate')} */}
                                                        {/* // required  */}
                                                        {/* /> */}
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red"></FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="notes">{i18n.t('static.program.notes')}</Label>
                                                        <Input
                                                            name="notes"
                                                            id="notes"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.dataChange(e) }}
                                                            type="textarea"
                                                        />
                                                        <FormFeedback className="red"></FormFeedback>
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
                                                            // placeholderText="mm-dd-yyy"
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
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>

                                                        {/* <Button type="reset" size="sm" color="warning" className="float-right mr-1"><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button> */}
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>

                                                        &nbsp;
                                                    </FormGroup>
                                                </CardFooter>
                                            </Form>
                                        )} />
                        </Card>
                    </Col>
                </Row>
                {/* <div>
                    <h6>{i18n.t(this.state.message)}</h6>
                    <h6>{i18n.t(this.props.match.params.message)}</h6>
                </div> */}
            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/budget/listBudget/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        let { budget } = this.state;

        budget.label.label_en = ''
        // budget.program.programId = ''
        budget.program.id= ''
        budget.fundingSource.fundingSourceId = ''
        budget.budgetAmt = ''
        budget.startDate = ''
        budget.stopDate = ''
        budget.currency.currencyId = ''
        budget.budgetCode = ''
        budget.currency.conversionRateToUsd = ''


            this.setState({
                budget
            },
                () => { });
    }
}

export default AddBudgetComponent;