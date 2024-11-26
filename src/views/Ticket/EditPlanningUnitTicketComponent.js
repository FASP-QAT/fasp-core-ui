import classNames from 'classnames';
import { Formik } from 'formik';
import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { Button, Form, FormFeedback, FormGroup, Input, Label, ModalFooter } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, SPACE_REGEX } from '../../Constants';
import JiraTikcetService from '../../api/JiraTikcetService';
import PlanningUnitService from '../../api/PlanningUnitService';
import i18n from '../../i18n';
import TicketPriorityComponent from './TicketPriorityComponent';
let summaryText_1 = (i18n.t("static.common.edit") + " " + i18n.t("static.planningunit.planningunit"))
let summaryText_2 = "Edit Planning Unit"
const initialValues = {
    summary: summaryText_1,
    planningUnitName: "",
    notes: "",
    priority: 3
}
/**
 * This const is used to define the validation schema for planning unit ticket component
 * @param {*} values 
 * @returns 
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        planningUnitName: Yup.string()
            .required(i18n.t('static.common.pleaseSelect').concat(" ").concat((i18n.t('static.planningunit.planningunit')).concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.planningunit.planningunit'))))).nullable(),
        notes: Yup.string()
            .required(i18n.t('static.program.validnotestext'))
    })
}
/**
 * This component is used to display the planning unit form and allow user to submit the update master request in jira
 */
export default class EditPlanningUnitTicketComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            planningUnit: {
                summary: summaryText_1,
                planningUnitName: '',
                notes: '',
                priority: 3
            },
            lang: localStorage.getItem('lang'),
            message: '',
            planningUnits: [],
            planningUnitList: [],
            planningUnitId: '',
            loading: true
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.changePlanningUnit = this.changePlanningUnit.bind(this);
        this.updatePriority = this.updatePriority.bind(this);
    }
    /**
     * This function is called when some data in the form is changed
     * @param {*} event This is the on change event
     */
    dataChange(event) {
        let { planningUnit } = this.state
        if (event.target.name == "summary") {
            planningUnit.summary = event.target.value;
        }
        if (event.target.name == "planningUnitName") {
            var outText = "";
            if (event.target.value !== "") {
                var planningUnitT = this.state.planningUnits.filter(c => c.planningUnitId == event.target.value)[0];
                outText = planningUnitT.label.label_en;
            }
            planningUnit.planningUnitName = outText;
            this.setState({
                planningUnitId: event.target.value
            })
        }
        if (event.target.name == "notes") {
            planningUnit.notes = event.target.value;
        }
        this.setState({
            planningUnit
        }, () => { })
    };
    /**
     * This function is called when planning unit is changed
     * @param {*} event This is the on change event
     */
    changePlanningUnit(event) {
        if (event === null) {
            let { planningUnit } = this.state;
            planningUnit.planningUnitName = ''
            this.setState({
                planningUnit: planningUnit,
                planningUnitId: ''
            });
        } else {
            let { planningUnit } = this.state;
            var outText = "";
            if (event.value !== "") {
                var planningUnitT = this.state.planningUnits.filter(c => c.planningUnitId == event.value)[0];
                outText = planningUnitT.label.label_en;
            }
            planningUnit.planningUnitName = outText;
            this.setState({
                planningUnit: planningUnit,
                planningUnitId: event.value
            });
        }
    }
    /**
     * This function is used to get planning unit lists on page load
     */
    componentDidMount() {
        if (this.props.items.userRealmId > 0) {
            PlanningUnitService.getPlanningUnitByRealmId(this.props.items.userRealmId).then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                var unitList = [];
                for (var i = 0; i < listArray.length; i++) {
                    unitList[i] = { value: listArray[i].planningUnitId, label: getLabelText(listArray[i].label, this.state.lang) }
                }
                this.setState({
                    planningUnits: listArray,
                    planningUnitList: unitList,
                    loading: false
                });
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
        } else {
            PlanningUnitService.getAllPlanningUnitList().then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                var unitList = [];
                for (var i = 0; i < listArray.length; i++) {
                    unitList[i] = { value: listArray[i].planningUnitId, label: getLabelText(listArray[i].label, this.state.lang) }
                }
                this.setState({
                    planningUnits: listArray,
                    planningUnitList: unitList,
                    loading: false
                });
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
        }
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
     * This function is used to update the ticket priority in state
     * @param {*} newState - This the selected priority
     */
    updatePriority(newState){
        // console.log('priority - : '+newState);
        let { planningUnit } = this.state;
        planningUnit.priority = newState;
        this.setState(
            {
                planningUnit
            }, () => {
                // console.log('priority - state : '+this.state.planningUnit.priority);
            }
        );
    }

    /**
     * This function is called when reset button is clicked to reset the planning unit details
     */
    resetClicked() {
        let { planningUnit } = this.state;
        planningUnit.planningUnitName = '';
        planningUnit.notes = '';
        planningUnit.priority = 3;
        this.setState({
            planningUnit: planningUnit,
            planningUnitId: ''
        },
            () => { });
    }
    /**
     * This is used to display the content
     * @returns This returns planning unit details form
     */
    render() {
        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.planningunit.planningunit')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.planningUnit.summary = summaryText_2;
                            this.state.planningUnit.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(this.state.planningUnit).then(response => {
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
                                            valid={!errors.summary && this.state.planningUnit.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.planningUnit.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="planningUnitName">{i18n.t('static.planningunit.planningunit')}<span class="red Reqasterisk">*</span></Label>
                                        <Select
                                            className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                { 'is-valid': !errors.planningUnitName && this.state.planningUnit.planningUnitName != '' },
                                                { 'is-invalid': (touched.planningUnitName && !!errors.planningUnitName) }
                                            )}
                                            bsSize="sm"
                                            name="planningUnitName"
                                            id="planningUnitName"
                                            isClearable={false}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setFieldValue("planningUnitName", e);
                                                this.changePlanningUnit(e);
                                            }}
                                            onBlur={() => setFieldTouched("planningUnitName", true)}
                                            required
                                            min={1}
                                            options={this.state.planningUnitList}
                                            value={this.state.planningUnitId}
                                        />
                                        <FormFeedback className="red">{errors.planningUnitName}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            valid={!errors.notes && this.state.planningUnit.notes != ''}
                                            invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={600}
                                            value={this.state.planningUnit.notes}
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <TicketPriorityComponent priority={this.state.planningUnit.priority} updatePriority={this.updatePriority} errors={errors} touched={touched}/>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                        <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="mr-1"  disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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