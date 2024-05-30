import { Formik } from 'formik';
import React, { Component } from 'react';
import 'react-select/dist/react-select.min.css';
import { Button, Form, FormFeedback, FormGroup, Input, Label, ModalFooter } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, SPACE_REGEX } from '../../Constants';
import ForecastMethodService from "../../api/ForecastMethodService";
import JiraTikcetService from '../../api/JiraTikcetService';
import i18n from '../../i18n';
import TicketPriorityComponent from './TicketPriorityComponent';
let summaryText_1 = (i18n.t("static.common.add") + " " + i18n.t("static.forecastMethod.forecastMethod"))
let summaryText_2 = "Add Forecast Method"
const initialValues = {
    summary: "",
    ForecastMethodTypeId: "",
    ForecastMethod: "",
    notes: '',
    priority: 3
}
/**
 * This const is used to define the validation schema for forecast method ticket component
 * @param {*} values 
 * @returns 
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        forecastMethod: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required('Enter Forecast Method'),
        forecastMethodTypeId: Yup.string()
            .required('Select forecast method type'),
    })
}
/**
 * This component is used to display the tracer category form and allow user to submit the add master request in jira
 */
export default class OrganisationTypeTicketComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            forecastMethod: {
                summary: summaryText_1,
                forecastMethod: "",
                forecastMethodTypeName: '',
                notes: '',
                priority: 3
            },
            lang: localStorage.getItem('lang'),
            message: '',
            loading: true,
            notes: "",
            forecastMethodTypeId: '',
            forecastMethodTypeList: [],
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.getForecastMethodTypeList = this.getForecastMethodTypeList.bind(this);
        this.updatePriority = this.updatePriority.bind(this);
    }
    /**
     * This function is called when some data in the form is changed
     * @param {*} event This is the on change event
     */
    dataChange(event) {
        let { forecastMethod } = this.state
        if (event.target.name == "summary") {
            forecastMethod.summary = event.target.value;
        }
        if (event.target.name === "forecastMethod") {
            forecastMethod.forecastMethod = event.target.value
        }
        if (event.target.name == "forecastMethodTypeId") {
            forecastMethod.forecastMethodTypeName = event.target.value !== "" ? this.state.forecastMethodTypeList.filter(c => c.id == event.target.value)[0].label.label_en : "";
            this.setState({
                forecastMethodTypeId: event.target.value
            })
        }
        if (event.target.name == "notes") {
            forecastMethod.notes = event.target.value;
        }
        this.setState({
            forecastMethod
        }, () => { })
    };
    /**
     * This function is used to capitalize the first letter of the unit name
     * @param {*} str This is the name of the unit
     */
    Capitalize(str) {
        this.state.forecastMethod.forecastMethod = str.charAt(0).toUpperCase() + str.slice(1)
    }
    /**
     * This function is used to call the get forecast method type list
     */
    componentDidMount() {
        this.getForecastMethodTypeList();
    }
    /**
     * This function is used to get forecast method type list
     */
    getForecastMethodTypeList() {
        ForecastMethodService.getForecastMethodTypeList().then(response => {
            if (response.status == 200) {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    forecastMethodTypeList: listArray,
                    loading: false
                },
                    () => {
                    })
            }
            else {
                this.setState({
                    message: response.data.messageCode, loading: false, color: "#BA0C2F",
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
                            loading: false,
                            color: "#BA0C2F",
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
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false,
                                    color: "#BA0C2F",
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
     * This function is called when reset button is clicked to reset the forecast method details
     */
    resetClicked() {
        let { forecastMethod } = this.state;
        forecastMethod.forecastMethod = '';
        forecastMethod.forecastMethodTypeName = '';
        forecastMethod.notes = '';
        forecastMethod.priority = 3;
        this.setState({
            forecastMethod: forecastMethod,
            forecastMethodTypeId: ''
        },
            () => { });
    }

    /**
     * This function is used to update the ticket priority in state
     * @param {*} newState - This the selected priority
     */
    updatePriority(newState){
        console.log('priority - : '+newState);
        let { forecastMethod } = this.state;
        forecastMethod.priority = newState;
        this.setState(
            {
                forecastMethod
            }, () => {

                console.log('priority - state : '+this.state.forecastMethod.priority);
            }
        );
    }

    /**
     * This is used to display the content
     * @returns This returns forecast method details form
     */
    render() {
        const { forecastMethodTypeList } = this.state;
        let forecastMethodTypeList1 = forecastMethodTypeList.length > 0
            && forecastMethodTypeList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>{getLabelText(item.label, this.state.lang)}</option>
                )
            }, this);
        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.forecastMethod.forecastMethod')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        enableReinitialize={true}
                        initialValues={{
                            summary: summaryText_1,
                            forecastMethod: '',
                            forecastMethodTypeId: '',
                            notes: '',
                            priority: 3
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.forecastMethod.summary = summaryText_2;
                            this.state.forecastMethod.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(this.state.forecastMethod).then(response => {
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
                                setFieldTouched
                            }) => (
                                <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">
                                    < FormGroup >
                                        <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="summary" id="summary" readOnly={true}
                                            bsSize="sm"
                                            valid={!errors.summary && this.state.forecastMethod.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.forecastMethod.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="forecastMethod">{i18n.t('static.forecastMethod.forecastMethod')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="forecastMethod" id="forecastMethod"
                                            bsSize="sm"
                                            valid={!errors.forecastMethod && this.state.forecastMethod.forecastMethod != ''}
                                            invalid={touched.forecastMethod && !!errors.forecastMethod}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value); }}
                                            onBlur={(e) => { handleBlur(e); }}
                                            value={this.state.forecastMethod.forecastMethod}
                                            required />
                                        <FormFeedback className="red">{errors.forecastMethod}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="forecastMethodTypeId">{i18n.t('static.forecastMethod.methodology')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="forecastMethodTypeId" id="forecastMethodTypeId"
                                            bsSize="sm"
                                            valid={!errors.forecastMethodTypeId && this.state.forecastMethod.forecastMethodTypeName != ''}
                                            invalid={touched.forecastMethodTypeId && !!errors.forecastMethodTypeId}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.forecastMethodTypeId}
                                            required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {forecastMethodTypeList1}
                                        </Input>
                                        <FormFeedback className="red">{errors.forecastMethodTypeId}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={600}
                                            value={this.state.forecastMethod.notes}
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <TicketPriorityComponent priority={this.state.forecastMethod.priority} updatePriority={this.updatePriority} errors={errors} touched={touched}/>
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