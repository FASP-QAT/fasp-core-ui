import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Form, FormFeedback, FormGroup, Input, Label, ModalFooter } from 'reactstrap';
import * as Yup from 'yup';
import { API_URL, SPACE_REGEX } from '../../Constants';
import JiraTikcetService from '../../api/JiraTikcetService';
import i18n from '../../i18n';
import TicketPriorityComponent from './TicketPriorityComponent';
let summaryText_1 = (i18n.t("static.common.add") + " " + i18n.t("static.realm.realm"))
let summaryText_2 = "Add Realm"
/**
 * This const is used to define the validation schema for realm ticket component
 * @param {*} values 
 * @returns 
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        realmName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.realm.realmNameText')),
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
        noOfMonthsInFutureForTopDashboard: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .min(0, i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.validated.restrictionNoOfMonthsInFutureForTopDashboard')),
        noOfMonthsInPastForBottomDashboard: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .min(0, i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.validated.restrictionNoOfMonthsInPastForBottomDashboard')),
        noOfMonthsInPastForTopDashboard: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .min(0, i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.validated.restrictionNoOfMonthsInPastForTopDashboard')),
        noOfMonthsInFutureForBottomDashboard: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .min(0, i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.validated.restrictionNoOfMonthsInFutureForBottomDashboard')),
    })
}
/**
 * This component is used to display the realm form and allow user to submit the add master request in jira
 */
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
                notes: "",
                priority: 3,
                noOfMonthsInPastForBottomDashboard: 6,
                noOfMonthsInFutureForBottomDashboard: 18,
                noOfMonthsInPastForTopDashboard: 0,
                noOfMonthsInFutureForTopDashboard: 18
            },
            lang: localStorage.getItem('lang'),
            message: '',
            loading: false
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.updatePriority = this.updatePriority.bind(this);
    }
    /**
     * This function is called when some data in the form is changed
     * @param {*} event This is the on change event
     */
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
        if (event.target.name === "noOfMonthsInFutureForTopDashboard") {
            realm.noOfMonthsInFutureForTopDashboard = event.target.value
        }
        if (event.target.name === "noOfMonthsInPastForBottomDashboard") {
            realm.noOfMonthsInPastForBottomDashboard = event.target.value
        }
        if (event.target.name === "noOfMonthsInPastForTopDashboard") {
            realm.noOfMonthsInPastForTopDashboard = event.target.value
        }
        if (event.target.name === "noOfMonthsInFutureForBottomDashboard") {
            realm.noOfMonthsInFutureForBottomDashboard = event.target.value
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
    /**
     * This function is used to hide the messages that are there in div2 after 30 seconds
     */
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is used to update the ticket priority in state
     * @param {*} newState - This the selected priority
     */
    updatePriority(newState) {
        // console.log('priority - : '+newState);
        let { realm } = this.state;
        realm.priority = newState;
        this.setState(
            {
                realm
            }, () => {
                // console.log('priority - state : '+this.state.realm.priority);
            }
        );
    }

    /**
     * This function is called when reset button is clicked to reset the realm details
     */
    resetClicked() {
        let { realm } = this.state;
        realm.realmName = '';
        realm.realmCode = '';
        realm.minMosMinGaurdrail = '';
        realm.minMosMaxGaurdrail = '';
        realm.maxMosMaxGaurdrail = '';
        realm.notes = '';
        realm.priority = 3;
        realm.noOfMonthsInPastForBottomDashboard = 6;
        realm.noOfMonthsInFutureForBottomDashboard = 18;
        realm.noOfMonthsInPastForTopDashboard = 0;
        realm.noOfMonthsInFutureForTopDashboard = 18;
        this.setState({
            realm
        },
            () => { });
    }
    /**
     * This is used to display the content
     * @returns This returns realm details form
     */
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
                            notes: this.state.realm.notes,
                            priority: 3,
                            noOfMonthsInFutureForTopDashboard: this.state.noOfMonthsInFutureForTopDashboard,
                            noOfMonthsInPastForBottomDashboard: this.state.noOfMonthsInPastForBottomDashboard,
                            noOfMonthsInPastForTopDashboard: this.state.noOfMonthsInPastForTopDashboard,
                            noOfMonthsInFutureForBottomDashboard: this.state.noOfMonthsInFutureForBottomDashboard
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.realm.summary = summaryText_2;
                            this.state.realm.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(values).then(response => {
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
                                        <Label>{i18n.t('static.realm.noOfMonthsInPastForTopDashboard')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="number"
                                            name="noOfMonthsInPastForTopDashboard"
                                            id="noOfMonthsInPastForTopDashboard"
                                            bsSize="sm"
                                            valid={!errors.noOfMonthsInPastForTopDashboard && this.state.realm.noOfMonthsInPastForTopDashboard != ''}
                                            invalid={touched.noOfMonthsInPastForTopDashboard && !!errors.noOfMonthsInPastForTopDashboard}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            value={this.state.realm.noOfMonthsInPastForTopDashboard}
                                            required />
                                        <FormFeedback className="red">{errors.noOfMonthsInPastForTopDashboard}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>{i18n.t('static.realm.noOfMonthsInFutureForTopDashboard')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="number"
                                            name="noOfMonthsInFutureForTopDashboard"
                                            id="noOfMonthsInFutureForTopDashboard"
                                            bsSize="sm"
                                            valid={!errors.noOfMonthsInFutureForTopDashboard && this.state.realm.noOfMonthsInFutureForTopDashboard != ''}
                                            invalid={touched.noOfMonthsInFutureForTopDashboard && !!errors.noOfMonthsInFutureForTopDashboard}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            value={this.state.realm.noOfMonthsInFutureForTopDashboard}
                                            required />
                                        <FormFeedback className="red">{errors.noOfMonthsInFutureForTopDashboard}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>{i18n.t('static.realm.noOfMonthsInPastForBottomDashboard')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="number"
                                            name="noOfMonthsInPastForBottomDashboard"
                                            id="noOfMonthsInPastForBottomDashboard"
                                            bsSize="sm"
                                            valid={!errors.noOfMonthsInPastForBottomDashboard && this.state.realm.noOfMonthsInPastForBottomDashboard != ''}
                                            invalid={touched.noOfMonthsInPastForBottomDashboard && !!errors.noOfMonthsInPastForBottomDashboard}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            value={this.state.realm.noOfMonthsInPastForBottomDashboard}
                                            required />
                                        <FormFeedback className="red">{errors.noOfMonthsInPastForBottomDashboard}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>{i18n.t('static.realm.noOfMonthsInFutureForBottomDashboard')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="number"
                                            name="noOfMonthsInFutureForBottomDashboard"
                                            id="noOfMonthsInFutureForBottomDashboard"
                                            bsSize="sm"
                                            valid={!errors.noOfMonthsInFutureForBottomDashboard && this.state.realm.noOfMonthsInFutureForBottomDashboard != ''}
                                            invalid={touched.noOfMonthsInFutureForBottomDashboard && !!errors.noOfMonthsInFutureForBottomDashboard}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            value={this.state.realm.noOfMonthsInFutureForBottomDashboard}
                                            required />
                                        <FormFeedback className="red">{errors.noOfMonthsInFutureForBottomDashboard}</FormFeedback>
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
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <TicketPriorityComponent priority={this.state.realm.priority} updatePriority={this.updatePriority} errors={errors} touched={touched} />
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                        <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className=" mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="mr-1"><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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