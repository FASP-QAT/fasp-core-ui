import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import ForecastingUnitService from '../../api/ForecastingUnitService.js';
import ProductService from '../../api/ProductService';
import RealmService from "../../api/RealmService";
import UnitService from "../../api/UnitService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Initial values for form fields
let initialValues = {
    realmId: [],
    productCategoryId: [],
    tracerCategoryId: [],
    unitId: [],
    label: ''
}
// Localized entity name
const entityname = i18n.t('static.forecastingunit.forecastingunit');
/**
 * Defines the validation schema for forecasting unit details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        tracerCategoryId: Yup.string()
            .required(i18n.t('static.tracercategory.tracercategoryText')),
        productCategoryId: Yup.string()
            .required(i18n.t('static.productcategory.productcategorytext')),
        label: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.forecastingunit.forecastingunittext')),
        unitId: Yup.string()
            .required(i18n.t('static.product.productunittext')),
        genericLabel: Yup.string()
            .matches(/^$|^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
    })
}
/**
 * Component for adding forecasting unit details.
 */
export default class AddForecastingUnitComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            units: [],
            productcategories: [],
            tracerCategories: [],
            forecastingUnit:
            {
                active: '',
                realm: {
                    id: ''
                },
                label: {
                    label_en: '',
                    labelId: 0,
                }, genericLabel: {
                    label_en: '',
                    labelId: 0,
                },
                unit: { id: '' },
                productCategory: { id: '' },
                tracerCategory: { id: '' }
            },
            lang: localStorage.getItem('lang'),
            loading: true,
        }
        this.dataChange = this.dataChange.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.getProductCategoryByRealmId = this.getProductCategoryByRealmId.bind(this);
    }
    /**
     * Handles data change in the form.
     * @param {Event} event - The change event.
     */
    dataChange(event) {
        let { forecastingUnit } = this.state
        if (event.target.name === "label") {
            forecastingUnit.label.label_en = event.target.value
        }
        if (event.target.name == "realmId") {
            forecastingUnit.realm.id = event.target.value;
        }
        if (event.target.name == "tracerCategoryId") {
            forecastingUnit.tracerCategory.id = event.target.value;
        }
        if (event.target.name == "productCategoryId") {
            forecastingUnit.productCategory.id = event.target.value;
        }
        if (event.target.name == "genericLabel") {
            forecastingUnit.genericLabel.label_en = event.target.value;
        }
        if (event.target.name == "unitId") {
            forecastingUnit.unit.id = event.target.value;
        }
        this.setState(
            {
                forecastingUnit
            }, () => {
            }
        )
    };
    /**
     * Reterives unit, realm and tracer category list on component mount
     */
    componentDidMount() {
        UnitService.getUnitListAll()
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    units: listArray, loading: false
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
        DropdownService.getTracerCategoryDropdownList()
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    tracerCategories: listArray,
                    loading: false
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
            let { forecastingUnit } = this.state
            forecastingUnit.realm.id = realmId;
            document.getElementById("realmId").disabled = true;
            this.setState({
                forecastingUnit
            },
                () => {
                    this.getProductCategoryByRealmId()
                })
        }
    }
    /**
     * Reterives product category list based on realm Id from server
     */
    getProductCategoryByRealmId() {
        let realmId = this.state.forecastingUnit.realm.id;
        if (realmId != "") {
            ProductService.getProductCategoryList(realmId)
                .then(response => {
                    var listArray = response.data.slice(1);
                    listArray = listArray.filter(c => c.payload.active.toString() == "true");
                    // listArray.sort((a, b) => {
                    //     var itemLabelA = getLabelText(a.payload.label, this.state.lang).toUpperCase();
                    //     var itemLabelB = getLabelText(b.payload.label, this.state.lang).toUpperCase();
                    //     return itemLabelA > itemLabelB ? 1 : -1;
                    // });
                    this.setState({
                        productcategories: listArray
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
        } else {
            this.setState({
                productcategories: []
            })
        }
    }
    /**
     * Renders the forecasting unit details form.
     * @returns {JSX.Element} - Forecasting unit details form.
     */
    render() {
        const { units } = this.state;
        let unitList = units.length > 0
            && units.map((item, i) => {
                return (
                    <option key={i} value={item.unitId}>
                        {item.label.label_en}
                    </option>
                )
            }, this);
        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { tracerCategories } = this.state;
        let tracerCategoryList = tracerCategories.length > 0
            && tracerCategories.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { productcategories } = this.state;
        let productCategoryList = productcategories.length > 0
            && productcategories.map((item, i) => {
                return (
                    <option key={i} value={item.payload.productCategoryId}>
                        {getLabelText(item.payload.label, this.state.lang)}
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
                                    ForecastingUnitService.addForecastingUnit(this.state.forecastingUnit)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/forecastingUnit/listForecastingUnit/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode,
                                                    loading: false
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
                                                            this.setState({
                                                                message: error.response.data.messageCode,
                                                                loading: false
                                                            });
                                                            break;
                                                        case 406:
                                                            this.setState({
                                                                message: i18n.t('static.message.forecastingUnitAlreadExists'),
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
                                        <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='forecastingUnit' autocomplete="off">
                                            <CardBody style={{ display: this.state.loading ? "none" : "block" }}>
                                                <FormGroup>
                                                    <Label htmlFor="realmId">{i18n.t('static.realm.realm')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="select"
                                                        name="realmId"
                                                        id="realmId"
                                                        bsSize="sm"
                                                        valid={!errors.realmId && this.state.forecastingUnit.realm.id != ''}
                                                        invalid={touched.realmId && !!errors.realmId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.getProductCategoryByRealmId() }}
                                                        onBlur={handleBlur}
                                                        required
                                                        value={this.state.forecastingUnit.realm.id}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {realmList}
                                                    </Input>
                                                    <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="tracerCategoryId">{i18n.t('static.tracercategory.tracercategory')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="select"
                                                        name="tracerCategoryId"
                                                        id="tracerCategoryId"
                                                        bsSize="sm"
                                                        valid={!errors.tracerCategoryId && this.state.forecastingUnit.tracerCategory.id != ''}
                                                        invalid={touched.tracerCategoryId && !!errors.tracerCategoryId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        required
                                                        value={this.state.forecastingUnit.tracerCategory.id}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {tracerCategoryList}
                                                    </Input>
                                                    <FormFeedback className="red">{errors.tracerCategoryId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="productCategoryId">{i18n.t('static.productcategory.productcategory')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="select"
                                                        name="productCategoryId"
                                                        id="productCategoryId"
                                                        bsSize="sm"
                                                        valid={!errors.productCategoryId && this.state.forecastingUnit.productCategory.id != ''}
                                                        invalid={touched.productCategoryId && !!errors.productCategoryId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        required
                                                        value={this.state.forecastingUnit.productCategory.id}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {productCategoryList}
                                                    </Input>
                                                    <FormFeedback className="red">{errors.productCategoryId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="label">{i18n.t('static.forecastingunit.forecastingunit')}<span className="red Reqasterisk">*</span></Label> <Input type="text"
                                                        name="label"
                                                        id="label"
                                                        bsSize="sm"
                                                        valid={!errors.label && this.state.forecastingUnit.label.label_en != ''}
                                                        invalid={touched.label && !!errors.label}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.forecastingUnit.label.label_en}
                                                        required />
                                                    <FormFeedback className="red">{errors.label}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="genericLabel">{i18n.t('static.product.productgenericname')}</Label>
                                                    <Input type="text"
                                                        name="genericLabel"
                                                        id="genericLabel"
                                                        bsSize="sm"
                                                        valid={!errors.genericLabel && this.state.forecastingUnit.genericLabel.label_en != ''}
                                                        invalid={touched.genericLabel && !!errors.genericLabel}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.forecastingUnit.genericLabel.label_en}
                                                        required />
                                                    <FormFeedback className="red">{errors.genericLabel}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="unitId">{i18n.t('static.unit.unit')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="select"
                                                        name="unitId"
                                                        id="unitId"
                                                        bsSize="sm"
                                                        value={this.state.forecastingUnit.unit.id}
                                                        valid={!errors.unitId && this.state.forecastingUnit.unit.id != ''}
                                                        invalid={touched.unitId && !!errors.unitId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        required>
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {unitList}
                                                    </Input>
                                                    <FormFeedback className="red">{errors.unitId}</FormFeedback>
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
                                                    <Button type="submit" color="success" className="mr-1 float-right" size="md"  disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
     * Redirects to the list forecasting unit screen when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/forecastingUnit/listForecastingUnit/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Resets the forecasting unit details when reset button is clicked.
     */
    resetClicked() {
        let { forecastingUnit } = this.state
        forecastingUnit.label.label_en = ''
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN')) {
            forecastingUnit.realm.id = ''
        }
        forecastingUnit.tracerCategory.id = ''
        forecastingUnit.productCategory.id = ''
        forecastingUnit.genericLabel.label_en = ''
        this.setState(
            {
                forecastingUnit
            }, () => {
            }
        )
    }
}
