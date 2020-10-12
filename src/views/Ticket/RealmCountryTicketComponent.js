import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import CountryService from '../../api/CountryService';
import RealmService from '../../api/RealmService';
import CurrencyService from '../../api/CurrencyService';
import getLabelText from '../../CommonComponent/getLabelText';
import { SPACE_REGEX } from '../../Constants';

const initialValues = {
    summary: "Add / Update Realm Country",
    realmId: "",
    countryId: "",
    currencyId: "",    
    notes: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({        
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?',i18n.t('static.realm.realmName')))),
        countryId: Yup.string()
            .required(i18n.t('static.healtharea.countrytext')),
        currencyId: Yup.string()
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

export default class RealmCountryTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            realmCountry: {
                summary: "Add / Update Realm Country",
                realmId: "",
                countryId: "",
                currencyId: "",                
                notes: ""
            },
            message : '',
            realms: [],
            countries: [],
            currencies: [],
            realm: '',
            country: '',
            currency: '',
            loading: false
        }        
        this.dataChange = this.dataChange.bind(this);        
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }  

    dataChange(event) {        
        let { realmCountry } = this.state
        if(event.target.name == "summary") {
            realmCountry.summary = event.target.value;
        }
        if(event.target.name == "realmId") {
            realmCountry.realmId = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                realm : event.target.value
            })
        }
        if(event.target.name == "countryId") {
            realmCountry.countryId = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                country : event.target.value
            })
        }
        if(event.target.name == "currencyId") {
            realmCountry.currencyId = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                currency : event.target.value
            })
        }        
        if(event.target.name == "notes") {
            realmCountry.notes = event.target.value;
        }
        this.setState({       
            realmCountry
        }, () => {})
    };

    touchAll(setTouched, errors) {
        setTouched({            
            summary: true,
            realmId: true,
            countryId: true,
            currencyId: true,            
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
        RealmService.getRealmListAll()
        .then(response => {
            if (response.status == 200) {
                this.setState({
                    realms: response.data
                })
            } else {
                this.setState({
                    message: response.data.messageCode
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }
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
                            break;
                    }
                }
            }
        );

        CountryService.getCountryListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        countries: response.data
                    })
                }else{
                    this.setState({
                        message: response.data.messageCode
                    },
                        () => {
                            this.hideSecondComponent();
                        })

                }
                
            }).catch(
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

            CurrencyService.getCurrencyListActive().then(response => {
                if (response.status == 200) {
                    this.setState({
                        currencies: response.data
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
        let { realmCountry } = this.state;
        // realmCountry.summary = '';
        realmCountry.realmId = '';
        realmCountry.countryId = '';
        realmCountry.currencyId = '';        
        realmCountry.notes = '';   
        this.setState({
            realmCountry
        },
            () => { });
    }

    render() {
        const { realms } = this.state;
        const { countries } = this.state;
        const { currencies } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {item.label.label_en}
                    </option>
                )
            }, this);
        let countryList = countries.length > 0
            && countries.map((item, i) => {
                return (
                    <option key={i} value={item.countryuId}>
                        {item.label.label_en}
                    </option>
                )
            }, this);  
        
        let currencyList = currencies.length > 0
            && currencies.map((item, i) => {
                return (
                    <option key={i} value={item.currencyId}>{getLabelText(item.label, this.state.lang)}</option>
                )
            }, this);       
             

        return (
            <div className="col-md-12">
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>                
                <h4>{i18n.t('static.dashboard.realmcountry')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                <Formik
                    initialValues={initialValues}
                    validate={validate(validationSchema)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {   
                        this.setState({
                            loading: true
                        })
                        JiraTikcetService.addEmailRequestIssue(this.state.realmCountry).then(response => {                                         
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
                                    message: i18n.t('static.unkownError'), loading: false
                                },
                                    () => {                                        
                                        this.hideSecondComponent();
                                    })                                
                            }                            
                            this.props.togglehelp();
                            this.props.toggleSmall(this.state.message);
                        })
                        .catch(
                            error => {
                                this.setState({                                        
                                    message: i18n.t('static.unkownError'), loading: false
                                },
                                () => {                                        
                                    this.hideSecondComponent();                                     
                                });                                    
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
                                <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">
                                    < FormGroup >
                                        <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="summary" id="summary" readOnly = {true}
                                        bsSize="sm"
                                        valid={!errors.summary && this.state.realmCountry.summary != ''}
                                        invalid={touched.summary && !!errors.summary}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.realmCountry.summary}
                                        required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="realmId">{i18n.t('static.realm.realmName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="realmId" id="realmId"
                                        bsSize="sm"
                                        valid={!errors.realmId && this.state.realmCountry.realmId != ''}
                                        invalid={touched.realmId && !!errors.realmId}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.realm}
                                        required>
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmList}
                                        </Input>
                                        <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="countryId">{i18n.t('static.country.countryName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="countryId" id="countryId"
                                        bsSize="sm"
                                        valid={!errors.countryId && this.state.realmCountry.countryId != ''}
                                        invalid={touched.countryId && !!errors.countryId}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.country}
                                        required>
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {countryList}
                                        </Input>
                                        <FormFeedback className="red">{errors.countryId}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="currencyId">{i18n.t('static.country.currency')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="currencyId" id="currencyId"
                                        bsSize="sm"
                                        valid={!errors.currencyId && this.state.realmCountry.currencyId != ''}
                                        invalid={touched.currencyId && !!errors.currencyId}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.currency}
                                        required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {currencyList}
                                        </Input>
                                        <FormFeedback className="red">{errors.currencyId}</FormFeedback>
                                    </FormGroup>                                                                        
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                        bsSize="sm"
                                        valid={!errors.notes && this.state.realmCountry.notes != ''}
                                        invalid={touched.notes && !!errors.notes}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.realmCountry.notes}
                                        // required 
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                    <Button type="button" size="md" color="info" className="mr-1" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>                                        
                                        <Button type="submit" size="md" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                    </ModalFooter>
                                    {/* <br></br><br></br>
                                    <div className={this.props.className}>
                                        <p>{i18n.t('static.ticket.drodownvaluenotfound')}</p>
                                    </div> */}
                                </Form>
                            )} />
                            </div>
                            <div style={{ display: this.state.loading ? "block" : "none" }}>
                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                    <div class="align-items-center">
                                        <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                        <div class="spinner-border blue ml-4" role="status"></div>
                                    </div>
                                </div> 
                            </div>
            </div>
        );
    }

}