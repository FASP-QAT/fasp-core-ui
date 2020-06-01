import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import UserService from "../../api/UserService";
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';

const initialValues = {
    roleName: "",
    businessFunctions: [],
    canCreateRole: []
}
const entityname = i18n.t('static.role.role');
const validationSchema = function (values) {
    return Yup.object().shape({
        roleName: Yup.string()
            .required(i18n.t('static.role.roletext'))
        // businessFunctions: Yup.string()
        //     .required(i18n.t('static.role.businessfunctiontext')),
        // canCreateRole: Yup.string()
        //     .required(i18n.t('static.role.cancreateroletext'))
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
class AddRoleComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: localStorage.getItem('lang'),
            businessFunctions: [],
            roles: [],
            role: {
                businessFunctions: [],
                canCreateRoles: [],
                label: {
                    label_en: ''
                }
            },
            businessFunctionId: '',
            businessFunctionList: [],
            canCreateRoleId: '',
            canCreateRoleList: [],
            message: ''
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.businessFunctionChange = this.businessFunctionChange.bind(this);
        this.canCreateRoleChange = this.canCreateRoleChange.bind(this);
    }

    Capitalize(str) {
        if (str != null && str != "") {
            return str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return "";
        }
    }

    dataChange(event) {
        let { role } = this.state;
        if (event.target.name == "roleName") {
            role.label.label_en = event.target.value;
        }
        this.setState({
            role
        },
            () => { });
    };

    businessFunctionChange(businessFunctionId) {
        let { role } = this.state;
        this.setState({ businessFunctionId });
        var businessFunctionIdArray = [];
        for (var i = 0; i < businessFunctionId.length; i++) {
            businessFunctionIdArray[i] = businessFunctionId[i].value;
        }
        role.businessFunctions = businessFunctionIdArray;
        this.setState({
            role
        },
            () => { });
    }

    canCreateRoleChange(canCreateRoleId) {
        let { role } = this.state;
        this.setState({ canCreateRoleId });
        var canCreateRoleIdArray = [];
        for (var i = 0; i < canCreateRoleId.length; i++) {
            canCreateRoleIdArray[i] = canCreateRoleId[i].value;
        }
        role.canCreateRoles = canCreateRoleIdArray;
        this.setState({
            role
        },
            () => { });
    }

    touchAll(setTouched, errors) {
        setTouched({
            roleName: true,
            businessFunctions: true,
            canCreateRoles: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('roleForm', (fieldName) => {
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
        UserService.getBusinessFunctionList()
            .then(response => {
                var businessFunctionList = [];
                for (var i = 0; i < response.data.length; i++) {
                    businessFunctionList[i] = { value: response.data[i].businessFunctionId, label: getLabelText(response.data[i].label, this.state.lang) }
                }
                this.setState({
                    businessFunctionList
                })
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
                var canCreateRoleList = [];
                for (var i = 0; i < response.data.length; i++) {
                    canCreateRoleList[i] = { value: response.data[i].roleId, label: getLabelText(response.data[i].label, this.state.lang) }
                }
                this.setState({
                    canCreateRoleList
                })
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
        return (
            <div className="animated fadeIn">
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    console.log("8888888************", this.state.role);
                                    UserService.addNewRole(this.state.role)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/role/listRole/` + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode
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
                                        setTouched,
                                        handleReset
                                    }) => (
                                            <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='roleForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label for="roleName">{i18n.t('static.role.role')}<span className="red Reqasterisk">*</span> </Label>
                                                        <Input type="text"
                                                            name="roleName"
                                                            id="roleName"
                                                            bsSize="sm"
                                                            valid={!errors.roleName && this.state.role.label.label_en != ''}
                                                            invalid={touched.roleName && !!errors.roleName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.Capitalize(this.state.role.label.label_en)}
                                                        /><FormFeedback className="red">{errors.roleName}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="businessFunctions">{i18n.t('static.role.businessfunction')}<span className="red Reqasterisk">*</span> </Label>
                                                        <Select
                                                            valid={!errors.businessFunctions}
                                                            bsSize="sm"
                                                            invalid={touched.businessFunctions && !!errors.businessFunctions}
                                                            onChange={(e) => { handleChange(e); this.businessFunctionChange(e) }}
                                                            onBlur={handleBlur}
                                                            name="businessFunctions"
                                                            id="businessFunctions"
                                                            multi
                                                            required
                                                            min={1}
                                                            options={this.state.businessFunctionList}
                                                            value={this.state.businessFunctionId}
                                                            error={errors.businessFunctions}
                                                            touched={touched.businessFunctions}
                                                        />
                                                        <FormFeedback className="red">{errors.businessFunctions}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="canCreateRoles">{i18n.t('static.role.cancreaterole')}<span className="red Reqasterisk">*</span> </Label>

                                                        <Select
                                                            valid={!errors.canCreateRoles}
                                                            bsSize="sm"
                                                            invalid={touched.canCreateRoles && !!errors.canCreateRoles}
                                                            onChange={(e) => { handleChange(e); this.canCreateRoleChange(e) }}
                                                            onBlur={handleBlur}
                                                            name="canCreateRoles"
                                                            id="canCreateRoles"
                                                            multi
                                                            required
                                                            min={1}
                                                            options={this.state.canCreateRoleList}
                                                            value={this.state.canCreateRoleId}
                                                            error={errors.canCreateRoles}
                                                            touched={touched.canCreateRoles}
                                                        />
                                                        <FormFeedback className="red">{errors.canCreateRoles}</FormFeedback>
                                                    </FormGroup>
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>

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
        this.props.history.push(`/role/listRole/` + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        let { role } = this.state;
        role.label.label_en = '';
        this.state.businessFunctionId = '';
        this.state.canCreateRoleId = '';

        this.setState(
            {
                role
            }
        )

    }
}

export default AddRoleComponent;
