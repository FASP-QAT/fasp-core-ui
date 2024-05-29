import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Form, FormFeedback, FormGroup, Input, Label, ModalFooter } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, SPACE_REGEX, SPECIAL_CHARECTER_WITH_NUM } from '../../Constants';
import FundingSourceService from '../../api/FundingSourceService';
import JiraTikcetService from '../../api/JiraTikcetService';
import RealmService from '../../api/RealmService';
import i18n from '../../i18n';
import TicketPriorityComponent from './TicketPriorityComponent';
let summaryText_1 = (i18n.t("static.common.add") + " " + i18n.t("static.fundingsource.fundingsource"))
let summaryText_2 = "Add Funding Source"
const initialValues = {
    summary: "",
    realmName: "",
    fundingSourceName: "",
    fundingSourceCode: "",
    notes: "",
    priority: 3
}
/**
 * This const is used to define the validation schema for funding source ticket component
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
        fundingSourceName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.fundingsource.fundingsourcetext')),
        fundingSourceCode: Yup.string()
            .matches(SPECIAL_CHARECTER_WITH_NUM, i18n.t('static.validNoSpace.string'))
            .required(i18n.t('static.fundingsource.fundingsourceCodeText')),
    })
}
/**
 * This component is used to display the funding source form and allow user to submit the add master request in jira
 */
export default class FundingSourceTicketComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fundingSource: {
                summary: summaryText_1,
                realmName: "",
                fundingSourceName: "",
                fundingSourceCode: "",
                allowedInBudget: true,
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
        this.Capitalize = this.Capitalize.bind(this);
        this.getDisplayName = this.getDisplayName.bind(this);
        this.updatePriority = this.updatePriority.bind(this);
    }
    /**
     * This function is called when some data in the form is changed
     * @param {*} event This is the on change event
     */
    dataChange(event) {
        let { fundingSource } = this.state
        if (event.target.name == "summary") {
            fundingSource.summary = event.target.value;
        }
        if (event.target.name == "realmName") {
            fundingSource.realmName = event.target.value !== "" ? this.state.realms.filter(c => c.realmId == event.target.value)[0].label.label_en : "";
            this.setState({
                realmId: event.target.value
            })
        }
        if (event.target.name == "fundingSourceName") {
            fundingSource.fundingSourceName = event.target.value;
        }
        if (event.target.name == "fundingSourceCode") {
            fundingSource.fundingSourceCode = event.target.value.toUpperCase();
        }
        if (event.target.name == "allowedInBudget") {
            fundingSource.allowedInBudget = event.target.id === "allowedInBudget2" ? false : true;
        }
        if (event.target.name == "notes") {
            fundingSource.notes = event.target.value;
        }
        this.setState({
            fundingSource
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
                    let { fundingSource } = this.state;
                    fundingSource.realmName = (response.data).filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en;
                    this.setState({
                        fundingSource
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
     * This function is called when reset button is clicked to reset the funding source details
     */
    resetClicked() {
        let { fundingSource } = this.state;
        fundingSource.realmName = this.props.items.userRealmId !== "" ? this.state.realms.filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en : "";
        fundingSource.fundingSourceName = '';
        fundingSource.fundingSourceCode = '';
        fundingSource.notes = '';
        fundingSource.priority = 3;
        this.setState({
            fundingSource: fundingSource,
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
     * This function is used to get the display name based on funding source
     */
    getDisplayName() {
        let realmId = this.state.realmId;
        let fundingSourceValue = this.state.fundingSource.fundingSourceName;
        fundingSourceValue = fundingSourceValue.replace(/[^A-Za-z0-9]/g, "");
        fundingSourceValue = fundingSourceValue.trim().toUpperCase();
        if (realmId != '' && fundingSourceValue.length != 0) {
            if (fundingSourceValue.length >= 7) {
                fundingSourceValue = fundingSourceValue.slice(0, 5);
                FundingSourceService.getFundingSourceDisplayName(realmId, fundingSourceValue)
                    .then(response => {
                        let { fundingSource } = this.state;
                        fundingSource.fundingSourceCode = response.data;
                        this.setState({
                            fundingSource
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
                FundingSourceService.getFundingSourceDisplayName(realmId, fundingSourceValue)
                    .then(response => {
                        let { fundingSource } = this.state;
                        fundingSource.fundingSourceCode = response.data;
                        this.setState({
                            fundingSource
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
     * This function is used to update the ticket priority in state
     * @param {*} newState - This the selected priority
     */
    updatePriority(newState){
        // let priority  = this.state.priority;
        // let priority = event.target.value;
        console.log('priority - : '+newState);
        let { fundingSource } = this.state;
        fundingSource.priority = newState;
        this.setState(
            {
                fundingSource
            }, () => {

                console.log('priority - state : '+this.state.fundingSource.priority);
            }
        );
    }
    /**
     * This is used to display the content
     * @returns This returns funding source details form
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
                <h4>{i18n.t('static.fundingsource.fundingsource')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        enableReinitialize={true}
                        initialValues={{
                            summary: summaryText_1,
                            realmName: this.state.realmId,
                            fundingSourceName: this.state.fundingSource.fundingSourceName,
                            fundingSourceCode: this.state.fundingSource.fundingSourceCode,
                            notes: this.state.fundingSource.notes,
                            priority: 3
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.fundingSource.summary = summaryText_2;
                            this.state.fundingSource.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(this.state.fundingSource).then(response => {
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
                                            valid={!errors.summary && this.state.fundingSource.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.fundingSource.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="realmName">{i18n.t('static.realm.realmName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="realmName" id="realmName"
                                            bsSize="sm"
                                            valid={!errors.realmName && this.state.fundingSource.realmName != ''}
                                            invalid={touched.realmName && !!errors.realmName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realmId}
                                            required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmList}
                                        </Input>
                                        <FormFeedback className="red">{errors.realmName}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="fundingSourceName">{i18n.t('static.fundingSource.fundingSourceName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="fundingSourceName" id="fundingSourceName"
                                            bsSize="sm"
                                            valid={!errors.fundingSourceName && this.state.fundingSource.fundingSourceName != ''}
                                            invalid={touched.fundingSourceName && !!errors.fundingSourceName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getDisplayName() }}
                                            onBlur={handleBlur}
                                            value={this.Capitalize(this.state.fundingSource.fundingSourceName)}
                                            required />
                                        <FormFeedback className="red">{errors.fundingSourceName}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="fundingSourceCode">{i18n.t('static.fundingsource.fundingsourceCode')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="fundingSourceCode" id="fundingSourceCode"
                                            bsSize="sm"
                                            valid={!errors.fundingSourceCode && this.state.fundingSource.fundingSourceCode != ''}
                                            invalid={touched.fundingSourceCode && !!errors.fundingSourceCode}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={7}
                                            value={this.state.fundingSource.fundingSourceCode}
                                            required
                                        />
                                        <FormFeedback className="red">{errors.fundingSourceCode}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label className="P-absltRadio">{i18n.t('static.fundingSource.allowInBudget')}&nbsp;&nbsp;</Label>
                                        <FormGroup check inline className="ml-5">
                                            <Input
                                                className="form-check-input"
                                                type="radio"
                                                id="allowedInBudget1"
                                                name="allowedInBudget"
                                                value={true}
                                                checked={this.state.fundingSource.allowedInBudget === true}
                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            />
                                            <Label
                                                className="form-check-label"
                                                check htmlFor="inline-active1">
                                                {i18n.t('static.program.yes')}
                                            </Label>
                                        </FormGroup>
                                        <FormGroup check inline>
                                            <Input
                                                className="form-check-input"
                                                type="radio"
                                                id="allowedInBudget2"
                                                name="allowedInBudget"
                                                value={false}
                                                checked={this.state.fundingSource.allowedInBudget === false}
                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            />
                                            <Label
                                                className="form-check-label"
                                                check htmlFor="inline-active2">
                                                {i18n.t('static.program.no')}
                                            </Label>
                                        </FormGroup>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            valid={!errors.notes && this.state.fundingSource.notes != ''}
                                            invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={600}
                                            value={this.state.fundingSource.notes}
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <TicketPriorityComponent priority={this.state.fundingSource.priority} updatePriority={this.updatePriority} errors={errors} touched={touched}/>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                        <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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