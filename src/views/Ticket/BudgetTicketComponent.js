import classNames from 'classnames';
import { Date } from 'core-js';
import { Formik } from 'formik';
import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { Button, Form, FormFeedback, FormGroup, Input, Label, ModalFooter } from 'reactstrap';
import * as Yup from 'yup';
import '../../../node_modules/react-datepicker/dist/react-datepicker.css';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_SM, DATE_PLACEHOLDER_TEXT, SPACE_REGEX, SPECIAL_CHARECTER_WITH_NUM } from '../../Constants.js';
import CurrencyService from '../../api/CurrencyService';
import FundingSourceService from '../../api/FundingSourceService';
import JiraTikcetService from '../../api/JiraTikcetService';
import ProgramService from '../../api/ProgramService';
import i18n from '../../i18n';
import TicketPriorityComponent from './TicketPriorityComponent.js';
let summaryText_1 = (i18n.t("static.common.add") + " " + i18n.t("static.dashboard.budget"))
let summaryText_2 = "Add Budget"
/**
 * This const is used to define the validation schema for budget ticket component
 * @param {*} values 
 * @returns 
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        programName: Yup.string()
            .required(i18n.t('static.budget.programtext').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.budget.program')))),
        fundingSourceName: Yup.string()
            .required(i18n.t('static.fundingSource.selectFundingSource').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.budget.fundingsource')))),
        budgetName: Yup.string()
            .required(i18n.t('static.budget.budgetamountdesc')),
        budgetCode: Yup.string()
            .matches(SPECIAL_CHARECTER_WITH_NUM, i18n.t('static.validNoSpace.string'))
            .max(30, i18n.t('static.common.max30digittext'))
            .required(i18n.t('static.budget.budgetDisplayNameText')),
        currency: Yup.string()
            .required(i18n.t('static.country.currencytext')),
        budgetAmount: Yup.string()
            .matches(/^\s*(?=.*[1-9])\d{1,15}(?:\.\d{1,2})?\s*$/, i18n.t('static.program.validBudgetAmount'))
            .required(i18n.t('static.budget.budgetamounttext')),
        startDate: Yup
            .string().required(i18n.t('static.budget.startdatetext')).nullable().default(undefined),
        stopDate: Yup.string()
            .required(i18n.t('static.budget.stopdatetext')).nullable().default(undefined),
    })
}
/**
 * This component is used to display the budget form and allow user to submit the master request in jira
 */
export default class BudgetTicketComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            budget: {
                summary: summaryText_1,
                programName: "",
                fundingSourceName: "",
                budgetName: "",
                budgetCode: "",
                currency: "",
                budgetAmount: "",
                startDate: "",
                stopDate: "",
                notes: "",
                priority: ''
            },
            lang: localStorage.getItem('lang'),
            message: '',
            programs: [],
            fundingSources: [],
            currencies: [],
            programId: [],
            fundingSourceId: '',
            currencyId: '',
            loading: true
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.addMonths = this.addMonths.bind(this);
        this.dataChangeDate = this.dataChangeDate.bind(this);
        this.dataChangeEndDate = this.dataChangeEndDate.bind(this);
        this.programChange = this.programChange.bind(this);
        this.updatePriority = this.updatePriority.bind(this);
    }
    /**
     * This function is called when program in the form is changed
     * @param {*} programId This is the list of program Ids selected by the user
     */
    programChange(programId) {
        let { budget } = this.state;
        var selectedArray = [];
        for (var p = 0; p < programId.length; p++) {
            selectedArray.push(programId[p].value);
        }
        if (selectedArray.includes("-1")) {
            this.setState({ programId: [] });
            var list = this.state.programs.filter(c => c.value != -1)
            this.setState({ programId: list });
            var programId = list;
            budget.programName = [...new Set(list.map(ele => ele.label))];
        } else {
            this.setState({ programId: programId });
            budget.programName = [...new Set(programId.map(ele => ele.label))];
            var programId = programId;
        }
        var programIdArray = [];
        for (var i = 0; i < programId.length; i++) {
            programIdArray[i] = {
                id: programId[i].value
            }
        }
    }
    /**
     * This function is called when some data in the form is changed
     * @param {*} event This is the on change event
     */
    dataChange(event) {
        let { budget } = this.state
        if (event.target.name == "summary") {
            budget.summary = event.target.value;
        }
        if (event.target.name === "budgetName") {
            budget.budgetName = event.target.value;
        }
        if (event.target.name === "programName") {
            budget.programName = event.target.value !== "" ? this.state.programs.filter(c => c.programId == event.target.value)[0].label.label_en : "";
            this.setState({
                programId: event.target.value
            })
        }
        if (event.target.name === "fundingSourceName") {
            budget.fundingSourceName = event.target.value !== "" ? this.state.fundingSources.filter(c => c.fundingSourceId == event.target.value)[0].label.label_en : "";
            this.setState({
                fundingSourceId: event.target.value
            })
        }
        if (event.target.name === "budgetAmount") {
            budget.budgetAmount = event.target.value;
        }
        if (event.target.name === "budgetCode") {
            budget.budgetCode = event.target.value.toUpperCase();
        }
        if (event.target.name === "currency") {
            budget.currency = event.target.value !== "" ? this.state.currencies.filter(c => c.currencyId == event.target.value)[0].label.label_en : "";
            this.setState({
                currencyId: event.target.value
            })
        }
        if (event.target.name == "notes") {
            budget.notes = event.target.value;
        }
        this.setState({
            budget
        }, () => { })
    };
    /**
     * This function is used to get program, funding source and currency lists
     */
    componentDidMount() {
        ProgramService.getProgramList()
            .then(response => {
                if (response.status == 200) {
                    var programList = [{ value: "-1", label: i18n.t("static.common.all") }];
                    for (var i = 0; i < response.data.length; i++) {
                        programList[i + 1] = { value: response.data[i].programId, label: getLabelText(response.data[i].label, this.state.lang) }
                    }
                    var listArray = programList;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.label.toUpperCase();
                        var itemLabelB = b.label.toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        programs: listArray, loading: false
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
        FundingSourceService.getFundingSourceListAll()
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    fundingSources: listArray, loading: false
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
        CurrencyService.getCurrencyList().then(response => {
            if (response.status == 200) {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    currencies: listArray, loading: false
                })
            } else {
                this.setState({ message: response.data.messageCode })
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
     * This function is used to hide the messages that are there in div2 after 30 seconds
     */
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is called when reset button is clicked to reset the budget details
     */
    resetClicked() {
        let { budget } = this.state;
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
            budget: budget,
            programId: [],
            fundingSourceId: '',
            currencyId: ''
        },
            () => { });
    }
    /**
     * This function is used to add the months for start date min
     * @param {*} date This is the date on on which months should be added
     * @param {*} months This is the no of months that should be added
     * @returns This function returns date after added months
     */
    addMonths(date, months) {
        date.setMonth(date.getMonth() + months);
        return date;
    }
    /**
     * This function is called when start date is changed
     * @param {*} date This is the value start date selected by user
     */
    dataChangeDate(date) {
        let { budget } = this.state
        budget.startDate = date;
        this.setState({ budget: budget });
    }
    /**
     * This function is called when end date is changed
     * @param {*} date This is the value end date selected by user
     */
    dataChangeEndDate(date) {
        let { budget } = this.state;
        budget.stopDate = date;
        this.setState({ budget: budget });
    }
    /**
     * This function is used to update the ticket priority in state
     * @param {*} newState - This the selected priority
     */
    updatePriority(newState){
        // console.log('priority - : '+newState);
        let { budget } = this.state;
        budget.priority = newState;
        this.setState(
            {
                budget
            }, () => {
                // console.log('priority - state : '+this.state.budget.priority);
            }
        );
    }
    /**
     * This is used to display the content
     * @returns This returns budget details form
     */
    render() {
        const { fundingSources } = this.state;
        const { currencies } = this.state;
        let fundingSourceList = fundingSources.length > 0 && fundingSources.map((item, i) => {
            return (
                <option key={i} value={item.fundingSourceId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);
        let currencyList = currencies.length > 0 && currencies.map((item, i) => {
            return (
                <option key={i} value={item.currencyId}>
                    {getLabelText(item.label, this.state.lang)}
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
                        enableReinitialize={true}
                        initialValues={{
                            summary: summaryText_1,
                            programName: "",
                            fundingSourceName: "",
                            budgetName: "",
                            budgetCode: "",
                            currency: "",
                            budgetAmount: "",
                            notes: "",
                            priority: ''
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.budget.summary = summaryText_2;
                            this.state.budget.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(this.state.budget).then(response => {
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
                                    <FormGroup className="Selectcontrol-bdrNone">
                                        <Label htmlFor="programId">{i18n.t('static.dataSource.program')}</Label>
                                        <Select
                                            className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                { 'is-valid': !errors.programName && this.state.programId.length != 0 },
                                                { 'is-invalid': (touched.programName && !!errors.programName) }
                                            )}
                                            bsSize="sm"
                                            onChange={(e) => {
                                                handleChange(e);
                                                setFieldValue("programName", e);
                                                this.programChange(e);
                                            }}
                                            onBlur={() => setFieldTouched("programName", true)}
                                            name="programName"
                                            id="programName"
                                            multi
                                            required
                                            options={this.state.programs}
                                            value={this.state.programId}
                                        />
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
                                        <Label for="budget">{i18n.t('static.budget.budgetDisplayName')}<span className="red Reqasterisk">*</span></Label>
                                        <Input type="text"
                                            name="budgetCode"
                                            id="budgetCode"
                                            bsSize="sm"
                                            valid={!errors.budgetCode && this.state.budget.budgetCode != ''}
                                            invalid={touched.budgetCode && !!errors.budgetCode}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            value={this.state.budget.budgetCode}
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
                                        <Label for="startDate">{i18n.t('static.common.startdate')}<span className="red Reqasterisk">*</span></Label>
                                        <DatePicker
                                            id="startDate"
                                            name="startDate"
                                            bsSize="sm"
                                            minDate={this.addMonths(new Date(), -6)}
                                            selected={this.state.budget.startDate}
                                            onChange={(date) => {
                                                handleChange(date);
                                                setFieldValue("startDate", date);
                                                this.dataChangeDate(date)
                                            }}
                                            onBlur={() => setFieldTouched("startDate", true)}
                                            className={classNames('form-control', 'd-block', 'w-100',
                                                { 'is-valid': !errors.startDate && this.state.budget.startDate != '' },
                                                { 'is-invalid': (touched.startDate && !!errors.startDate) }
                                            )}
                                            placeholderText={DATE_PLACEHOLDER_TEXT}
                                            disabledKeyboardNavigation
                                            autoComplete={"off"}
                                            dateFormat={DATE_FORMAT_SM}
                                        />
                                        <div className="red">{(touched.startDate && !!errors.startDate ? errors.startDate : '')}</div>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="stopDate">{i18n.t('static.common.stopdate')}<span className="red Reqasterisk">*</span></Label>
                                        <DatePicker
                                            id="stopDate"
                                            name="stopDate"
                                            bsSize="sm"
                                            minDate={this.state.budget.startDate}
                                            selected={this.state.budget.stopDate}
                                            onChange={(date) => {
                                                handleChange(date);
                                                setFieldValue("stopDate", date);
                                                this.dataChangeEndDate(date)
                                            }}
                                            onBlur={() => setFieldTouched("stopDate", true)}
                                            className={classNames('form-control', 'd-block', 'w-100',
                                                { 'is-valid': !errors.stopDate && this.state.budget.stopDate != '' },
                                                { 'is-invalid': (touched.stopDate && !!errors.stopDate) }
                                            )}
                                            placeholderText={DATE_PLACEHOLDER_TEXT}
                                            disabledKeyboardNavigation
                                            autoComplete={"off"}
                                            dateFormat={DATE_FORMAT_SM}
                                        />
                                        <div className="red">{(touched.stopDate && !!errors.stopDate ? errors.stopDate : '')}</div>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            valid={!errors.notes && this.state.budget.notes != ''}
                                            invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={600}
                                            value={this.state.budget.notes}
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <TicketPriorityComponent priority={this.state.budget.priority} updatePriority={this.updatePriority} />
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                        <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="mr-1" disabled={!isValid}><i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>
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