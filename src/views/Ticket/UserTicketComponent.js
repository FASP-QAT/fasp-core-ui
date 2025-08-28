import classNames from 'classnames';
import { Formik } from 'formik';
import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { Button, Form, FormFeedback, FormGroup, Input, Label, ModalFooter } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, SPACE_REGEX, SPECIAL_CHARECTER_WITH_NUM_NODOUBLESPACE } from '../../Constants';
import JiraTikcetService from '../../api/JiraTikcetService';
import LanguageService from '../../api/LanguageService';
import RealmService from '../../api/RealmService';
import UserService from '../../api/UserService';
import i18n from '../../i18n';
import TicketPriorityComponent from './TicketPriorityComponent';
let summaryText_2 = "Add / Update User"
/**
 * This const is used to define the validation schema for user ticket component
 * @param {*} values 
 * @returns 
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        realm: Yup.string()
            .required(i18n.t('static.common.realmtext').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.realm.realmName')))),
        name: Yup.string()
            .required(i18n.t('static.user.validusername'))
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string')),
        emailId: Yup.string()
            .email(i18n.t('static.user.invalidemail'))
            .required(i18n.t('static.user.validemail')),
        role: Yup.string()
            .test('roleValid', i18n.t('static.common.roleinvalidtext'),
                function (value) {
                    if (document.getElementById("roleValid").value == "false") {
                        return true;
                    } else {
                        return false;
                    }
                })
            .required(i18n.t('static.user.validrole')),
        language: Yup.string()
            .required(i18n.t('static.user.validlanguage')),
        orgAndCountry: Yup.string()
            .matches(SPECIAL_CHARECTER_WITH_NUM_NODOUBLESPACE, i18n.t('static.validNoDoubleSpace.string'))
            .required(i18n.t('static.user.org&CountryText')),
        // priority: Yup.string()
        //     .test('validatePriority', 'Priority needed',
        //         function (value) {
        //             console.log('this.state.user.priority: '+this.state.user.priority);
        //             if (this.state.user.priority != '') {
        //                 return true;
        //             } else {
        //                 return false;
        //             }
        //         })
        //     .required(i18n.t('static.user.validrole')),
        // priority: Yup.string()
        //     .required(i18n.t('static.ticket.priority'))
    })
}
/**
 * This component is used to display the user form and allow user to submit the add master request in jira
 */
export default class UserTicketComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {
                summary: i18n.t('static.ticket.addUpdateUser'),
                realm: "",
                name: "",
                emailId: "",
                orgAndCountry: '',
                role: [],
                language: "",
                notes: '',
                file: '',
                attachFile: '',
                priority: 3
            },
            lang: localStorage.getItem('lang'),
            realms: [],
            languages: [],
            roleList: [],
            message: '',
            realmId: '',
            roleId: '',
            languageId: '',
            loading: true
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.roleChange = this.roleChange.bind(this);
        this.updatePriority = this.updatePriority.bind(this);
    }
    /**
     * This function is called when some data in the form is changed
     * @param {*} event This is the on change event
     */
    dataChange(event) {
        let { user } = this.state
        if (event.target.name == "summary") {
            user.summary = event.target.value;
        }
        if (event.target.name == "realm") {
            user.realm = event.target.value !== "" ? this.state.realms.filter(c => c.realmId == event.target.value)[0].label.label_en : "";
            this.setState({
                realmId: event.target.value
            })
        }
        if (event.target.name == "name") {
            user.name = event.target.value;
        }
        if (event.target.name == "emailId") {
            user.emailId = event.target.value;
        }
        if (event.target.name == "orgAndCountry") {
            user.orgAndCountry = event.target.value;
        }
        if (event.target.name == "language") {
            user.language = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                languageId: event.target.value
            })
        }
        if (event.target.name == "notes") {
            user.notes = event.target.value;
        }
        if (event.target.name == "attachFile") {
            user.file = event.target.files[0];
            user.attachFile = event.target.files[0].name;
        }
        this.setState({
            user
        }, () => { })
    };
    /**
     * This function is called when role is changed
     * @param {*} roleId This is the on change event
     */
    roleChange(roleId) {
        let { user } = this.state;
        let count = 0;
        let count1 = 0;
        this.setState({ roleId });
        var roleIdArray = [];
        for (var i = 0; i < roleId.length; i++) {
            roleIdArray[i] = roleId[i].value;
            if (roleId[i].value != 'ROLE_APPLICATION_ADMIN') {
                count++;
            } else {
                count1++;
            }
        }
        if (count > 0) {
            if (count1 > 0) {
                document.getElementById("roleValid").value = true;
            } else {
                document.getElementById("roleValid").value = false;
            }
        } else {
            document.getElementById("roleValid").value = false;
        }
        user.role = roleIdArray;
        this.setState({
            user
        },
            () => { });
    }
    /**
     * This function is used to get the language list on page load
     */
    componentDidMount() {
        LanguageService.getLanguageListActive()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.label.label_en.toUpperCase(); 
                        var itemLabelB = b.label.label_en.toUpperCase(); 
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        languages: listArray, loading: false
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
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 401:
                                this.props.history.push(`/login/static.message.sessionExpired`)
                                break;
                            case 409:
                                this.setState({
                                    message: i18n.t('static.common.accessDenied'),
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                            case 403:
                                this.props.history.push(`/accessDenied`)
                                break;
                            case 500:
                            case 404:
                            case 406:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                });
                                break;
                        }
                    }
                }
            );
        RealmService.getRealmListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        realms: listArray,
                        realmId: this.props.items.userRealmId, loading: false
                    });
                    if (this.props.items.userRealmId !== "") {
                        this.setState({
                            realms: (response.data).filter(c => c.realmId == this.props.items.userRealmId)
                        })
                        let { user } = this.state;
                        user.realm = (response.data).filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en;
                        this.setState({
                            user
                        }, () => {
                        })
                    }
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
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 401:
                                this.props.history.push(`/login/static.message.sessionExpired`)
                                break;
                            case 409:
                                this.setState({
                                    message: i18n.t('static.common.accessDenied'),
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                            case 403:
                                this.props.history.push(`/accessDenied`)
                                break;
                            case 500:
                            case 404:
                            case 406:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                });
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
                    roleList.sort((a, b) => {
                        var itemLabelA = a.label.toUpperCase(); 
                        var itemLabelB = b.label.toUpperCase(); 
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
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
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 401:
                                this.props.history.push(`/login/static.message.sessionExpired`)
                                break;
                            case 409:
                                this.setState({
                                    message: i18n.t('static.common.accessDenied'),
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                            case 403:
                                this.props.history.push(`/accessDenied`)
                                break;
                            case 500:
                            case 404:
                            case 406:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                });
                                break;
                        }
                    }
                }
            );
    }
    /**
     * This function is used to hide the messages that are there in div2 after 30 seconds
     */
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is called when reset button is clicked to reset the usage period details
     */
    resetClicked() {
        let { user } = this.state;
        user.realm = this.props.items.userRealmId !== "" ? this.state.realms.filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en : "";
        user.name = '';
        user.emailId = '';
        user.orgAndCountry = '';
        user.role = '';
        user.language = '';
        user.notes = '';
        user.file = '';
        user.attachFile = '';
        this.setState({
            user: user,
            realmId: this.props.items.userRealmId,
            roleId: '',
            languageId: ''
        },
            () => { });
    }
    /**
     * This function is used to update the ticket priority in state
     * @param {*} newState - This the selected priority
     */
    updatePriority(newState){
        // console.log('priority - : '+newState);
        let { user } = this.state;
        user.priority = newState;
        this.setState(
            {
                user
            }, () => {

                // console.log('priority - state : '+this.state.user.priority);
            }
        );
    }
    /**
     * This is used to display the content
     * @returns This returns user details form
     */
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
                        {item.label.label_en}
                    </option>
                )
            }, this);
        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.ticket.addUpdateUser')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        enableReinitialize={true}
                        initialValues={{
                            summary: i18n.t('static.ticket.addUpdateUser'),
                            realm: this.props.items.userRealmId,
                            name: "",
                            emailId: "",
                            orgAndCountry: "",
                            role: "",
                            language: "",
                            notes: "",
                            priority: 3
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.user.summary = summaryText_2;
                            this.state.user.userLanguageCode = this.state.lang;
                            JiraTikcetService.addUpdateUserRequest(this.state.user).then(response => {
                                if (response.status == 200 || response.status == 201) {
                                    var msg = response.data.key;
                                    JiraTikcetService.addIssueAttachment(this.state.user, response.data.id).then(response => {
                                    });
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
                            }).catch(
                                error => {
                                    if (error.message === "Network Error") {
                                        this.setState({
                                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                            loading: false
                                        });
                                    } else {
                                        switch (error.response ? error.response.status : "") {
                                            case 401:
                                                this.props.history.push(`/login/static.message.sessionExpired`)
                                                break;
                                            case 409:
                                                this.setState({
                                                    message: i18n.t('static.common.accessDenied'),
                                                    loading: false,
                                                    color: "#BA0C2F",
                                                });
                                                break;
                                            case 403:
                                                this.props.history.push(`/accessDenied`)
                                                break;
                                            case 500:
                                            case 404:
                                            case 406:
                                                this.setState({
                                                    message: error.response.data.messageCode,
                                                    loading: false
                                                });
                                                break;
                                            case 412:
                                                this.setState({
                                                    message: error.response.data.messageCode,
                                                    loading: false
                                                });
                                                break;
                                            default:
                                                this.setState({
                                                    message: 'static.unkownError',
                                                    loading: false
                                                });
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
                                setTouched,
                                handleReset,
                                setFieldValue,
                                setFieldTouched
                            }) => (
                                <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">
                                    <Input
                                        type="hidden"
                                        name="roleValid"
                                        id="roleValid"
                                    />
                                    < FormGroup >
                                        <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="summary" id="summary" readOnly={true}
                                            bsSize="sm"
                                            valid={!errors.summary && this.state.user.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
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
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realmId}
                                            required>
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmList}
                                        </Input>
                                        <FormFeedback className="red">{errors.realm}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="name">{i18n.t('static.user.username')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="name" id="name" autoComplete="nope"
                                            bsSize="sm"
                                            valid={!errors.name && this.state.user.name != ''}
                                            invalid={touched.name && !!errors.name}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
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
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.user.emailId}
                                            required />
                                        <FormFeedback className="red">{errors.emailId}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="orgAndCountry">{i18n.t('static.user.orgAndCountry')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text"
                                            autocomplete="off"
                                            name="orgAndCountry"
                                            id="orgAndCountry"
                                            bsSize="sm"
                                            valid={!errors.orgAndCountry && this.state.user.orgAndCountry != ''}
                                            invalid={touched.orgAndCountry && !!errors.orgAndCountry}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            maxLength={100}
                                            required
                                            value={this.state.user.orgAndCountry}
                                        /><FormFeedback className="red">{errors.orgAndCountry}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup className="Selectcontrol-bdrNone">
                                        <Label for="role">{i18n.t('static.role.role')}<span class="red Reqasterisk">*</span></Label>
                                        <Select
                                            className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                { 'is-valid': !errors.role && this.state.user.role.length != 0 },
                                                { 'is-invalid': (touched.role && !!errors.role) }
                                            )}
                                            name="role" id="role"
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); setFieldValue("role", e); this.roleChange(e); }}
                                            onBlur={() => setFieldTouched("role", true)}
                                            multi
                                            required
                                            min={1}
                                            options={this.state.roleList}
                                            value={this.state.roleId}
                                            error={errors.role}
                                            touched={touched.role}
                                        />
                                        <FormFeedback className="red">{errors.role}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="language">{i18n.t('static.language.language')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="language" id="language"
                                            bsSize="sm"
                                            valid={!errors.language && this.state.user.language != ''}
                                            invalid={touched.language && !!errors.language}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.languageId}
                                            required>
                                            <option value="">{i18n.t('static.common.select')}</option>
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
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={600}
                                            value={this.state.user.notes}
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup >
                                        <Label htmlFor="attachFile">{i18n.t('static.ticket.uploadFile')}</Label>
                                        <div className="custom-file">
                                            <Input type="file" className="custom-file-input" id="attachFile" name="attachFile" accept=".zip,.png,.jpg,.jpeg,.xls,.xlsx,.xlsm,.xlsb,.doc,.docx,.pdf"
                                                valid={!errors.attachFile && this.state.user.attachFile != ''}
                                                invalid={touched.attachFile && !!errors.attachFile}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                            />
                                            <label className="custom-file-label" id="attachFile" data-browse={i18n.t('static.uploadfile.Browse')} >{this.state.user.attachFile}</label>
                                            <FormFeedback className="red">{errors.attachFile}</FormFeedback>
                                        </div>
                                        <br></br><br></br>
                                        <div>
                                            <p>{i18n.t('static.ticket.filesuploadnote')}</p>
                                        </div>
                                    </FormGroup>
                                    <FormGroup>
                                        <TicketPriorityComponent priority={this.state.user.priority} updatePriority={this.updatePriority} errors={errors} touched={touched}/>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                        <Button type="button" size="md" color="info" className=" mr-1 pr-3 pl-3" onClick={this.props.toggleMain}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className=" mr-1" disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                    </ModalFooter>
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