import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import RealmService from '../../api/RealmService'
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';


const entityname = i18n.t('static.realm.realm');
const initialValues = {
    realmCode: '',
    label: '',
    minMosMinGaurdrail: '',
    minMosMaxGaurdrail: '',
    maxMosMaxGaurdrail: '',
    minQplTolerance: '',
    minQplToleranceCutOff: '',
    maxQplTolerance: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({
        realmCode: Yup.string()
            .matches(/^\S*$/, i18n.t('static.validNoSpace.string'))
            .required(i18n.t('static.realm.realmCodeText'))
            .max(6, i18n.t('static.realm.realmCodeLength')),
        label: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.realm.realmNameText')),
        minMosMinGaurdrail: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            // .matches(/^[0-9]*$/, i18n.t('static.user.validnumber'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
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

        minQplTolerance: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.validated.minQplTolerance'))
            .min(0, i18n.t('static.program.validvaluetext')),
        minQplToleranceCutOff: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.validated.minQplToleranceCutOff'))
            .min(0, i18n.t('static.program.validvaluetext')),
        maxQplTolerance: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.validated.maxQplTolerance'))
            .min(0, i18n.t('static.program.validvaluetext')),
        // .min(0, i18n.t('static.program.validvaluetext')),
        /*monthInPastForAmc: Yup.number()
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

export default class AddRealmComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            realm: {
                realmCode: '',
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: ''
                },
                /* monthInPastForAmc: '',
                 monthInFutureForAmc: '',
                 orderFrequency: '',*/
                defaultRealm: true,
                minMosMinGaurdrail: '',
                minMosMaxGaurdrail: '',
                maxMosMaxGaurdrail: '',
                minQplTolerance: '',
                minQplToleranceCutOff: '',
                maxQplTolerance: ''
            },
            message: ''
        }
        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
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
        if (event.target.name === "minQplTolerance") {
            realm.minQplTolerance = event.target.value
        }
        if (event.target.name === "minQplToleranceCutOff") {
            realm.minQplToleranceCutOff = event.target.value
        }
        if (event.target.name === "maxQplTolerance") {
            realm.maxQplTolerance = event.target.value
        }
        /*  if (event.target.name === "monthInPastForAmc") {
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
            maxMosMaxGaurdrail: true,
            minQplTolerance: true,
            minQplToleranceCutOff: true,
            maxQplTolerance: true
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
        // AuthenticationService.setupAxiosInterceptors();
        this.setState({ loading: false })
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }
    Capitalize(str) {
        let { realm } = this.state
        realm.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }


    render() {

        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    // AuthenticationService.setupAxiosInterceptors();
                                    RealmService.addRealm(this.state.realm)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/realm/listRealm/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                                                                // message: error.response.data.messageCode,
                                                                message: i18n.t('static.message.alreadExists'),
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
                                            <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='realmForm' autocomplete="off">
                                                <CardBody style={{ display: this.state.loading ? "none" : "block" }}>

                                                    <FormGroup>
                                                        <Label for="label">{i18n.t('static.realm.realmName')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="label"
                                                            id="label"
                                                            bsSize="sm"
                                                            valid={!errors.label && this.state.realm.label.label_en != ''}
                                                            invalid={touched.label && !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.realm.label.label_en}
                                                            required />
                                                        <FormFeedback className="red">{errors.label}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="realmCode">{i18n.t('static.realm.realmCode')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="realmCode"
                                                            id="realmCode"
                                                            bsSize="sm"
                                                            valid={!errors.realmCode && this.state.realm.realmCode != ''}
                                                            invalid={touched.realmCode && !!errors.realmCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.realm.realmCode}
                                                            required />
                                                        <FormFeedback className="red">{errors.realmCode}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="minMosMinGaurdrail">{i18n.t('static.realm.minMosMinGaurdraillabel')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="number"
                                                            name="minMosMinGaurdrail"
                                                            id="minMosMinGaurdrail"
                                                            bsSize="sm"
                                                            valid={!errors.minMosMinGaurdrail && this.state.realm.minMosMinGaurdrail != ''}
                                                            invalid={touched.minMosMinGaurdrail && !!errors.minMosMinGaurdrail}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.realm.minMosMinGaurdrail}
                                                            required />
                                                        <FormFeedback className="red">{errors.minMosMinGaurdrail}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="minMosMaxGaurdrail">{i18n.t('static.realm.minMosMaxGaurdraillabel')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="number"
                                                            // min="0"
                                                            name="minMosMaxGaurdrail"
                                                            id="minMosMaxGaurdrail"
                                                            bsSize="sm"
                                                            valid={!errors.minMosMaxGaurdrail && this.state.realm.minMosMaxGaurdrail != ''}
                                                            invalid={touched.minMosMaxGaurdrail && !!errors.minMosMaxGaurdrail}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.realm.minMosMaxGaurdrail}
                                                            required />
                                                        <FormFeedback className="red">{errors.minMosMaxGaurdrail}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="maxMosMaxGaurdrail">{i18n.t('static.realm.maxMosMaxGaurdraillabel')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="number"
                                                            // min="0"
                                                            name="maxMosMaxGaurdrail"
                                                            id="maxMosMaxGaurdrail"
                                                            bsSize="sm"
                                                            valid={!errors.maxMosMaxGaurdrail && this.state.realm.maxMosMaxGaurdrail != ''}
                                                            invalid={touched.maxMosMaxGaurdrail && !!errors.maxMosMaxGaurdrail}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.realm.maxMosMaxGaurdrail}
                                                            required />
                                                        <FormFeedback className="red">{errors.maxMosMaxGaurdrail}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="minQplTolerance">{i18n.t('static.realm.minQplTolerance')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="number"
                                                            // min="0"
                                                            name="minQplTolerance"
                                                            id="minQplTolerance"
                                                            bsSize="sm"
                                                            valid={!errors.minQplTolerance && this.state.realm.minQplTolerance != ''}
                                                            invalid={touched.minQplTolerance && !!errors.minQplTolerance}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.realm.minQplTolerance}
                                                            required />
                                                        <FormFeedback className="red">{errors.minQplTolerance}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="minQplToleranceCutOff">{i18n.t('static.realm.minQplToleranceCutOff')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="number"
                                                            // min="0"
                                                            name="minQplToleranceCutOff"
                                                            id="minQplToleranceCutOff"
                                                            bsSize="sm"
                                                            valid={!errors.minQplToleranceCutOff && this.state.realm.minQplToleranceCutOff != ''}
                                                            invalid={touched.minQplToleranceCutOff && !!errors.minQplToleranceCutOff}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.realm.minQplToleranceCutOff}
                                                            required />
                                                        <FormFeedback className="red">{errors.minQplToleranceCutOff}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="maxQplTolerance">{i18n.t('static.realm.maxQplTolerance')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="number"
                                                            // min="0"
                                                            name="maxQplTolerance"
                                                            id="maxQplTolerance"
                                                            bsSize="sm"
                                                            valid={!errors.maxQplTolerance && this.state.realm.maxQplTolerance != ''}
                                                            invalid={touched.maxQplTolerance && !!errors.maxQplTolerance}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.realm.maxQplTolerance}
                                                            required />
                                                        <FormFeedback className="red">{errors.maxQplTolerance}</FormFeedback>
                                                    </FormGroup>
                                                    {/*  <FormGroup>
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
                                                                {i18n.t('static.realm.yes')}
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
                                                                {i18n.t('static.realm.no')}
                                                            </Label>
                                                        </FormGroup>
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
                                                        <Button type="reset" color="warning" size="md" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
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
        this.props.history.push(`/realm/listRealm/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        let { realm } = this.state

        realm.label.label_en = ''
        realm.realmCode = ''
        realm.minMosMinGaurdrail = ''
        realm.minMosMaxGaurdrail = ''
        realm.maxMosMaxGaurdrail = ''
        realm.minQplTolerance = ''
        realm.minQplToleranceCutOff = ''
        realm.maxQplTolerance = ''
        realm.defaultRealm = true
        this.setState(
            {
                realm
            }
        )

    }

}