import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, InputGroupAddon, InputGroupText, Input } from 'reactstrap';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import CountryService from "../../api/CountryService";
import OrganisationService from "../../api/OrganisationService";
import UserService from "../../api/UserService";
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import classNames from 'classnames';

const entityname = i18n.t('static.organisation.organisation');

const initialValues = {
    realmId: '',
    realmCountryId: [],
    organisationCode: '',
    organisationName: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        organisationName: Yup.string()
            .matches(/^([a-zA-Z]+\s)*[a-zA-Z]+$/, i18n.t('static.message.rolenamevalidtext'))
            .required(i18n.t('static.organisation.organisationtext')),
        organisationCode: Yup.string()
            .required(i18n.t('static.organisation.organisationcodetext'))
            .max(4, i18n.t('static.organisation.organisationcodemax4digittext')),
        realmCountryId: Yup.string()
            .required(i18n.t('static.program.validcountrytext'))
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

export default class AddOrganisationComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            countries: [],
            realms: [],
            organisation: {
                label: {
                    label_en: ''
                },
                realm: {
                    id: ""
                },
                realmCountryArray: [],
                organisationCode: ''
            },
            lang: localStorage.getItem('lang'),
            realmCountryId: '',
            realmCountryList: [],
            selCountries: [],
            message: '',
            loading: true,
        }


        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.updateFieldData = this.updateFieldData.bind(this);
        this.getRealmCountryList = this.getRealmCountryList.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);

    }
    dataChange(event) {
        let { organisation } = this.state
        console.log(event.target.name);
        console.log(event.target.value);
        if (event.target.name === "organisationName") {
            organisation.label.label_en = event.target.value
        } else if (event.target.name === "organisationCode") {
            organisation.organisationCode = event.target.value.toUpperCase();
        } else if (event.target.name === "realmId") {
            organisation.realm.id = event.target.value
        }
        this.setState({
            organisation
        }, (
        ) => {
            console.log("state after update---", this.state.organisation)
        })
    }

    touchAll(setTouched, errors) {
        setTouched({
            realmId: true,
            organisationName: true,
            organisationCode: true,
            realmCountryId: true
        }
        )
        this.validateForm(errors)
    }

    validateForm(errors) {
        this.findFirstError('organisationForm', (fieldName) => {
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
        console.log("IN componentDidMount------------------");
        AuthenticationService.setupAxiosInterceptors();
        CountryService.getCountryListAll()
            .then(response => {
                console.log("country list---", response.data);
                this.setState({
                    countries: response.data, loading: false,
                })
            })

        UserService.getRealmList()
            .then(response => {
                console.log("realm list---", response.data);
                this.setState({
                    realms: response.data,
                    loading: false,
                })
            })
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    updateFieldData(value) {
        let { organisation } = this.state;
        this.setState({ realmCountryId: value });
        var realmCountryId = value;
        var realmCountryIdArray = [];
        for (var i = 0; i < realmCountryId.length; i++) {
            realmCountryIdArray[i] = realmCountryId[i].value;
        }
        organisation.realmCountryArray = realmCountryIdArray;
        this.setState({ organisation: organisation });
    }

    getRealmCountryList(e) {
        AuthenticationService.setupAxiosInterceptors();
        OrganisationService.getRealmCountryList(e.target.value)
            .then(response => {
                console.log("Realm Country List list---", response.data);
                if (response.status == 200) {
                    var json = response.data;
                    var regList = [];
                    for (var i = 0; i < json.length; i++) {
                        regList[i] = { value: json[i].realmCountryId, label: json[i].country.label.label_en }
                    }
                    this.setState({
                        realmCountryId: '',
                        realmCountryList: regList,
                        loading: false,
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            })

    }

    Capitalize(str) {
        this.state.organisation.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }

    render() {
        const { selCountries } = this.state;
        const { realms } = this.state;

        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {(() => {
                            switch (this.state.languageId) {
                                case 2: return (item.label.label_pr !== null && item.label.label_pr !== "" ? item.label.label_pr : item.label.label_en);
                                case 3: return (item.label.label_fr !== null && item.label.label_fr !== "" ? item.label.label_fr : item.label.label_en);
                                case 4: return (item.label.label_sp !== null && item.label.label_sp !== "" ? item.label.label_sp : item.label.label_en);
                                default: return item.label.label_en;
                            }
                        })()}
                    </option>
                )
            }, this);

        let countryList = selCountries.length > 0
            && selCountries.map((item, i) => {
                return (
                    <option key={i} value={item.realmCountryId}>
                        {item.country.label.label_en}
                    </option>
                )
            }, this);

        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row style={{ display: this.state.loading ? "none" : "block" }}>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {

                                    // console.log("-------------------->" + this.state.organisation.organisationCode);
                                    if (this.state.organisation.organisationCode != '') {
                                        this.setState({
                                            loading: true
                                        })
                                        OrganisationService.addOrganisation(this.state.organisation)
                                            .then(response => {
                                                if (response.status == 200) {
                                                    this.props.history.push(`/organisation/listOrganisation/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                                } else {
                                                    this.setState({
                                                        message: response.data.messageCode, loading: false
                                                    })
                                                }
                                            })
                                    }


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
                                            <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='organisationForm'>
                                                <CardBody>

                                                    <FormGroup>
                                                        <Label htmlFor="realmId">{i18n.t('static.organisation.realm')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            bsSize="sm"
                                                            value={this.state.organisation.realm.id}
                                                            valid={!errors.realmId && this.state.organisation.realm.id != ''}
                                                            invalid={touched.realmId && !!errors.realmId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getRealmCountryList(e) }}
                                                            onBlur={handleBlur}
                                                            type="select" name="realmId" id="realmId">
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {realmList}
                                                        </Input>
                                                        <FormFeedback>{errors.realmId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup className="Selectcontrol-bdrNone">
                                                        <Label htmlFor="realmCountryId">{i18n.t('static.organisation.realmcountry')}<span class="red Reqasterisk">*</span></Label>
                                                        <Select
                                                            bsSize="sm"
                                                            className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                                { 'is-valid': !errors.realmCountryId && this.state.organisation.realmCountryArray.length != 0 },
                                                                { 'is-invalid': (touched.realmCountryId && !!errors.realmCountryId) }
                                                            )}
                                                            name="realmCountryId"
                                                            id="realmCountryId"
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                setFieldValue("realmCountryId", e);
                                                                this.updateFieldData(e);
                                                            }}
                                                            onBlur={() => setFieldTouched("realmCountryId", true)}
                                                            multi
                                                            options={this.state.realmCountryList}
                                                            value={this.state.realmCountryId}
                                                        />
                                                        <FormFeedback>{errors.realmCountryId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label htmlFor="organisationCode">{i18n.t('static.organisation.organisationcode')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            bsSize="sm"
                                                            type="text" name="organisationCode" valid={!errors.organisationCode && this.state.organisation.organisationCode != ''}
                                                            invalid={touched.organisationCode && !!errors.organisationCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.organisation.organisationCode}
                                                            id="organisationCode" />
                                                        <FormFeedback className="red">{errors.organisationCode}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label htmlFor="organisationName">{i18n.t('static.organisation.organisationname')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            bsSize="sm"
                                                            type="text" name="organisationName" valid={!errors.organisationName && this.state.organisation.label.label_en != ''}
                                                            invalid={touched.organisationName && !!errors.organisationName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.organisation.label.label_en}
                                                            id="organisationName" />
                                                        <FormFeedback className="red">{errors.organisationName}</FormFeedback>
                                                    </FormGroup>

                                                </CardBody>

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
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>Loading...</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    cancelClicked() {
        this.props.history.push(`/organisation/listOrganisation/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    resetClicked() {
        let { organisation } = this.state

        organisation.label.label_en = ''
        organisation.organisationCode = ''
        organisation.realm.id = ''
        this.state.realmCountryId = ''

        this.setState({
            organisation
        }, (
        ) => {
        })
    }

}
