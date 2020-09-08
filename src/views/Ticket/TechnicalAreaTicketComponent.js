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
import UserService from '../../api/UserService';
import HealthAreaService from '../../api/HealthAreaService';
import CountryService from '../../api/CountryService';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';

const initialValues = {
    summary: "Add / Update Technical Area",
    realmName: "",
    countryName: "",
    technicalAreaName: "",
    technicalAreaCode: "",
    notes: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .required(i18n.t('static.common.summarytext')),
        realmName: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        // countryName: Yup.string()
        //     .required(i18n.t('static.country.countrytext')),
        technicalAreaName: Yup.string()
            .required(i18n.t('static.healtharea.healthareatext')),
        technicalAreaCode: Yup.string()
            .required(i18n.t('static.technicalArea.technicalAreaCodeText')),
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

export default class TechnicalAreaTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            technicalArea: {
                summary: "Add / Update Technical Area",
                realmName: "",
                countryName: [],
                technicalAreaName: "",
                technicalAreaCode: "",
                notes: ""
            },
            message: '',
            realms: [],
            countryList: [],
            realmId: '',
            countryId: '',
            countries: [],
            realmCountryList: []
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.updateFieldData = this.updateFieldData.bind(this);
        this.getRealmCountryList = this.getRealmCountryList.bind(this);
    }

    dataChange(event) {
        let { technicalArea } = this.state
        if (event.target.name == "summary") {
            technicalArea.summary = event.target.value;
        }
        if (event.target.name == "realmName") {
            technicalArea.realmName = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                realmId: event.target.value
            })
        }
        // if(event.target.name == "countryName") {
        //     technicalArea.countryName = event.target.value;
        // }
        if (event.target.name == "technicalAreaName") {
            technicalArea.technicalAreaName = event.target.value;
        }
        if (event.target.name == "technicalAreaCode") {
            technicalArea.technicalAreaCode = event.target.value;
        }
        if (event.target.name == "notes") {
            technicalArea.notes = event.target.value;
        }
        this.setState({
            technicalArea
        }, () => { })
    };

    touchAll(setTouched, errors) {
        setTouched({
            summary: true,
            realmName: true,
            countryName: true,
            technicalAreaName: true,
            technicalAreaCode: true,
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
        let { technicalArea } = this.state;
        this.setState({ countryId: value });
        var realmCountryId = value;
        var realmCountryIdArray = [];
        for (var i = 0; i < realmCountryId.length; i++) {
            realmCountryIdArray[i] = realmCountryId[i].label;
        }
        technicalArea.countryName = realmCountryIdArray;
        this.setState({ technicalArea: technicalArea });
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
        let { technicalArea } = this.state;
        technicalArea.summary = '';
        technicalArea.realmName = '';
        technicalArea.countryName = '';
        technicalArea.technicalAreaName = '';
        technicalArea.technicalAreaCode = '';
        technicalArea.notes = '';
        this.setState({
            technicalArea
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
                <h4>{i18n.t('static.healtharea.healtharea')}</h4>
                <br></br>
                <Formik
                    initialValues={initialValues}
                    validate={validate(validationSchema)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        JiraTikcetService.addEmailRequestIssue(this.state.technicalArea).then(response => {                            
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
                                            valid={!errors.summary && this.state.technicalArea.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.technicalArea.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="realmName">{i18n.t('static.realm.realmName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="realmName" id="realmName"
                                            bsSize="sm"
                                            valid={!errors.realmName && this.state.technicalArea.realmName != ''}
                                            invalid={touched.realmName && !!errors.realmName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getRealmCountryList(e)}}
                                            onBlur={handleBlur}
                                            value={this.state.realmId}
                                            required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmList}
                                        </Input>
                                        <FormFeedback className="red">{errors.realmName}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="countryName">{i18n.t('static.country.countryName')}<span class="red Reqasterisk">*</span></Label>
                                        <Select name="countryName" id="countryName"
                                            bsSize="sm"
                                            valid={!errors.countryName && this.state.technicalArea.countryName != ''}
                                            invalid={touched.countryName && !!errors.countryName}
                                            onChange={(e) => { handleChange(e); this.updateFieldData(e); }}
                                            onBlur={handleBlur}
                                            multi
                                            options={this.state.realmCountryList}
                                            value={this.state.countryId}
                                            required />
                                        <FormFeedback className="red">{errors.countryName}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="technicalAreaName">{i18n.t('static.healthArea.healthAreaName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="technicalAreaName" id="technicalAreaName"
                                            bsSize="sm"
                                            valid={!errors.technicalAreaName && this.state.technicalArea.technicalAreaName != ''}
                                            invalid={touched.technicalAreaName && !!errors.technicalAreaName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.technicalArea.technicalAreaName}
                                            required />
                                        <FormFeedback className="red">{errors.technicalAreaName}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="technicalAreaCode">{i18n.t('static.technicalArea.technicalAreaCode')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="technicalAreaCode" id="technicalAreaCode"
                                            bsSize="sm"
                                            valid={!errors.technicalAreaCode && this.state.technicalArea.technicalAreaCode != ''}
                                            invalid={touched.technicalAreaCode && !!errors.technicalAreaCode}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.technicalArea.technicalAreaCode}
                                            required />
                                        <FormFeedback className="red">{errors.technicalAreaCode}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            valid={!errors.notes && this.state.technicalArea.notes != ''}
                                            invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.technicalArea.notes}
                                        // required 
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                        <Button type="button" size="md" color="info" className="mr-1" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                    </ModalFooter>
                                </Form>
                            )} />
            </div>
        );
    }

}