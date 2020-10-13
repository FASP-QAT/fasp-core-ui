import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import RealmCountryService from '../../api/RealmCountryService';
import getLabelText from '../../CommonComponent/getLabelText';
import { SPACE_REGEX } from '../../Constants';
import ProgramService from '../../api/ProgramService';
import HealthAreaService from '../../api/HealthAreaService';

const initialValues = {
    summary: "Add Realm Country Region",
    realmId: '',
    realmCountryId: "",
    regionId: "",
    capacity: "",
    glnCode: "",
    notes: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?',i18n.t('static.realm.realmName')))),
        realmCountryId: Yup.string()
            .required(i18n.t('static.healtharea.countrytext')),
        regionId: Yup.string()
            .required(i18n.t('static.region.validregion')),
        capacity: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))            
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))            
            .required(i18n.t('static.region.capacitycbmtext')),
        glnCode: Yup.string()
            .required(i18n.t('static.region.glntext')),
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

export default class RealmCountryRegionTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            realmCountryRegion: {
                summary: "Add Realm Country Region",
                realmId: '',
                realmCountryId: "",
                regionId: "",
                capacity: "",
                glnCode: "",
                notes: ""
            },
            message: '',
            realmCountries: [],
            realmCountryId: '',
            loading: false,
            realmId: '',
            realmList: []
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getDependentLists = this.getDependentLists.bind(this);
    }

    dataChange(event) {
        let { realmCountryRegion } = this.state
        if (event.target.name == "summary") {
            realmCountryRegion.summary = event.target.value;
        }
        if (event.target.name == "realmId") {            
            realmCountryRegion.realmId = event.target.options[event.target.selectedIndex].innerHTML;
            // this.setState({
                this.state.realmId = event.target.value
            // })            
        }
        if (event.target.name == "realmCountryId") {
            realmCountryRegion.realmCountryId = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                realmCountryId: event.target.value
            })
        }
        if (event.target.name == "regionId") {
            realmCountryRegion.regionId = event.target.value;
        }
        if (event.target.name == "capacity") {
            realmCountryRegion.capacity = event.target.value;
        }
        if (event.target.name == "glnCode") {
            realmCountryRegion.glnCode = event.target.value;
        }
        if (event.target.name == "notes") {
            realmCountryRegion.notes = event.target.value;
        }
        this.setState({
            realmCountryRegion
        }, () => { })
    };


    getDependentLists(e) {        
        AuthenticationService.setupAxiosInterceptors();        

        ProgramService.getRealmCountryList(e.target.value)
            .then(response => {                
                if (response.status == 200) {
                    this.setState({
                        realmCountries: response.data
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            })
        
    }

    touchAll(setTouched, errors) {
        setTouched({
            summary: true,
            realmId: true,
            realmCountryId: true,
            regionId: true,
            capacity: true,
            glnCode: true,
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
        HealthAreaService.getRealmList()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        realmList: response.data
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
        let { realmCountryRegion } = this.state;
        // realmCountryRegion.summary = '';
        realmCountryRegion.realmCountryId = '';
        realmCountryRegion.regionId = '';
        realmCountryRegion.realmId = '';
        realmCountryRegion.capacity = '';
        realmCountryRegion.glnCode = '';
        realmCountryRegion.notes = '';
        this.setState({
            realmCountryRegion
        },
            () => { });
    }

    render() {
        const { realmList } = this.state;
        const { realmCountries } = this.state;

        let realms = realmList.length > 0
            && realmList.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        let realmCountryList = realmCountries.length > 0
            && realmCountries.map((item, i) => {
                return (
                    <option key={i} value={item.realmCountryId}>
                        {getLabelText(item.country.label, this.state.lang)}
                    </option>
                )
            }, this);

        return (
            <div className="col-md-12">
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.dashboad.regioncountry')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                <Formik
                    initialValues={initialValues}
                    validate={validate(validationSchema)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        this.setState({
                            loading: true
                        })
                        JiraTikcetService.addEmailRequestIssue(values).then(response => {                            
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
                                            valid={!errors.summary && this.state.realmCountryRegion.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realmCountryRegion.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="realmId">{i18n.t('static.program.realm')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="realmId" id="realmId"
                                            bsSize="sm"
                                            valid={!errors.realmId && this.state.realmCountryRegion.realmId != ''}
                                            invalid={touched.realmId && !!errors.realmId}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getDependentLists(e)}}
                                            onBlur={handleBlur}
                                            value={this.state.realmId}
                                            required >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {realms}
                                            </Input>
                                        <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="realmCountryId">{i18n.t('static.dashboard.realmcountry')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="realmCountryId" id="realmCountryId"
                                            bsSize="sm"
                                            valid={!errors.realmCountryId && this.state.realmCountryRegion.realmCountryId != ''}
                                            invalid={touched.realmCountryId && !!errors.realmCountryId}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realmCountryId}
                                            required >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {realmCountryList}
                                            </Input>
                                        <FormFeedback className="red">{errors.realmCountryId}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="regionId">{i18n.t('static.region.region')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="regionId" id="regionId"
                                            bsSize="sm"
                                            valid={!errors.regionId && this.state.realmCountryRegion.regionId != ''}
                                            invalid={touched.regionId && !!errors.regionId}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realmCountryRegion.regionId}
                                            required />
                                        <FormFeedback className="red">{errors.regionId}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="capacity">{i18n.t('static.region.capacitycbm')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="number" name="capacity" id="capacity"
                                            bsSize="sm"
                                            valid={!errors.capacity && this.state.realmCountryRegion.capacity != ''}
                                            invalid={touched.capacity && !!errors.capacity}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realmCountryRegion.capacity}
                                            required />
                                        <FormFeedback className="red">{errors.capacity}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="glnCode">{i18n.t('static.region.gln')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="glnCode" id="glnCode"
                                            bsSize="sm"
                                            valid={!errors.glnCode && this.state.realmCountryRegion.glnCode != ''}
                                            invalid={touched.glnCode && !!errors.glnCode}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realmCountryRegion.glnCode}
                                            required />
                                        <FormFeedback className="red">{errors.glnCode}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            valid={!errors.notes && this.state.realmCountryRegion.notes != ''}
                                            invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realmCountryRegion.notes}
                                        // required 
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                        <Button type="button" size="md" color="info" className="mr-1" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check "></i> {i18n.t('static.common.submit')}</Button>
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