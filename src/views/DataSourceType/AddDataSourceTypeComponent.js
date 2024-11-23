import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL } from '../../Constants.js';
import DataSourceTypeService from '../../api/DataSourceTypeService.js';
import RealmService from "../../api/RealmService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { Capitalize, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Initial values for form fields
let initialValues = {
    realmId: [],
    label: ''
}
// Localized entity name
const entityname = i18n.t('static.datasourcetype.datasourcetype');
/**
 * Defines the validation schema for role details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        label: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.datasourcetype.datasourcetypetext'))
    })
}
/**
 * Component for adding data source type details.
 */
export default class AddDataSourceTypeComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: localStorage.getItem('lang'),
            realms: [],
            dataSourceType:
            {
                active: '',
                realm: {
                    id: ''
                },
                label: {
                    label_en: '',
                    labelId: 0,
                }
            },
            loading: true
        }
        this.dataChange = this.dataChange.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
    }
    /**
     * Handles data change in the form.
     * @param {Event} event - The change event.
     */
    dataChange(event) {
        let { dataSourceType } = this.state
        if (event.target.name === "label") {
            dataSourceType.label.label_en = event.target.value
        }
        if (event.target.name == "realmId") {
            dataSourceType.realm.id = event.target.value;
        }
        this.setState(
            {
                dataSourceType
            }, () => {
            }
        )
    };
    /**
     * Reterives realm list on component mount
     */
    componentDidMount() {
        RealmService.getRealmListAll()
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    realms: listArray,
                    loading: false
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
        let realmId = AuthenticationService.getRealmId();
        if (realmId != -1) {
            initialValues = {
                realmId: realmId
            }
            let { dataSourceType } = this.state;
            dataSourceType.realm.id = realmId;
            document.getElementById("realmId").disabled = true;
            this.setState({
                dataSourceType
            });
        }
    }
    /**
     * Renders the data source type details form.
     * @returns {JSX.Element} - Data source type details form.
     */
    render() {
        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
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
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    DataSourceTypeService.addDataSourceType(this.state.dataSourceType)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/dataSourceType/listDataSourceType/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                                        <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='dataSourceType' autocomplete="off">
                                            <CardBody style={{ display: this.state.loading ? "none" : "block" }}>
                                                <FormGroup>
                                                    <Label htmlFor="realmId">{i18n.t('static.realm.realm')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="select"
                                                        name="realmId"
                                                        id="realmId"
                                                        bsSize="sm"
                                                        valid={!errors.realmId && this.state.dataSourceType.realm.id != ''}
                                                        invalid={touched.realmId && !!errors.realmId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        required
                                                        value={this.state.dataSourceType.realm.id}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {realmList}
                                                    </Input>
                                                    <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="label">{i18n.t('static.datasourcetype.datasourcetype')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        name="label"
                                                        id="label"
                                                        bsSize="sm"
                                                        valid={!errors.label && this.state.dataSourceType.label.label_en != ''}
                                                        invalid={touched.label && !!errors.label}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); Capitalize(e.target.value) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.dataSourceType.label.label_en}
                                                        required />
                                                    <FormFeedback className="red">{errors.label}</FormFeedback>
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
                                                    <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                    <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                    <Button type="submit" color="success" className="mr-1 float-right" size="md" disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
     * Redirects to the list data source type screen when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/dataSourceType/listDataSourceType/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Resets the data source type details when reset button is clicked.
     */
    resetClicked() {
        let { dataSourceType } = this.state
        dataSourceType.label.label_en = ''
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN')) {
            dataSourceType.realm.id = '';
        }
        this.setState(
            {
                dataSourceType
            }, () => {
            }
        )
    }
}
