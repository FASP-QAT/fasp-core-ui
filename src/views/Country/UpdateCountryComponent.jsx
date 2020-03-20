import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import AuthenticationService from '../common/AuthenticationService.js';
import CountryService from '../../api/CountryService.js';
import LanguageService from '../../api/LanguageService.js';
import CurrencyService from '../../api/CurrencyService.js';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n';
let initialValues = {
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

export default class UpdateCountryComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            country: {
                countryId: '',
                countryCode: '',
                label: {
                    label_en: '',
                    labelId: ''
                },
                currency: {
                    curencyId: ''
                },
                language: {
                    languageId: ''
                },
                active: ''

            },
            languageList: [],
            currencyList: []
        }

        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        initialValues = {
            label: this.props.location.state.country.label.label_en,
            countryCode: this.props.location.state.country.countryCode,
            languageId: this.props.location.state.country.language.languageId,
            currencyId: this.props.location.state.country.currency.currencyId
        }
    }

    dataChange(event) {
        let { country } = this.state
        if (event.target.name === "label") {
            country.label.label_en = event.target.value
        }
        if (event.target.name === "countryCode") {
            country.countryCode = event.target.value
        }
        // if (event.target.name === "country.label.freLabel") {
        //     this.state.country.label.freLabel = event.target.value
        // } if (event.target.name === "country.label.spaLabel") {
        //     this.state.country.label.spaLabel = event.target.value
        // } if (event.target.name === "country.label.porLabel") {
        //     this.state.country.label.porLabel = event.target.value
        // }
        if (event.target.name === "currencyId") {
            country.currency.currencyId = event.target.value
        } if (event.target.name === "languageId") {
            country.language.languageId = event.target.value
        } else if (event.target.name === "active") {
            country.active = event.target.id === "active2" ? false : true
        }

        this.setState(
            {
                country
            }
        )

    };

    touchAll(setTouched, errors) {
        setTouched({
            'label': true,
            'countryCode': true,
            'languageId': true,
            'currencyId': true
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
        this.setState({
            country: this.props.location.state.country
        });

        LanguageService.getLanguageListActive().then(response => {
            this.setState({
                languageList: response.data
            })
        })
            .catch(
                error => {
                    switch (error.message) {
                        case "Network Error":
                            this.setState({
                                message: error.message
                            })
                            break
                        default:
                            this.setState({
                                message: error.message
                            })
                            break
                    }
                });

        CurrencyService.getCurrencyListActive().then(response => {
            this.setState({
                currencyList: response.data
            })
        })
            .catch(
                error => {
                    switch (error.message) {
                        case "Network Error":
                            this.setState({
                                message: error.message
                            })
                            break
                        default:
                            this.setState({
                                message: error.message
                            })
                            break
                    }
                });

    }
    Capitalize(str) {
        let { country } = this.state
        country.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }

    cancelClicked() {
        this.props.history.push(`/country/listCountry/` + "Action Canceled")
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
                    <option key={i} value={itemOne.currencyId}>{itemOne.label.label_en}</option>
                )
            }, this);
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.country.countryedit')}</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {

                                    // alert("----"+this.state);
                                    // console.log("------IN SUBMIT------" + this.state.country)
                                    CountryService.editCountry(this.state.country)
                                        .then(response => {
                                            if (response.data.status == "Success") {
                                                this.props.history.push(`/country/listCountry/${response.data.message}`)
                                            } else {
                                                this.setState({
                                                    message: response.data.message
                                                })
                                            }
                                        })
                                        .catch(
                                            error => {
                                                switch (error.message) {
                                                    case "Network Error":
                                                        this.setState({
                                                            message: error.message
                                                        })
                                                        break
                                                    default:
                                                        this.setState({
                                                            message: error.response.data.message
                                                        })
                                                        break
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
                                                        <Input type="text"
                                                            name="label"
                                                            id="label"
                                                            valid={!errors.label}
                                                            bsSize="sm"
                                                            invalid={touched.label && !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.country.label.label_en}
                                                            required />
                                                        <FormFeedback>{errors.label}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="countryCode">{i18n.t('static.country.countrycode')}</Label>
                                                        <Input type="text"
                                                            name="countryCode"
                                                            id="countryCode"
                                                            bsSize="sm"
                                                            valid={!errors.countryCode}
                                                            invalid={touched.countryCode && !!errors.countryCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.country.countryCode}
                                                            required />
                                                        <FormFeedback>{errors.countryCode}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="languageId">{i18n.t('static.country.language')}</Label>
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
                                                        <FormFeedback>{errors.languageId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="currencyId">{i18n.t('static.country.currency')}</Label>
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
                                                        <FormFeedback>{errors.currencyId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label>{i18n.t('static.common.status')}  </Label>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="active"
                                                                value={true}
                                                                checked={this.state.country.active === true}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio1">
                                                                {i18n.t('static.common.active')}
                                                                </Label>
                                                        </FormGroup>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active2"
                                                                name="active"
                                                                value={false}
                                                                checked={this.state.country.active === false}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio2">
                                                                {i18n.t('static.common.disabled')}
                                                                </Label>
                                                        </FormGroup>
                                                    </FormGroup>
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                    <Button type="reset" color="danger" className="mr-1 float-right"size="sm" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                    <Button type="submit" color="success"className="mr-1 float-right"size="sm" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>  {i18n.t('static.common.submit')}</Button>
                                                    
                                                      
                                                        
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
        this.props.history.push(`/country/listCountry/` + "Action Canceled")
    }

}