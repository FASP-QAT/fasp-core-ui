import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import getLabelText from '../../CommonComponent/getLabelText';
import CurrencyService from '../../api/CurrencyService';

const initialValues = {
    summary: "Add / Update Country",
    countryName: "",
    countryCode: "",
    countryCode2: "",
    currency: "",    
    notes: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({        
        summary: Yup.string()
            .required(i18n.t('static.common.summarytext')),
        countryName: Yup.string()
            .required(i18n.t('static.country.countrytext')),
        countryCode: Yup.string()
            .required(i18n.t('static.country.countrycodetext')),
        countryCode2: Yup.string()
            .required(i18n.t('static.country.countrycodetext')),
        currency: Yup.string()
            .required(i18n.t('static.country.currencytext')),        
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

export default class CountryTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            country: {
                summary: 'Add / Update Country',
                countryName: "",
                countryCode: "",
                countryCode2: "",
                currency: "",
                notes: ''
            },
            message : '',
            currencyList: [],
            currencyId : '',
            loading: false

        }        
        this.dataChange = this.dataChange.bind(this);        
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }  

    dataChange(event) {        
        let { country } = this.state
        if(event.target.name == "summary") {
            country.summary = event.target.value;
        }
        if(event.target.name == "countryName") {
            country.countryName = event.target.value;
        }
        if(event.target.name == "countryCode") {
            country.countryCode = event.target.value;
        }
        if(event.target.name == "countryCode2") {
            country.countryCode2 = event.target.value;
        }
        if(event.target.name == "currency") {            
            country.currency = event.target.options[event.target.selectedIndex].innerHTML;            
            this.setState({
                currencyId : event.target.value
            })
        }        
        if(event.target.name == "notes") {
            country.notes = event.target.value;
        }
        this.setState({       
            country
        }, () => {})
    };

    touchAll(setTouched, errors) {
        setTouched({            
            summary: true,
            countryName: true,
            countryCode: true,
            countryCode2: true,
            currency: true,
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
        CurrencyService.getCurrencyListActive().then(response => {
            if (response.status == 200) {
                this.setState({
                    currencyList: response.data
                })
            } else {
                this.setState({
                    message: response.data.messageCode
                })
            }
        })
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
        let { country } = this.state;
        country.summary = '';
        country.countryName = '';
        country.countryCode = '';
        country.countryCode2 = '';
        country.currency = '';        
        country.notes = '';   
        this.setState({
            country
        },
            () => { });
    }

    render() {

        const { currencyList } = this.state;
        let currencyItems = currencyList.length > 0
            && currencyList.map((itemOne, i) => {
                return (
                    <option key={i} value={itemOne.currencyId}>{getLabelText(itemOne.label, this.state.lang)}</option>
                )
            }, this);

        return (
            <div className="col-md-12">
                <h5 style={{ color: "green" }} id="div2">{i18n.t(this.state.message)}</h5>                
                <h4>{i18n.t('static.country.countryMaster')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                <Formik
                    initialValues={initialValues}
                    validate={validate(validationSchema)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {   
                        this.setState({
                            loading: true
                        })
                        JiraTikcetService.addEmailRequestIssue(this.state.country).then(response => {                                         
                            console.log("Response :",response.status, ":" ,JSON.stringify(response.data));
                            if (response.status == 200 || response.status == 201) {
                                var msg = response.data.key;
                                this.setState({
                                    message: msg, loading: false
                                },
                                    () => {
                                        this.resetClicked();
                                        this.hideSecondComponent();
                                    })                                
                            } else {
                                this.setState({
                                    // message: response.data.messageCode
                                    message: 'Error while creating query', loading: false
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
                                        valid={!errors.summary && this.state.country.summary != ''}
                                        invalid={touched.summary && !!errors.summary}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.country.summary}
                                        required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="countryName">{i18n.t('static.country.countryName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="countryName" id="countryName"
                                        bsSize="sm"
                                        valid={!errors.countryName && this.state.country.countryName != ''}
                                        invalid={touched.countryName && !!errors.countryName}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.country.countryName}
                                        required />
                                        <FormFeedback className="red">{errors.countryName}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="countryCode">{i18n.t('static.country.countrycode')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="countryCode" id="countryCode"
                                        bsSize="sm"
                                        valid={!errors.countryCode && this.state.country.countryCode != ''}
                                        invalid={touched.countryCode && !!errors.countryCode}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.country.countryCode}
                                        required />
                                        <FormFeedback className="red">{errors.countryCode}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="countryCode2">{i18n.t('static.country.countrycode')}2<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="countryCode2" id="countryCode2"
                                        bsSize="sm"
                                        valid={!errors.countryCode2 && this.state.country.countryCode2 != ''}
                                        invalid={touched.countryCode2 && !!errors.countryCode2}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.country.countryCode2}
                                        required />
                                        <FormFeedback className="red">{errors.countryCode2}</FormFeedback>
                                    </FormGroup>                                    
                                    <FormGroup>
                                        <Label for="currency">{i18n.t('static.currency.currencyName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="currency" id="currency"
                                        bsSize="sm"
                                        valid={!errors.currency && this.state.country.currency != ''}
                                        invalid={touched.currency && !!errors.currency}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.currencyId}
                                        required>
                                            <option value="0">{i18n.t('static.common.select')}</option>
                                            {currencyItems}
                                        </Input>
                                        <FormFeedback className="red">{errors.currency}</FormFeedback>
                                    </FormGroup>                                    
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                        bsSize="sm"
                                        valid={!errors.notes && this.state.country.notes != ''}
                                        invalid={touched.notes && !!errors.notes}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.country.notes}
                                        // required 
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <ModalFooter className="pr-0 pb-0">
                                    <Button type="button" size="md" color="info" className="mr-1" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className=" mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>                                        
                                        <Button type="submit" size="md" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                    </ModalFooter>
                                </Form>
                            )} />
                            </div>
                            <div style={{ display: this.state.loading ? "block" : "none" }}>
                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                    <div class="align-items-center">
                                        <div ><h4> <strong>Loading...</strong></h4></div>
                                        <div class="spinner-border blue ml-4" role="status"></div>
                                    </div>
                                </div> 
                            </div>
            </div>
        );
    }

}