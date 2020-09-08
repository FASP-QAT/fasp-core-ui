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
import RealmService from '../../api/RealmService';
import LanguageService from '../../api/LanguageService';
import getLabelText from '../../CommonComponent/getLabelText';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';

const initialValues = {
    summary: "Add / Update User",
    realm: "",
    name: "",
    emailId: "",
    phoneNumber: "",
    role: "",
    language: "",
    notes: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({        
        summary: Yup.string()
            .required(i18n.t('static.common.summarytext')),
        realm: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        name: Yup.string()
            .required(i18n.t('static.user.validusername')),
        emailId: Yup.string()
            .required(i18n.t('static.user.validemail')),
        phoneNumber: Yup.string()
            .required(i18n.t('static.user.validphone')),
        // role: Yup.string()
        //     .required(i18n.t('static.role.roletext')),
        language: Yup.string()
            .required(i18n.t('static.user.validlanguage')),
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

export default class UserTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            lang: localStorage.getItem('lang'),
            user: {
                summary: 'Add / Update User',
                realm: "",
                name: "",
                emailId: "",
                phoneNumber: "",
                role: [],
                language: "",
                notes: ''
            },
            realms: [],
            languages: [],
            roleList: [],
            message : '',
            realmId : '',
            roleId: '',
            languageId: ''
        }        
        this.dataChange = this.dataChange.bind(this);        
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.roleChange = this.roleChange.bind(this);
    }  

    dataChange(event) {        
        let { user } = this.state
        if(event.target.name == "summary") {
            user.summary = event.target.value;
        }
        if(event.target.name == "realm") {            
            user.realm = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                realmId : event.target.value
            })            
        }
        if(event.target.name == "name") {
            user.name = event.target.value;
        }
        if(event.target.name == "emailId") {
            user.emailId = event.target.value;
        }
        if(event.target.name == "phoneNumber") {
            user.phoneNumber = event.target.value;
        }        
        if(event.target.name == "language") {
            user.language = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                languageId : event.target.value
            })
        }
        if(event.target.name == "notes") {
            user.notes = event.target.value;
        }
        this.setState({       
            user
        }, () => {})
    };

    roleChange(roleId) {
        let { user } = this.state;
        let count = 0;
        this.setState({ roleId });
        var roleIdArray = [];
        for (var i = 0; i < roleId.length; i++) {
            roleIdArray[i] = roleId[i].value;
            if (roleId[i].value != 'ROLE_APPL_ADMIN') {
                count++;                
            }
        }        
        user.role = roleIdArray;
        this.setState({
            user,
            validateRealm: (count > 0 ? true : false)
        },
            () => { });
    }

    touchAll(setTouched, errors) {
        setTouched({            
            summary: true,
            realm: true,
            name: true,
            emailId: true,
            phoneNumber: true,
            role: true,
            language: true,
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

        LanguageService.getLanguageList()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        languages: response.data
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

        UserService.getRoleList()
            .then(response => {
                if (response.status == 200) {
                    var roleList = [];
                    for (var i = 0; i < response.data.length; i++) {
                        roleList[i] = { value: response.data[i].roleId, label: getLabelText(response.data[i].label, this.state.lang) }
                    }
                    this.setState({
                        roleList
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
        let { user } = this.state;
        user.summary = '';
        user.realm = '';
        user.name = '';
        user.emailId = '';
        user.phoneNumber = '';
        user.role = '';
        user.language = '';
        user.notes = '';   
        this.setState({
            user
        },
            () => { });
    }

    render() {

        const { realms } = this.state;
        const { languages } = this.state;

        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        let languageList = languages.length > 0
            && languages.map((item, i) => {
                return (
                    <option key={i} value={item.languageId}>
                        {item.languageName}
                    </option>
                )
            }, this);

        return (
            <div className="col-md-12">
                <h5 style={{ color: "green" }} id="div2">{i18n.t(this.state.message)}</h5>                
                <h4>{i18n.t('static.user.user')}</h4>
                <br></br>
                <Formik
                    initialValues={initialValues}
                    validate={validate(validationSchema)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {   
                        JiraTikcetService.addEmailRequestIssue(this.state.user).then(response => {                                         
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
                                        valid={!errors.summary && this.state.user.summary != ''}
                                        invalid={touched.summary && !!errors.summary}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.user.summary}
                                        required>                                            
                                        </Input>
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="realm">{i18n.t('static.realm.realmName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="realm" id="realm"
                                        bsSize="sm"
                                        valid={!errors.realm && this.state.user.realm != ''}
                                        invalid={touched.realm && !!errors.realm}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.realmId}
                                        required>
                                            <option value="0">{i18n.t('static.common.select')}</option>
                                            {realmList}
                                        </Input>
                                        <FormFeedback className="red">{errors.realm}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="name">{i18n.t('static.user.username')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="name" id="name"
                                        bsSize="sm"
                                        valid={!errors.name && this.state.user.name != ''}
                                        invalid={touched.name && !!errors.name}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.user.name}
                                        required />
                                        <FormFeedback className="red">{errors.name}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="emailId">{i18n.t('static.user.emailid')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="emailId" id="emailId"
                                        bsSize="sm"
                                        valid={!errors.emailId && this.state.user.emailId != ''}
                                        invalid={touched.emailId && !!errors.emailId}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.user.emailId}
                                        required />
                                        <FormFeedback className="red">{errors.emailId}</FormFeedback>
                                    </FormGroup>                                    
                                    <FormGroup>
                                        <Label for="phoneNumber">{i18n.t('static.user.phoneNumber')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="phoneNumber" id="phoneNumber"
                                        bsSize="sm"
                                        valid={!errors.phoneNumber && this.state.user.phoneNumber != ''}
                                        invalid={touched.phoneNumber && !!errors.phoneNumber}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.user.phoneNumber}
                                        required />
                                        <FormFeedback className="red">{errors.phoneNumber}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="role">{i18n.t('static.role.role')}<span class="red Reqasterisk">*</span></Label>
                                        <Select name="role" id="role"
                                        bsSize="sm"                                        
                                        invalid={touched.role && !!errors.role}
                                        onChange={(e) => { handleChange(e); this.roleChange(e);}}
                                        onBlur={handleBlur}
                                        multi
                                        required
                                        min={1}
                                        options={this.state.roleList}
                                        value={this.state.roleId}
                                        error={errors.roleId}
                                        touched={touched.roleId}                                           
                                        />
                                        <FormFeedback className="red">{errors.role}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="language">{i18n.t('static.language.language')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="language" id="language"
                                        bsSize="sm"
                                        valid={!errors.language && this.state.user.language != ''}
                                        invalid={touched.language && !!errors.language}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.languageId}
                                        required>
                                            <option value="0">{i18n.t('static.common.select')}</option>
                                            {languageList}
                                        </Input>
                                        <FormFeedback className="red">{errors.language}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                        bsSize="sm"
                                        valid={!errors.notes && this.state.user.notes != ''}
                                        invalid={touched.notes && !!errors.notes}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.user.notes}
                                        // required 
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                    <Button type="button" size="md" color="info" className=" mr-1" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>                                        
                                        <Button type="submit" size="md" color="success" className=" mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                    </ModalFooter>
                                </Form>
                            )} />
            </div>
        );
    }

}