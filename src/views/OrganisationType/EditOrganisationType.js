import { Formik } from 'formik';
import React, { Component } from 'react';
import 'react-select/dist/react-select.min.css';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL } from '../../Constants.js';
import OrganisationTypeService from "../../api/OrganisationTypeService";
import UserService from "../../api/UserService";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// Initial values for form fields
let initialValues = {
    realmId: '',
    organisationTypeName: '',
}
// Localized entity name
const entityname = i18n.t('static.organisationType.organisationType');
/**
 * Defines the validation schema for organization type details.
 * @param {*} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        organisationTypeName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.organisationType.organisationTypetext')),
    })
}
/**
 * Component for editing organization type details.
 */
export default class EditOrganisationTypeComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            organisationType: {
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: ''
                },
                realm: {
                    id: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                },
            },
            message: '',
            lang: localStorage.getItem('lang'),
            loading: true
        }
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    /**
     * Hides the message in div2 after 30 seconds.
     */
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * Handles data change in the organization type form.
     * @param {Event} event - The change event.
     */
    dataChange(event) {
        let { organisationType } = this.state
        if (event.target.name === "organisationName") {
            organisationType.label.label_en = event.target.value
        } else if (event.target.name === "realmId") {
            organisationType.realm.id = event.target.value
        } else if (event.target.name === "active") {
            organisationType.active = event.target.id === "active2" ? false : true
        }
        this.setState({
            organisationType
        }, (
        ) => {
        })
    }
    /**
     * Fetches organization type details & realm list on component mount.
     */
    componentDidMount() {
        //Fetch organization type details by id
        OrganisationTypeService.getOrganisationTypeById(this.props.match.params.organisationTypeId).then(response => {
            if (response.status == 200) {
                this.setState({
                    organisationType: response.data, loading: false
                })
            }
            else {
                this.setState({
                    message: response.data.messageCode, loading: false
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }
            initialValues = {
                organisationTypeName: this.state.organisationType.label.label_en,
                realmId: this.state.organisationType.realm.id
            }
            //Fetch realm list
            UserService.getRealmList()
                .then(response => {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        realms: listArray, loading: false
                    })
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
     * Capitalizes the first letter of the organization type name.
     * @param {string} str - The organization type name.
     */
    Capitalize(str) {
        this.state.organisationType.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }
    /**
     * Renders the organization type details form.
     * @returns {JSX.Element} - organization type details form.
     */
    render() {
        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {(() => {
                            switch (this.state.languageId) {
                                case 2: return (item.label.label_pr !== null && item.label.label_pr !== "" ? item.label.label_pr : item.label.label_en);
                                case 3: return (item.label.label_fr !== null && item.label.label_fr !== "" ? item.label.label_fr : item.label.label_en);
                                case 4: return (item.label.label_sp !== null && item.label.label_sp !== "" ? item.label.label_sp : item.label.label_en);
                                default: return item.label.label_en;
                            }
                        })()}
                    </option>
                )
            }, this);
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{
                                    organisationTypeName: this.state.organisationType.label.label_en,
                                    realmId: this.state.organisationType.realm.id,
                                }}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    OrganisationTypeService.editOrganisationType(this.state.organisationType)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/organisationType/listOrganisationType/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode, loading: false
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
                                        setFieldValue,
                                        setFieldTouched
                                    }) => (
                                        <Form onSubmit={handleSubmit} noValidate name='organisationTypeForm' autocomplete="off">
                                            <CardBody className="pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                                <FormGroup>
                                                    <Label htmlFor="realmId">{i18n.t('static.organisation.realm')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        bsSize="sm"
                                                        value={this.state.organisationType.realm.id}
                                                        valid={!errors.realmId}
                                                        invalid={touched.realmId && !!errors.realmId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        disabled
                                                        type="select" name="realmId" id="realmId">
                                                        <option value="0">{i18n.t('static.common.select')}</option>
                                                        {realmList}
                                                    </Input>
                                                    <FormFeedback>{errors.realmId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="organisationTypeName">{i18n.t('static.organisationType.organisationTypeName')}<span class="red Reqasterisk">*</span> </Label>
                                                    <Input
                                                        bsSize="sm"
                                                        type="text" name="organisationTypeName" valid={!errors.organisationTypeName}
                                                        invalid={(touched.organisationTypeName && !!errors.organisationTypeName) || !!errors.organisationTypeName}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.organisationType.label.label_en}
                                                        id="organisationTypeName" />
                                                    <FormFeedback className="red">{errors.organisationTypeName}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label className="P-absltRadio">{i18n.t('static.common.status')}  </Label>
                                                    <FormGroup check inline>
                                                        <Input
                                                            className="form-check-input"
                                                            type="radio"
                                                            id="active1"
                                                            name="active"
                                                            value={true}
                                                            checked={this.state.organisationType.active === true}
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
                                                            checked={this.state.organisationType.active === false}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio2">
                                                            {i18n.t('static.dataentry.inactive')}
                                                        </Label>
                                                    </FormGroup>
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
                                                    <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                    <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                    <Button type="submit" color="success" className="mr-1 float-right" size="md" ><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
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
     * Redirects to the list organization type when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/organisationType/listOrganisationType/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Resets the organization type details form when reset button is clicked.
     */
    resetClicked() {
        //Fetch organization type details by id
        OrganisationTypeService.getOrganisationTypeById(this.props.match.params.organisationTypeId).then(response => {
            this.setState({
                organisationType: response.data
            })
            //Fetch Realm list
            UserService.getRealmList()
                .then(response => {
                    this.setState({
                        realms: response.data, loading: false
                    })
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
}
