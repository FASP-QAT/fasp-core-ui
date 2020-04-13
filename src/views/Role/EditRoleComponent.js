import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import UserService from "../../api/UserService";
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';

const initialValues = {
    roleName: "",
    businessFunctions: [],
    canCreateRole: []
}
const entityname = i18n.t('static.role.role');
const validationSchema = function (values) {
    return Yup.object().shape({
        roleName: Yup.string()
            .required('Please enter role name'),
        businessFunctions: Yup.string()
            .required('Please select business functions'),
        canCreateRole: Yup.string()
            .required('Please select can create role')
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
class EditRoleComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: localStorage.getItem('lang'),
            businessFunctions: [],
            roles: [],
            // role: this.props.location.state.role,
            role: {
                businessFunctions: [],
                canCreateRole: [],
                label: {

                }
            },
            message: ''
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
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
        if (event.target.name == "businessFunctions") {
            role.businessFunctions = Array.from(event.target.selectedOptions, (item) => item.value);
        }
        if (event.target.name == "canCreateRole") {
            role.canCreateRole = Array.from(event.target.selectedOptions, (item) => item.value);
        }
        this.setState({
            role
        },
            () => { });
    };

    touchAll(setTouched, errors) {
        setTouched({
            roleName: true,
            businessFunctions: true,
            canCreateRole: true
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
        UserService.getRoleById(this.props.match.params.roleId).then(response => {
            this.setState({
                role: response.data
            });
            initialValues = {
                roleName: this.state.role.label.label_en,
                businessFunctions: this.state.role.businessFunctions,
                canCreateRole: this.state.role.canCreateRole
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
                            console.log("Error code unkown");
                            break;
                    }
                }
            }
        );



        UserService.getBusinessFunctionList()
            .then(response => {
                this.setState({
                    businessFunctions: response.data
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
                this.setState({
                    roles: response.data
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
        const { businessFunctions } = this.state;
        const { roles } = this.state;

        let businessFunctionsList = businessFunctions.length > 0
            && businessFunctions.map((item, i) => {
                return (
                    <>
                        <option key={i} value={item.businessFunctionId}>
                            {getLabelText(item.label, this.state.lang)}
                        </option>
                    </>
                )
            }, this);
        let roleList = roles.length > 0
            && roles.map((item, i) => {
                return (
                    <option key={i} value={item.roleId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        return (
            <div className="animated fadeIn">
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity', { entityname })}</strong>{' '}
                            </CardHeader>
                            <Formik
                                // initialValues={{
                                //     roleName: this.state.role.label.label_en,
                                //     businessFunctions: this.state.role.businessFunctions,
                                //     canCreateRole: this.state.role.canCreateRole
                                // }}
                                enableReinitialize={true}
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    UserService.editRole(this.state.role)
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
                                        setTouched
                                    }) => (
                                            <Form onSubmit={handleSubmit} noValidate name='roleForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label for="roleName">{i18n.t('static.role.role')}</Label>
                                                        <Input type="text"
                                                            name="roleName"
                                                            id="roleName"
                                                            bsSize="sm"
                                                            valid={!errors.roleName}
                                                            invalid={touched.roleName && !!errors.roleName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.Capitalize(this.state.role.label.label_en)}
                                                        />
                                                        <FormFeedback className="red">{errors.roleName}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="businessFunctions">{i18n.t('static.role.businessfunction')}</Label><Input
                                                            type="select"
                                                            name="businessFunctions"
                                                            id="businessFunctions"
                                                            bsSize="sm"
                                                            valid={!errors.businessFunctions}
                                                            invalid={touched.businessFunctions && !!errors.businessFunctions}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.role.businessFunctions}
                                                            multiple={true}
                                                        >
                                                            <option value="0" disabled>{i18n.t('static.common.select')}</option>
                                                            {businessFunctionsList}

                                                        </Input>
                                                        <FormFeedback className="red">{errors.businessFunctions}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="canCreateRole">{i18n.t('static.role.cancreaterole')}</Label>
                                                        <Input
                                                            type="select"
                                                            name="canCreateRole"
                                                            id="canCreateRole"
                                                            bsSize="sm"
                                                            valid={!errors.canCreateRole}
                                                            invalid={touched.canCreateRole && !!errors.canCreateRole}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.role.canCreateRole}
                                                            multiple={true}
                                                        >
                                                            <option value="0" disabled>{i18n.t('static.common.select')}</option>
                                                            {roleList}
                                                        </Input> <FormFeedback className="red">{errors.canCreateRole}</FormFeedback>
                                                    </FormGroup>
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
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
        this.props.history.push(`/role/listRole/` + i18n.t('static.message.cancelled', { entityname }))
    }
}

export default EditRoleComponent;
