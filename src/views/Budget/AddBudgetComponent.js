import classNames from 'classnames';
import { Date } from 'core-js';
import { Formik } from 'formik';
import React, { Component } from 'react';
import Picker from 'react-month-picker';
import Select from 'react-select';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, PROGRAM_TYPE_SUPPLY_PLAN, REPORT_DATEPICKER_END_MONTH, REPORT_DATEPICKER_START_MONTH, SPECIAL_CHARECTER_WITH_NUM } from '../../Constants.js';
import BudgetService from "../../api/BudgetService";
import CurrencyService from '../../api/CurrencyService.js';
import DropdownService from '../../api/DropdownService';
import FundingSourceService from '../../api/FundingSourceService';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// Localized entity name
const entityname = i18n.t('static.dashboard.budget');

// Initial values for form fields
const initialValues = {
    budget: '',
    programId: [],
    fundingSourceId: '',
    budgetAmt: '',
    programList: [],
    budgetCode: '',
    fundingSourceList: [],
    currencyId: ''
}
/**
 * Defines the validation schema for budget details.
 * @param {*} values - Form values.
 * @param {*} t 
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values, t) {
    return Yup.object().shape({
        budget: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.budget.budgetamountdesc')),
        fundingSourceId: Yup.string()
            .required(i18n.t('static.budget.fundingtext')),
        budgetAmt: Yup.string()
            .matches(/^\d{0,15}(,\d{3})*(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount'))
            .required(i18n.t('static.budget.budgetamounttext')).min(0, i18n.t('static.program.validvaluetext')),
        currencyId: Yup.string()
            .required(i18n.t('static.country.currencytext')),
        budgetCode: Yup.string()
            .matches(SPECIAL_CHARECTER_WITH_NUM, i18n.t('static.validNoSpace.string'))
            .max(30, i18n.t('static.common.max30digittext'))
            .required(i18n.t('static.budget.budgetDisplayNameText')),
    })
}
/**
 * Component for adding budget details.
 */
class AddBudgetComponent extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        this.state = {
            loading: true,
            programs: [],
            fundingSources: [],
            currencyList: [],
            message: '',
            lang: localStorage.getItem('lang'),
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
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
                programs: []
            },
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.pickRange = React.createRef();
        this.programChange = this.programChange.bind(this);
    }
    /**
     * Handles change in selected programs.
     * @param {Array} programId - Selected program IDs.
     */
    programChange(programId) {
        var selectedArray = [];
        for (var p = 0; p < programId.length; p++) {
            selectedArray.push(programId[p].value);
        }
        if (selectedArray.includes("-1")) {
            this.setState({ programId: [] });
            var list = this.state.programs.filter(c => c.value != -1)
            this.setState({ programId: list });
            var programId = list;
        } else {
            this.setState({ programId: programId });
            var programId = programId;
        }
        let { budget } = this.state;
        var programIdArray = [];
        for (var i = 0; i < programId.length; i++) {
            programIdArray[i] = {
                id: programId[i].value
            }
        }
        budget.programs = programIdArray;
        this.setState({
            budget,
        },
            () => { });
    }
    /**
     * Show budget date range picker
     * @param {Event} e -  The click event.
     */
    _handleClickRangeBox(e) {
        this.pickRange.current.show()
    }
    /**
     * Handle date range change
     * @param {*} value 
     * @param {*} text 
     * @param {*} listIndex 
     */
    handleRangeChange(value, text, listIndex) {
    }
    /**
     * Update budget range after date range picker is closed
     * @param {*} value 
     */
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value })
    }
    /**
     * Capitalizes the first letter of the budget name.
     * @param {string} str - The budget name.
     */
    Capitalize(str) {
        let { budget } = this.state
        budget.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }
    /**
     * Handles data change in the budget form.
     * @param {Event} event - The change event.
     */
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
            budget.budgetAmt = event.target.value;
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
        else if (event.target.name === "notes") {
            budget.notes = event.target.value;
        }
        this.setState({
            budget
        },
            () => { });
    };
    /**
     * Hides the message in div2 after 30 seconds.
     */
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * Fetches RealmId, Program list, Funding source list and Currency list on component mount.
     */
    componentDidMount() {
        this.setState({ loading: true })
        // Fetch realmId
        let realmId = AuthenticationService.getRealmId();
        //Fetch Program list
        DropdownService.getProgramForDropdown(realmId, PROGRAM_TYPE_SUPPLY_PLAN)
            .then(response => {
                if (response.status == 200) {
                    var programList = [];
                    var responseData = response.data.filter(c => c.active);
                    for (var i = 0; i < responseData.length; i++) {
                        programList[i + 1] = { value: responseData[i].id, label: getLabelText(responseData[i].label, this.state.lang) }
                    }
                    var listArray = programList;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.label.toUpperCase();
                        var itemLabelB = b.label.toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    listArray.unshift({ value: "-1", label: i18n.t("static.common.all") });
                    this.setState({
                        programs: listArray, loading: false
                    })
                }
                else {
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
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
        //Fetch all funding source list
        FundingSourceService.getFundingSourceListAll()
            .then(response => {
                var listArray = response.data.filter(c => (c.allowedInBudget == true || c.allowedInBudget == "true"));
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    fundingSources: listArray
                    , loading: false
                })
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
        //Fetch currency list
        CurrencyService.getCurrencyList().then(response => {
            if (response.status == 200) {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    currencyList: listArray, loading: false
                })
            } else {
                this.setState({ message: response.data.messageCode, loading: false })
            }
        }).catch(
            error => {
                if (error.message === "Network Error") {
                    this.setState({
                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
    /**
     * Renders the budget details form.
     * @returns {JSX.Element} - Budget details form.
     */
    render() {
        const { fundingSources } = this.state;
        const { currencyList } = this.state;
        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state
        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }
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
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    let { budget } = this.state;
                                    let budget1 = this.state.budget;
                                    var getCurrencyId = this.state.budget.currency.currencyId;
                                    var currencyId = getCurrencyId.split("~");
                                    budget.currency.currencyId = currencyId[0];
                                    var amount = this.state.budget.budgetAmt.replace(/,/g, '');
                                    budget.budgetAmt = amount;
                                    let rangeValue = this.state.rangeValue;
                                    let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
                                    let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
                                    budget.startDate = startDate;
                                    budget.stopDate = stopDate;
                                    for (var i = 0; i < budget.programs.length; i++) {
                                        if (budget.programs[i].id == 0) {
                                            budget.programs = []
                                        }
                                    }
                                    BudgetService.addBudget(budget)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/budget/listBudget/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode, loading: false
                                                },
                                                    () => {
                                                        this.hideSecondComponent();
                                                    })
                                            }
                                        })
                                        .catch(
                                            error => {
                                                let budget = budget1;
                                                budget.currency.currencyId = budget1.currency.currencyId + "~" + budget1.currency.conversionRateToUsd;
                                                this.setState({
                                                    budget: budget
                                                }, () => {
                                                })
                                                if (error.message === "Network Error") {
                                                    this.setState({
                                                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                                                        case 409:
                                                            this.setState({
                                                                message: i18n.t('static.budget.duplicateDisplayName'),
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
                                        handleReset,
                                        setFieldValue,
                                        setFieldTouched,
                                        setFieldError
                                    }) => (
                                        <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='budgetForm' autocomplete="off">
                                            <CardBody style={{ display: this.state.loading ? "none" : "block" }}>
                                                <FormGroup className="Selectcontrol-bdrNone">
                                                    <Label htmlFor="programId">{i18n.t('static.dataSource.program')}</Label>
                                                    <Select
                                                        className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                            { 'is-valid': !errors.programId && this.state.budget.programs.length != 0 },
                                                            { 'is-invalid': (touched.programId && !!errors.programId) }
                                                        )}
                                                        bsSize="sm"
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            setFieldValue("programId", e);
                                                            this.programChange(e);
                                                        }}
                                                        onBlur={() => setFieldTouched("programId", true)}
                                                        name="programId"
                                                        id="programId"
                                                        multi
                                                        required
                                                        options={this.state.programs}
                                                        value={this.state.programId}
                                                        placeholder={i18n.t('static.common.select')}
                                                    />
                                                    <FormFeedback className="red">{errors.programId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="fundingSourceId">{i18n.t('static.budget.fundingsource')}<span className="red Reqasterisk">*</span></Label>
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
                                                    <FormFeedback className="red">{errors.fundingSourceId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="budget">{i18n.t('static.budget.budget')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        name="budget"
                                                        id="budget"
                                                        bsSize="sm"
                                                        valid={!errors.budget && this.state.budget.label.label_en != ''}
                                                        invalid={(touched.budget && !!errors.budget) || (touched.budget && this.state.budget.label.label_en == '')}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.budget.label.label_en}
                                                        required />
                                                    <FormFeedback className="red">{errors.budget}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="budget">{i18n.t('static.budget.budgetDisplayName')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        name="budgetCode"
                                                        id="budgetCode"
                                                        bsSize="sm"
                                                        valid={!errors.budgetCode && this.state.budget.budgetCode != ''}
                                                        invalid={touched.budgetCode && !!errors.budgetCode}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        maxLength={30}
                                                        value={this.state.budget.budgetCode}
                                                        required />
                                                    <FormFeedback className="red">{errors.budgetCode}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="currencyId">{i18n.t("static.country.currency")}<span className="red Reqasterisk">*</span></Label>
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
                                                    <Input
                                                        type="number"
                                                        name="budgetAmt"
                                                        id="budgetAmt"
                                                        bsSize="sm"
                                                        valid={!errors.budgetAmt && this.state.budget.budgetAmt != ''}
                                                        invalid={touched.budgetAmt && !!errors.budgetAmt}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        type="text"
                                                        value={this.state.budget.budgetAmt}
                                                        required />
                                                    <FormFeedback className="red">{errors.budgetAmt}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.budget.budgetrange')}</Label>
                                                    <div className="controls edit">
                                                        <Picker
                                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                            ref={this.pickRange}
                                                            value={rangeValue}
                                                            lang={pickerLang}
                                                            onChange={this.handleRangeChange}
                                                            onDismiss={this.handleRangeDissmis}
                                                        >
                                                            <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                        </Picker>
                                                    </div>
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
                                            </CardBody>
                                            <div style={{ display: this.state.loading ? "block" : "none" }}>
                                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                                    <div class="align-items-center">
                                                        <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                                        <div class="spinner-border blue ml-4" role="status">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <CardFooter>
                                                <FormGroup>
                                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                    <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                    <Button type="submit" size="md" color="success" className="float-right mr-1" disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                    &nbsp;
                                                </FormGroup>
                                            </CardFooter>
                                        </Form>
                                    )} />
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
    /**
     * Redirects to the list budget screen when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/budget/listBudget/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Resets the budget details form when reset button is clicked.
     */
    resetClicked() {
        let { budget } = this.state;
        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        budget.label.label_en = ''
        budget.program.id = ''
        budget.fundingSource.fundingSourceId = ''
        budget.budgetAmt = ''
        budget.startDate = ''
        budget.stopDate = ''
        budget.currency.currencyId = ''
        budget.budgetCode = ''
        budget.currency.conversionRateToUsd = ''
        this.setState({
            budget,
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
        },
            () => { });
    }
}
export default AddBudgetComponent;