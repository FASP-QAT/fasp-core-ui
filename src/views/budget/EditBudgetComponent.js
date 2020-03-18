import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'

import i18n from '../../i18n'
import getLabelText from '../../CommonComponent/getLabelText'

import BudgetService from "../../api/BudgetService";
import AuthenticationService from '../common/AuthenticationService.js';

let initialValues = {
    budget: '',
    programId: '',
    subFundingSourceId: '',
    budgetAmt: '',
    startDate: '',
    stopDate: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({
        budget: Yup.string()
            .required('Please enter Budget'),
        budgetAmt: Yup.string()
            .required('Please enter Budget amount'),
        startDate: Yup.string()
            .required('Please enter Start date'),
        stopDate: Yup.string()
            .required('Please enter Stop date')
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

class EditBudgetComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            budget: this.props.location.state.budget,
            message: '',
            lan: 'en'
        }
        initialValues = {
            budget: getLabelText(this.props.location.state.budget.label, this.state.lan),
            programId: this.props.location.state.budget.program.programId,
            subFundingSourceId: this.props.location.state.budget.subFundingSource.subFundingSourceId,
            budgetAmt: this.props.location.state.budget.budgetAmt,
            startDate: this.props.location.state.budget.startDate,
            stopDate: this.props.location.state.budget.stopDate,
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
    }

    dataChange(event) {
        let { budget } = this.state;
        if (event.target.name === "budget") {
            budget.label.label_en = event.target.value;
        }
        if (event.target.name === "budgetAmt") {
            budget.budgetAmt = event.target.value;
        } if (event.target.name === "startDate") {
            budget.startDate = event.target.value;
        } if (event.target.name === "stopDate") {
            budget.stopDate = event.target.value;
        } else if (event.target.name === "active") {
            budget.active = event.target.id === "active2" ? false : true;
        }
        this.setState({
            budget
        },
            () => { });
    };

    touchAll(setTouched, errors) {
        setTouched({
            budget: true,
            budgetAmt: true,
            startDate: true,
            stopDate: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('budgetForm', (fieldName) => {
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

    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.budget.budgetedit')}</strong>{' '}
                            </CardHeader>
                            <Formik
                                enableReinitialize={true}
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    AuthenticationService.setupAxiosInterceptors();
                                    BudgetService.editBudget(this.state.budget)
                                        .then(response => {
                                            if (response.status == "200") {
                                                this.props.history.push(`/budget/listBudget/${response.data.message}`)
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
                                            <Form onSubmit={handleSubmit} noValidate name='budgetForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label for="budget">{i18n.t('static.budget.budget')}</Label>
                                                        <Input type="text"
                                                            name="budget"
                                                            id="budget"
                                                            bsSize="sm"
                                                            valid={!errors.budget}
                                                            invalid={touched.budget && !!errors.budget}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={getLabelText(this.state.budget.label, this.state.lan)}
                                                            required />
                                                        <FormFeedback>{errors.budget}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="programId">{i18n.t('static.budget.program')}</Label>
                                                        <Input
                                                            type="text"
                                                            name="programId"
                                                            id="programId"
                                                            bsSize="sm"
                                                            readOnly
                                                            valid={!errors.programId}
                                                            invalid={touched.programId && !!errors.programId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.budget.program.label.label_en}
                                                        >
                                                        </Input>
                                                        <FormFeedback>{errors.programId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="subFundingSourceId">{i18n.t('static.budget.subfundingsource')}</Label>
                                                        <Input
                                                            type="text"
                                                            name="subFundingSourceId"
                                                            id="subFundingSourceId"
                                                            bsSize="sm"
                                                            valid={!errors.subFundingSourceId}
                                                            invalid={touched.subFundingSourceId && !!errors.subFundingSourceId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            readOnly
                                                            required
                                                            value={this.state.budget.subFundingSource.label.label_en}
                                                        >
                                                        </Input>
                                                        <FormFeedback>{errors.subFundingSourceId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="budgetAmt">{i18n.t('static.budget.budgetamount')}</Label>
                                                        <Input type="text"
                                                            name="budgetAmt"
                                                            id="budgetAmt"
                                                            bsSize="sm"
                                                            valid={!errors.budgetAmt}
                                                            invalid={touched.budgetAmt && !!errors.budgetAmt}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            placeholder={i18n.t('static.budget.budgetamountdesc')}
                                                            value={this.state.budget.budgetAmt}
                                                            required />
                                                        <FormFeedback>{errors.budgetAmt}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="startDate">{i18n.t('static.common.startdate')}</Label>
                                                        <Input type="text"
                                                            name="startDate"
                                                            id="startDate"
                                                            bsSize="sm"
                                                            valid={!errors.startDate}
                                                            invalid={touched.startDate && !!errors.startDate}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="date"
                                                            value={this.state.budget.startDate}
                                                            placeholder="{i18n.t('static.budget.budgetstartdate')}"
                                                            required />
                                                        <FormFeedback>{errors.startDate}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="stopDate">{i18n.t('static.common.stopdate')}</Label>
                                                        <Input type="text"
                                                            name="stopDate"
                                                            id="stopDate"
                                                            bsSize="sm"
                                                            valid={!errors.stopDate}
                                                            invalid={touched.stopDate && !!errors.stopDate}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="date"
                                                            value={this.state.budget.stopDate}
                                                            placeholder="{i18n.t('static.budget.budgetstopdate')}"
                                                            required />
                                                        <FormFeedback>{errors.stopDate}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label>{i18n.t('static.common.status')}&nbsp;&nbsp;</Label>

                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="active"
                                                                value={true}
                                                                checked={this.state.budget.active === true}
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
                                                                checked={this.state.budget.active === false}
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
                                                        {/* <Button type="reset" size="sm" color="warning" className="float-right mr-1"><i className="fa fa-ban"></i> Reset</Button> */}
                                                        <Button type="button" size="sm" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.budget.cancel')}</Button>
                                                        <Button type="submit" size="sm" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>Update</Button>
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
        this.props.history.push(`/budget/listBudget/` + "Action Canceled")
    }
}

export default EditBudgetComponent;
