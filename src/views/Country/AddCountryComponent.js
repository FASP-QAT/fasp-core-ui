import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import AuthenticationService from '../Common/AuthenticationService.js';
import LanguageService from '../../api/LanguageService.js';
import CurrencyService from '../../api/CurrencyService.js';
import CountryService from '../../api/CountryService.js';
import i18n from '../../i18n';
import getLabelText from '../../CommonComponent/getLabelText';


const entityname = i18n.t('static.country.countryMaster');
const initialValues = {
    label: '',
    countryCode: '',
    languageId: '',
    currencyId: '',
    languageList: [],
    currencyList: [],
}

const validationSchema = function (values) {
    return Yup.object().shape({
        label: Yup.string()
            .required(i18n.t('static.country.countrytext')),
        countryCode: Yup.string()
            .max(3, i18n.t('static.country.countrycodemax3digittext'))
            .required(i18n.t('static.country.countrycodetext')),
        languageId: Yup.string()
            .required(i18n.t('static.country.languagetext')),
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
                label: {
                    label_en: '',
                    label_fr:'',
                    label_sp:'',
                    label_pr:''
                },
                currency: {
                    currencyId: ''
                },
                language: {
                    languageId: ''
                }
            },
            languageList: [],
            currencyList: [],
            message: '',
            lang: localStorage.getItem('lang')

        }
        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
    }

    dataChange(event) {
        let { country } = this.state
        if (event.target.name === "label") {
            country.label.label_en = event.target.value
        }
        if (event.target.name === "countryCode") {
            country.countryCode = event.target.value
        }
        if (event.target.name === "currencyId") {
            country.currency.currencyId = event.target.value
        } else if (event.target.name === "languageId") {
            country.language.languageId = event.target.value
        }

        this.setState(
            {
                country
            }, () => {
                // console.log(this.state)
            }
        )
    };

    touchAll(setTouched, errors) {
        setTouched({
            label: true,
            countryCode: true,
            languageId: true,
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


    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        LanguageService.getLanguageListActive().then(response => {
            if (response.status == 200) {
                this.setState({
                    languageList: response.data
                })
            } else {
                this.setState({
                    message: response.data.messageCode
                })
            }
        })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response.status) {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                console.log("Error code unkown");
                                break;
                        }
                    }
                });

        CurrencyService.getCurrencyListActive().then(response => {
            if (response.status == 200) {
                this.setState({
                    currencyList: response.data
                })
            } else {
                this.setState({
                    message: response.data.messageCode
                })
            }
        })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response.status) {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                console.log("Error code unkown");
                                break;
                        }
                    }
                });
    }

    Capitalize(str) {
        let { country } = this.state
        country.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }

    render() {
        const { languageList } = this.state;
        let languageItems = languageList.length > 0
            && languageList.map((item, i) => {
                return (
                    <option key={i} value={item.languageId}>{item.languageName}</option>
                )
            }, this);

        const { currencyList } = this.state;
        let currencyItems = currencyList.length > 0
            && currencyList.map((itemOne, i) => {
                return (
                    <option key={i} value={itemOne.currencyId}>{getLabelText(itemOne.label, this.state.lang)}</option>
                )
            }, this);
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.country.countryadd')}</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    console.log("------IN SUBMIT------", this.state.country)
                                    CountryService.addCountry(this.state.country)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/country/listCountry/` + i18n.t(response.data.messageCode, { entityname }))
                                            }
                                            else {
                                                this.setState({
                                                    message: response.data.messageCode
                                                })
                                            }

                                        })
                                        .catch(
                                            error => {
                                                if (error.message === "Network Error") {
                                                    this.setState({ message: error.message });
                                                } else {
                                                    switch (error.response ? error.response.status : "") {
                                                        case 500:
                                                        case 401:
                                                        case 404:
                                                        case 406:
                                                        case 412:
                                                            this.setState({ message: error.response.data.messageCode });
                                                            break;
                                                        default:
                                                            this.setState({ message: 'static.unkownError' });
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
                                        setTouched
                                    }) => (
                                            <Form onSubmit={handleSubmit} noValidate name='countryForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label for="label">{i18n.t('static.country.country')}</Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-globe"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            name="label"
                                                            id="label"
                                                            bsSize="sm"
                                                            valid={!errors.label}
                                                            invalid={touched.label && !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={getLabelText(this.state.country.label, this.state.lang)}
                                                            required />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.label}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="countryCode">{i18n.t('static.country.countrycode')}</Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-pencil"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            name="countryCode"
                                                            id="countryCode"
                                                            bsSize="sm"
                                                            valid={!errors.countryCode}
                                                            invalid={touched.countryCode && !!errors.countryCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.countryCode}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="languageId">{i18n.t('static.country.language')}</Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-language"></i></InputGroupText> */}
                                                        <Input
                                                            type="select"
                                                            name="languageId"
                                                            id="languageId"
                                                            bsSize="sm"
                                                            valid={!errors.languageId}
                                                            invalid={touched.languageId && !!errors.languageId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.country.language.languageId}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {languageItems}
                                                        </Input>
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.languageId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="currencyId">{i18n.t('static.country.currency')}</Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-money"></i></InputGroupText> */}
                                                        <Input
                                                            type="select"
                                                            name="currencyId"
                                                            id="currencyId"
                                                            bsSize="sm"
                                                            valid={!errors.currencyId}
                                                            invalid={touched.currencyId && !!errors.currencyId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.country.currency.currencyId}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {currencyItems}
                                                        </Input>
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.currencyId}</FormFeedback>
                                                    </FormGroup>

                                                </CardBody>

                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
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
        this.props.history.push(`/country/listCountry/` + i18n.t('static.message.cancelled', { entityname }))
    }

}