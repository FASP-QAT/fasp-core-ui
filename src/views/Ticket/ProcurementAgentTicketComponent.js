import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Form, FormFeedback, FormGroup, Input, Label, ModalFooter } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, SPACE_REGEX, SPECIAL_CHARECTER_WITH_NUM } from '../../Constants';
import JiraTikcetService from '../../api/JiraTikcetService';
import ProcurementAgentService from '../../api/ProcurementAgentService';
import RealmService from '../../api/RealmService';
import i18n from '../../i18n';
import TicketPriorityComponent from './TicketPriorityComponent';
let summaryText_2 = "Add Procurement Agent"
/**
 * This const is used to define the validation schema for procurement agent ticket component
 * @param {*} values 
 * @returns 
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        realmName: Yup.string()
            .required(i18n.t('static.common.realmtext').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.realm.realmName')))),
        procurementAgentCode: Yup.string()
            .matches(SPECIAL_CHARECTER_WITH_NUM, i18n.t('static.validNoSpace.string'))
            .required(i18n.t('static.procurementagent.codetext')),
        procurementAgentName: Yup.string()
            .required(i18n.t('static.procurementAgent.procurementagentnametext')),
        submittedToApprovedLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal')),
        approvedToShippedLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal')),
    })
}
/**
 * This component is used to display the procurement agent form and allow user to submit the add master request in jira
 */
export default class ProcurementAgentTicketComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            procurementAgent: {
                summary: (i18n.t("static.common.add") + " " + i18n.t("static.procurementagent.procurementagent")),
                realmName: "",
                procurementAgentName: "",
                procurementAgentCode: "",
                submittedToApprovedLeadTime: "",
                approvedToShippedLeadTime: "",
                localProcurementAgent: false,
                notes: "",
                priority: 3
            },
            lang: localStorage.getItem('lang'),
            message: '',
            realms: [],
            realmId: '',
            loading: true
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getDisplayName = this.getDisplayName.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.updatePriority = this.updatePriority.bind(this);
    }
    /**
     * This function is called when some data in the form is changed
     * @param {*} event This is the on change event
     */
    dataChange(event) {
        let { procurementAgent } = this.state
        if (event.target.name == "summary") {
            procurementAgent.summary = event.target.value;
        }
        if (event.target.name == "realmName") {
            procurementAgent.realmName = event.target.value !== "" ? this.state.realms.filter(c => c.realmId == event.target.value)[0].label.label_en : "";
            this.setState({
                realmId: event.target.value
            })
        }
        if (event.target.name == "procurementAgentCode") {
            procurementAgent.procurementAgentCode = event.target.value.toUpperCase();
        }
        if (event.target.name == "procurementAgentName") {
            procurementAgent.procurementAgentName = event.target.value;
        }
        if (event.target.name == "submittedToApprovedLeadTime") {
            procurementAgent.submittedToApprovedLeadTime = event.target.value;
        }
        if (event.target.name == "approvedToShippedLeadTime") {
            procurementAgent.approvedToShippedLeadTime = event.target.value;
        }
        if (event.target.name === "localProcurementAgent") {
            procurementAgent.localProcurementAgent = event.target.id === "localProcurementAgent2" ? false : true
        }
        if (event.target.name == "notes") {
            procurementAgent.notes = event.target.value;
        }
        this.setState({
            procurementAgent
        }, () => { })
    };
    /**
     * This function is used to get realm list on page load
     */
    componentDidMount() {
        RealmService.getRealmListAll()
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    realms: listArray,
                    realmId: this.props.items.userRealmId, loading: false
                });
                if (this.props.items.userRealmId !== "") {
                    this.setState({
                        realms: (response.data).filter(c => c.realmId == this.props.items.userRealmId)
                    })
                    let { procurementAgent } = this.state;
                    procurementAgent.realmName = (response.data).filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en;
                    this.setState({
                        procurementAgent
                    }, () => {
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
    /**
     * This function is used to hide the messages that are there in div2 after 30 seconds
     */
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is called when reset button is clicked to reset the procurement agent details
     */
    resetClicked() {
        let { procurementAgent } = this.state;
        procurementAgent.realmName = this.props.items.userRealmId !== "" ? this.state.realms.filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en : "";
        procurementAgent.procurementAgentCode = '';
        procurementAgent.procurementAgentName = '';
        procurementAgent.submittedToApprovedLeadTime = '';
        procurementAgent.approvedToShippedLeadTime = '';
        procurementAgent.priority = 3;
        this.setState({
            procurementAgent: procurementAgent,
            realmId: this.props.items.userRealmId
        },
            () => { });
    }
    /**
     * This function is used to capitalize the first letter of the unit name
     * @param {*} str This is the name of the unit
     */
    Capitalize(str) {
        if (str != null && str != "") {
            return str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return "";
        }
    }
    /**
     * This function is used to update the ticket priority in state
     * @param {*} newState - This the selected priority
     */
    updatePriority(newState){
        // console.log('priority - : '+newState);
        let { procurementAgent } = this.state;
        procurementAgent.priority = newState;
        this.setState(
            {
                procurementAgent
            }, () => {
                // console.log('priority - state : '+this.state.procurementAgent.priority);
            }
        );
    }

    /**
     * This function is used to get the display name for procurement agent
     */
    getDisplayName() {
        let realmId = this.state.realmId;
        let procurementAgentValue = this.state.procurementAgent.procurementAgentName;
        procurementAgentValue = procurementAgentValue.replace(/[^A-Za-z0-9]/g, "");
        procurementAgentValue = procurementAgentValue.trim().toUpperCase();
        if (realmId != '' && procurementAgentValue.length != 0) {
            if (procurementAgentValue.length >= 10) {
                procurementAgentValue = procurementAgentValue.slice(0, 8);
                ProcurementAgentService.getProcurementAgentDisplayName(realmId, procurementAgentValue)
                    .then(response => {
                        let { procurementAgent } = this.state;
                        procurementAgent.procurementAgentCode = response.data;
                        this.setState({
                            procurementAgent
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
                ProcurementAgentService.getProcurementAgentDisplayName(realmId, procurementAgentValue)
                    .then(response => {
                        let { procurementAgent } = this.state;
                        procurementAgent.procurementAgentCode = response.data;
                        this.setState({
                            procurementAgent
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
    }
    /**
     * This is used to display the content
     * @returns This returns procurement agent details form
     */
    render() {
        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.procurementagent.procurementagent')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        enableReinitialize={true}
                        initialValues={{
                            summary: (i18n.t("static.common.add") + " " + i18n.t("static.procurementagent.procurementagent")),
                            realmName: this.props.items.userRealmId,
                            procurementAgentName: this.state.procurementAgent.procurementAgentName,
                            procurementAgentCode: this.state.procurementAgent.procurementAgentCode,
                            submittedToApprovedLeadTime: this.state.procurementAgent.submittedToApprovedLeadTime,
                            approvedToShippedLeadTime: this.state.procurementAgent.approvedToShippedLeadTime,
                            localProcurementAgent: false,
                            notes: "",
                            priority: 3
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.procurementAgent.summary = summaryText_2;
                            this.state.procurementAgent.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(this.state.procurementAgent).then(response => {
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
                                handleReset
                            }) => (
                                <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">
                                    < FormGroup >
                                        <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="summary" id="summary" readOnly={true}
                                            bsSize="sm"
                                            valid={!errors.summary && this.state.procurementAgent.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.procurementAgent.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label htmlFor="realmName">{i18n.t('static.realm.realmName')}<span className="red Reqasterisk">*</span></Label>
                                        <Input
                                            type="select"
                                            bsSize="sm"
                                            name="realmName"
                                            id="realmName"
                                            valid={!errors.realmName && this.state.procurementAgent.realmName != ''}
                                            invalid={touched.realmName && !!errors.realmName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            value={this.state.realmId}
                                            required
                                        >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmList}
                                        </Input>
                                                                                <FormFeedback className="red">{errors.realmName}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="procurementAgentName">{i18n.t('static.procurementagent.procurementagentname')}<span className="red Reqasterisk">*</span></Label>
                                        <Input type="text"
                                            bsSize="sm"
                                            name="procurementAgentName"
                                            id="procurementAgentName"
                                            valid={!errors.procurementAgentName && this.state.procurementAgent.procurementAgentName != ''}
                                            invalid={touched.procurementAgentName && !!errors.procurementAgentName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getDisplayName() }}
                                            onBlur={handleBlur}
                                            required
                                            value={this.Capitalize(this.state.procurementAgent.procurementAgentName)}
                                        />
                                                                                <FormFeedback className="red">{errors.procurementAgentName}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="procurementAgentCode">{i18n.t('static.procurementagent.procurementagentcode')}<span className="red Reqasterisk">*</span></Label>
                                        <Input type="text"
                                            bsSize="sm"
                                            name="procurementAgentCode"
                                            id="procurementAgentCode"
                                            valid={!errors.procurementAgentCode && this.state.procurementAgent.procurementAgentCode != ''}
                                            invalid={touched.procurementAgentCode && !!errors.procurementAgentCode}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            required
                                            maxLength={10}
                                            value={this.state.procurementAgent.procurementAgentCode}
                                        />
                                                                                <FormFeedback className="red">{errors.procurementAgentCode}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="submittedToApprovedLeadTime">{i18n.t('static.procurementagent.procurementagentsubmittoapprovetimeLabel')}</Label>
                                        <Input type="number"
                                            bsSize="sm"
                                            name="submittedToApprovedLeadTime"
                                            id="submittedToApprovedLeadTime"
                                            valid={!errors.submittedToApprovedLeadTime}
                                            invalid={touched.submittedToApprovedLeadTime && !!errors.submittedToApprovedLeadTime}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            value={this.state.procurementAgent.submittedToApprovedLeadTime}
                                        />
                                                                                <FormFeedback className="red">{errors.submittedToApprovedLeadTime}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="approvedToShippedLeadTime">{i18n.t('static.procurementagent.procurementagentapprovetoshippedtimeLabel')}</Label>
                                        <Input type="number"
                                            bsSize="sm"
                                            name="approvedToShippedLeadTime"
                                            id="approvedToShippedLeadTime"
                                            valid={!errors.approvedToShippedLeadTime}
                                            invalid={touched.approvedToShippedLeadTime && !!errors.approvedToShippedLeadTime}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            value={this.state.procurementAgent.approvedToShippedLeadTime}
                                        />
                                                                                <FormFeedback className="red">{errors.approvedToShippedLeadTime}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label className="P-absltRadio">{i18n.t('static.procurementAgent.localProcurementAgent')}  </Label>
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        <FormGroup check inline className="ml-12">
                                            <Input
                                                className="form-check-input"
                                                type="radio"
                                                id="localProcurementAgent1"
                                                name="localProcurementAgent"
                                                value={true}
                                                checked={this.state.procurementAgent.localProcurementAgent === true}
                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            />
                                            <Label
                                                className="form-check-label"
                                                check htmlFor="inline-radio1">
                                                {i18n.t('static.program.yes')}
                                            </Label>
                                        </FormGroup>
                                        <FormGroup check inline>
                                            <Input
                                                className="form-check-input"
                                                type="radio"
                                                id="localProcurementAgent2"
                                                name="localProcurementAgent"
                                                value={false}
                                                checked={this.state.procurementAgent.localProcurementAgent === false}
                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            />
                                            <Label
                                                className="form-check-label"
                                                check htmlFor="inline-radio2">
                                                {i18n.t('static.program.no')}
                                            </Label>
                                        </FormGroup>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            valid={!errors.notes && this.state.procurementAgent.notes != ''}
                                            invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={600}
                                            value={this.state.procurementAgent.notes}
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <TicketPriorityComponent priority={this.state.procurementAgent.priority} updatePriority={this.updatePriority} errors={errors} touched={touched}/>
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