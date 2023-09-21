import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, SPECIAL_CHARECTER_WITHOUT_NUM } from '../../Constants.js';
import CountryService from '../../api/CountryService.js';
import CurrencyService from '../../api/CurrencyService.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import '../Forms/ValidationForms/ValidationForms.css';
const entityname = i18n.t('static.country.countryMaster');
const initialValues = {
    label: '',
    countryCode: '',
    countryCode2: '',
    currencyId: '',
    languageList: [],
    currencyList: [],
}
const validationSchema = function () {
    return Yup.object().shape({
        label: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.country.countrytext')),
        countryCode2: Yup.string()
            .matches(SPECIAL_CHARECTER_WITHOUT_NUM, i18n.t('static.common.alphabetsOnly'))
            .required(i18n.t('static.country.countrycodetext2')),
        countryCode: Yup.string()
            .matches(SPECIAL_CHARECTER_WITHOUT_NUM, i18n.t('static.common.alphabetsOnly'))
            .required(i18n.t('static.country.countrycodetext')),
        currencyId: Yup.string()
            .required(i18n.t('static.country.currencytext')),
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
export default class AddCountryComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            country: {
                countryCode: '',
                countryCode2: '',
                label: {
                    label_en: '',
                    label_fr: '',
                    label_sp: '',
                    label_pr: ''
                },
                currency: {
                    id: ''
                },
            },
            currencyList: [],
            message: '',
            lang: localStorage.getItem('lang'),
            loading: true
        }
        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    dataChange(event) {
        let { country } = this.state
        if (event.target.name === "label") {
            country.label.label_en = event.target.value
        }
        if (event.target.name === "countryCode") {
            country.countryCode = event.target.value.toUpperCase();
        }
        if (event.target.name === "countryCode2") {
            country.countryCode2 = event.target.value.toUpperCase();
        }
        else if (event.target.name === "currencyId") {
            country.currency.id = event.target.value
        }
        this.setState(
            {
                country
            }, () => {
            }
        )
    };
    touchAll(setTouched, errors) {
        setTouched({
            label: true,
            countryCode: true,
            countryCode2: true,
            currencyId: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('countryForm', (fieldName) => {
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
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    componentDidMount() {
        CurrencyService.getCurrencyListActive().then(response => {
            if (response.status == 200) {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    currencyList: listArray, loading: false
                })
            } else {
                this.setState({
                    message: response.data.messageCode, loading: false
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
    Capitalize(str) {
        let { country } = this.state
        country.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }
    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }
    render() {
        const { currencyList } = this.state;
        let currencyItems = currencyList.length > 0
            && currencyList.map((itemOne, i) => {
                return (
                    <option key={i} value={itemOne.currencyId}>{getLabelText(itemOne.label, this.state.lang)}</option>
                )
            }, this);
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values) => {
                                    this.setState({
                                        loading: true
                                    })
                                    CountryService.addCountry(this.state.country)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/country/listCountry/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                            }
                                            else {
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
                                }}
                                render={
                                    ({
                                        errors,
                                        touched,
                                        handleChange,
                                        handleBlur,
                                        handleSubmit,
                                        isValid,
                                        setTouched,
                                        handleReset
                                    }) => (
                                        <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='countryForm' autocomplete="off">
                                            <CardBody className="pt-2 pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                                <FormGroup>
                                                    <Label for="label">{i18n.t('static.country.countryName')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        name="label"
                                                        id="label"
                                                        bsSize="sm"
                                                        valid={!errors.label && this.state.country.label.label_en != ''}
                                                        invalid={touched.label && !!errors.label}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.country.label.label_en}
                                                        required />
                                                    <FormFeedback className="red">{errors.label}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="countryCode">{i18n.t('static.country.countrycode')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        name="countryCode"
                                                        id="countryCode"
                                                        bsSize="sm"
                                                        valid={!errors.countryCode && this.state.country.countryCode != ''}
                                                        invalid={touched.countryCode && !!errors.countryCode}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.country.countryCode}
                                                        required
                                                        maxLength={3}
                                                    />
                                                    <FormFeedback className="red">{errors.countryCode}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="countryCode">{i18n.t('static.country.countrycode2')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        name="countryCode2"
                                                        id="countryCode2"
                                                        bsSize="sm"
                                                        valid={!errors.countryCode2 && this.state.country.countryCode2 != ''}
                                                        invalid={touched.countryCode2 && !!errors.countryCode2}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.country.countryCode2}
                                                        required
                                                        maxLength={2}
                                                    />
                                                    <FormFeedback className="red">{errors.countryCode2}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="currencyId">{i18n.t('static.country.currency')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="select"
                                                        name="currencyId"
                                                        id="currencyId"
                                                        bsSize="sm"
                                                        valid={!errors.currencyId && this.state.country.currency.id != ''}
                                                        invalid={touched.currencyId && !!errors.currencyId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        required
                                                        value={this.state.country.currency.id}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {currencyItems}
                                                    </Input>
                                                    <FormFeedback className="red">{errors.currencyId}</FormFeedback>
                                                </FormGroup>
                                            </CardBody>
                                            <div style={{ display: this.state.loading ? "block" : "none" }}>
                                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                                    <div class="align-items-center">
                                                        <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                                        <div class="spinner-border blue ml-4" role="status">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <CardFooter>
                                                <FormGroup>
                                                    <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                    <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                    <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                    &nbsp;
                                                </FormGroup>
                                            </CardFooter>
                                        </Form>
                                    )} />
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/country/listCountry/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    resetClicked() {
        let { country } = this.state
        country.label.label_en = ''
        country.countryCode = ''
        country.currency.id = ''
        country.language.languageId = ''
        this.setState(
            {
                country
            }, () => {
            }
        )
    }
}