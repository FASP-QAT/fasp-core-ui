import classNames from 'classnames';
import { Formik } from 'formik';
import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL } from '../../Constants.js';
import UserService from "../../api/UserService";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { Capitalize, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Initial values for form fields
const initialValues = {
    roleName: "",
    businessFunctions: [],
    canCreateRoles: []
}
// Localized entity name
const entityname = i18n.t('static.role.role');
/**
 * Defines the validation schema for role details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        roleName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.role.roletext')),
        businessFunctions: Yup.string()
            .required(i18n.t('static.role.businessfunctiontext')),
        canCreateRoles: Yup.string()
            .required(i18n.t('static.role.cancreateroletext'))
    })
}
/**
 * Component for adding role details.
 */
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
            loading: true,
            businessFunctionId: '',
            businessFunctionList: [],
            canCreateRoleId: '',
            canCreateRoleList: [],
            message: ''
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.businessFunctionChange = this.businessFunctionChange.bind(this);
        this.canCreateRoleChange = this.canCreateRoleChange.bind(this);
    }
    /**
     * Handles data change in the form.
     * @param {Event} event - The change event.
     */
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
    /**
     * Handles change in selected business functions.
     * @param {Array} businessFunctionId - Selected business function IDs.
     */
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
    /**
     * Handles change in selected can create roles.
     * @param {Array} canCreateRoleId - Selected can create role IDs.
     */
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
    /**
     * Fetches business function and role list on component mount.
     */
    componentDidMount() {
        // Fetch business function list
        UserService.getBusinessFunctionList()
            .then(response => {
                if (response.status == 200) {
                    var businessFunctionList = [];
                    for (var i = 0; i < response.data.length; i++) {
                        businessFunctionList[i] = { value: response.data[i].businessFunctionId, label: getLabelText(response.data[i].label, this.state.lang) }
                    }
                    var listArray = businessFunctionList;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.label.toUpperCase();
                        var itemLabelB = b.label.toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        businessFunctionList: listArray, loading: false
                    })
                }
                else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            hideSecondComponent();
                        })
                }
            })
            .catch(
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
        // Fetch role list
        UserService.getRoleList()
            .then(response => {
                if (response.status == 200) {
                    var canCreateRoleList = [];
                    for (var i = 0; i < response.data.length; i++) {
                        canCreateRoleList[i] = { value: response.data[i].roleId, label: getLabelText(response.data[i].label, this.state.lang) }
                    }
                    var listArray = canCreateRoleList;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.label.toUpperCase();
                        var itemLabelB = b.label.toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        canCreateRoleList: listArray,
                        loading: false
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            hideSecondComponent();
                        })
                }
            })
            .catch(
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
     * Renders the role details form.
     * @returns {JSX.Element} - Role details form.
     */
    render() {
        return (
            <div className="animated fadeIn">
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <AuthenticationServiceComponent history={this.props.history} />
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    UserService.addNewRole(this.state.role)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/role/listRole/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                            }
                                            else {
                                                this.setState({
                                                    message: response.data.messageCode, loading: false
                                                },
                                                    () => {
                                                        hideSecondComponent();
                                                    })
                                            }
                                        })
                                        .catch(
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
                                        <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='roleForm' autocomplete="off">
                                            <CardBody className="pt-2 pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
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
                                                        maxLength={45}
                                                        value={Capitalize(this.state.role.label.label_en)}
                                                    /><FormFeedback className="red">{errors.roleName}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup className="Selectcontrol-bdrNone">
                                                    <Label htmlFor="businessFunctions">{i18n.t('static.role.businessfunction')}<span className="red Reqasterisk">*</span> </Label>
                                                    <Select
                                                        className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                            { 'is-valid': !errors.businessFunctions && this.state.role.businessFunctions.length != 0 },
                                                            { 'is-invalid': (touched.businessFunctions && !!errors.businessFunctions) }
                                                        )}
                                                        bsSize="sm"
                                                        name="businessFunctions"
                                                        id="businessFunctions"
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            setFieldValue("businessFunctions", e);
                                                            this.businessFunctionChange(e);
                                                        }}
                                                        onBlur={() => setFieldTouched("businessFunctions", true)}
                                                        multi
                                                        required
                                                        min={1}
                                                        options={this.state.businessFunctionList}
                                                        value={this.state.businessFunctionId}
                                                    />
                                                    <FormFeedback className="red">{errors.businessFunctions}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup className="Selectcontrol-bdrNone">
                                                    <Label htmlFor="canCreateRoles">{i18n.t('static.role.cancreaterole')}
                                                        <span className="red Reqasterisk">*</span> </Label>
                                                    <Select
                                                        className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                            { 'is-valid': !errors.canCreateRoles && this.state.role.canCreateRoles.length != 0 },
                                                            { 'is-invalid': (touched.canCreateRoles && !!errors.canCreateRoles) }
                                                        )}
                                                        bsSize="sm"
                                                        name="canCreateRoles"
                                                        id="canCreateRoles"
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            setFieldValue("canCreateRoles", e);
                                                            this.canCreateRoleChange(e);
                                                        }}
                                                        onBlur={() => setFieldTouched("canCreateRoles", true)}
                                                        multi
                                                        required
                                                        min={1}
                                                        options={this.state.canCreateRoleList}
                                                        value={this.state.canCreateRoleId}
                                                    />
                                                    <FormFeedback className="red">{errors.canCreateRoles}</FormFeedback>
                                                </FormGroup>
                                            </CardBody>
                                            <div style={{ display: this.state.loading ? "block" : "none" }}>
                                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                                    <div class="align-items-center">
                                                        <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                                        <div class="spinner-border blue ml-4" role="status">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <CardFooter>
                                                <FormGroup>
                                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                    <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                    <Button type="submit" size="md" color="success" className="float-right mr-1" disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
    /**
     * Redirects to the list role screen when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/role/listRole/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Resets the role details when reset button is clicked.
     */
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