import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import UserService from "../../api/UserService";
import RealmService from "../../api/RealmService";
import LanguageService from "../../api/LanguageService";
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';

const initialValues = {
    username: "",
    realmId: [],
    emailId: "",
    phoneNumber: "",
    languageId: []
}
const entityname = i18n.t('static.user.user')
const validationSchema = function (values) {
    return Yup.object().shape({
        username: Yup.string()
            // .min(6, i18n.t('static.user.valid6char'))
            // .max(30, i18n.t('static.user.validpasswordlength'))
            // .matches(/^(?=.*[a-zA-Z]).*$/, i18n.t('static.user.alleast1alpha'))
            // .matches(/^\S*$/, i18n.t('static.user.nospace'))
            .required(i18n.t('static.user.validusername'))
            .matches(/^[a-zA-Z\s]+$/, i18n.t('static.message.rolenamevalidtext')),
        languageId: Yup.string()
            .required(i18n.t('static.user.validlanguage')),
        emailId: Yup.string()
            .email(i18n.t('static.user.invalidemail'))
            .required(i18n.t('static.user.validemail')),
        phoneNumber: Yup.string()
            .min(4, i18n.t('static.user.validphonemindigit'))
            .max(15, i18n.t('static.user.validphonemaxdigit'))
            .matches(/^[0-9]*$/, i18n.t('static.user.validnumber'))
            .required(i18n.t('static.user.validphone'))
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
class EditUserComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: localStorage.getItem('lang'),
            realms: [],
            languages: [],
            roles: [],
            // user: this.props.location.state.user,
            user: {
                realm: {
                    realmId: '',
                    label: {
                        label_en: ''
                    }
                },
                language: {
                    languageId: ''
                },
                roles: [],
                username: '',
                emailId: '',
                phoneNumber: '',
                roleList: []
            },
            message: '',
            roleId: '',
            roleList: []
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.roleChange = this.roleChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    dataChange(event) {
        let { user } = this.state;
        if (event.target.name == "username") {
            user.username = event.target.value;
        }
        if (event.target.name == "emailId") {
            user.emailId = event.target.value;
        }
        if (event.target.name == "phoneNumber") {
            user.phoneNumber = event.target.value;
        }
        if (event.target.name == "roleId") {
            user.roles = Array.from(event.target.selectedOptions, (item) => item.value);
        }
        if (event.target.name == "realmId") {
            user.realm.realmId = event.target.value;
        }
        if (event.target.name == "languageId") {
            user.language.languageId = event.target.value;
        }
        if (event.target.name == "active") {
            user.active = event.target.id === "active2" ? false : true;
        }

        this.setState({
            user
        },
            () => { });
    };

    roleChange(roleId) {
        let { user } = this.state;
        this.setState({ roleId });
        var roleIdArray = [];
        for (var i = 0; i < roleId.length; i++) {
            roleIdArray[i] = roleId[i].value;
        }
        user.roles = roleIdArray;
        this.setState({
            user
        },
            () => { });
    }

    touchAll(setTouched, errors) {
        setTouched({
            username: true,
            realmId: true,
            emailId: true,
            phoneNumber: true,
            languageId: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('userForm', (fieldName) => {
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
        // console.log("USERID --> ", this.props.match.params.userId);
        UserService.getUserByUserId(this.props.match.params.userId).then(response => {
            if (response.status == 200) {
                this.setState({
                    user: response.data

                }, (
                ) => {
                    // console.log("state after update---", this.state.user);
                    // console.log("Role list---", this.state.user.roleList);
                });
            } else {
                this.setState({
                    message: response.data.messageCode
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }


        })

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
                }
                else {
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
            <div className="animated fadeIn">
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                enableReinitialize={true}
                                initialValues={{
                                    username: this.state.user.username,
                                    realmId: this.state.user.realm.realmId,
                                    emailId: this.state.user.emailId,
                                    phoneNumber: this.state.user.phoneNumber,
                                    roles: this.state.user.roleList,
                                    languageId: this.state.user.language.languageId,
                                    roleId: this.state.user.roleList
                                }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    console.log(JSON.stringify(this.state.user))
                                    this.setState({
                                        message: ''
                                    })
                                    UserService.editUser(this.state.user)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/user/listUser/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))


                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode
                                                },
                                                    () => {
                                                        this.hideSecondComponent();
                                                    })
                                            }

                                        })
                                        .catch(
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
                                            <Form onSubmit={handleSubmit} noValidate name='userForm'>
                                                <CardBody className="pt-2 pb-0">
                                                    <FormGroup>
                                                        <Label htmlFor="realmId">{i18n.t('static.realm.realm')}</Label><Input
                                                            type="text"
                                                            name="realmId"
                                                            id="realmId"
                                                            bsSize="sm"
                                                            readOnly={true}
                                                            value={this.state.user.realm.label.label_en}
                                                        // value={this.state.user.roleList}
                                                        ></Input>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="username">{i18n.t('static.user.username')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="username"
                                                            id="username"
                                                            bsSize="sm"
                                                            valid={!errors.username}
                                                            invalid={touched.username && !!errors.username || this.state.user.username == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.user.username}
                                                        /> <FormFeedback className="red">{errors.username}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="emailId">{i18n.t('static.user.emailid')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="emailId"
                                                            id="emailId"
                                                            bsSize="sm"
                                                            valid={!errors.emailId}
                                                            invalid={touched.emailId && !!errors.emailId || this.state.user.emailId == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.user.emailId}
                                                        />
                                                        <FormFeedback className="red">{errors.emailId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="phoneNumber">{i18n.t('static.user.phoneNumber')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="phoneNumber"
                                                            id="phoneNumber"
                                                            bsSize="sm"
                                                            valid={!errors.phoneNumber}
                                                            invalid={touched.phoneNumber && !!errors.phoneNumber || this.state.user.phoneNumber == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.user.phoneNumber}
                                                        />
                                                        <FormFeedback className="red">{errors.phoneNumber}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="roleId">{i18n.t('static.role.role')}<span class="red Reqasterisk">*</span></Label>
                                                        <Select
                                                            valid={!errors.roleId}
                                                            bsSize="sm"
                                                            invalid={touched.roleId && !!errors.roleId || this.state.user.roleId == ''}
                                                            onChange={(e) => { handleChange(e); this.roleChange(e) }}
                                                            onBlur={handleBlur}
                                                            name="roleId"
                                                            id="roleId"
                                                            multi
                                                            options={this.state.roleList}
                                                            value={this.state.user.roles}
                                                        />
                                                        {/* <Input
                                                            type="select"
                                                            name="roleId"
                                                            id="roleId"
                                                            bsSize="sm"
                                                            valid={!errors.roleId}
                                                            invalid={touched.roleId && !!errors.roleId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.user.roles}
                                                            multiple={true}
                                                        >
                                                            <option value="0" disabled>{i18n.t('static.common.select')}</option>
                                                            {roleList}
                                                        </Input> */}
                                                        <FormFeedback className="red">{errors.roleId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="languageId">{i18n.t('static.language.language')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="languageId"
                                                            id="languageId"
                                                            bsSize="sm"
                                                            valid={!errors.languageId}
                                                            invalid={touched.languageId && !!errors.languageId || this.state.user.language.languageId == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.user.language.languageId}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {languageList}
                                                        </Input> <FormFeedback className="red">{errors.languageId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label className="P-absltRadio">{i18n.t('static.common.status')}</Label>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="active"
                                                                value={true}
                                                                checked={this.state.user.active === true}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio1">
                                                                {i18n.t('static.common.active')}
                                                            </Label>
                                                        </FormGroup>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active2"
                                                                name="active"
                                                                value={false}
                                                                checked={this.state.user.active === false}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio2">
                                                                {i18n.t('static.common.disabled')}
                                                            </Label>
                                                        </FormGroup>
                                                    </FormGroup>
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> Reset</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>

                                                        &nbsp;
                          </FormGroup>
                                                </CardFooter>
                                            </Form>
                                        )} />
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/user/listUser/` + 'red/' + i18n.t("static.message.cancelled", { entityname }))
    }

    resetClicked() {
        UserService.getUserByUserId(this.props.match.params.userId).then(response => {
            this.setState({
                user: response.data
            });

        })
    }
}

export default EditUserComponent;