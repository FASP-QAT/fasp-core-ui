import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import UserService from '../../api/UserService';
import Select from 'react-select';
import ForecastMethodService from "../../api/ForecastMethodService";
import 'react-select/dist/react-select.min.css';
import classNames from 'classnames';
import { SPECIAL_CHARECTER_WITH_NUM, SPACE_REGEX, ALPHABET_NUMBER_REGEX } from '../../Constants';
import getLabelText from '../../CommonComponent/getLabelText';

let summaryText_1 = (i18n.t("static.common.add") + " " + i18n.t("static.forecastMethod.forecastMethod"))
let summaryText_2 = "Add Forecast Method"
const initialValues = {
    summary: "",
    ForecastMethodTypeId: "",
    ForecastMethod: "",
    notes: ''
}

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

const validate = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values)
        try {
            validationSchema.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationError(error)
        }
    }
}

const getErrorsFromValidationError = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}

export default class OrganisationTypeTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            forecastMethod: {
                summary: summaryText_1,
                forecastMethod: "",
                forecastMethodTypeName: '',
                notes: ''
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
    }

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

    touchAll(setTouched, errors) {
        setTouched({
            summary: true,
            forecastMethod: true,
            forecastMethodTypeId: true
        })
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('simpleForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }
    findFirstError(formName, hasError) {
        const form = document.forms[formName]
        for (let i = 0; i < form.length; i++) {
            if (hasError(form[i].name)) {
                form[i].focus()
                break
            }
        }
    }

    Capitalize(str) {
        this.state.forecastMethod.forecastMethod = str.charAt(0).toUpperCase() + str.slice(1)
    }

    componentDidMount() {
        this.getForecastMethodTypeList();
    }

    getForecastMethodTypeList() {
        ForecastMethodService.getForecastMethodTypeList().then(response => {
            if (response.status == 200) {
                console.log("response.data---->", response.data)

                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });


                this.setState({
                    forecastMethodTypeList: listArray,
                    loading: false
                },
                    () => {
                        // this.getForecastMethodData();
                        // this.buildJexcel()
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
                            message: 'static.unkownError',
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


    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }

    resetClicked() {
        let { forecastMethod } = this.state;
        forecastMethod.forecastMethod = '';
        forecastMethod.forecastMethodTypeName = '';
        forecastMethod.notes = '';
        this.setState({
            forecastMethod: forecastMethod,
            forecastMethodTypeId: ''
        },
            () => { });
    }

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
                            notes: ''
                        }}
                        validate={validate(validationSchema)}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.forecastMethod.summary = summaryText_2;
                            this.state.forecastMethod.userLanguageCode = this.state.lang;
                            console.log("SUBMIT------->", this.state.forecastMethod);
                            JiraTikcetService.addEmailRequestIssue(this.state.forecastMethod).then(response => {
                                console.log("Response :", response.status, ":", JSON.stringify(response.data));
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
                                            message: 'static.unkownError',
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
                                            // valid={!errors.notes && this.state.organisationType.notes != ''}
                                            // invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={600}
                                            value={this.state.forecastMethod.notes}
                                        // required 
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>



                                    <ModalFooter className="pb-0 pr-0">
                                        <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                    </ModalFooter>
                                    {/* <br></br><br></br>
                                    <div className={this.props.className}>
                                        <p>{i18n.t('static.ticket.drodownvaluenotfound')}</p>
                                    </div> */}
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