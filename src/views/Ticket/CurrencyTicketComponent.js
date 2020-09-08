import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';

const initialValues = {
    summary: "Add / Update Currency",
    currencyName: "",
    currencyCode: "",
    conversionRatetoUSD: "",        
    notes: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({        
        summary: Yup.string()
            .required(i18n.t('static.common.summarytext')),
        currencyName: Yup.string()
            .required(i18n.t('static.currency.currencytext')),
        currencyCode: Yup.string()
            .required(i18n.t('static.currency.currencycodetext')),
        conversionRatetoUSD: Yup.string()
            .required(i18n.t('static.currency.currencyconversiontext')),        
        // notes: Yup.string()
        //     .required(i18n.t('static.common.notestext'))
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

export default class CurrencyTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currency: {
                summary: 'Add / Update Currency',
                currencyName: "",
                currencyCode: "",
                conversionRatetoUSD: "",
                notes: ''
            },
            message : ''
        }        
        this.dataChange = this.dataChange.bind(this);        
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }  

    dataChange(event) {        
        let { currency } = this.state
        if(event.target.name == "summary") {
            currency.summary = event.target.value;
        }
        if(event.target.name == "currencyName") {
            currency.currencyName = event.target.value;
        }
        if(event.target.name == "currencyCode") {
            currency.currencyCode = event.target.value;
        }
        if(event.target.name == "conversionRatetoUSD") {
            currency.conversionRatetoUSD = event.target.value;
        }    
        if(event.target.name == "notes") {
            currency.notes = event.target.value;
        }
        this.setState({       
            currency
        }, () => {})
    };

    touchAll(setTouched, errors) {
        setTouched({            
            summary: true,
            currencyName: true,
            currencyCode: true,
            conversionRatetoUSD: true,
            notes: true
        })
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

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';            
        }, 8000);
    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }

    resetClicked() {        
        let { currency } = this.state;
        currency.summary = '';
        currency.currencyName = '';
        currency.currencyCode = '';
        currency.conversionRatetoUSD = '';              
        currency.notes = '';   
        this.setState({
            currency
        },
            () => { });
    }

    render() {

        return (
            <div className="col-md-12">
                <h5 style={{ color: "green" }} id="div2">{i18n.t(this.state.message)}</h5>                
                <h4>{i18n.t('static.currency.currencyMaster')}</h4>
                <br></br>
                <Formik
                    initialValues={initialValues}
                    validate={validate(validationSchema)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {   
                        JiraTikcetService.addEmailRequestIssue(values).then(response => {                                         
                            console.log("Response :",response.status, ":" ,JSON.stringify(response.data));
                            if (response.status == 200 || response.status == 201) {
                                var msg = response.data.key;
                                this.setState({
                                    message: msg
                                },
                                    () => {
                                        this.resetClicked();
                                        this.hideSecondComponent();
                                    })                                
                            } else {
                                this.setState({
                                    // message: response.data.messageCode
                                    message: 'Error while creating query'
                                },
                                    () => {
                                        this.resetClicked();
                                        this.hideSecondComponent();
                                    })                                
                            }                            
                            this.props.togglehelp();
                            this.props.toggleSmall(this.state.message);
                        })
                        // .catch(
                        //     error => {
                        //         switch (error.message) {
                        //             case "Network Error":
                        //                 this.setState({
                        //                     message: 'Network Error'
                        //                 })
                        //                 break
                        //             default:
                        //                 this.setState({
                        //                     message: 'Error'
                        //                 })
                        //                 break
                        //         }
                        //         alert(this.state.message);
                        //         this.props.togglehelp();
                        //     }
                        // );       
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
                                    < FormGroup >
                                        <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="summary" id="summary"
                                        bsSize="sm"
                                        valid={!errors.summary && this.state.currency.summary != ''}
                                        invalid={touched.summary && !!errors.summary}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.currency.summary}
                                        required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="currencyName">{i18n.t('static.currency.currencyName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="currencyName" id="currencyName"
                                        bsSize="sm"
                                        valid={!errors.currencyName && this.state.currency.currencyName != ''}
                                        invalid={touched.currencyName && !!errors.currencyName}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.currency.currencyName}
                                        required />
                                        <FormFeedback className="red">{errors.currencyName}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="currencyCode">{i18n.t('static.currency.currencycode')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="currencyCode" id="currencyCode"
                                        bsSize="sm"
                                        valid={!errors.currencyCode && this.state.currency.currencyCode != ''}
                                        invalid={touched.currencyCode && !!errors.currencyCode}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.currency.currencyCode}
                                        required />
                                        <FormFeedback className="red">{errors.currencyCode}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="conversionRatetoUSD">{i18n.t('static.currency.conversionrateusd')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="conversionRatetoUSD" id="conversionRatetoUSD"
                                        bsSize="sm"
                                        valid={!errors.conversionRatetoUSD && this.state.currency.conversionRatetoUSD != ''}
                                        invalid={touched.conversionRatetoUSD && !!errors.conversionRatetoUSD}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.currency.conversionRatetoUSD}
                                        required />
                                        <FormFeedback className="red">{errors.conversionRatetoUSD}</FormFeedback>
                                    </FormGroup>                                                                                                            
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                        bsSize="sm"
                                        valid={!errors.notes && this.state.currency.notes != ''}
                                        invalid={touched.notes && !!errors.notes}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.currency.notes}
                                        // required 
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                    <Button type="button" size="md" color="info" className="mr-1" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>                                        
                                        <Button type="submit" size="md" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check "></i> {i18n.t('static.common.submit')}</Button>
                                    </ModalFooter>
                                </Form>
                            )} />
            </div>
        );
    }

}