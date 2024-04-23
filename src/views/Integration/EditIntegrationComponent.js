import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import { API_URL } from '../../Constants.js';
import IntegrationService from '../../api/IntegrationService.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions.js';
// Localized entity name
const entityname = i18n.t('static.integration.integration');
/**
 * Defines the validation schema for integration details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        integrationName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.integration.integrationValidName')),
        integrationViewId: Yup.string()
            .required(i18n.t('static.common.integrationViewtext')),
        folderLocation: Yup.string()
            .required(i18n.t('static.integration.validFolderLocation')),
        fileName: Yup.string()
            .required(i18n.t('static.integration.validFileName'))
    })
}
/**
 * Component for edit integrations
 */
export default class UpdateDataSourceComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            integration: {
                integrationId: '',
                integrationName: '',
                realm: {
                    id: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                },
                folderLocation: '',
                fileName: '',
                integrationView: {
                    integrationViewId: '',
                    integrationViewDesc: '',
                    integrationViewName: ''
                }
            },
            loading: true,
            isHide: true,
            bodyParameter: '',
            integrationViewList: []
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.addParameter = this.addParameter.bind(this);
        this.clearParameter = this.clearParameter.bind(this);
    }
    /**
     * Sets the 'isHide' state to false, enabling the display of a parameter.
     */
    addParameter() {
        this.setState({ isHide: false })
    }
    /**
     * Clears the fileName, isHide, and bodyParameter states, and resets the integration state.
     */
    clearParameter() {
        let { integration } = this.state
        integration.fileName = ''
        integration.bodyParameter = ''
        this.setState(
            {
                integration,
                isHide: true
            }
        )
    }
    /**
     * Handles data change in the form.
     * @param {Event} event - The change event.
     */
    dataChange(event) {
        let { integration } = this.state
        if (event.target.name === "integrationName") {
            integration.integrationName = event.target.value
        } else if (event.target.name === "folderLocation") {
            integration.folderLocation = event.target.value
        } else if (event.target.name === "fileName") {
            integration.fileName = event.target.value
        } else if (event.target.name === "realmId") {
            integration.realm.id = event.target.value;
        } else if (event.target.name === "integrationViewId") {
            integration.integrationView.integrationViewId = event.target.value;
        } else if (event.target.name === "bodyParameter") {
            let bodyParameterId = event.target.value;
            let fileName = this.state.integration.fileName;
            if (bodyParameterId == 1) {
                integration.fileName = fileName + '<%PROGRAM_CODE%>';
            } else if (bodyParameterId == 2) {
                integration.fileName = fileName + '<%PROGRAM_ID%>';
            } else if (bodyParameterId == 3) {
                integration.fileName = fileName + '<%VERSION_ID%>';
            } else if (bodyParameterId == 4) {
                integration.fileName = fileName + '<%YMDHMS%>';
            } else if (bodyParameterId == 5) {
                integration.fileName = fileName + '<%YMD%>';
            }
        }
        this.setState(
            {
                integration
            }
        )
    };
    /**
     * Reterives integration list and integration details on component mount
     */
    componentDidMount() {
        IntegrationService.getIntegrationById(this.props.match.params.integrationId).then(response => {
            if (response.status == 200) {
                this.setState({
                    integration: response.data, loading: false
                });
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
        IntegrationService.getIntegrationViewListAll()
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = (a.integrationViewDesc).toUpperCase();
                    var itemLabelB = (b.integrationViewDesc).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    integrationViewList: listArray, loading: false
                })
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
     * Redirects to list integration on cancel button clicked
     */
    cancelClicked() {
        this.props.history.push(`/integration/listIntegration/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Renders the Edit Integration form.
     * @returns {JSX.Element} - Edit Integration form.
     */
    render() {
        const { integrationViewList } = this.state;
        let viewList = integrationViewList.length > 0
            && integrationViewList.map((item, i) => {
                return (
                    <option key={i} value={item.integrationViewId}>
                        {item.integrationViewDesc}
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
                                    integrationName: this.state.integration.integrationName,
                                    integrationViewId: this.state.integration.integrationView.integrationViewId,
                                    folderLocation: this.state.integration.folderLocation,
                                    fileName: this.state.integration.fileName,
                                }}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    IntegrationService.editIntegration(this.state.integration)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/integration/listIntegration/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                                        <Form onSubmit={handleSubmit} noValidate name='integrationForm' autocomplete="off">
                                            <CardBody className="pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                                <FormGroup>
                                                    <Label htmlFor="realmId">{i18n.t('static.realm.realm')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="text"
                                                        name="realmId"
                                                        id="realmId"
                                                        bsSize="sm"
                                                        readOnly
                                                        value={this.state.integration.realm.label.label_en}
                                                    >
                                                    </Input>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="label">{i18n.t('static.integration.integration')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        name="integrationName"
                                                        id="integrationName"
                                                        bsSize="sm"
                                                        valid={!errors.integrationName && this.state.integration.integrationName != ''}
                                                        invalid={touched.integrationName && !!errors.integrationName}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.integration.integrationName}
                                                        required />
                                                    <FormFeedback className="red">{errors.integrationName}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="realmId">{i18n.t('static.integration.integrationViewName')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="select"
                                                        name="integrationViewId"
                                                        id="integrationViewId"
                                                        bsSize="sm"
                                                        valid={!errors.integrationViewId && this.state.integration.integrationView.integrationViewId != ''}
                                                        invalid={touched.integrationViewId && !!errors.integrationViewId}
                                                        onChange={(e) => {
                                                            handleChange(e); this.dataChange(e);
                                                        }}
                                                        onBlur={handleBlur}
                                                        required
                                                        value={this.state.integration.integrationView.integrationViewId}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {viewList}
                                                    </Input>
                                                    <FormFeedback className="red">{errors.integrationViewId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="label">{i18n.t('static.integration.folderLocation')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        name="folderLocation"
                                                        id="folderLocation"
                                                        bsSize="sm"
                                                        valid={!errors.folderLocation && this.state.integration.folderLocation != ''}
                                                        invalid={touched.folderLocation && !!errors.folderLocation}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.integration.folderLocation}
                                                        required />
                                                    <FormFeedback className="red">{errors.folderLocation}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="label">{i18n.t('static.integration.fileName')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        name="fileName"
                                                        id="fileName"
                                                        bsSize="sm"
                                                        valid={!errors.fileName && this.state.integration.fileName != ''}
                                                        invalid={touched.fileName && !!errors.fileName}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.integration.fileName}
                                                        required />
                                                    <FormFeedback className="red">{errors.fileName}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup className="pb-3">
                                                    {this.state.isHide && <Button color="info" size="md" className="float-left mr-1" onClick={() => this.addParameter()}><i className="fa fa-plus"></i>{i18n.t('static.integration.addBodyParameter')}</Button>}
                                                    &nbsp;
                                                    <Button color="warning" size="md" className="float-left mr-1" onClick={() => this.clearParameter()}><i className="fa fa-refresh"></i>{i18n.t('static.integration.clearBodyParameter')}</Button>
                                                </FormGroup>
                                                {!this.state.isHide &&
                                                    <FormGroup>
                                                        <Label htmlFor="bodyParameter">{i18n.t('static.integration.bodyParameter')}</Label>
                                                        <Input
                                                            type="select"
                                                            name="bodyParameter"
                                                            id="bodyParameter"
                                                            bsSize="sm"
                                                            onChange={(e) => {
                                                                handleChange(e); this.dataChange(e);
                                                            }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.bodyParameter}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            <option value="1">{i18n.t('static.programOnboarding.programCode')}</option>
                                                            <option value="2">{i18n.t('static.pipelineProgram.programId')}</option>
                                                            <option value="3">{i18n.t('static.program.versionId')}</option>
                                                            <option value="4">{i18n.t('static.common.Date[YMDHMS]')}</option>
                                                            <option value="5">{i18n.t('static.common.Date[YMD]')}</option>
                                                        </Input>
                                                        <FormFeedback className="red">{errors.bodyParameter}</FormFeedback>
                                                    </FormGroup>
                                                }
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
                                                    <Button type="submit" color="success" className="mr-1 float-right" size="md"><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                                                    &nbsp;
                                                </FormGroup>
                                            </CardFooter>
                                        </Form>
                                    )} />
                        </Card>
                    </Col>
                </Row>
                <div>
                    <h6>{i18n.t(this.state.message)}</h6>
                    <h6>{i18n.t(this.props.match.params.message)}</h6>
                </div>
            </div>
        );
    }
    /**
     * Resets the integration details when reset button is clicked.
     */
    resetClicked() {
        IntegrationService.getIntegrationById(this.props.match.params.integrationId).then(response => {
            this.setState({
                integration: response.data
            });
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