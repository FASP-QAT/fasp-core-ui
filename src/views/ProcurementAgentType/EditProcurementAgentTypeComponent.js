import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, SPECIAL_CHARECTER_WITH_NUM } from '../../Constants.js';
import ProcurementAgentService from "../../api/ProcurementAgentService";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { Capitalize, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Localized entity name
const entityname = i18n.t('static.dashboard.procurementagenttype');
/**
 * Defines the validation schema for procurement agent type details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        procurementAgentTypeCode: Yup.string()
            .matches(SPECIAL_CHARECTER_WITH_NUM, i18n.t('static.validNoSpace.string'))
            .required(i18n.t('static.procurementagenttype.codetext')),
        procurementAgentTypeName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.procurementAgenTtype.procurementagenttypenametext')),
    })
}
/**
 * Component for editing procurement agent type details.
 */
class EditProcurementAgentTypeComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            procurementAgentType: {
                realm: {
                    realmId: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: '',
                    }
                },
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: '',
                },
                procurementAgentTypeCode: '',
            },
            message: '',
            lang: localStorage.getItem('lang'),
            loading: true
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
    }
    /**
     * Handles data change in the form.
     * @param {Event} event - The change event.
     */
    dataChange(event) {
        let { procurementAgentType } = this.state;
        if (event.target.name == "procurementAgentTypeCode") {
            procurementAgentType.procurementAgentTypeCode = event.target.value;
        }
        if (event.target.name == "procurementAgentTypeName") {
            procurementAgentType.label.label_en = event.target.value;
        }
        if (event.target.name == "active") {
            procurementAgentType.active = event.target.id === "active2" ? false : true;
        }
        this.setState({
            procurementAgentType
        },
            () => { });
    };
    /**
     * Fetches procurement agent type details on component mount.
     */
    componentDidMount() {
        ProcurementAgentService.getProcurementAgentTypeById(this.props.match.params.procurementAgentTypeId).then(response => {
            if (response.status == 200) {
                this.setState({
                    procurementAgentType: response.data, loading: false
                });
            } else {
                this.setState({
                    message: response.data.messageCode, loading: false
                },
                    () => {
                        hideSecondComponent();
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
     * Renders the procurement agent type details form.
     * @returns {JSX.Element} - Procurement agent type details form.
     */
    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <Formik
                                enableReinitialize={true}
                                initialValues={
                                    {
                                        procurementAgentTypeCode: this.state.procurementAgentType.procurementAgentTypeCode,
                                        procurementAgentTypeName: this.state.procurementAgentType.label.label_en,
                                    }}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    ProcurementAgentService.updateProcurementAgentType(this.state.procurementAgentType)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/procurementAgentType/listProcurementAgentType/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode, loading: false
                                                },
                                                    () => {
                                                        hideSecondComponent();
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
                                        <Form onSubmit={handleSubmit} noValidate name='procurementAgentTypeForm' autocomplete="off">
                                            <CardBody className="pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                                <FormGroup>
                                                    <Label htmlFor="realmId">{i18n.t('static.realm.realmName')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="text"
                                                        name="realmId"
                                                        id="realmId"
                                                        bsSize="sm"
                                                        readOnly={true}
                                                        value={getLabelText(this.state.procurementAgentType.realm.label, this.state.lang)}
                                                    >
                                                    </Input>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="procurementAgentTypeName">{i18n.t('static.procurementagenttype.procurementtypename')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        bsSize="sm"
                                                        name="procurementAgentTypeName"
                                                        id="procurementAgentTypeName"
                                                        valid={!errors.procurementAgentTypeName}
                                                        invalid={(touched.procurementAgentTypeName && !!errors.procurementAgentTypeName) || !!errors.procurementAgentTypeName}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); Capitalize(e.target.value) }}
                                                        onBlur={handleBlur}
                                                        maxLength={255}
                                                        required
                                                        value={getLabelText(this.state.procurementAgentType.label, this.state.lang)}
                                                    />
                                                    <FormFeedback className="red">{errors.procurementAgentTypeName}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="procurementAgentCode">{i18n.t('static.procurementagenttype.procurementagenttypecode')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        bsSize="sm"
                                                        name="procurementAgentTypeCode"
                                                        id="procurementAgentTypeCode"
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        valid={!errors.procurementAgentTypeCode}
                                                        invalid={(touched.procurementAgentTypeCode && !!errors.procurementAgentTypeCode) || !!errors.procurementAgentTypeCode}
                                                        maxLength={10}
                                                        value={this.state.procurementAgentType.procurementAgentTypeCode}
                                                    />
                                                    <FormFeedback className="red">{errors.procurementAgentTypeCode}</FormFeedback>
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
                                                            checked={this.state.procurementAgentType.active === true}
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
                                                            checked={this.state.procurementAgentType.active === false}
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
                                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                    <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                    <Button type="submit" size="md" color="success" className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
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
     * Redirects to the list procurement agent type screen when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/procurementAgentType/listProcurementAgentType/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Resets the procurement agent type details when reset button is clicked.
     */
    resetClicked() {
        ProcurementAgentService.getProcurementAgentTypeById(this.props.match.params.procurementAgentTypeId).then(response => {
            this.setState({
                procurementAgentType: response.data, loading: false
            });
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
}
export default EditProcurementAgentTypeComponent;
