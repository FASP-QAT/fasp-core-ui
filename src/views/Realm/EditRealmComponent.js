import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import RealmService from '../../api/RealmService';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'


const entityname = i18n.t('static.realm.realm');
let initialValues = {
    realmCode: '',
    label: '',
    minMosMinGaurdrail: '',
    minMosMaxGaurdrail: '',
    maxMosMaxGaurdrail: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({
        realmCode: Yup.string()
            .required(i18n.t('static.realm.realmNameText')).max(6, i18n.t('static.realm.realmCodeLength')),
        label: Yup.string()
            .required(i18n.t('static.realm.realmCodeText')),
        minMosMinGaurdrail: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            // .matches(/^[0-9]*$/, i18n.t('static.user.validnumber'))
            .required(i18n.t('static.realm.minMosMinGaurdrail')),
        // .min(0, i18n.t('static.program.validvaluetext')),
        minMosMaxGaurdrail: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            // .matches(/^[0-9]*$/, i18n.t('static.user.validnumber'))
            .required(i18n.t('static.realm.minMosMaxGaurdrail')),
        // .min(0, i18n.t('static.program.validvaluetext')),
        maxMosMaxGaurdrail: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            // .matches(/^[0-9]*$/, i18n.t('static.user.validnumber'))
            .required(i18n.t('static.realm.maxMosMaxGaurdrail')),
        // .min(0, i18n.t('static.program.validvaluetext')),
        /*   monthInPastForAmc: Yup.number()
               .required(i18n.t('static.realm.monthInPastForAmcText')).min(0, i18n.t('static.program.validvaluetext')),
           monthInFutureForAmc: Yup.number()
               .required(i18n.t('static.realm.monthInFutureForAmcText')).min(0, i18n.t('static.program.validvaluetext')),
           orderFrequency: Yup.number()
               .required(i18n.t('static.realm.orderFrequencyText')).min(0, i18n.t('static.program.validvaluetext'))*/
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
            // realm: this.props.location.state.realm,
            realm: {
                realmCode: '',
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: ''
                },
                /*  monthInPastForAmc: '',
                  monthInFutureForAmc: '',
                  orderFrequency: '',*/
                defaultRealm: '',
                minMosMinGaurdrail: '',
                minMosMaxGaurdrail: '',
                maxMosMaxGaurdrail: ''
            },
            lang: localStorage.getItem('lang'),
            message: ''
        }
        this.Capitalize = this.Capitalize.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.changeMessage = this.changeMessage.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }
    changeMessage(message) {
        this.setState({ message: message })
    }

    dataChange(event) {
        let { realm } = this.state
        if (event.target.name === "label") {
            realm.label.label_en = event.target.value
        }
        if (event.target.name === "realmCode") {
            realm.realmCode = event.target.value.toUpperCase();
        }
        if (event.target.name === "minMosMinGaurdrail") {
            realm.minMosMinGaurdrail = event.target.value
        }
        if (event.target.name === "minMosMaxGaurdrail") {
            realm.minMosMaxGaurdrail = event.target.value
        }
        if (event.target.name === "maxMosMaxGaurdrail") {
            realm.maxMosMaxGaurdrail = event.target.value
        }
        /* if (event.target.name === "monthInPastForAmc") {
             realm.monthInPastForAmc = event.target.value
         }
         if (event.target.name === "monthInFutureForAmc") {
             realm.monthInFutureForAmc = event.target.value
         }
         if (event.target.name === "orderFrequency") {
             realm.orderFrequency = event.target.value
         }*/
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
            minMosMinGaurdrail: true,
            minMosMaxGaurdrail: true,
            maxMosMaxGaurdrail: true
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

    componentDidMount(str) {
        AuthenticationService.setupAxiosInterceptors();
        RealmService.getRealmById(this.props.match.params.realmId).then(response => {
            if (response.status == 200) {
                this.setState({
                    realm: response.data
                });
            }
            else {

                this.setState({
                    message: response.data.messageCode
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }


        })
    }

    Capitalize(str) {
        let { realm } = this.state
        realm.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }
    cancelClicked() {
        this.props.history.push(`/realm/realmList/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    render() {

        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={this.changeMessage} />
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                enableReinitialize={true}
                                initialValues={{
                                    realmCode: this.state.realm.realmCode,
                                    label: getLabelText(this.state.realm.label, this.state.lang),
                                    minMosMinGaurdrail: this.state.realm.minMosMinGaurdrail,
                                    minMosMaxGaurdrail: this.state.realm.minMosMaxGaurdrail,
                                    maxMosMaxGaurdrail: this.state.realm.maxMosMaxGaurdrail,
                                    defaultRealm: this.state.realm.defaultRealm,
                                }}

                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    AuthenticationService.setupAxiosInterceptors();
                                    RealmService.updateRealm(this.state.realm)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/realm/realmList/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode
                                                },
                                                    () => {
                                                        this.hideSecondComponent();
                                                    })
                                            }
                                        })
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
                                                        <Label for="label">{i18n.t('static.realm.realmName')}</Label>
                                                        <Input type="text"
                                                            name="label"
                                                            id="label"
                                                            bsSize="sm"
                                                            valid={!errors.label}
                                                            invalid={touched.label && !!errors.label || this.state.realm.label.label_en == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.realm.label.label_en}
                                                            required />
                                                        <FormFeedback className="red">{errors.label}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="realmCode">{i18n.t('static.realm.realmCode')}</Label>
                                                        <Input type="text"
                                                            name="realmCode"
                                                            id="realmCode"
                                                            bsSize="sm"
                                                            valid={!errors.realmCode}
                                                            invalid={touched.realmCode && !!errors.realmCode || this.state.realm.realmCode == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.realm.realmCode}
                                                            required />
                                                        <FormFeedback className="red">{errors.realmCode}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="minMosMinGaurdrail">{i18n.t('static.realm.minMosMinGaurdraillabel')}</Label>
                                                        <Input type="number"
                                                            // min="0"
                                                            name="minMosMinGaurdrail"
                                                            id="minMosMinGaurdrail"
                                                            bsSize="sm"
                                                            valid={!errors.minMosMinGaurdrail && this.state.realm.minMosMinGaurdrail != ''}
                                                            invalid={touched.minMosMinGaurdrail && !!errors.minMosMinGaurdrail || this.state.realm.minMosMinGaurdrail == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.realm.minMosMinGaurdrail}
                                                            required />
                                                        <FormFeedback className="red">{errors.minMosMinGaurdrail}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="minMosMaxGaurdrail">{i18n.t('static.realm.minMosMaxGaurdraillabel')}</Label>
                                                        <Input type="number"
                                                            // min="0"
                                                            name="minMosMaxGaurdrail"
                                                            id="minMosMaxGaurdrail"
                                                            bsSize="sm"
                                                            valid={!errors.minMosMaxGaurdrail && this.state.realm.minMosMaxGaurdrail != ''}
                                                            invalid={touched.minMosMaxGaurdrail && !!errors.minMosMaxGaurdrail || this.state.realm.minMosMaxGaurdrail == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.realm.minMosMaxGaurdrail}
                                                            required />
                                                        <FormFeedback className="red">{errors.minMosMaxGaurdrail}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="maxMosMaxGaurdrail">{i18n.t('static.realm.maxMosMaxGaurdraillabel')}</Label>
                                                        <Input type="number"
                                                            // min="0"
                                                            name="maxMosMaxGaurdrail"
                                                            id="maxMosMaxGaurdrail"
                                                            bsSize="sm"
                                                            valid={!errors.maxMosMaxGaurdrail && this.state.realm.maxMosMaxGaurdrail != ''}
                                                            invalid={touched.maxMosMaxGaurdrail && !!errors.maxMosMaxGaurdrail || this.state.realm.maxMosMaxGaurdrail == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.realm.maxMosMaxGaurdrail}
                                                            required />
                                                        <FormFeedback className="red">{errors.maxMosMaxGaurdrail}</FormFeedback>
                                                    </FormGroup>
                                                    {/*    <FormGroup>
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
                                                </FormGroup>*/}
                                                    <FormGroup>
                                                        <Label className="P-absltRadio">{i18n.t('static.realm.default')}  </Label>
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
                                                        <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                        <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
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

    resetClicked() {
        AuthenticationService.setupAxiosInterceptors();
        RealmService.getRealmById(this.props.match.params.realmId).then(response => {
            this.setState({
                realm: response.data
            });

        }).catch(
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
                            console.log("Error code unkown");
                            break;
                    }
                }
            }
        );
    }

}