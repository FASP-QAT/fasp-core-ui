import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import FundingSourceService from "../../api/FundingSourceService";
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { LABEL_REGEX } from '../../Constants.js';

let initialValues = {
    fundingSource: "",
    fundingSourceCode: "",
}
const entityname = i18n.t('static.fundingsource.fundingsource');
const validationSchema = function (values) {
    return Yup.object().shape({
        fundingSource: Yup.string()
            .matches(LABEL_REGEX, i18n.t('static.message.rolenamevalidtext'))
            .required(i18n.t('static.fundingsource.fundingsourcetext')),
        fundingSourceCode: Yup.string()
            .matches(/^[a-zA-Z]+$/, i18n.t('static.common.alphabetsOnly'))
            .required(i18n.t('static.fundingsource.fundingsourceCodeText')),
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

class EditFundingSourceComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // fundingSource: this.props.location.state.fundingSource,
            fundingSource: {
                realm: {
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: '',
                    }
                },
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: '',
                },
                fundingSourceCode: '',
            },
            message: '',
            lang: localStorage.getItem('lang'),
            loading: true
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.changeMessage = this.changeMessage.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.changeLoading = this.changeLoading.bind(this);
    }
    changeMessage(message) {
        this.setState({ message: message })
    }
    changeLoading(loading) {
        this.setState({ loading: loading })
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        FundingSourceService.getFundingSourceById(this.props.match.params.fundingSourceId).then(response => {
            if (response.status == 200) {
                console.log("RESP----", response.data);
                this.setState({
                    fundingSource: response.data, loading: false
                });
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
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    dataChange(event) {
        let { fundingSource } = this.state;
        if (event.target.name == "fundingSource") {
            fundingSource.label.label_en = event.target.value;
        }
        if (event.target.name == "active") {
            fundingSource.active = event.target.id === "active2" ? false : true;
        }
        if (event.target.name == "fundingSourceCode") {
            fundingSource.fundingSourceCode = event.target.value.toUpperCase();;
        }
        this.setState({
            fundingSource
        },
            () => { });
    };

    touchAll(setTouched, errors) {
        setTouched({
            fundingSource: true,
            fundingSourceCode: true,
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('fundingSourceForm', (fieldName) => {
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
        if (str != null && str != "") {
            let { fundingSource } = this.state
            fundingSource.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
        }
    }

    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={this.changeMessage} loading={this.changeLoading} />
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row style={{ display: this.state.loading ? "none" : "block" }}>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                enableReinitialize={true}
                                initialValues={{
                                    fundingSource: this.state.fundingSource.label.label_en,
                                    fundingSourceCode: this.state.fundingSource.fundingSourceCode
                                }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    AuthenticationService.setupAxiosInterceptors();
                                    console.log("FUNDING_SOURCE----", this.state.fundingSource);
                                    FundingSourceService.updateFundingSource(this.state.fundingSource)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/fundingSource/listFundingSource/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                            } else {

                                                this.setState({
                                                    message: response.data.messageCode, loading: false
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
                                            <Form onSubmit={handleSubmit} noValidate name='fundingSourceForm'>
                                                <CardBody className="pb-0">
                                                    <FormGroup>
                                                        <Label htmlFor="realmId">{i18n.t('static.fundingsource.realm')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="text"
                                                            name="realmId"
                                                            id="realmId"
                                                            bsSize="sm"
                                                            readOnly
                                                            value={getLabelText(this.state.fundingSource.realm.label, this.state.lang)}
                                                        >
                                                        </Input>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="fundingSource">{i18n.t('static.fundingsource.fundingsource')}<span className="red Reqasterisk">*</span> </Label>
                                                        <Input type="text"
                                                            name="fundingSource"
                                                            id="fundingSource"
                                                            bsSize="sm"
                                                            valid={!errors.fundingSource}
                                                            invalid={touched.fundingSource && !!errors.fundingSource || this.state.fundingSource.label.label_en == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.fundingSource.label.label_en}
                                                            required />
                                                        <FormFeedback className="red">{errors.fundingSource}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="fundingSource">{i18n.t('static.fundingsource.fundingsourceCode')}<span className="red Reqasterisk">*</span> </Label>
                                                        <Input type="text"
                                                            name="fundingSourceCode"
                                                            id="fundingSourceCode"
                                                            bsSize="sm"
                                                            valid={!errors.fundingSourceCode && this.state.fundingSource.fundingSourceCode != ''}
                                                            invalid={touched.fundingSourceCode && !!errors.fundingSourceCode || this.state.fundingSource.fundingSourceCode == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.fundingSource.fundingSourceCode}
                                                            required
                                                            maxLength={6}
                                                        />
                                                        <FormFeedback className="red">{errors.fundingSourceCode}</FormFeedback>
                                                    </FormGroup>


                                                    <FormGroup>
                                                        <Label className="P-absltRadio">{i18n.t('static.common.status')}&nbsp;&nbsp;</Label>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="active"
                                                                value={true}
                                                                checked={this.state.fundingSource.active === true}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-active1">
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
                                                                checked={this.state.fundingSource.active === false}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-active2">
                                                                {i18n.t('static.common.disabled')}
                                                            </Label>
                                                        </FormGroup>
                                                    </FormGroup>
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
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
                <div>
                    <h6>{i18n.t(this.state.message)}</h6>
                    <h6>{i18n.t(this.props.match.params.message)}</h6>
                </div>
            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/fundingSource/listFundingSource/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        AuthenticationService.setupAxiosInterceptors();
        FundingSourceService.getFundingSourceById(this.props.match.params.fundingSourceId).then(response => {
            this.setState({
                fundingSource: response.data
            });

        })
    }
}

export default EditFundingSourceComponent;
