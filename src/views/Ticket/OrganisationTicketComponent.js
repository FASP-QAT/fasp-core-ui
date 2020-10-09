import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import UserService from '../../api/UserService';
import CountryService from '../../api/CountryService';
import HealthAreaService from '../../api/HealthAreaService';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import classNames from 'classnames';
import { SPACE_REGEX, ALPHABET_NUMBER_REGEX } from '../../Constants';

const initialValues = {
    summary: 'Add / Update Organization',
    realmId: '',
    realmCountryId: '',
    organisationCode: '',
    organisationName: '', 
    notes: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({        
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        realmCountryId: Yup.string()
            .required(i18n.t('static.program.validcountrytext')),
        organisationName: Yup.string()            
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.organisation.organisationtext')),
        // organisationCode: Yup.string()
        //     .matches(ALPHABET_NUMBER_REGEX, i18n.t('static.message.alphabetnumerallowed'))
        //     .max(4, i18n.t('static.organisation.organisationcodemax4digittext'))
        //     .required(i18n.t('static.organisation.organisationcodetext')),
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

export default class OrganisationTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            organisation: {
                summary: "Add / Update Organization",
                realmId: "",
                realmCountryId: [],
                organisationCode: "",
                organisationName: "",              
                notes: ""
            },
            message : '',
            realms: [],
            countryList: [],
            realm: '',
            countryId: '',
            countries: [],
            realmCountryList: [],
            loading: false
        }        
        this.dataChange = this.dataChange.bind(this);        
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.updateFieldData = this.updateFieldData.bind(this);
        this.getRealmCountryList = this.getRealmCountryList.bind(this);
    }  

    dataChange(event) {        
        let { organisation } = this.state
        if(event.target.name == "summary") {
            organisation.summary = event.target.value;
        }
        if (event.target.name === "organisationName") {
            organisation.organisationName = event.target.value
        } 
        if (event.target.name === "organisationCode") {
            organisation.organisationCode = event.target.value.toUpperCase();
        } 
        if (event.target.name === "realmId") {
            organisation.realmId = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                realm: event.target.value
            })            
        } 
        // if (event.target.name === "realmCountryId") {
        //     organisation.realmCountryId = event.target.value
        // }        
        if(event.target.name == "notes") {
            organisation.notes = event.target.value;
        }
        this.setState({       
            organisation
        }, () => {})
    };

    touchAll(setTouched, errors) {
        setTouched({            
            summary: true,
            realmId: true,
            realmCountryId: true,
            organisationCode: true,
            organisationName: true,
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
        CountryService.getCountryListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        countries: response.data
                    })
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

        UserService.getRealmList()
            .then(response => {                
                this.setState({
                    realms: response.data
                })
            })
    }

    updateFieldData(value) {        
        let { organisation } = this.state;
        this.setState({ countryId: value });
        var realmCountryId = value;
        var realmCountryIdArray = [];
        for (var i = 0; i < realmCountryId.length; i++) {
            realmCountryIdArray[i] = realmCountryId[i].label;
        }
        organisation.realmCountryId = realmCountryIdArray;
        this.setState({ organisation: organisation });
    }

    getRealmCountryList(e) {
        AuthenticationService.setupAxiosInterceptors();
        HealthAreaService.getRealmCountryList(e.target.value)
            .then(response => {
                if (response.status == 200) {
                    var json = response.data;
                    var regList = [];
                    for (var i = 0; i < json.length; i++) {
                        regList[i] = { value: json[i].realmCountryId, label: json[i].country.label.label_en }
                    }
                    this.setState({
                        countryId: '',
                        realmCountryList: regList
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
        let { organisation } = this.state;
        // organisation.summary = '';
        organisation.realmId = '';
        organisation.realmCountryId = '';
        organisation.organisationName = '';        
        organisation.organisationCode = '';        
        organisation.notes = '';   
        this.setState({
            organisation
        },
            () => { });
    }

    render() {

        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {item.label.label_en}
                    </option>
                )
            }, this);

        return (
            <div className="col-md-12">
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>                
                <h4>{i18n.t('static.organisation.organisation')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                <Formik
                    initialValues={initialValues}
                    validate={validate(validationSchema)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {   
                        this.setState({
                            loading: true
                        })
                        JiraTikcetService.addEmailRequestIssue(this.state.organisation).then(response => {                                         
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
                            handleReset,
                            setFieldValue,
                            setFieldTouched
                        }) => (
                                <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">
                                    < FormGroup >
                                        <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="summary" id="summary" readOnly = {true}
                                        bsSize="sm"
                                        valid={!errors.summary && this.state.organisation.summary != ''}
                                        invalid={touched.summary && !!errors.summary}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.organisation.summary}
                                        required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="realmId">{i18n.t('static.realm.realmName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="realmId" id="realmId"
                                        bsSize="sm"
                                        valid={!errors.realmId && this.state.organisation.realmId != ''}
                                        invalid={touched.realmId && !!errors.realmId}
                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.getRealmCountryList(e)}}
                                        onBlur={handleBlur}
                                        value={this.state.realm}
                                        required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmList}
                                        </Input>
                                        <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup className="Selectcontrol-bdrNone">
                                        <Label for="realmCountryId">{i18n.t('static.organisation.realmcountry')}<span class="red Reqasterisk">*</span></Label>
                                        <Select 
                                        className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                            { 'is-valid': !errors.realmCountryId && this.state.organisation.realmCountryId.length != 0 },
                                            { 'is-invalid': (touched.realmCountryId && !!errors.realmCountryId) }
                                        )}
                                        name="realmCountryId" id="realmCountryId"
                                        bsSize="sm"                                        
                                        onChange={(e) => { handleChange(e); setFieldValue("realmCountryId", e); this.updateFieldData(e)}}
                                        onBlur={() => setFieldTouched("realmCountryId", true)}
                                        multi
                                        options={this.state.realmCountryList}
                                        value={this.state.countryId}
                                        required />
                                        <FormFeedback className="red">{errors.realmCountryId}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="organisationName">{i18n.t('static.organisation.organisationname')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="organisationName" id="organisationName"
                                        bsSize="sm"
                                        valid={!errors.organisationName && this.state.organisation.organisationName != ''}
                                        invalid={touched.organisationName && !!errors.organisationName}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.organisation.organisationName}
                                        required />
                                        <FormFeedback className="red">{errors.organisationName}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="organisationCode">{i18n.t('static.organisation.organisationcode')}</Label>
                                        <Input type="text" name="organisationCode" id="organisationCode"
                                        bsSize="sm"
                                        // valid={!errors.organisationCode && this.state.organisation.organisationCode != ''}
                                        // invalid={touched.organisationCode && !!errors.organisationCode}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.organisation.organisationCode}
                                        // required 
                                        />
                                        <FormFeedback className="red">{errors.organisationCode}</FormFeedback>
                                    </FormGroup>                                                                                                                                                                           
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                        bsSize="sm"
                                        valid={!errors.notes && this.state.organisation.notes != ''}
                                        invalid={touched.notes && !!errors.notes}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.organisation.notes}
                                        // required 
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                    <Button type="button" size="md" color="info" className="mr-1" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>                                        
                                        <Button type="submit" size="md" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                    </ModalFooter>
                                    <br></br><br></br>
                                    <div className={this.props.className}>
                                        <p>{i18n.t('static.ticket.drodownvaluenotfound')}</p>
                                    </div>
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