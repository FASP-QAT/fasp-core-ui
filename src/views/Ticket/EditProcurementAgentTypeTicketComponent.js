import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Form, FormFeedback, FormGroup, Input, Label, ModalFooter } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, SPACE_REGEX } from '../../Constants';
import JiraTikcetService from '../../api/JiraTikcetService';
import ProcurementAgentService from '../../api/ProcurementAgentService';
import i18n from '../../i18n';
import TicketPriorityComponent from './TicketPriorityComponent';
let summaryText_1 = (i18n.t("static.common.edit") + " " + i18n.t("static.dashboard.procurementagenttype"))
let summaryText_2 = "Edit Procurement Agent Type"
const initialValues = {
    summary: summaryText_1,
    procurementAgentTypeName: "",
    notes: "",
    priority: 3
}
/**
 * This const is used to define the validation schema for procurement agent type ticket component
 * @param {*} values 
 * @returns 
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        procurementAgentTypeName: Yup.string()
            .required(i18n.t('static.common.pleaseSelect').concat(" ").concat((i18n.t('static.dashboard.procurementagenttype')).concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.dashboard.procurementagenttype'))))),
        notes: Yup.string()
            .required(i18n.t('static.program.validnotestext'))
    })
}
/**
 * This component is used to display the procurement agent type form and allow user to submit the update master request in jira
 */
export default class EditProcurementAgentTypeTicketComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            procurementAgentType: {
                summary: summaryText_1,
                procurementAgentTypeName: "",
                notes: "",
                priority: 3
            },
            lang: localStorage.getItem('lang'),
            message: '',
            procurementAgentTypes: [],
            procurementAgentTypeId: '',
            loading: true
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
        let { procurementAgentType } = this.state
        if (event.target.name == "summary") {
            procurementAgentType.summary = event.target.value;
        }
        if (event.target.name == "procurementAgentTypeName") {
            var outText = "";
            if (event.target.value !== "") {
                var procurementAgentTypeT = this.state.procurementAgentTypes.filter(c => c.procurementAgentTypeId == event.target.value)[0];
                outText = procurementAgentTypeT.realm.label.label_en + " | " + procurementAgentTypeT.label.label_en + " | " + procurementAgentTypeT.procurementAgentTypeCode;
            }
            procurementAgentType.procurementAgentTypeName = outText;
            this.setState({
                procurementAgentTypeId: event.target.value
            })
        }
        if (event.target.name == "notes") {
            procurementAgentType.notes = event.target.value;
        }
        this.setState({
            procurementAgentType
        }, () => { })
    };
    /**
     * This function is used to get list of procurement agent type list on page load
     */
    componentDidMount() {
        ProcurementAgentService.getProcurementAgentTypeListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        procurementAgentTypes: listArray, loading: false
                    })
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
     * This function is used to update the ticket priority in state
     * @param {*} newState - This the selected priority
     */
    updatePriority(newState){
        // console.log('priority - : '+newState);
        let { procurementAgentType } = this.state;
        procurementAgentType.priority = newState;
        this.setState(
            {
                procurementAgentType
            }, () => {
                // console.log('priority - state : '+this.state.procurementAgentType.priority);
            }
        );
    }

    /**
     * This function is called when reset button is clicked to reset the procurement agent type details
     */
    resetClicked() {
        let { procurementAgentType } = this.state;
        procurementAgentType.procurementAgentTypeName = '';
        procurementAgentType.notes = '';
        procurementAgentType.priority = 3;
        this.setState({
            procurementAgentType: procurementAgentType,
            procurementAgentTypeId: ''
        },
            () => { });
    }
    /**
     * This is used to display the content
     * @returns This returns procurement agent type details form
     */
    render() {
        const { procurementAgentTypes } = this.state;
        let procurementAgentTypeList = procurementAgentTypes.length > 0
            && procurementAgentTypes.map((item, i) => {
                return (
                    <option key={i} value={item.procurementAgentTypeId}>
                        {getLabelText(item.label, this.state.lang) + " | " + item.procurementAgentTypeCode}
                    </option>
                )
            }, this);
        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.dashboard.procurementagenttype')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.procurementAgentType.summary = summaryText_2;
                            this.state.procurementAgentType.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(this.state.procurementAgentType).then(response => {
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
                                            valid={!errors.summary && this.state.procurementAgentType.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.procurementAgentType.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label htmlFor="procurementAgentName">{i18n.t('static.dashboard.procurementagenttype')}<span className="red Reqasterisk">*</span></Label>
                                        <Input
                                            type="select"
                                            bsSize="sm"
                                            name="procurementAgentTypeName"
                                            id="procurementAgentTypeName"
                                            valid={!errors.procurementAgentTypeName && this.state.procurementAgentType.procurementAgentTypeName != ''}
                                            invalid={touched.procurementAgentTypeName && !!errors.procurementAgentTypeName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            value={this.state.procurementAgentTypeId}
                                            required
                                        >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {procurementAgentTypeList}
                                        </Input>
                                        <FormFeedback className="red">{errors.procurementAgentTypeName}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            valid={!errors.notes && this.state.procurementAgentType.notes != ''}
                                            invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={600}
                                            value={this.state.procurementAgentType.notes}
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <TicketPriorityComponent priority={this.state.procurementAgentType.priority} updatePriority={this.updatePriority} errors={errors} touched={touched}/>
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