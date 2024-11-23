import { Formik } from 'formik';
import React, { Component } from 'react';
import 'react-select/dist/react-select.min.css';
import { Button, Form, FormFeedback, FormGroup, Input, Label, ModalFooter } from 'reactstrap';
import * as Yup from 'yup';
import { API_URL, SPACE_REGEX } from '../../Constants';
import JiraTikcetService from '../../api/JiraTikcetService';
import i18n from '../../i18n';
import TicketPriorityComponent from './TicketPriorityComponent';
let summaryText_1 = (i18n.t("static.common.add") + " " + i18n.t("static.usagePeriod.usagePeriod"))
let summaryText_2 = "Add Usage Period"
/**
 * This const is used to define the validation schema for usage period ticket component
 * @param {*} values 
 * @returns 
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        usagePeriodName: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required('Enter Usage Period'),
        conversionFactor: Yup.string()
            .matches(/^\d{1,5}(\.\d{1,8})?$/, i18n.t('static.usagePeriod.conversionFactorTestString'))
            .required('Enter conversion factor to month').min(0, i18n.t('static.program.validvaluetext')),
    })
}
/**
 * This component is used to display the usage period form and allow user to submit the add master request in jira
 */
export default class OrganisationTypeTicketComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            usagePeriod: {
                summary: summaryText_1,
                usagePeriodName: "",
                conversionFactor: '',
                notes: '',
                priority: 3
            },
            lang: localStorage.getItem('lang'),
            message: '',
            realms: [],
            realm: '',
            loading: true,
            priority: 3
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.updatePriority = this.updatePriority.bind(this);
    }
    /**
     * This function is called when some data in the form is changed
     * @param {*} event This is the on change event
     */
    dataChange(event) {
        let { usagePeriod } = this.state
        if (event.target.name == "summary") {
            usagePeriod.summary = event.target.value;
        }
        if (event.target.name === "usagePeriodName") {
            usagePeriod.usagePeriodName = event.target.value
        }
        if (event.target.name == "conversionFactor") {
            usagePeriod.conversionFactor = event.target.value;
        }
        if (event.target.name == "notes") {
            usagePeriod.notes = event.target.value;
        }
        this.setState({
            usagePeriod
        }, () => { })
    };
    /**
     * This function is used to capitalize the first letter of the unit name
     * @param {*} str This is the name of the unit
     */
    Capitalize(str) {
        this.state.usagePeriod.usagePeriodName = str.charAt(0).toUpperCase() + str.slice(1)
    }
    /**
     * This function is used to set loading screen off on page load
     */
    componentDidMount() {
        this.setState({ loading: false })
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
     * This function is called when reset button is clicked to reset the usage period details
     */
    resetClicked() {
        let { usagePeriod } = this.state;
        usagePeriod.usagePeriodName = '';
        usagePeriod.conversionFactor = '';
        usagePeriod.notes = '';
        usagePeriod.priority = 3;
        this.setState({
            usagePeriod: usagePeriod,
        },
            () => { });
    }

    /**
     * This function is used to update the ticket priority in state
     * @param {*} newState - This the selected priority
     */
    updatePriority(newState){
        // console.log('priority - : '+newState);
        let { usagePeriod } = this.state;
        usagePeriod.priority = newState;
        this.setState(
            {
                usagePeriod
            }, () => {
                // console.log('priority - state : '+this.state.usagePeriod.priority);
            }
        );
    }

    /**
     * This is used to display the content
     * @returns This returns usage period details form
     */
    render() {
        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.usagePeriod.usagePeriod')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        enableReinitialize={true}
                        initialValues={{
                            summary: summaryText_1,
                            usagePeriodName: '',
                            conversionFactor: '',
                            notes: '',
                            priority: 3
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.usagePeriod.summary = summaryText_2;
                            this.state.usagePeriod.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(this.state.usagePeriod).then(response => {
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
                                            case 409:
                                                this.setState({
                                                    message: i18n.t('static.common.accessDenied'),
                                                    loading: false,
                                                    color: "#BA0C2F",
                                                });
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
                                setFieldTouched
                            }) => (
                                <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">
                                    < FormGroup >
                                        <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="summary" id="summary" readOnly={true}
                                            bsSize="sm"
                                            valid={!errors.summary && this.state.usagePeriod.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.usagePeriod.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="usagePeriodName">{i18n.t('static.usagePeriod.usagePeriod')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="usagePeriodName" id="usagePeriodName"
                                            bsSize="sm"
                                            valid={!errors.usagePeriodName && this.state.usagePeriod.usagePeriodName != ''}
                                            invalid={touched.usagePeriodName && !!errors.usagePeriodName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value); }}
                                            onBlur={(e) => { handleBlur(e); }}
                                            value={this.state.usagePeriod.usagePeriodName}
                                            required />
                                        <FormFeedback className="red">{errors.usagePeriodName}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="conversionFactor">{i18n.t('static.usagePeriod.conversionFactor')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="number" name="conversionFactor" id="conversionFactor"
                                            bsSize="sm"
                                            valid={!errors.conversionFactor && this.state.usagePeriod.conversionFactor != ''}
                                            invalid={touched.conversionFactor && !!errors.conversionFactor}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={(e) => { handleBlur(e); }}
                                            value={this.state.usagePeriod.conversionFactor}
                                            required />
                                        <FormFeedback className="red">{errors.conversionFactor}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={600}
                                            value={this.state.usagePeriod.notes}
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <TicketPriorityComponent priority={this.state.usagePeriod.priority} updatePriority={this.updatePriority} errors={errors} touched={touched}/>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                        <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="mr-1" disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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