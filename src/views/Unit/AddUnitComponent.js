import { Formik } from 'formik';
import React, { Component } from 'react';
import 'react-select/dist/react-select.min.css';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import DimensionService from '../../api/DimensionService';
import UnitService from '../../api/UnitService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import '../Forms/ValidationForms/ValidationForms.css';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { UNIT_LABEL_REGEX } from '../../Constants.js';


const initialValues = {
    unitName: "",
    unitCode: "",
    dimensionId: []
}
const entityname = i18n.t('static.unit.unit');
const validationSchema = function (values) {
    return Yup.object().shape({
        dimensionId: Yup.string()
            .required(i18n.t('static.unit.dimensiontext')),
        unitName: Yup.string()
            .matches(UNIT_LABEL_REGEX, i18n.t('static.message.alphaspespacenumtext'))
            .required(i18n.t('static.unit.unittext')),
        unitCode: Yup.string()
            .matches(UNIT_LABEL_REGEX, i18n.t('static.message.alphaspespacenumtext'))
            .required(i18n.t('static.unit.unitcodetext'))

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

class AddUnitComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            unit: {
                dimension: {
                    id: ''
                },
                label: {
                    label_en: ''
                },
                unitCode: ''
            },
            message: '',
            dimensions: []
        }

        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }

    dataChange(event) {
        let { unit } = this.state;
        if (event.target.name == "dimensionId") {
            unit.dimension.id = event.target.value;
        }
        if (event.target.name == "unitName") {
            unit.label.label_en = event.target.value;
        }
        if (event.target.name == "unitCode") {
            unit.unitCode = event.target.value;
        }
        this.setState({
            unit
        },
            () => { });
    };

    Capitalize(str) {
        if (str != null && str != "") {
            return str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return "";
        }
    }

    touchAll(setTouched, errors) {
        setTouched({
            unitName: true,
            unitCode: true,
            dimensionId: true
        }
        )
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
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        DimensionService.getDimensionListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        dimensions: response.data
                    })
                } else {

                    this.setState({
                        message: response.data.messageCode
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }
            })

    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }



    render() {
        const { dimensions } = this.state;
        let dimensionList = dimensions.length > 0
            && dimensions.map((item, i) => {
                return (
                    <option key={i} value={item.dimensionId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
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
                                    UnitService.addUnit(this.state.unit).then(response => {
                                        if (response.status == 200) {
                                            this.props.history.push(`/unit/listUnit/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                                        setTouched,
                                        handleReset
                                    }) => (
                                            <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label htmlFor="dimensionId">{i18n.t('static.dimension.dimension')}<span class="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-pencil"></i></InputGroupText> */}
                                                        <Input
                                                            type="select"
                                                            bsSize="sm"
                                                            name="dimensionId"
                                                            id="dimensionId"
                                                            valid={!errors.dimensionId && this.state.unit.dimension.id != ''}
                                                            invalid={touched.dimensionId && !!errors.dimensionId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.unit.dimension.id}
                                                            required
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {dimensionList}
                                                        </Input>
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.dimensionId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label for="unitName">{i18n.t('static.unit.unit')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="unitName"
                                                            id="unitName"
                                                            bsSize="sm"
                                                            valid={!errors.unitName && this.state.unit.label.label_en != ''}
                                                            invalid={touched.unitName && !!errors.unitName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.Capitalize(this.state.unit.label.label_en)}

                                                            required />
                                                        <FormFeedback className="red">{errors.unitName}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="unitCode">{i18n.t('static.unit.unitCode')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="unitCode"
                                                            id="unitCode"
                                                            bsSize="sm"
                                                            valid={!errors.unitCode && this.state.unit.unitCode != ''}
                                                            invalid={touched.unitCode && !!errors.unitCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.unit.unitCode}
                                                            required />
                                                        <FormFeedback className="red">{errors.unitCode}</FormFeedback>
                                                    </FormGroup>
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>

                                                        &nbsp;
                                                    </FormGroup>
                                                </CardFooter>
                                            </Form>
                                        )} />
                        </Card>
                    </Col>
                </Row>
                <div>
                    <h6>{i18n.t(this.state.message, { entityname })}</h6>
                    <h6>{i18n.t(this.props.match.params.message, { entityname })}</h6>
                </div>
            </div>
        );
    }

    cancelClicked() {
        this.props.history.push(`/unit/listUnit/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        let { unit } = this.state;

        unit.dimension.id = ''
        unit.label.label_en = ''
        unit.unitCode = ''

        this.setState({
            unit
        },
            () => { });
    }


}
export default AddUnitComponent;