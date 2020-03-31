import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import RealmService from '../../api/RealmService';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';


const entityname = i18n.t('static.realm.realmMaster');
let initialValues = {
    realmCode: '',
    label: '',
    monthInPastForAmc: '',
    monthInFutureForAmc: '',
    orderFrequency: '',

}

const validationSchema = function (values) {
    return Yup.object().shape({
        realmCode: Yup.string()
            .required(i18n.t('static.realm.realmNameText')).max(6, i18n.t('static.realm.realmCodeLength')),
        label: Yup.string()
            .required(i18n.t('static.realm.realmCodeText')),
        monthInPastForAmc: Yup.number()
            .required(i18n.t('static.realm.monthInPastForAmcText')).min(0, i18n.t('static.program.validvaluetext')),
        monthInFutureForAmc: Yup.number()
            .required(i18n.t('static.realm.monthInFutureForAmcText')).min(0, i18n.t('static.program.validvaluetext')),
        orderFrequency: Yup.number()
            .required(i18n.t('static.realm.orderFrequencyText')).min(0, i18n.t('static.program.validvaluetext'))
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

export default class UpdateDataSourceComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            realm: this.props.location.state.realm,
            lang: localStorage.getItem('lang'),
            message: ''
        }
        this.Capitalize = this.Capitalize.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        initialValues = {
            realmCode: this.state.realm.realmCode,
            label: getLabelText(this.state.realm.label, this.state.lang),
            monthInPastForAmc: this.state.realm.monthInPastForAmc,
            monthInFutureForAmc: this.state.realm.monthInFutureForAmc,
            orderFrequency: this.state.realm.orderFrequency,
            defaultRealm: this.state.realm.defaultRealm,
        }

    }

    dataChange(event) {
        let { realm } = this.state
        if (event.target.name === "label") {
            realm.label.label_en = event.target.value
        }
        if (event.target.name === "realmCode") {
            realm.realmCode = event.target.value
        }
        if (event.target.name === "monthInPastForAmc") {
            realm.monthInPastForAmc = event.target.value
        }
        if (event.target.name === "monthInFutureForAmc") {
            realm.monthInFutureForAmc = event.target.value
        }
        if (event.target.name === "orderFrequency") {
            realm.orderFrequency = event.target.value
        }
        else if (event.target.name === "defaultRealm") {
            realm.defaultRealm = event.target.id === "active2" ? false : true
        }
        this.setState(
            {
                realm
            }
        )

    };

    touchAll(setTouched, errors) {
        setTouched({
            realmCode: true,
            label: true,
            monthInPastForAmc: true,
            monthInFutureForAmc: true,
            orderFrequency: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('realmForm', (fieldName) => {
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

    }

    Capitalize(str) {

    }
    cancelClicked() {
        this.props.history.push(`/realm/realmList/` + i18n.t('static.message.cancelled', { entityname }))
    }

    render() {

        return (
            <div className="animated fadeIn">
                <h5>{i18n.t(this.state.message)}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.realm.realmEdit')}</strong>{' '}
                            </CardHeader>
                            <Formik
                                enableReinitialize={true}
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    AuthenticationService.setupAxiosInterceptors();
                                    RealmService.updateRealm(this.state.realm)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/realm/realmList/` + i18n.t(response.data.messageCode, { entityname }))
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
                                            <Form onSubmit={handleSubmit} noValidate name='realmForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label for="realmCode">{i18n.t('static.realm.realmCode')}</Label>
                                                        <Input type="text"
                                                            name="realmCode"
                                                            id="realmCode"
                                                            bsSize="sm"
                                                            valid={!errors.realmCode}
                                                            invalid={touched.realmCode && !!errors.realmCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.realm.realmCode}
                                                            required />
                                                        <FormFeedback className="red">{errors.realmCode}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="label">{i18n.t('static.realm.realmName')}</Label>
                                                        <Input type="text"
                                                            name="label"
                                                            id="label"
                                                            bsSize="sm"
                                                            valid={!errors.label}
                                                            invalid={touched.label && !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.realm.label.label_en}
                                                            required />
                                                        <FormFeedback className="red">{errors.label}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="monthInPastForAmc">{i18n.t('static.realm.monthInPastForAmc')}</Label>
                                                        <Input type="number"
                                                            name="monthInPastForAmc"
                                                            id="monthInPastForAmc"
                                                            bsSize="sm"
                                                            valid={!errors.monthInPastForAmc}
                                                            invalid={touched.monthInPastForAmc && !!errors.monthInPastForAmc}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.realm.monthInPastForAmc}
                                                            required />
                                                        <FormFeedback className="red">{errors.monthInPastForAmc}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="monthInFutureForAmc">{i18n.t('static.realm.monthInFutureForAmc')}</Label>
                                                        <Input type="number"
                                                            bsSize="sm"
                                                            name="monthInFutureForAmc"
                                                            id="monthInFutureForAmc"
                                                            valid={!errors.monthInFutureForAmc}
                                                            invalid={touched.monthInFutureForAmc && !!errors.monthInFutureForAmc}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.realm.monthInFutureForAmc}
                                                            required />
                                                        <FormFeedback className="red">{errors.monthInFutureForAmc}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="orderFrequency">{i18n.t('static.realm.orderFrequency')}</Label>
                                                        <Input type="number"
                                                            name="orderFrequency"
                                                            id="orderFrequency"
                                                            bsSize="sm"
                                                            valid={!errors.orderFrequency}
                                                            invalid={touched.orderFrequency && !!errors.orderFrequency}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.realm.orderFrequency}
                                                            required />
                                                        <FormFeedback className="red">{errors.orderFrequency}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label>{i18n.t('static.realm.default')}</Label>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="defaultRealm"
                                                                value={true}
                                                                checked={this.state.realm.defaultRealm === true}
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
                                                                name="defaultRealm"
                                                                value={false}
                                                                checked={this.state.realm.defaultRealm === false}
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
                                                        <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-check"></i>{i18n.t('static.common.cancel')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
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

}