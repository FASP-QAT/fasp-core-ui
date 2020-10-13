import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import RealmService from '../../api/RealmService';
import { LABEL_REGEX, SPACE_REGEX } from '../../Constants';

const initialValues = {
    summary: "Add Funding Source",
    realmName: "",
    fundingSourceName: "",
    fundingSourceCode: "",    
    notes: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({        
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        realmName: Yup.string()
            .required(i18n.t('static.common.realmtext').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?',i18n.t('static.realm.realmName')))),
        fundingSourceName: Yup.string()
            .matches(LABEL_REGEX, i18n.t('static.message.rolenamevalidtext'))
            .required(i18n.t('static.fundingsource.fundingsourcetext')),
        // fundingSourceCode: Yup.string()
            // .matches(/^[a-zA-Z]+$/, i18n.t('static.common.alphabetsOnly'))
            // .required(i18n.t('static.fundingsource.fundingsourceCodeText')),        
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

export default class FundingSourceTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            fundingSource: {
                summary: "Add Funding Source",
                realmName: "",
                fundingSourceName: "",
                fundingSourceCode: "",                
                notes: ""
            },
            message : '',
            realms: [],
            realmId: '',
            loading: false
        }        
        this.dataChange = this.dataChange.bind(this);        
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }  

    dataChange(event) {        
        let { fundingSource } = this.state
        if(event.target.name == "summary") {
            fundingSource.summary = event.target.value;
        }
        if(event.target.name == "realmName") {
            fundingSource.realmName = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                realmId : event.target.value
            })
        }
        if(event.target.name == "fundingSourceName") {
            fundingSource.fundingSourceName = event.target.value;
        }
        if(event.target.name == "fundingSourceCode") {
            fundingSource.fundingSourceCode = event.target.value;
        }
        if(event.target.name == "notes") {
            fundingSource.notes = event.target.value;
        }
        this.setState({       
            fundingSource
        }, () => {})
    };

    touchAll(setTouched, errors) {
        setTouched({            
            summary: true,
            realmName: true,
            fundingSourceName: true,
            fundingSourceCode: true,                     
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
                this.setState({
                    realms: response.data
                })
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
        let { fundingSource } = this.state;
        // fundingSource.summary = '';
        fundingSource.realmName = '';
        fundingSource.fundingSourceName = '';
        fundingSource.fundingSourceCode = '';                     
        fundingSource.notes = '';   
        this.setState({
            fundingSource
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
                <h4>{i18n.t('static.fundingsource.fundingsource')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                <Formik
                    initialValues={initialValues}
                    validate={validate(validationSchema)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {   
                        this.setState({
                            loading: true
                        })
                        JiraTikcetService.addEmailRequestIssue(this.state.fundingSource).then(response => {                                         
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
                                        valid={!errors.summary && this.state.fundingSource.summary != ''}
                                        invalid={touched.summary && !!errors.summary}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.fundingSource.summary}
                                        required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="realmName">{i18n.t('static.realm.realmName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="realmName" id="realmName"
                                        bsSize="sm"
                                        valid={!errors.realmName && this.state.fundingSource.realmName != ''}
                                        invalid={touched.realmName && !!errors.realmName}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.realmId}
                                        required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmList}
                                        </Input>
                                        <FormFeedback className="red">{errors.realmName}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="fundingSourceName">{i18n.t('static.fundingSource.fundingSourceName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="fundingSourceName" id="fundingSourceName"
                                        bsSize="sm"
                                        valid={!errors.fundingSourceName && this.state.fundingSource.fundingSourceName != ''}
                                        invalid={touched.fundingSourceName && !!errors.fundingSourceName}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.fundingSource.fundingSourceName}
                                        required />
                                        <FormFeedback className="red">{errors.fundingSourceName}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="fundingSourceCode">{i18n.t('static.fundingsource.fundingsourceCode')}</Label>
                                        <Input type="text" name="fundingSourceCode" id="fundingSourceCode"
                                        bsSize="sm"
                                        // valid={!errors.fundingSourceCode && this.state.fundingSource.fundingSourceCode != ''}
                                        // invalid={touched.fundingSourceCode && !!errors.fundingSourceCode}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.fundingSource.fundingSourceCode}
                                        // required 
                                        />
                                        <FormFeedback className="red">{errors.fundingSourceCode}</FormFeedback>
                                    </FormGroup>                                                                                                                                         
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                        bsSize="sm"
                                        valid={!errors.notes && this.state.fundingSource.notes != ''}
                                        invalid={touched.notes && !!errors.notes}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.fundingSource.notes}
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