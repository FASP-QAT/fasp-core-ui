import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button,CardBody, FormFeedback, Form, FormGroup, Label, Input, InputGroupAddon, InputGroupText, InputGroup } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import BudgetService from "../../api/BudgetService";
import ProgramService from "../../api/ProgramService";
import AuthenticationService from '../Common/AuthenticationService.js';
import SubFundingSourceService from '../../api/SubFundingSourceService';
import getLabelText from '../../CommonComponent/getLabelText'
import { Date } from 'core-js';


const initialValues = {
    budget: '',
    programId: '',
    subFundingSourceId: '',
    budgetAmt: '',
    startDate: '',
    stopDate: '',
    programList: [],
    subFundingSourceList: []
}
const entityname=i18n.t('static.budget.budget');
const validationSchema = function (values, t) {
    return Yup.object().shape({
        budget: Yup.string()
            .required(i18n.t('static.budget.budgetdesctext')),
        programId: Yup.string()
            .required(i18n.t('static.budget.programtext')),
        subFundingSourceId: Yup.string()
            .required(i18n.t('static.budget.subfundingtext')),
        budgetAmt: Yup.string()
            .required(i18n.t('static.budget.budgetamounttext')),
        startDate: Yup.string()
            .required(i18n.t('static.budget.startdatetext')),
        stopDate: Yup.string()
            .required(i18n.t('static.budget.stopdatetext'))
    })
}

const validate = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values, i18n.t)
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
class AddBudgetComponent extends Component {
    constructor(props) {


        super(props);
        this.state = {
            programs: [],
            subFundingSources: [],
            message: '',
            lang: localStorage.getItem('lang'),
            budget: {
                program: {
                },
                subFundingSource: {
                },
                label: {
                },
                startDate: '',
                stopDate: ''

            },

        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.currentDate = this.currentDate.bind(this);
    }

    currentDate() {
        var todaysDate = new Date();
        var yyyy = todaysDate.getFullYear().toString();
        var mm = (todaysDate.getMonth() + 1).toString();
        var dd = todaysDate.getDate().toString();
        var mmChars = mm.split('');
        var ddChars = dd.split('');
        let date = yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
        // console.log("------date", date)
        return date;
    }

    dataChange(event) {
        let { budget } = this.state;
        if (event.target.name === "budget") {
            budget.label.label_en = event.target.value;
        }
        if (event.target.name === "programId") {
            budget.program.programId = event.target.value;
        }
        if (event.target.name === "subFundingSourceId") {
            budget.subFundingSource.subFundingSourceId = event.target.value;
        }
        if (event.target.name === "budgetAmt") {
            budget.budgetAmt = event.target.value;
        }
        if (event.target.name === "startDate") {
            budget.startDate = event.target.value;
            budget.stopDate = ''
        }
        if (event.target.name === "stopDate") {
            budget.stopDate = event.target.value;
        }
        this.setState({
            budget
        },
            () => { });
    };

    touchAll(setTouched, errors) {
        setTouched({
            budget: true,
            programId: true,
            subFundingSourceId: true,
            budgetAmt: true,
            startDate: true,
            stopDate: true
        }
        );
        this.validateForm(errors);
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

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getProgramListForDropDown()
            .then(response => {
                // console.log(response.data);
                this.setState({
                    programs: response.data
                })
            }).catch(
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
                                this.setState({ message: i18n.t(error.response.data.messageCode ,{entityname})});
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                console.log("Error code unkown");
                                break;
                        }
                    }
                }
            );

        SubFundingSourceService.getSubFundingSourceListAll()
            .then(response => {
                console.log("--------res", response);
                this.setState({
                    subFundingSources: response.data
                })
                
            }).catch(
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
                                this.setState({ message: i18n.t(error.response.data.messageCode ,{entityname}) });
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

    render() {

        const { programs } = this.state;
        const { subFundingSources } = this.state;

        let programList = programs.length > 0 && programs.map((item, i) => {
            return (
                <option key={i} value={item.programId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);
        let subFundingSourceList = subFundingSources.length > 0 && subFundingSources.map((item, i) => {
            return (
                <option key={i} value={item.subFundingSourceId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.budget.budgetadd')}</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    BudgetService.addBudget(this.state.budget)
                                        .then(response => {
                                            if (response.status == "200") {
                                                this.props.history.push(`/budget/listBudget/`+i18n.t(response.data.messageCode,{entityname}))
                                            } else {
                                                this.setState({
                                                    message: response.data.message
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
                                                            this.setState({ message:i18n.t( error.response.data.messageCode,{entityname}) });
                                                            break;
                                                        default:
                                                            this.setState({ message: 'static.unkownError' });
                                                            console.log("Error code unkown");
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


                                            <Form onSubmit={handleSubmit} noValidate name='budgetForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label for="budget">{i18n.t('static.budget.budget')}</Label>
                                                        <InputGroup>
                                                            <InputGroupAddon addonType="prepend">
                                                                <InputGroupText><i className="fa fa-money"></i></InputGroupText>
                                                            </InputGroupAddon>
                                                            <Input
                                                                type="text"
                                                                name="budget"
                                                                id="budget"
                                                                bsSize="sm"
                                                                valid={!errors.budget}
                                                                invalid={touched.budget && !!errors.budget}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                required />
                                                            <FormFeedback className="red">{errors.budget}</FormFeedback>
                                                        </InputGroup>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="programId">{i18n.t('static.budget.program')}</Label>
                                                        <InputGroup>
                                                            <InputGroupAddon addonType="prepend">
                                                                <InputGroupText><i className="fa-object-group"></i></InputGroupText>
                                                            </InputGroupAddon> <Input
                                                                type="select"
                                                                name="programId"
                                                                id="programId"
                                                                bsSize="sm"
                                                                valid={!errors.programId}
                                                                invalid={touched.programId && !!errors.programId}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                required
                                                                value={this.state.programId}
                                                            >
                                                                <option value="">{i18n.t('static.common.select')}</option>
                                                                {programList}
                                                            </Input>
                                                            <FormFeedback className="red">{errors.programId}</FormFeedback>
                                                        </InputGroup>

                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="subFundingSourceId">{i18n.t('static.budget.subfundingsource')}</Label>
                                                        <InputGroup>
                                                            <InputGroupAddon addonType="prepend">
                                                                <InputGroupText><i className="fa fa-building-o"></i></InputGroupText>
                                                            </InputGroupAddon><Input
                                                                type="select"
                                                                name="subFundingSourceId"
                                                                id="subFundingSourceId"
                                                                bsSize="sm"
                                                                valid={!errors.subFundingSourceId}
                                                                invalid={touched.subFundingSourceId && !!errors.subFundingSourceId}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                required
                                                                value={this.state.subFundingSourceId}
                                                            >
                                                                <option value="">{i18n.t('static.common.select')}</option>
                                                                {subFundingSourceList}
                                                            </Input>
                                                            <FormFeedback className="red">{errors.subFundingSourceId}</FormFeedback>
                                                        </InputGroup>

                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="budgetAmt">{i18n.t('static.budget.budgetamount')}</Label>
                                                        <InputGroup>
                                                            <InputGroupAddon addonType="prepend">
                                                                <InputGroupText><i className="fa fa-usd"></i></InputGroupText>
                                                            </InputGroupAddon><Input type="text"
                                                                name="budgetAmt"
                                                                id="budgetAmt"
                                                                bsSize="sm"
                                                                valid={!errors.budgetAmt}
                                                                invalid={touched.budgetAmt && !!errors.budgetAmt}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                type="number"
                                                                placeholder={i18n.t('static.budget.budgetamountdesc')}
                                                                required />
                                                            <FormFeedback className="red">{errors.budgetAmt}</FormFeedback>
                                                        </InputGroup>

                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="startDate">{i18n.t('static.common.startdate')}</Label>
                                                        <InputGroup><InputGroupAddon addonType="prepend">
                                                            <InputGroupText><i className="fa fa-calendar-plus-o"></i></InputGroupText>
                                                        </InputGroupAddon><Input
                                                                // value={this.state.budget.st}
                                                                name="startDate"
                                                                id="startDate"
                                                                bsSize="sm"
                                                                valid={!errors.startDate}
                                                                invalid={touched.startDate && !!errors.startDate}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                type="date"
                                                                min={this.currentDate()}
                                                                placeholder={i18n.t('static.budget.budgetstartdate')}
                                                                required />
                                                            <FormFeedback className="red">{errors.startDate}</FormFeedback>
                                                        </InputGroup>

                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="stopDate">{i18n.t('static.common.stopdate')}</Label>
                                                        <InputGroup>
                                                            <InputGroupAddon addonType="prepend">
                                                                <InputGroupText><i className="fa fa-calendar-minus-o"></i></InputGroupText>
                                                            </InputGroupAddon><Input
                                                                value={this.state.budget.stopDate}
                                                                name="stopDate"
                                                                id="stopDate"
                                                                bsSize="sm"
                                                                valid={!errors.stopDate}
                                                                invalid={touched.stopDate && !!errors.stopDate}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                type="date"
                                                                min={this.state.budget.startDate}
                                                                placeholder={i18n.t('static.budget.budgetstopdate')}
                                                                required />
                                                            <FormFeedback className="red">{errors.stopDate}</FormFeedback>
                                                        </InputGroup>

                                                    </FormGroup>
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>

                                                        {/* <Button type="reset" size="sm" color="warning" className="float-right mr-1"><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button> */}
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
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
                    <h6>{i18n.t(this.state.message)}</h6>
                    <h6>{i18n.t(this.props.match.params.message)}</h6>
                </div>
            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/budget/listBudget/` + i18n.t('static.message.cancelled',{entityname}))
    }
}

export default AddBudgetComponent;
