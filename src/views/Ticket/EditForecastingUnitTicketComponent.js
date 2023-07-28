import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import UnitService from '../../api/UnitService';
import TracerCategoryService from '../../api/TracerCategoryService';
import getLabelText from '../../CommonComponent/getLabelText';
import ProductService from '../../api/ProductService';
import RealmService from '../../api/RealmService';
import { API_URL, SPACE_REGEX } from '../../Constants';
import ForecastingUnitService from '../../api/ForecastingUnitService';

import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import classNames from 'classnames';
import '../Forms/ValidationForms/ValidationForms.css'

let summaryText_1 = (i18n.t("static.common.edit") + " " + i18n.t("static.forecastingunit.forecastingunit"))
let summaryText_2 = "Edit Forecasting Unit"
const initialValues = {
    summary: summaryText_1,
    forecastingUnitName: "",
    notes: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        forecastingUnitName: Yup.string()
            .required(i18n.t('static.common.pleaseSelect').concat(" ").concat((i18n.t('static.forecastingunit.forecastingunit')).concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.forecastingunit.forecastingunit'))))).nullable(),
        notes: Yup.string()
            .required(i18n.t('static.program.validnotestext'))
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

export default class EditForecastingUnitTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            forecastingUnit: {
                summary: summaryText_1,
                forecastingUnitName: "",
                notes: ''
            },
            lang: localStorage.getItem('lang'),
            message: '',
            forecastingUnitList: [],
            forecastingUnits: [],
            forecastingUnitId: '',
            loading: true
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.changeForecastingUnit = this.changeForecastingUnit.bind(this);
    }

    dataChange(event) {
        let { forecastingUnit } = this.state
        if (event.target.name == "summary") {
            forecastingUnit.summary = event.target.value;
        }
        if (event.target.name == "forecastingUnitName") {
            var outText = "";
            if (event.target.value !== "") {
                var forecastingUnitT = this.state.forecastingUnits.filter(c => c.forecastingUnitId == event.target.value)[0];
                outText = forecastingUnitT.realm.label.label_en + " | " + forecastingUnitT.label.label_en;
            }
            forecastingUnit.forecastingUnitName = outText;
            this.setState({
                forecastingUnitId: event.target.value
            })
        }

        if (event.target.name == "notes") {
            forecastingUnit.notes = event.target.value;
        }
        this.setState({
            forecastingUnit
        }, () => { })
    };

    changeForecastingUnit(event) {
        if (event === null) {
            let { forecastingUnit } = this.state;
            forecastingUnit.forecastingUnitName = ''
            this.setState({
                forecastingUnit: forecastingUnit,
                forecastingUnitId: ''
            });
        } else {
            let { forecastingUnit } = this.state;
            var outText = "";
            if (event.value !== "") {
                var forecastingUnitT = this.state.forecastingUnits.filter(c => c.forecastingUnitId == event.value)[0];
                outText = forecastingUnitT.realm.label.label_en + " | " + forecastingUnitT.label.label_en;
            }
            forecastingUnit.forecastingUnitName = outText;
            this.setState({
                forecastingUnit: forecastingUnit,
                forecastingUnitId: event.value
            });
        }
    }

    touchAll(setTouched, errors) {
        setTouched({
            summary: true,
            forecastingUnitName: "",
            notes: true
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

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();

        if (this.props.items.userRealmId > 0) {
            ForecastingUnitService.getForcastingUnitByRealmId(this.props.items.userRealmId).then(response => {
                if (response.status == 200) {
                    // console.log("response------->" + response);
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    var unitList = [];
                    for (var i = 0; i < listArray.length; i++) {
                        unitList[i] = { value: listArray[i].forecastingUnitId, label: getLabelText(listArray[i].label, this.state.lang) }
                    }
                    this.setState({
                        forecastingUnits: listArray,
                        forecastingUnitList: unitList,
                        loading: false
                    })
                }
                else {

                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }

            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            // message: 'static.unkownError',
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

            ForecastingUnitService.getForecastingUnitList().then(response => {
                if (response.status == 200) {
                    // console.log("response------->" + response);
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    var unitList = [];
                    for (var i = 0; i < listArray.length; i++) {
                        unitList[i] = { value: listArray[i].forecastingUnitId, label: getLabelText(listArray[i].label, this.state.lang) }
                    }
                    this.setState({
                        forecastingUnits: listArray,
                        forecastingUnitList: unitList,
                        loading: false
                    })
                }
                else {

                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }

            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            // message: 'static.unkownError',
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

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }

    resetClicked() {
        let { forecastingUnit } = this.state;
        // forecastingUnit.summary = '';
        forecastingUnit.forecastingUnitName = '';
        forecastingUnit.notes = '';
        this.setState({
            forecastingUnit: forecastingUnit,
            forecastingUnitId: ''
        },
            () => { });
    }

    render() {

        // const { forecastingUnits } = this.state;
        // let forecastingUnitList = forecastingUnits.length > 0
        //     && forecastingUnits.map((item, i) => {
        //         return (
        //             <option key={i} value={item.forecastingUnitId}>
        //                 {getLabelText(item.label, this.state.lang)}
        //             </option>
        //         )
        //     }, this);

        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.forecastingunit.forecastingunit')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        initialValues={initialValues}
                        validate={validate(validationSchema)}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.forecastingUnit.summary = summaryText_2
                            this.state.forecastingUnit.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(this.state.forecastingUnit).then(response => {
                                // console.log("Response :", response.status, ":", JSON.stringify(response.data));
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
                                            // message: 'static.unkownError',
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
                                            valid={!errors.summary && this.state.forecastingUnit.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.forecastingUnit.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="forecastingUnitName">{i18n.t('static.forecastingunit.forecastingunit')}<span class="red Reqasterisk">*</span></Label>
                                        {/* <Input type="select" name="forecastingUnitName" id="forecastingUnitName"
                                                bsSize="sm"
                                                valid={!errors.forecastingUnitName && this.state.forecastingUnit.forecastingUnitName != ''}
                                                invalid={touched.forecastingUnitName && !!errors.forecastingUnitName}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.forecastingUnitId}
                                                required >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {forecastingUnitList}
                                            </Input> */}

                                        <Select
                                            className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                { 'is-valid': !errors.forecastingUnitName && this.state.forecastingUnit.forecastingUnitName != '' },
                                                { 'is-invalid': (touched.forecastingUnitName && !!errors.forecastingUnitName) }
                                            )}
                                            bsSize="sm"
                                            name="forecastingUnitName"
                                            id="forecastingUnitName"
                                            isClearable={false}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setFieldValue("forecastingUnitName", e);
                                                this.changeForecastingUnit(e);
                                            }}
                                            onBlur={() => setFieldTouched("forecastingUnitName", true)}
                                            required
                                            min={1}
                                            options={this.state.forecastingUnitList}
                                            value={this.state.forecastingUnitId}
                                        />

                                        <FormFeedback className="red">{errors.forecastingUnitName}</FormFeedback>
                                    </FormGroup>

                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            valid={!errors.notes && this.state.forecastingUnit.notes != ''}
                                            invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={600}
                                            value={this.state.forecastingUnit.notes}
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