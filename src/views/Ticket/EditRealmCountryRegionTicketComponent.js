import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Form, FormFeedback, FormGroup, Input, Label, ModalFooter } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, SPACE_REGEX } from '../../Constants';
import JiraTikcetService from '../../api/JiraTikcetService';
import RegionService from '../../api/RegionService';
import i18n from '../../i18n';
import TicketPriorityComponent from './TicketPriorityComponent';
let summaryText_1 = (i18n.t("static.common.edit") + " " + i18n.t("static.dashboad.regioncountry"))
let summaryText_2 = "Edit Realm Country Region"
const initialValues = {
    summary: summaryText_1,
    realmCountryRegionName: '',
    notes: "",
    priority: 3
}
/**
 * This const is used to define the validation schema for realm country region ticket component
 * @param {*} values 
 * @returns 
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        realmCountryRegionName: Yup.string()
            .required(i18n.t('static.common.pleaseSelect').concat(" ").concat((i18n.t('static.dashboad.regioncountry')).concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.dashboad.regioncountry'))))),
        notes: Yup.string()
            .required(i18n.t('static.program.validnotestext'))
    })
}
/**
 * This component is used to display the realm country region form and allow user to submit the update master request in jira
 */
export default class EditRealmCountryRegionTicketComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realmCountryRegion: {
                summary: summaryText_1,
                realmCountryRegionName: '',
                notes: "",
                priority: 3
            },
            lang: localStorage.getItem('lang'),
            message: '',
            loading: true,
            realmCountryRegionId: '',
            realmCountryRegionList: []
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
        let { realmCountryRegion } = this.state
        if (event.target.name == "summary") {
            realmCountryRegion.summary = event.target.value;
        }
        if (event.target.name == "realmCountryRegionName") {
            var outText = "";
            if (event.target.value !== "") {
                var realmCountryRegionT = this.state.realmCountryRegionList.filter(c => c.regionId == event.target.value)[0];
                outText = realmCountryRegionT.realmCountry.realm.label.label_en + " | " + realmCountryRegionT.realmCountry.country.label.label_en + " | " + realmCountryRegionT.label.label_en;
            }
            realmCountryRegion.realmCountryRegionName = outText;
            this.state.realmCountryRegionId = event.target.value
        }
        if (event.target.name == "notes") {
            realmCountryRegion.notes = event.target.value;
        }
        this.setState({
            realmCountryRegion
        }, () => { })
    };
    /**
     * This function is used to get region lists on page load
     */
    componentDidMount() {
        RegionService.getRegionList()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.realmCountry.country.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.realmCountry.country.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        realmCountryRegionList: listArray,
                        loading: false
                    }, () => {
                    });
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
     * This function is used to update the ticket priority in state
     * @param {*} newState - This the selected priority
     */
    updatePriority(newState){
        // console.log('priority - : '+newState);
        let { realmCountryRegion } = this.state;
        realmCountryRegion.priority = newState;
        this.setState(
            {
                realmCountryRegion
            }, () => {
                // console.log('priority - state : '+this.state.realmCountryRegion.priority);
            }
        );
    }

    /**
     * This function is called when reset button is clicked to reset the realm country region details
     */
    resetClicked() {
        let { realmCountryRegion } = this.state;
        realmCountryRegion.realmCountryRegionName = '';
        realmCountryRegion.notes = '';
        realmCountryRegion.priority = 3;
        this.setState({
            realmCountryRegion: realmCountryRegion,
            realmCountryRegionId: ''
        },
            () => { });
    }
    /**
     * This is used to display the content
     * @returns This returns realm country region details form
     */
    render() {
        const { realmCountryRegionList } = this.state;
        let realmCountryRegions = realmCountryRegionList.length > 0
            && realmCountryRegionList.map((item, i) => {
                return (
                    <option key={i} value={item.regionId}>
                        {getLabelText(item.realmCountry.country.label, this.state.lang) + " | " + getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.dashboad.regioncountry')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.realmCountryRegion.summary = summaryText_2;
                            this.state.realmCountryRegion.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(this.state.realmCountryRegion).then(response => {
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
                                            valid={!errors.summary && this.state.realmCountryRegion.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realmCountryRegion.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="realmCountryRegionName">{i18n.t('static.dashboad.regioncountry')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="realmCountryRegionName" id="realmCountryRegionName"
                                            bsSize="sm"
                                            valid={!errors.realmCountryRegionName && this.state.realmCountryRegion.realmCountryRegionName != ''}
                                            invalid={touched.realmCountryRegionName && !!errors.realmCountryRegionName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getDependentLists(e) }}
                                            onBlur={handleBlur}
                                            value={this.state.realmCountryRegionId}
                                            required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmCountryRegions}
                                        </Input>
                                        <FormFeedback className="red">{errors.realmCountryRegionName}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            valid={!errors.notes && this.state.realmCountryRegion.notes != ''}
                                            invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={600}
                                            value={this.state.realmCountryRegion.notes}
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <TicketPriorityComponent priority={this.state.realmCountryRegion.priority} updatePriority={this.updatePriority} errors={errors} touched={touched}/>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                        <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="mr-1" disabled={!isValid}><i className="fa fa-check "></i> {i18n.t('static.common.submit')}</Button>
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