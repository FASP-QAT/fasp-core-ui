import React, { Component } from "react";
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import '../Forms/ValidationForms/ValidationForms.css';
import ProgramServcie from '../../api/ProgramService';
import BudgetServcie from '../../api/BudgetService';
import getLabelText from '../../CommonComponent/getLabelText'


let initialValues = {
     budget:''
}
const validationSchema = function (values) {
    return Yup.object().shape({
        budget: Yup.string()
            .required("Please enter Budget name"),
        programId: Yup.string()
            .required('Please select program.'),
        subFundingSourceId: Yup.string()
            .required('Please select sub funding source'),
        budgetAmt: Yup.string()
            .required('Please enter budget amount'),
        startDate: Yup.string()
            .required('Please enter start date'),
        stopDate: Yup.string()
            .required('Please enter stop date')
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

export default class EditBudget extends Component {
    constructor(props) {
        super(props);
        this.state = {
            budget: this.props.location.state.budget,
            message: '',
            programList: [],
            subFundingSourceList: [],
            lang: 'en'
        }
        initialValues={
            budget: getLabelText(this.props.location.state.budget.label,this.state.lan),
            programId: this.props.location.state.budget.program.programId,
            subFundingSourceId:this.props.location.state.budget.subFundingSource.subFundingSourceId,
            budgetAmt:this.props.location.state.budget.budgetAmt,
            startDate:this.props.location.state.budget.startDate,
            stopDate:this.props.location.state.budget.stopDate
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        
    }

    dataChange(event) {
        let { budget } = this.state;
        if (event.target.name == "budget") {
            budget.label.label_en = event.target.value;
        } if (event.target.name == "programId") {
            budget.program.programId = event.target.value;
        } if (event.target.name == 'subFundingSourceId') {
            budget.subFundingSource.subFundingSourceId = event.target.value;
        } if (event.target.name == 'budgetAmt') {
            budget.budgetAmt = event.target.value;
        } if (event.target.name == 'startDate') {
            budget.startDate = event.target.value;
        } else if (event.target.name == 'stopDate') {
            budget.stopDate = event.target.value;
        }

        this.setState({ budget }, () => {})
    }
    

    componentDidMount() {

        ProgramServcie.getProgramList().then(response => {
            // console.log(response.data)
            this.setState({
                programList: response.data
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
                }
            );
    }

    touchAll(setTouched, errors) {
        setTouched({
            programId: true,
            budget: true,
            subFundingSourceId: true,
            budgetAmt: true,
            startDate: true,
            stopDate: true
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
    cancelClicked() {
        this.props.history.push(`/budget/listBudgets/` + "Action Canceled")
    }

    render() {
        const lan = 'en';
        const { programList } = this.state;
        let programs = programList.length > 0
            && programList.map((item, i) => {
                return (
                    
                    <option key={i} value={item.programId}>{getLabelText(item.label, lan)}</option>
                )
            }, this);
        return (
            <>
                <Col xs="12" sm="8">
                    <Card>
                        <Formik
                            initialValues={initialValues}
                            validate={validate(validationSchema)}
                            onSubmit={(values, { setSubmitting, setErrors }) => {
                                console.log(this.state.budget);
                                BudgetServcie.editBudget(this.state.budget).then(response => {
                                    this.props.history.push(`/budget/listBudgets/${response.data.message}`)
                                }
                                )
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
                                        }
                                    )
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
                                        <Form onSubmit={handleSubmit} noValidate name='simpleForm'>
                                            <CardHeader>
                                                <strong>Edit Budget</strong>
                                                {/* <small> Form</small> */}
                                            </CardHeader>
                                            <CardBody>

                                                <FormGroup>
                                                    <Col md="3">
                                                        <Label htmlFor="company">Budget</Label>
                                                    </Col>
                                                    <Col xs="12" md="9">
                                                        <Input type="text" name="budget" id="budget"
                                                            valid={!errors.budget}
                                                            invalid={touched.budget && !!errors.budget}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}

                                                            placeholder="Enter your budget name"
                                                            value={getLabelText(this.state.budget.label,this.state.lang)} />
                                                        <FormFeedback>{errors.budget}</FormFeedback>
                                                    </Col>

                                                </FormGroup>
                                                <FormGroup >
                                                    <Col md="3">
                                                        <Label htmlFor="select">Select Program</Label>
                                                    </Col>
                                                    <Col xs="12" md="9">
                                                        <Input type="select"
                                                            disabled
                                                            valid={!errors.programId}
                                                            invalid={touched.programId && !!errors.programId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur} name="programId" id="programId"
                                                            value={this.state.budget.program.programId}>
                                                            {/* <option value="0">Please select</option> */}
                                                            {programs}
                                                        </Input>
                                                        <FormFeedback>{errors.programId}</FormFeedback>
                                                    </Col>

                                                </FormGroup>
                                                <FormGroup >
                                                    <Col md="3">
                                                        <Label htmlFor="select">Select Sub Funding Source</Label>
                                                    </Col>
                                                    <Col xs="12" md="9">
                                                        <Input
                                                            disabled    
                                                            type="select" valid={!errors.subFundingSourceId}
                                                            invalid={touched.subFundingSourceId && !!errors.subFundingSourceId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur} name="subFundingSourceId" id="subFundingSourceId"
                                                            value={this.state.budget.subFundingSource.subFundingSourceId}>
                                                            {/* <option value="">Please select</option> */}
                                                            <option value="1">Sub Funding Source #1</option>
                                                            <option value="2">Sub Funding Source #2</option>
                                                            <option value="3">Sub Funding Source #3</option>
                                                        </Input>
                                                        <FormFeedback>{errors.subFundingSourceId}</FormFeedback>
                                                    </Col>

                                                </FormGroup>
                                                <FormGroup>
                                                    <Col md="3">
                                                        <Label htmlFor="company">Budget Amount</Label>
                                                    </Col>
                                                    <Col xs="12" md="9">
                                                        <Input
                                                            valid={!errors.budgetAmt}
                                                            invalid={touched.budgetAmt && !!errors.budgetAmt}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur} type="number" id="budgetAmt" name="budgetAmt" placeholder="Enter your budget amount"
                                                            value={this.state.budget.budgetAmt} />
                                                        <FormFeedback>{errors.budgetAmt}</FormFeedback>
                                                    </Col>

                                                </FormGroup>
                                                <FormGroup>
                                                    <Col md="3">
                                                        <Label htmlFor="date-input">Start Date</Label>
                                                    </Col>
                                                    <Col xs="12" md="9">
                                                        <Input
                                                            valid={!errors.startDate}
                                                            invalid={touched.startDate && !!errors.startDate}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur} type="date" id="startDate" name="startDate" placeholder="date"
                                                            value={this.state.budget.startDate} />
                                                        <FormFeedback>{errors.startDate}</FormFeedback>
                                                    </Col>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Col md="3">
                                                        <Label htmlFor="date-input">Stop Date</Label>
                                                    </Col>
                                                    <Col xs="12" md="9">
                                                        <Input valid={!errors.stopDate}
                                                            invalid={touched.stopDate && !!errors.stopDate}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur} type="date" id="stopDate" name="stopDate" placeholder="date"
                                                            value={this.state.budget.stopDate} />
                                                        <FormFeedback>{errors.stopDate}</FormFeedback>
                                                    </Col>
                                                </FormGroup>

                                            </CardBody>
                                            <CardFooter>
                                                <Button type="submit" onClick={() => this.touchAll(setTouched, errors)} size="sm" color="primary"><i className="fa fa-dot-circle-o"></i>Update</Button>
                                                {/* <Button type="reset" size="sm" color="danger"><i className="fa fa-ban"></i> Reset</Button> */}
                                            </CardFooter>
                                        </Form>
                                    )} />
                    </Card>
                </Col>
            </>
        )
    }

}