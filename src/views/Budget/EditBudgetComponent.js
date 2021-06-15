import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';
import Select from 'react-select';
import { Formik } from 'formik';
import * as Yup from 'yup';
import '../Forms/ValidationForms/ValidationForms.css';
import 'react-select/dist/react-select.min.css';
import i18n from '../../i18n';
import getLabelText from '../../CommonComponent/getLabelText';
import BudgetService from "../../api/BudgetService";
import AuthenticationService from '../Common/AuthenticationService.js';
import moment from 'moment';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import classNames from 'classnames';
import { SPECIAL_CHARECTER_WITH_NUM, DATE_FORMAT_SM, DATE_PLACEHOLDER_TEXT, ALPHABET_NUMBER_REGEX, BUDGET_NAME_REGEX } from '../../Constants.js';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import FundingSourceService from '../../api/FundingSourceService';


const entityname = i18n.t('static.dashboard.budget');
let initialValues = {
    budgetName: '',
    budgetAmt: '',
    budgetCode: '',
    fundingSourceId: '',
}

const validationSchema = function (values) {
    return Yup.object().shape({
        budgetName: Yup.string()
            // .matches(BUDGET_NAME_REGEX, i18n.t('static.message.budgetNameRegex'))
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.budget.budgetamountdesc')),
        budgetAmt: Yup.string()
            // .typeError(i18n.t('static.procurementUnit.validNumberText'))
            // .matches(/^\d{0,15}(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount'))
            .matches(/^\d{0,15}(,\d{3})*(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount'))
            .required(i18n.t('static.budget.budgetamounttext')).min(0, i18n.t('static.program.validvaluetext')),
        // .matches(/^[0-9]+([,\.][0-9]+)?/, i18n.t('static.program.validBudgetAmount')),
        budgetCode: Yup.string()
            // .matches(ALPHABET_NUMBER_REGEX, i18n.t('static.message.alphabetnumerallowed'))
            // .matches(/^[a-zA-Z0-9_'\/-]*$/, i18n.t('static.common.alphabetNumericCharOnly'))
            .matches(SPECIAL_CHARECTER_WITH_NUM, i18n.t('static.validNoSpace.string'))
            .max(30, i18n.t('static.common.max30digittext'))
            .required(i18n.t('static.budget.budgetDisplayNameText')),
        fundingSourceId: Yup.string()
            .required(i18n.t('static.budget.fundingtext')),
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

class EditBudgetComponent extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - 10);
        this.state = {
            loading: true,
            fundingSources: [],
            rangeValue: "",
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 2 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() },
            // budget: this.props.location.state.budget,
            budget: {
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: ''
                },
                program: {
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
            message: '',
            lang: localStorage.getItem('lang'),
        }

        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.currentDate = this.currentDate.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.changeMessage = this.changeMessage.bind(this);
        this.dataChangeDate = this.dataChangeDate.bind(this);
        this.dataChangeEndDate = this.dataChangeEndDate.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.addMonths = this.addMonths.bind(this);
        this.CommaFormatted = this.CommaFormatted.bind(this);
        this.changeLoading = this.changeLoading.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.pickRange = React.createRef();
    }

    _handleClickRangeBox(e) {
        this.pickRange.current.show()
    }

    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value })
    }

    changeLoading(loading) {
        this.setState({ loading: loading })
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
        return x1 + x2;
    }


    addMonths(date, months) {
        console.log("add months date 1---" + date);
        date.setMonth(date.getMonth() + months);
        console.log("add months date 2---" + date);
        return date;
    }

    changeMessage(message) {
        this.setState({ message: message })
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    dataChangeDate(date) {
        let { budget } = this.state
        budget.startDate = date;
        budget.stopDate = '';
        this.setState({ budget: budget });
    }

    dataChangeEndDate(date) {
        let { budget } = this.state;
        budget.stopDate = date;
        this.setState({ budget: budget });
    }

    componentDidMount() {
        BudgetService.getBudgetDataById(this.props.match.params.budgetId)
            .then(response => {
                if (response.status == 200) {
                    console.log("(response.data.startDate)--", new Date(response.data.startDate));
                    // if (response.data.startDate != null && response.data.startDate != "") {
                    //     response.data.startDate = new Date(response.data.startDate);
                    // }
                    // if (response.data.stopDate != null && response.data.stopDate != "") {
                    //     response.data.stopDate = new Date(response.data.stopDate);
                    // }
                    // var getBudgetAmount = this.CommaFormatted(response.data.budgetAmt);
                    // response.data.budgetAmt = getBudgetAmount;

                    var startDate = moment(response.data.startDate).format("YYYY-MM-DD");
                    var stopDate = moment(response.data.stopDate).format("YYYY-MM-DD");
                    let budgetObj = response.data;
                    budgetObj.budgetAmt = (budgetObj.budgetAmt).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
                    console.log("AMT------>", (budgetObj.budgetAmt).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","));

                    this.setState({
                        budget: budgetObj, loading: false,
                        rangeValue: { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(stopDate).getFullYear(), month: new Date(stopDate).getMonth() + 1 } }
                    });
                }
                else {

                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }
                // response.data.startDate = moment(response.data.startDate).format('YYYY-MM-DD');
                // response.data.stopDate = moment(response.data.stopDate).format('YYYY-MM-DD');
                // new Date('2019-06-11')




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

        FundingSourceService.getFundingSourceListAll()
            .then(response => {
                var listArray = response.data.filter(c => (c.allowedInBudget == true || c.allowedInBudget == "true"));
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    // fundingSources: response.data.filter(c => (c.allowedInBudget == true || c.allowedInBudget == "true"))
                    fundingSources: listArray
                    , loading: false
                })
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
    Capitalize(str) {
        let { budget } = this.state
        budget.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }
    currentDate() {
        var todaysDate = new Date();
        var yyyy = todaysDate.getFullYear().toString();
        var mm = (todaysDate.getMonth() + 1).toString();
        var dd = todaysDate.getDate().toString();
        var mmChars = mm.split('');
        var ddChars = dd.split('');
        let date = yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
        return date;
    }
    dataChange(event) {
        let { budget } = this.state;
        if (event.target.name === "budgetName") {
            budget.label.label_en = event.target.value;
        }
        if (event.target.name === "budgetAmt") {
            // var chnageValue = this.CommaFormatted(event.target.value);
            // budget.budgetAmt = chnageValue;

            budget.budgetAmt = event.target.value;
        }
        if (event.target.name === "fundingSourceId") {
            budget.fundingSource.fundingSourceId = event.target.value;
        }
        // if (event.target.name === "startDate") {
        //     budget.startDate = event.target.value;
        //     budget.stopDate = ''
        // } if (event.target.name === "stopDate") {
        //     budget.stopDate = event.target.value;
        // }
        if (event.target.name === "budgetCode") {
            budget.budgetCode = event.target.value.toUpperCase();
        }
        if (event.target.name === "notes") {
            budget.notes = event.target.value;
        } else if (event.target.name === "active") {
            budget.active = event.target.id === "active2" ? false : true;
        }
        this.setState({
            budget
        },
            () => { console.log(this.state) });
    };

    touchAll(setTouched, errors) {
        setTouched({
            budgetName: true,
            budgetAmt: true,
            budgetCode: true,
            fundingSourceId: true,
        });
        this.validateForm(errors)
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

    render() {
        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state

        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }
        const { fundingSources } = this.state;
        let fundingSourceList = fundingSources.length > 0 && fundingSources.map((item, i) => {
            return (
                <option key={i} value={item.fundingSourceId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row style={{ display: this.state.loading ? "none" : "block" }}>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                enableReinitialize={true}
                                initialValues={{
                                    budgetName: getLabelText(this.state.budget.label, this.state.lang),
                                    budgetAmt: this.state.budget.budgetAmt,
                                    budgetCode: this.state.budget.budgetCode,
                                    startDate: this.state.budget.startDate,
                                    stopDate: this.state.budget.stopDate,
                                    fundingSourceId: this.state.budget.fundingSource.fundingSourceId
                                }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    let { budget } = this.state;

                                    // var amount = this.state.budget.budgetAmt.replace(/,/g, '');
                                    // budget.budgetAmt = amount;
                                    budget.budgetAmt = this.state.budget.budgetAmt;
                                    let rangeValue = this.state.rangeValue;
                                    let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
                                    let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
                                    budget.startDate = startDate;

                                    // var stopDateString = this.state.budget.stopDate.getFullYear() + "-" + ("0" + (this.state.budget.stopDate.getMonth() + 1)).slice(-2) + "-" + ("0" + this.state.budget.stopDate.getDate()).slice(-2);
                                    budget.stopDate = stopDate;
                                    // var startDate = moment(this.state.budget.startDate).format("YYYY-MM-DD");
                                    // budget.startDate = startDate;

                                    // var stopDate = moment(this.state.budget.stopDate).format("YYYY-MM-DD");
                                    // budget.stopDate = stopDate;
                                    // var startDateString = this.state.budget.startDate.getFullYear() + "-" + ("0" + (this.state.budget.startDate.getMonth() + 1)).slice(-2) + "-" + ("0" + this.state.budget.startDate.getDate()).slice(-2);
                                    // budget.startDate = new Date(startDateString);

                                    // var stopDateString = this.state.budget.stopDate.getFullYear() + "-" + ("0" + (this.state.budget.stopDate.getMonth() + 1)).slice(-2) + "-" + ("0" + this.state.budget.stopDate.getDate()).slice(-2);
                                    // budget.stopDate = new Date(stopDateString);
                                    console.log("check----->1", budget.budgetAmt);
                                    budget.budgetAmt = budget.budgetAmt.replace(',', '');
                                    console.log("check----->2", budget.budgetAmt);
                                    BudgetService.editBudget(budget)
                                        .then(response => {
                                            if (response.status == "200") {
                                                this.props.history.push(`/budget/listBudget/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                                        setFieldValue,
                                        setFieldTouched,
                                        setFieldError
                                    }) => (
                                            <Form onSubmit={handleSubmit} noValidate name='budgetForm' autocomplete="off">
                                                <CardBody>

                                                    <FormGroup>
                                                        <Label htmlFor="programId">{i18n.t('static.budget.program')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            type="text"
                                                            name="programId"
                                                            id="programId"
                                                            bsSize="sm"
                                                            readOnly
                                                            valid={!errors.programId}
                                                            invalid={touched.programId && !!errors.programId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}

                                                            value={getLabelText(this.state.budget.program.label, this.state.lang)}
                                                        >
                                                        </Input>

                                                        <FormFeedback className="red">{errors.programId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="fundingSourceId">{i18n.t('static.budget.fundingsource')}<span class="red Reqasterisk">*</span></Label>

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
                                                            disabled={!AuthenticationService.getLoggedInUserRoleIdArr().includes("ROLE_APPLICATION_ADMIN") ? true : false}
                                                            value={this.state.budget.fundingSource.fundingSourceId}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {fundingSourceList}
                                                        </Input>
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.fundingSourceId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="budget">{i18n.t('static.budget.budget')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="text"
                                                            name="budgetName"
                                                            id="budget"
                                                            bsSize="sm"
                                                            valid={!errors.budgetName}
                                                            invalid={touched.budgetName && !!errors.budgetName || this.state.budget.label.label_en == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.budget.label.label_en}

                                                        />
                                                        <FormFeedback className="red">{errors.budgetName}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="budget">{i18n.t('static.budget.budgetDisplayName')}<span className="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="budgetCode"
                                                            id="budgetCode"
                                                            bsSize="sm"
                                                            valid={!errors.budgetCode && this.state.budget.budgetCode != ''}
                                                            invalid={touched.budgetCode && !!errors.budgetCode || this.state.budget.budgetCode == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            maxLength={30}
                                                            value={this.state.budget.budgetCode}
                                                            required />
                                                        <FormFeedback className="red">{errors.budgetCode}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label htmlFor="currencyId">{i18n.t("static.country.currency")}<span className="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-building-o"></i></InputGroupText> */}
                                                        <Input
                                                            type="text"
                                                            name="currencyId"
                                                            id="currencyId"
                                                            bsSize="sm"
                                                            value={this.state.budget.currency.label.label_en}
                                                            disabled
                                                        >
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
                                                        <Label for="budgetAmt">{i18n.t('static.budget.budgetamount')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input type="number"
                                                            // min="0"
                                                            name="budgetAmt"
                                                            id="budgetAmt"
                                                            bsSize="sm"
                                                            // valid={!errors.budgetAmt}
                                                            // invalid={touched.budgetAmt && !!errors.budgetAmt || this.state.budget.budgetAmt == ''}

                                                            valid={!errors.budgetAmt}
                                                            invalid={(touched.budgetAmt && !!errors.budgetAmt) || !!errors.budgetAmt}

                                                            // valid={!errors.budgetAmt}
                                                            // invalid={(touched.budgetAmt && !!errors.budgetAmt || !!errors.budgetAmt)}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="text"
                                                            // placeholder={i18n.t('static.budget.budgetamountdesc')}
                                                            value={this.state.budget.budgetAmt}
                                                        />
                                                        <FormFeedback className="red">{errors.budgetAmt}</FormFeedback>
                                                    </FormGroup>
                                                    {this.state.rangeValue != "" && <FormGroup>
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.budget.budgetrange')}</Label>
                                                        <div className="controls edit">
                                                            <Picker
                                                                years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                                ref={this.pickRange}
                                                                value={rangeValue}
                                                                lang={pickerLang}
                                                                //theme="light"
                                                                onChange={this.handleRangeChange}
                                                                onDismiss={this.handleRangeDissmis}
                                                            >
                                                                <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                            </Picker>
                                                        </div>
                                                    </FormGroup>}
                                                    <FormGroup>

                                                        <Label className="P-absltRadio">{i18n.t('static.common.status')}&nbsp;&nbsp;</Label>

                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="active"
                                                                value={true}
                                                                checked={this.state.budget.active === true}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-active1">
                                                                {i18n.t('static.common.active')}
                                                            </Label>
                                                        </FormGroup>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active2"
                                                                name="active"
                                                                value={false}
                                                                checked={this.state.budget.active === false}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-active2">
                                                                {i18n.t('static.common.disabled')}
                                                            </Label>
                                                        </FormGroup>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="notes">{i18n.t('static.program.notes')}</Label>
                                                        <Input
                                                            value={this.state.budget.notes}
                                                            name="notes"
                                                            id="notes"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.dataChange(e) }}
                                                            // maxLength={600}
                                                            type="textarea"
                                                        />
                                                        <FormFeedback className="red"></FormFeedback>
                                                    </FormGroup>
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>

                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                        <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                                                        &nbsp;
                                                    </FormGroup>
                                                </CardFooter>
                                            </Form>

                                        )} />
                        </Card>
                    </Col>
                </Row>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
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
        BudgetService.getBudgetDataById(this.props.match.params.budgetId)
            .then(response => {

                // var getBudgetAmount = this.CommaFormatted(response.data.budgetAmt);
                // response.data.budgetAmt = getBudgetAmount;
                var startDate = moment(response.data.startDate).format("YYYY-MM-DD");
                var stopDate = moment(response.data.stopDate).format("YYYY-MM-DD");
                this.setState({
                    budget: response.data,
                    rangeValue: { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(stopDate).getFullYear(), month: new Date(stopDate).getMonth() + 1 } }
                });
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
}

export default EditBudgetComponent;
